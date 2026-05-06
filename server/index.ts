import express from "express";
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
        pending_decision: pending!,
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
