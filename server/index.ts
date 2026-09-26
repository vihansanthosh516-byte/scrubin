import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
// Procedure catalog (metadata for the library). Simulation itself runs in the
// Python engine (engine/), reached by the client at /engine.
import { getProcedure, listProcedures } from "./engine/procedures/registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Security middleware: Helmet with Content Security Policy
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", "https://*.supabase.co", "https://github.com", "https://api.github.com", "https://*.groq.com"],
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

      // Free-form OR simulator debrief (engine/scrubin_engine/scoring/debrief.py).
      if (payload.debrief) {
        const d = payload.debrief;
        const role = d.role === "surgeon" ? "surgeon" : "anesthesiologist";
        const items = (d.items || [])
          .map((i: any) => `- [${i.grade}] ${i.domain} / ${i.title}: ${i.detail}`)
          .join("\n");
        const completion = await groq.chat.completions.create({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
          max_tokens: 2000, // reasoning models spend tokens thinking before answering
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: `You are a senior attending ${role} debriefing a trainee after a simulated ${procedureName}. There were no multiple-choice answers: the trainee managed a physiologically modelled patient in real time. Be specific, reference the findings and timings you are given, explain the physiology and the evidence behind each point, and end with the two most important things to do differently. Do not invent events that are not in the data. Under 220 words.`,
            },
            {
              role: "user",
              content: `Outcome: ${d.outcome}. Duration ${d.duration_min} min. Blood loss ${d.blood_loss_ml} mL.\nHidden case facts (revealed now): ${JSON.stringify(d.hidden)}\nFindings:\n${items}\nSurgical notes: ${(d.surgery?.notes || []).join("; ")}\nUnrecognised complications: ${(d.surgery?.occult || []).join("; ") || "none"}`,
            },
          ],
        });
        res.json({ notes: completion.choices[0]?.message?.content || "Attending notes unavailable." });
        return;
      }

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
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        max_tokens: 2000,
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

// Phase 10 - Dashboard Recommendations
app.get("/api/dashboard/recommendations", (_req, res) => {
  const allProcs = listProcedures();
  const recommended = allProcs.slice(0, 3).map(enrichScenario);
  res.json({ recommendations: recommended });
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

// Phase 13 - AI Workspace Mock Endpoints
app.post("/api/ai/upload", (req, res) => {
  // Mock a successful file upload and return a mock sessionId
  // In reality, this would handle multipart form data
  const mockSessionId = "ai-sess-" + Math.random().toString(36).substring(7);
  
  // Simulate processing delay
  setTimeout(() => {
    res.json({ success: true, sessionId: mockSessionId });
  }, 1500);
});

app.get("/api/ai/session/:id", (req, res) => {
  // Deterministic mock data for an AI session
  const id = req.params.id;
  res.json({
    id,
    status: "complete",
    differential: [
      { condition: "Acute Appendicitis", probability: 85, evidence: ["RLQ pain", "Elevated WBC"] },
      { condition: "Ovarian Torsion", probability: 10, evidence: ["Sudden onset pelvic pain"] },
      { condition: "Ectopic Pregnancy", probability: 5, evidence: [] }
    ],
    timeline: [
      { time: "08:00", event: "Patient admitted with RLQ pain" },
      { time: "08:30", event: "Ultrasound ordered" },
      { time: "09:15", event: "US shows inflamed appendix (9mm)" }
    ],
    riskAssessment: {
      score: 4,
      level: "Moderate",
      factors: ["Mild tachycardia", "Elevated CRP"]
    }
  });
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

app.get("/api/scenarios/:id", (req, res) => {
  const proc = getProcedure(req.params.id);
  if (!proc) {
    res.status(404).json({ detail: "Scenario not found" });
    return;
  }
  res.json(enrichScenario(proc));
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
