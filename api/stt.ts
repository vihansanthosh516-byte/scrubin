// Speech to text for the "hold to talk" button. The page posts the raw recording; the key stays here.
import { allow, readBody, type Req, type Res } from "./_lib.js";

export const config = { api: { bodyParser: false } };

const PROMPT =
  "Operating room orders: propofol, fentanyl, remifentanil, rocuronium, succinylcholine, sugammadex, neostigmine, glycopyrrolate, phenylephrine, ephedrine, sevoflurane, cefazolin, metronidazole, " +
  "PEEP, tidal volume, laryngoscope, bougie, LMA, Trendelenburg, trocar, Veress, mesoappendix, endoloop, cholecystectomy, cystic duct, Calot, critical view of safety, TAPP, epigastric vessels, " +
  "iliopubic tract, Cooper's ligament, sigmoid colectomy, IMA, ureter, splenic flexure, anastomosis, hysterectomy, uterine manipulator, colpotomy, vaginal cuff, nephrectomy, renal hilum, " +
  "prostatectomy, dorsal venous complex, urethrovesical, lateral decubitus.";

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!allow(req, "stt", 15, 60_000)) return res.status(429).json({ error: "Too many requests" });
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(503).json({ error: "speech-to-text unavailable (no API key)" });
  try {
    const audio = await readBody(req, 5_000_000);
    const form = new FormData();
    form.append("file", new Blob([audio], { type: String(req.headers["content-type"] || "audio/webm") }), "speech.webm");
    form.append("model", "whisper-large-v3-turbo");
    form.append("prompt", PROMPT);
    form.append("language", "en");
    form.append("temperature", "0");
    const up = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form });
    if (!up.ok) return res.status(503).json({ error: "speech-to-text failed" });
    const data = (await up.json()) as any;
    res.status(200).json({ text: String(data.text || "").trim() });
  } catch (e: any) {
    res.status(e?.status || 500).json({ error: String(e?.message || e) });
  }
}
