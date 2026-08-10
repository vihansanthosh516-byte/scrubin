import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import {
  SessionManager,
  DeterministicRNG,
  getProcedure,
  listProcedures,
  procedureExists,
  type TickDecision,
  type DecisionOption,
  type DecisionResultPublic,
  type TickDecisionPublic,
  type NextTickResponse,
  type DecideResponse,
} from "./engine/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionManager = new SessionManager();
const seedRng = new DeterministicRNG(
  parseInt(process.env.SIM_SEED || "42", 10)
);

function sanitizeOption(o: DecisionOption) {
  return { id: o.id, label: o.label, archetype: o.archetype };
}

function sanitizeDecision(d: TickDecision): TickDecisionPublic {
  return {
    id: d.id,
    tick: d.tick,
    phase: d.phase,
    phaseLabel: d.phaseLabel,
    procedurePhase: d.procedurePhase,
    archetype: d.archetype,
    prompt: d.prompt,
    context: d.context,
    options: d.options.map(sanitizeOption),
    urgency: d.urgency,
  };
}

function sanitizeDecisionResult(r: {
  wasCorrect: boolean;
  feedback: string;
  scoreDelta: number;
  complicationTriggered: string | null;
}): DecisionResultPublic {
  return {
    wasCorrect: r.wasCorrect,
    feedback: r.feedback,
    scoreDelta: r.scoreDelta,
    complicationTriggered: r.complicationTriggered,
  };
}

