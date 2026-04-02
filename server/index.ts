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

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
