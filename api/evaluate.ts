// AI attending notes for a finished case (classic multiple-choice or real-time OR debrief).
import { allow, jsonBody, type Req, type Res } from "./_lib.js";

async function chat(model: string, messages: unknown[], temperature: number): Promise<string> {
  const up = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    // reasoning models spend tokens thinking before answering
    body: JSON.stringify({ model, max_tokens: 2000, temperature, messages }),
  });
  if (!up.ok) throw new Error(`Groq ${up.status}`);
  const data = (await up.json()) as any;
  return data.choices?.[0]?.message?.content || "Attending notes unavailable.";
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!allow(req, "evaluate", 20, 60_000)) return res.status(429).json({ error: "Too many requests" });
  if (!process.env.GROQ_API_KEY) return res.status(200).json({ notes: "AI attending notes are not configured right now." });
  const payload = jsonBody(req);
  const model = process.env.GROQ_EVAL_MODEL || "openai/gpt-oss-120b";
  const procedureName = payload.procedureName || "Unknown Procedure";
  try {
    if (payload.debrief) {
      const d = payload.debrief;
      const role = d.role === "surgeon" ? "surgeon" : "anesthesiologist";
      const items = (d.items || []).map((i: any) => `- [${i.grade}] ${i.domain} / ${i.title}: ${i.detail}`).join("\n");
      const notes = await chat(
        model,
        [
          {
            role: "system",
            content: `You are a senior attending ${role} debriefing a trainee after a simulated ${procedureName}. There were no multiple-choice answers: the trainee managed a physiologically modelled patient in real time. Be specific, reference the findings and timings you are given, explain the physiology and evidence behind each point, and end with the two most important things to do differently. Do not invent events that are not in the data. Use the patient's actual weight for any per-kg dose and show the arithmetic correctly; if unsure, don't compute. Only attribute a cause (e.g. hypotension to induction vs pneumoperitoneum) when the timings given support it. Under 220 words.`,
          },
          {
            role: "user",
            content: `Patient: ${d.patient ? `${d.patient.age}${d.patient.sex}, ${d.patient.weight_kg} kg, allergies: ${(d.patient.allergies || []).join(", ") || "none"}` : "unknown"}.\nOutcome: ${d.outcome}. Duration ${d.duration_min} min. Blood loss ${d.blood_loss_ml} mL.\nHidden case facts (revealed now): ${JSON.stringify(d.hidden)}\nFindings:\n${items}\nSurgical notes: ${(d.surgery?.notes || []).join("; ")}\nUnrecognised complications: ${(d.surgery?.occult || []).join("; ") || "none"}`,
          },
        ],
        0,
      );
      return res.status(200).json({ notes });
    }
    const totalDecisions = payload.totalDecisions || payload.history?.length || "unknown number of";
    const notes = await chat(
      model,
      [
        {
          role: "system",
          content: `You are a senior attending surgeon giving post-operative feedback to a medical student after a ${procedureName} simulation. You are direct, specific, and educational. You reference exact decisions by number and phase. You never give generic feedback — every note must be specific to ${procedureName} anatomy, technique, and decision-making. You always explain the medical reasoning behind what went wrong and what the correct approach should have been. Your tone is like a real attending — firm but constructive. Keep your notes under 200 words.`,
        },
        {
          role: "user",
          content: `Please evaluate this ${procedureName} case:\nPatient: ${JSON.stringify(payload.patient)}\nOutcome: ${payload.outcomeBadge} (${payload.outcomeSummary})\nTotal Decisions in Case: ${totalDecisions}\n\nDecisions Log:\n${
            payload.history
              ? payload.history
                  .map((h: any) => `Decision ${h.decisionNumber}: ${h.decisionTitle} -> ${h.isCorrect ? "Correct" : "Incorrect"}. Complication Triggered: ${h.complication || "None"}. Vitals at time: HR ${h.vitals?.hr}, BP ${h.vitals?.bpSys}`)
                  .join("\n")
              : ""
          }`,
        },
      ],
      0.7,
    );
    res.status(200).json({ notes });
  } catch (e: any) {
    res.status(200).json({ notes: "AI attending notes are unavailable right now." });
  }
}
