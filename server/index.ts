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

  // Groq LLM API Endpoint — AI Attending Notes
  app.post("/api/evaluate", async (req, res) => {
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
      ${payload.history.map((h: any) => `Decision ${h.decisionNumber}: ${h.decisionTitle} -> ${h.isCorrect ? 'Correct' : 'Incorrect'}. Complication Triggered: ${h.complication || 'None'}. Vitals at time: HR ${h.vitals.hr}, BP ${h.vitals.bpSys}`).join("\n")}
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
    } catch (error: any) {
      console.error("Groq API Error:", error);
      res.status(500).json({ error: error.message });
    }
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

  // ── Simulation API ──

  app.post("/api/sim/start", (req, res) => {
    try {
      const { seed, procedure } = req.body || {};
      const procedureId = procedure || "appendectomy";
      if (!procedureExists(procedureId)) {
        res.status(400).json({ detail: `Unknown procedure: ${procedureId}` });
        return;
      }
      const simSeed = typeof seed === "number" ? seed : seedRng.nextInt(1, 999999);
      const session = sessionManager.create(simSeed, procedureId);
      const state = session.state;
      res.json({
        session_id: session.id,
        tick: state.tick,
        procedure_id: state.procedureId,
        procedure_name: state.procedureName,
        patient: state.patient,
        total_ticks: state.totalTicks,
      });
    } catch (e: any) {
      res.status(500).json({ detail: e.message });
    }
  });

  app.post("/api/sim/next", (req, res) => {
    try {
      const { session_id } = req.body || {};
      const session = sessionManager.get(session_id);
      if (!session) {
        res.status(404).json({ detail: "Session not found" });
        return;
      }
      const result = session.next();
      const pending = result.pendingDecision
        ? sanitizeDecision(result.pendingDecision)
        : null;
      const resp: NextTickResponse = {
        tick: result.tick,
        vitals: result.vitalsAfter,
        escalation_phase: result.escalationPhase,
        procedure_phase: result.procedurePhase,
        active_complication: result.activeComplication,
        pending_decision: pending,
        events: result.events,
        score: result.score,
        completed: session.state.completed,
      };
      res.json(resp);
    } catch (e: any) {
      if (e.message === "Cannot advance tick without decision") {
        res.status(409).json({ detail: e.message });
        return;
      }
      res.status(500).json({ detail: e.message });
    }
  });

  app.post("/api/sim/decide", (req, res) => {
    try {
      const { session_id, decision_id, option_id } = req.body || {};
      const session = sessionManager.get(session_id);
      if (!session) {
        res.status(404).json({ detail: "Session not found" });
        return;
      }
      const result = session.submitDecision(decision_id, option_id);
      const dr = result.decisionResult;
      const state = session.state;
      const resp: DecideResponse = {
        tick: result.tick,
        vitals: result.vitalsAfter,
        escalation_phase: result.escalationPhase,
        procedure_phase: result.procedurePhase,
        active_complication: result.activeComplication,
        decision_result: dr
          ? sanitizeDecisionResult({
              wasCorrect: dr.wasCorrect,
              feedback: dr.feedback,
              scoreDelta: dr.scoreDelta,
              complicationTriggered: dr.complicationTriggered,
            })
          : { wasCorrect: false, feedback: "", scoreDelta: 0, complicationTriggered: null },
        next_tick_ready: result.pendingDecisionState?.resolved === true,
        events: result.events,
        score: result.score,
        completed: state.completed,
        correct_decisions: state.correctDecisions,
        total_decisions: state.totalDecisions,
      };
      res.json(resp);
    } catch (e: any) {
      res.status(400).json({ detail: e.message });
    }
  });

  app.post("/api/sim/reset", (req, res) => {
    try {
      const { session_id } = req.body || {};
      if (session_id) sessionManager.delete(session_id);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ detail: e.message });
    }
  });

app.get("/api/sim/procedures", (_req, res) => {
  const procs = listProcedures();
  res.json({
    procedures: procs.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      specialty: p.specialty,
      description: p.description,
      patient: p.patient,
      totalTicks: p.totalTicks,
      phases: p.phases,
    })),
  });
});

// New scenario endpoints for the website UI
// Helper to enrich a ProcedureDefinition with UI‑only metadata (ignored by the engine)
function enrichScenario(p) {
  return {
    id: p.id,
    name: p.name,
    specialty: p.specialty,
    difficulty: p.category,
    // UI‑only fields – provide sensible defaults or placeholders
    thumbnail: `/thumbnails/${p.id}.png`, // client can fallback if missing
    tags: [],
    estimated_time: `${p.totalTicks ?? 0} min`,
    anatomy_regions: [],
    learning_objectives: [],
    required_instruments: [],
    // Preserve existing fields needed elsewhere
    category: p.category,
    description: p.description,
    patient: p.patient,
    totalTicks: p.totalTicks,
    phases: p.phases,
  };
}

app.get("/api/scenarios", (_req, res) => {
  // Return all procedures enriched as UI scenarios
  const procs = listProcedures();
  const enriched = procs.map(enrichScenario);
  res.json({ scenarios: enriched });
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
  const { session_id } = req.body || {};
  const session = sessionManager.get(session_id);
  if (!session) {
    res.status(404).json({ detail: "Session not found" });
    return;
  }
  const id = `save_${Date.now()}`;
  const savedAt = new Date().toISOString();
  savedSimulations.set(id, {
    id,
    savedAt,
    state: session.state,
  });
  res.json({ id, savedAt });
});

app.get("/api/sim/list", (_req, res) => {
  const list = Array.from(savedSimulations.values()).map((s) => ({
    id: s.id,
    savedAt: s.savedAt,
  }));
  res.json({ saved: list });
});

app.post("/api/sim/resume", (req, res) => {
  const { id } = req.body || {};
  const saved = savedSimulations.get(id);
  if (!saved) {
    res.status(404).json({ detail: "Saved simulation not found" });
    return;
  }
  const seed = saved.state?.seed ?? Math.floor(Math.random() * 1_000_000);
  const procedureId = saved.state?.procedureId ?? "appendectomy";
  const session = sessionManager.create(seed, procedureId);
  res.json({
    session_id: session.id,
    ...saved.state,
  });
});

app.get("/api/replay/:id", (req, res) => {
  const { id } = req.params;
  const saved = savedSimulations.get(id);
  if (!saved) {
    res.status(404).json({ detail: "Saved simulation not found" });
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
  const proc = getProcedure(req.params.id);
  if (!proc) {
    res.status(404).json({ detail: "Scenario not found" });
    return;
  }
  res.json(enrichScenario(proc));
});

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

app.use((err, req, res, next) => {
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
