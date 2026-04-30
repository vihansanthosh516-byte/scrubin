import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
