import { Mic, MicOff, Send } from "lucide-react";
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

interface Props {
  onSubmit: (text: string) => void;
  lastParse: { text: string; ok: boolean; source: string; clarification: string | null } | null;
  role: "anesthesia" | "surgeon";
}

/**
 * Type or speak orders. Hold the mic button (or the spacebar when not typing)
 * to talk — push-to-talk, like a real OR where you call out orders.
 * Uses the browser's speech recognition; falls back to server-side Whisper.
 */
export function CommandBar({ onSubmit, lastParse, role }: Props) {
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
        } catch {
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

  // Spacebar push-to-talk when not typing in a field.
  useEffect(() => {
    const isTyping = () => {
      const el = document.activeElement as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
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
      : ["prep and drape", "time out", "incision at the umbilicus", "hasson entry", "insufflate", "camera in", "divide the mesoappendix with the ligasure", "clip the bleeder"];

  return (
    <div className="rounded-sm border border-border bg-card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            start();
          }}
          onPointerUp={stop}
          onPointerLeave={() => listening && stop()}
          className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
            listening ? "bg-destructive/10 border-destructive scale-110 shadow-[0_0_24px_rgba(248,113,113,0.5)]" : "border-border hover:bg-primary/10"
          }`}
          aria-label="Hold to talk"
          title="Hold to talk (or hold Space)"
        >
          {listening ? <Mic className="w-5 h-5 text-destructive" /> : <MicOff className="w-5 h-5 text-primary" />}
        </button>
        <input
          ref={inputRef}
          value={listening ? interim : text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit(text);
            if (e.key === "Escape") inputRef.current?.blur();
          }}
          placeholder={listening ? "Listening…" : "Say or type an order — e.g. “push 150 of propofol”"}
          className="flex-1 bg-muted border border-border rounded-sm px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button type="button" onClick={() => submit(text)} className="shrink-0 w-11 h-11 rounded-sm border border-border flex items-center justify-center hover:bg-primary/10" aria-label="Send">
          <Send className="w-4 h-4 text-primary" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>Hold <kbd className="px-1 rounded bg-muted">Space</kbd> to talk.</span>
        {lastParse && (
          <span className={lastParse.ok ? "text-sage dark:text-[#5E8C74]" : "text-amber-warm"}>
            {lastParse.ok ? `✓ “${lastParse.text}”` : `? “${lastParse.text}”`}
            {lastParse.source === "llm" ? " (AI)" : ""}
          </span>
        )}
        {voiceError && <span className="text-destructive">{voiceError}</span>}
      </div>
      <div className="flex flex-wrap gap-1">
        {examples.map((ex) => (
          <button key={ex} type="button" onClick={() => setText(ex)} className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-border">
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
