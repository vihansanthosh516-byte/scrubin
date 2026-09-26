import { useEffect, useRef } from "react";
import type { CommsMessage } from "@/engine/types";
import { fmtTime } from "./AnesthesiaStation";

const SPEAKER_STYLE: Record<string, string> = {
  surgeon: "text-amber-warm",
  anesthesia: "text-primary",
  attending: "text-primary",
  circulator: "text-sage dark:text-[#5E8C74]",
  scrub: "text-sage dark:text-[#5E8C74]",
  patient: "text-[#9B4D6A] dark:text-pink-200",
  system: "text-muted-foreground",
  trainee: "text-foreground",
};

// Distinct synthetic voices per teammate so you can tell who's talking.
const VOICE_PARAMS: Record<string, { pitch: number; rate: number; idx: number }> = {
  surgeon: { pitch: 0.85, rate: 1.05, idx: 0 },
  anesthesia: { pitch: 1.0, rate: 1.0, idx: 1 },
  attending: { pitch: 1.0, rate: 1.0, idx: 1 },
  circulator: { pitch: 1.2, rate: 1.05, idx: 2 },
  scrub: { pitch: 0.95, rate: 1.1, idx: 3 },
  patient: { pitch: 1.05, rate: 0.95, idx: 4 },
};

export function speak(m: CommsMessage) {
  if (!("speechSynthesis" in window)) return;
  const p = VOICE_PARAMS[m.from];
  if (!p) return;
  const u = new SpeechSynthesisUtterance(m.text.replace(/\*/g, ""));
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  if (voices.length) u.voice = voices[p.idx % voices.length];
  u.pitch = p.pitch;
  u.rate = p.rate;
  window.speechSynthesis.speak(u);
}

export function CommsLog({ comms, voices }: { comms: CommsMessage[]; voices: boolean }) {
  const endRef = useRef<HTMLDivElement>(null);
  const spoken = useRef<number>(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (!voices) {
      spoken.current = comms.at(-1)?.id ?? 0;
      return;
    }
    for (const m of comms) {
      if (m.id > spoken.current) {
        spoken.current = m.id;
        if (m.kind !== "trainee") speak(m);
      }
    }
  }, [comms, voices]);

  return (
    <div className="rounded-sm border border-border bg-card p-3 h-full min-h-[220px] max-h-[420px] overflow-y-auto text-sm space-y-1.5" aria-live="polite">
      {comms.map((m) =>
        m.kind === "trainee" ? (
          <div key={m.id} className="flex justify-end">
            <div className="max-w-[85%] rounded-sm bg-primary/10 border border-border px-3 py-1.5">
              <span className="text-[10px] font-mono-data text-muted-foreground mr-2">{fmtTime(m.t)}</span>
              {m.text}
            </div>
          </div>
        ) : (
          <div key={m.id} className={`leading-snug ${m.kind === "alarm" ? "text-destructive" : ""}`}>
            <span className="text-[10px] font-mono-data text-muted-foreground mr-2">{fmtTime(m.t)}</span>
            {m.kind !== "narration" && m.kind !== "finding" && m.kind !== "sign" && (
              <span className={`font-semibold mr-1.5 ${SPEAKER_STYLE[m.from] ?? ""}`}>{m.name}:</span>
            )}
            <span className={m.kind === "finding" || m.kind === "sign" || m.kind === "narration" ? "italic text-muted-foreground" : m.kind === "question" ? "text-amber-warm" : ""}>
              {m.text}
            </span>
          </div>
        ),
      )}
      <div ref={endRef} />
    </div>
  );
}
