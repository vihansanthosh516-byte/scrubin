import { AlertCircle, Check, HelpCircle, Mic, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { engineApi } from "@/engine/client";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognizer(): SpeechRecognitionLike | null {
  const W = window as any;
  const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r: SpeechRecognitionLike = new Ctor();
  r.lang = "en-US";
  r.interimResults = true;
  r.continuous = true;
  return r;
}

/** Surgeon example chips per engine scenario. */
const SURGEON_EXAMPLES: Record<string, string[]> = {
  appendectomy: ["prep and drape", "incision at the umbilicus", "hasson entry", "insufflate", "camera in", "divide the mesoappendix with the ligasure", "clip the bleeder"],
  cholecystectomy: ["prep and drape", "incision at the umbilicus", "hasson entry", "insufflate", "camera in", "retract the fundus", "confirm the critical view of safety", "clip the cystic duct"],
  inguinal_hernia: ["prep and drape", "empty the bladder", "hasson entry", "insufflate", "identify the epigastric vessels", "incise the peritoneum", "reduce the sac", "tack the mesh to Cooper's ligament"],
  sigmoid_colectomy: ["prep and drape", "hasson entry", "insufflate", "sweep the small bowel", "medial to lateral dissection", "identify the left ureter", "divide the IMA with the ligasure", "air leak test"],
  total_hysterectomy: ["prep and drape", "place the uterine manipulator", "hasson entry", "insufflate", "divide the round ligaments", "develop the bladder flap", "identify the ureter", "coagulate the uterine arteries"],
  radical_nephrectomy: ["prep and drape", "hasson entry", "insufflate", "reflect the colon", "expose the hilum", "survey the hilum", "clip the renal artery", "staple the renal vein"],
  radical_prostatectomy: ["prep and drape", "place the foley", "dock the robot", "ligate the dorsal venous complex", "spare the nerves", "divide the urethra", "urethrovesical anastomosis", "leak test"],
  emergency_cesarean: ["prep and drape", "pfannenstiel incision", "open the fascia", "open the peritoneum", "place the bladder retractor", "incise the uterus", "deliver the baby", "clamp the cord", "deliver the placenta", "close the uterus"],
};

interface Props {
  onSubmit: (text: string) => void;
  lastParse: { text: string; ok: boolean; source: string; clarification: string | null } | null;
  role: "anesthesia" | "surgeon";
  scenario?: string;
  /** Inside a container that already draws the frame (the OR's bottom bar). */
  bare?: boolean;
}

/**
 * Type or speak orders. Hold the mic button (or the spacebar when not typing)
 * to talk — push-to-talk, like a real OR where you call out orders.
 * Uses the browser's speech recognition; falls back to server-side Whisper.
 */
export function CommandBar({ onSubmit, lastParse, role, scenario, bare }: Props) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = useCallback(
    (value: string) => {
      const v = value.trim();
      if (!v) return;
      onSubmit(v);
      setText("");
    },
    [onSubmit],
  );

  const start = useCallback(async () => {
    if (listening) return;
    setVoiceError(null);
    finalRef.current = "";
    setInterim("");
    const rec = getRecognizer();
    if (rec) {
      rec.onresult = (e: any) => {
        let fin = "";
        let inter = "";
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) fin += r[0].transcript;
          else inter += r[0].transcript;
        }
        finalRef.current = fin;
        setInterim(fin + inter);
      };
      rec.onerror = (e: any) => setVoiceError(e.error === "not-allowed" ? "Microphone permission denied." : `Voice error: ${e.error}`);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
      return;
    }
    // Fallback: record audio and transcribe on the engine (Whisper).
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => chunksRef.current.push(ev.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        try {
          const said = await engineApi.transcribe(blob);
          submit(said);
        } catch (e) {
          if (String((e as Error)?.message).includes("rate-limited")) {
            setVoiceError("Too many voice requests. Wait a minute, or type the order.");
            return;
          }
          setVoiceError("Speech-to-text unavailable. Type instead, or use Chrome/Edge for built-in recognition.");
        }
      };
      recorderRef.current = mr;
      mr.start();
      setListening(true);
    } catch {
      setVoiceError("No microphone available.");
    }
  }, [listening, submit]);

  const stop = useCallback(() => {
    if (recRef.current) {
      const rec = recRef.current;
      recRef.current = null;
      rec.stop();
      // Give the recogniser a moment to deliver the final result.
      window.setTimeout(() => {
        const said = finalRef.current || interim;
        setInterim("");
        setListening(false);
        submit(said);
      }, 350);
    } else if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setListening(false);
    }
  }, [interim, submit]);

  // Spacebar push-to-talk when not typing in a field. Space on a focused control (a button, a tab,
  // a checkbox) belongs to that control, and nothing fires while a dialog is open.
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement as HTMLElement | null;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return true;
      return (
        !!el &&
        (["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "SUMMARY"].includes(el.tagName) ||
          el.isContentEditable ||
          /^(button|tab|checkbox|radio|switch|menuitem|option|slider)$/.test(el.getAttribute("role") ?? ""))
      );
    };
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat && !isTyping()) {
        e.preventDefault();
        start();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping()) {
        e.preventDefault();
        stop();
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [start, stop]);

  const examples =
    role === "anesthesia"
      ? ["put on standard monitors", "preoxygenate", "fentanyl 100", "propofol 150 and roc 100", "intubate with the video laryngoscope", "volume control 500 by 14 peep 6", "sevo 2.5 percent", "listen to the chest"]
      : SURGEON_EXAMPLES[scenario ?? ""] ?? SURGEON_EXAMPLES.appendectomy;

  return (
    <div className={bare ? "space-y-1.5" : "space-y-2 rounded-sm border border-border bg-card p-3"}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            // Keep the press even if the pointer slides off the button mid-sentence.
            e.currentTarget.setPointerCapture(e.pointerId);
            start();
          }}
          onPointerUp={stop}
          onPointerCancel={() => listening && stop()}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
            listening ? "border-destructive bg-destructive text-destructive-foreground" : "border-border text-primary hover:bg-primary/10"
          }`}
          aria-label={listening ? "Listening. Release to send" : "Hold to talk"}
          aria-pressed={listening}
          title="Hold to talk (or hold Space)"
        >
          <Mic className={`h-5 w-5 ${listening ? "motion-safe:animate-pulse" : ""}`} aria-hidden="true" />
        </button>
        <label htmlFor="or-command-input" className="sr-only">
          Order to the team
        </label>
        <input
          id="or-command-input"
          autoComplete="off"
          data-1p-ignore
          data-lpignore="true"
          ref={inputRef}
          value={listening ? interim : text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(text);
            if (e.key === "Escape") inputRef.current?.blur();
          }}
          placeholder={listening ? "Listening…" : role === "anesthesia" ? "Say or type an order, e.g. “push 150 of propofol”" : "Say or type an order, e.g. “camera in”"}
          className="flex-1 rounded-sm border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
        />
        <button type="button" onClick={() => submit(text)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-border text-primary hover:bg-primary/10" aria-label="Send order">
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-live="polite">
        {listening ? (
          <span className="flex items-center gap-1.5 font-semibold text-destructive">
            <span className="h-2 w-2 rounded-full bg-destructive motion-safe:animate-pulse" aria-hidden="true" /> Listening… release to send
          </span>
        ) : (
          <span className="hidden sm:inline">
            Hold <kbd className="rounded-sm border border-border bg-muted px-1">Space</kbd> to talk, <kbd className="rounded-sm border border-border bg-muted px-1">/</kbd> to type
          </span>
        )}
        {lastParse && (
          <span className={`flex items-center gap-1 ${lastParse.ok ? "text-success" : "text-warning"}`}>
            {lastParse.ok ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />}
            {lastParse.ok ? "Understood" : "Not understood"}: “{lastParse.text}”{lastParse.source === "llm" ? " (AI)" : ""}
          </span>
        )}
        {voiceError && (
          <span className="flex items-center gap-1 text-destructive">
            <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" /> {voiceError}
          </span>
        )}
      </div>
      {lastParse && !lastParse.ok && lastParse.clarification && (
        <p className="rounded-sm border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">{lastParse.clarification}</p>
      )}
      {/* One scrollable row so the bar stays short. */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]" aria-label="Example orders">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onSubmit(ex)}
            title="Send this order"
            className="shrink-0 whitespace-nowrap rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:border-surface-hover-border hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