async function startServer() {
  const app = express();
  // Security middleware: Helmet with Content Security Policy
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
           defaultSrc: ["'self'"],
           scriptSrc: ["'self'"],
           styleSrc: ["'self'"],
           imgSrc: ["'self'", "data:"],
           connectSrc: ["'self'", "http://localhost:8001", "https://*.supabase.co", "https://github.com", "https://api.github.com", "https://*.groq.com"],
        },
      },
      referrerPolicy: { policy: "no-referrer" },
    })
  );
  const server = createServer(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  
  // JSON Body Parser for API
  app.use(express.json());

  // Proxy helper for ScrubIn Core (Python FastAPI engine)
  const CORE_URL = process.env.SCRUBIN_CORE_URL || "http://localhost:8001";

  async function proxyToCore(req: express.Request, res: express.Response, targetPath: string, methodOverride?: string) {
    try {
      const method = methodOverride || req.method;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      let url = `${CORE_URL}${targetPath}`;
      const queryIndex = req.url.indexOf("?");
      if (method === "GET" && queryIndex !== -1) {
        url += req.url.slice(queryIndex);
      }

      const options: RequestInit = {
        method,
        headers,
      };

      if (method !== "GET" && method !== "HEAD") {
        options.body = JSON.stringify(req.body || {});
      }

      const coreRes = await fetch(url, options);
      const contentType = coreRes.headers.get("content-type");
      let data: any;

      if (contentType && contentType.includes("application/json")) {
        data = await coreRes.json();
      } else {
        data = await coreRes.text();
      }

      res.status(coreRes.status).json(typeof data === "string" ? { message: data } : data);
    } catch (error: any) {
      console.error(`Proxy to core error (${targetPath}):`, error.message);
      res.status(503).json({ error: "ScrubIn Core service is unavailable", detail: error.message });
    }
  }

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const coreRes = await fetch(`${CORE_URL}/health`);
      if (coreRes.ok) {
        const data = await coreRes.json();
        res.json({ core: "up", ...data });
      } else {
        res.json({ core: "down" });
      }
    } catch {
      res.json({ core: "down" });
    }
  });

  // Groq LLM API Endpoint — AI Attending Notes (with Core proxy fallback)
  app.post("/api/evaluate", async (req, res) => {
    if (process.env.GROQ_API_KEY) {
      try {
        const payload = req.body;
        const Groq = (await import("groq-sdk")).default;
        const groq = new Groq({
          apiKey: process.env.GROQ_API_KEY,
        });

        const procedureName = payload.procedureName || "Unknown Procedure";
        const totalDecisions = payload.totalDecisions || payload.history?.length || "unknown number of";

        const systemPrompt = `You are a senior attending surgeon giving post-operative feedback to a medical student after a ${procedureName} simulation. You are direct, specific, and educational. You reference exact decisions by number and phase. You never give generic feedback — every note must be specific to ${procedureName} anatomy, technique, and decision-making. You always explain the medical reasoning behind what went wrong and what the correct approach should have been. Your tone is like a real attending — firm but constructive. Keep your notes under 200 words.`;

        const userPrompt = `Please evaluate this ${procedureName} case:
        Patient: ${JSON.stringify(payload.patient)}
        Outcome: ${payload.outcomeBadge} (${payload.outcomeSummary})
        Total Decisions in Case: ${totalDecisions}
        
        Decisions Log:
        ${payload.history ? payload.history.map((h: any) => `Decision ${h.decisionNumber}: ${h.decisionTitle} -> ${h.isCorrect ? 'Correct' : 'Incorrect'}. Complication Triggered: ${h.complication || 'None'}. Vitals at time: HR ${h.vitals?.hr}, BP ${h.vitals?.bpSys}`).join("\n") : ""}
        `;

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          max_tokens: 400,
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const notes = completion.choices[0]?.message?.content || "Attending notes unavailable.";
        res.json({ notes });
        return;
      } catch (error: any) {
        console.error("Groq API Error, falling back to core proxy:", error.message);
      }
    }
    proxyToCore(req, res, "/evaluate");
  });

  // GitHub OAuth Proxy Endpoint
  app.post("/api/auth/github", async (req, res) => {
    try {
      const { code } = req.body;
      const client_id = process.env.VITE_GITHUB_CLIENT_ID;
      const client_secret = process.env.GITHUB_CLIENT_SECRET;

      if (!client_id || !client_secret) {
        throw new Error("GitHub credentials not configured in .env");
      }

      // 1. Exchange code for access_token
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id,
          client_secret,
          code,
        }),
      });

      const tokenData = (await tokenResponse.json()) as any;
      const access_token = tokenData.access_token;

      if (!access_token) {
        throw new Error("Failed to obtain access token from GitHub");
      }

      // 2. Fetch User Profile
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
          Accept: "application/json",
        },
      });

      const userData = (await userResponse.json()) as any;

      res.json({
        user: {
          id: userData.id.toString(),
          name: userData.name || userData.login,
          login: userData.login,
          avatar_url: userData.avatar_url,
          email: userData.email,
        },
      });
    } catch (error: any) {
      console.error("GitHub OAuth Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Google OAuth Proxy Endpoint
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { code, redirect_uri } = req.body;
      const client_id = process.env.VITE_GOOGLE_CLIENT_ID;
      const client_secret = process.env.GOOGLE_CLIENT_SECRET;

      if (!client_id || !client_secret) {
        throw new Error("Google credentials not configured in .env");
      }

      // 1. Exchange code for access_token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id,
          client_secret,
          redirect_uri: redirect_uri || `${process.env.VITE_APP_URL || "http://localhost:3000"}/signin`,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = (await tokenResponse.json()) as any;
      const access_token = tokenData.access_token;

      if (!access_token) {
        throw new Error("Failed to obtain access token from Google");
      }

      // 2. Fetch User Profile
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userData = (await userResponse.json()) as any;

      res.json({
        user: {
          id: userData.id,
          name: userData.name,
          login: userData.email.split("@")[0],
          avatar_url: userData.picture,
          email: userData.email,
        },
      });
    } catch (error: any) {
      console.error("Google OAuth Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── Simulation API (Proxied to ScrubIn-Core) ──

  app.post("/api/sim/start", (req, res) => {
    proxyToCore(req, res, "/start");
  });

  app.post("/api/sim/next", (req, res) => {
    proxyToCore(req, res, "/next");
  });

  app.post("/api/sim/decide", (req, res) => {
    proxyToCore(req, res, "/decide");
  });

  app.post("/api/sim/reset", (req, res) => {
    proxyToCore(req, res, "/reset");
  });

  app.post("/api/sim/complicate", (req, res) => {
    proxyToCore(req, res, "/complicate");
  });

  app.post("/api/sim/tick", (req, res) => {
    proxyToCore(req, res, "/tick");
  });

  app.post("/api/sim/complete", (req, res) => {
    proxyToCore(req, res, "/complete");
  });

  app.get("/api/sim/procedures", (req, res) => {
    proxyToCore(req, res, "/procedures");
  });

  app.get("/api/scenarios", (req, res) => {
    proxyToCore(req, res, "/scenarios");
  });

// Dashboard endpoint – returns deterministic stats derived from SessionManager
app.get("/api/dashboard", (_req, res) => {
  // Deterministic dashboard data – currently only active session count
  const activeSessions = sessionManager.size;
  res.json({ activeSessions });
});

// Phase 12 – SEO metadata endpoint (stub)
app.get("/api/seo/:page", (req, res) => {
  const page = req.params.page;
  const data = {
    title: `${page.charAt(0).toUpperCase() + page.slice(1)} – ScrubIn`,
    description: `Learn about ${page} in ScrubIn – interactive surgical simulation platform.`,
    ogImage: `/og/${page}.png`,
    keywords: `${page}, scrubin, surgery, simulation, learning`,
  };
    res.json(data);
});

/* Begin comment – disable broken routes

  const dummy = {
    continueSimulation: null, // could hold last session id
    recommendedProcedures: [
      { id: "appendectomy", name: "Appendectomy", estimated_time: "30 min" },
      { id: "cabg", name: "Coronary Artery Bypass Graft", estimated_time: "45 min" },
    ],
    recentActivity: [],
    progress: { completedProcedures: 3, totalProcedures: 12 },
    achievements: [],
  };
  res.json(dummy);
});
  // existing code unchanged
});

// Phase 9 – Profile endpoint (placeholder)
app.get("/api/profile", (_req, res) => {
  // In a real app this would derive from session/auth token
  const dummy = {
    id: "user-1",
    name: "Demo User",
    login: "demo",
    avatar_url: "https://i.pravatar.cc/150?u=demo",
    email: null,
    profession: "Surgeon",
    xp: 0,
    badges: [],
  };
  res.json(dummy);
});
  // existing code unchanged
});

// Phase 8 – Leaderboard placeholder (to be extended later)
app.get("/api/leaderboard", (_req, res) => {
  // Simple static leaderboard for now – can be replaced with DB later
  const dummy = [
    { id: "1", name: "Alice", login: "alice", avatar_url: "https://i.pravatar.cc/150?u=alice", score: 1200 },
    { id: "2", name: "Bob", login: "bob", avatar_url: "https://i.pravatar.cc/150?u=bob", score: 1150 },
    { id: "3", name: "Carol", login: "carol", avatar_url: "https://i.pravatar.cc/150?u=carol", score: 1100 },
  ];
  res.json({ entries: dummy });
});

});

app.get("/api/scenarios/:id", (req, res) => {
    // existing code unchanged
  });

  // Phase 6 – Procedure Library helpers
  // Simple search endpoint
  app.get("/api/procedures/search", (req, res) => {
    try {
      const q = (req.query.q as string | undefined)?.toLowerCase() ?? "";
      const difficulty = (req.query.difficulty as string | undefined)?.toLowerCase();
      const tag = (req.query.tag as string | undefined)?.toLowerCase();
      const all = listProcedures();
      const filtered = all.filter((p) => {
        const matchText = p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
        const matchDiff = difficulty ? p.category?.toLowerCase() === difficulty : true;
        const matchTag = tag ? (p.tags ?? []).some((t) => t.toLowerCase() === tag) : true;
        return matchText && matchDiff && matchTag;
      });
      res.json({ procedures: filtered });
    } catch (e: any) {
      console.error("Procedure search error:", e);
      res.status(500).json({ error: e.message });
    }
  });
  const proc = getProcedure(req.params.id);
  if (!proc) {
    res.status(404).json({ detail: "Scenario not found" });
    return;
  }
  res.json(enrichScenario(proc));
});

*/
// New routes – save, list, resume, replay, profile, leaderboard, scenario, search

const savedSimulations = new Map<string, any>();

app.post("/api/sim/save", (req, res) => {
  const { session_id, procedure } = req.body || {};
  const id = `save_${Date.now()}`;
  const savedAt = new Date().toISOString();
  savedSimulations.set(id, {
    id,
    savedAt,
    session_id,
    procedure: procedure || "appendectomy",
    tick: 1,
    status: "active",
    state: { session_id, procedureId: procedure || "appendectomy", tick: 1 },
  });
  res.json({ id, savedAt });
});

app.get("/api/sim/list", (_req, res) => {
  const list = Array.from(savedSimulations.values()).map((s) => ({
    id: s.id,
    session_id: s.session_id,
    procedure: s.procedure,
    last_saved: s.savedAt,
    tick: s.tick,
    status: s.status,
  }));
  res.json({ saved: list });
});

app.post("/api/sim/resume", async (req, res) => {
  const { id, session_id } = req.body || {};
  const saved = id
    ? savedSimulations.get(id)
    : Array.from(savedSimulations.values()).find((s) => s.session_id === session_id);
  if (!saved) {
    res.status(404).json({ detail: "Saved simulation not found" });
    return;
  }
  try {
    const coreRes = await fetch(`${CORE_URL}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ procedure: saved.state?.procedureId || "appendectomy" }),
    });
    if (coreRes.ok) {
      const data = await coreRes.json();
      res.json({
        ...saved.state,
        session_id: data.session_id,
        procedure: saved.procedure || saved.state?.procedureId || "appendectomy",
      });
      return;
    }
  } catch {}
  res.json({
    session_id: saved.session_id || id,
    procedure: saved.procedure || saved.state?.procedureId || "appendectomy",
    ...saved.state,
  });
});

app.delete("/api/sim/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  let removed = false;
  savedSimulations.forEach((s, saveId) => {
    if (s.session_id === sessionId || saveId === sessionId) {
      savedSimulations.delete(saveId);
      removed = true;
    }
  });
  if (!removed) {
    res.status(404).json({ detail: "Saved simulation not found" });
    return;
  }
  res.json({ success: true });
});

app.get("/api/replay/:id", (req, res) => {
  const { id } = req.params;
  const saved = savedSimulations.get(id);
  if (!saved) {
    res.json({ replay: { id, status: "placeholder" } });
    return;
  }
  res.json({ replay: saved.state });
});

app.get("/api/profile", (_req, res) => {
  const dummy = {
    id: "user-1",
    name: "Demo User",
    login: "demo",
    avatar_url: "https://i.pravatar.cc/150?u=demo",
    email: null,
    profession: "Surgeon",
    xp: 0,
    badges: [],
  };
  res.json(dummy);
});

app.get("/api/leaderboard", (_req, res) => {
  const dummy = [
    { id: "1", name: "Alice", login: "alice", avatar_url: "https://i.pravatar.cc/150?u=alice", score: 1200 },
    { id: "2", name: "Bob", login: "bob", avatar_url: "https://i.pravatar.cc/150?u=bob", score: 1150 },
    { id: "3", name: "Carol", login: "carol", avatar_url: "https://i.pravatar.cc/150?u=carol", score: 1100 },
  ];
  res.json({ entries: dummy });
});

app.get("/api/scenarios/:id", (req, res) => {
  proxyToCore(req, res, `/scenarios/${req.params.id}`);
});

app.get("/api/procedures/search", (req, res) => {
  proxyToCore(req, res, "/procedures/search");
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: "Internal server error" });
});

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 5000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
