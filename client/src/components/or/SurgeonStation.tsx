import { useState } from "react";
import type { Action, CaseState } from "@/engine/types";
import { OrButton, Section } from "./controls";
import CholeScope, { isChole } from "./CholeScope";

interface Props {
  state: CaseState;
  act: (a: Action) => void;
  say: (text: string) => void;
}

/** Laparoscopic view: a state-driven picture of what the camera shows. */
function ScopeView({ state }: { state: CaseState }) {
  const s = state.surgery;
  if (!s) return null;
  const done = new Set(s.done);
  const cameraIn = done.has("camera_in") && !done.has("desufflate");
  const appendixGone = done.has("specimen_out") || done.has("remove_specimen");
  const insufflating = s.iap > 1;
  return (
    <div className="relative aspect-[16/9] rounded-sm overflow-hidden border border-border bg-black">
      {cameraIn && isChole(state) ? (
        <CholeScope state={state} />
      ) : cameraIn ? (
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <defs>
            <radialGradient id="scope" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#6b2a2a" />
              <stop offset="70%" stopColor="#3a1414" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
            <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
              <stop offset="75%" stopColor="transparent" />
              <stop offset="100%" stopColor="#000" />
            </radialGradient>
          </defs>
          <rect width="320" height="180" fill="url(#scope)" />
          {/* bowel loops */}
          <path d="M20 150 C 60 110, 100 170, 140 130 S 220 150, 260 120" stroke="#c97b6b" strokeWidth="22" fill="none" opacity="0.8" />
          <path d="M40 60 C 90 30, 130 80, 170 50" stroke="#b56a5c" strokeWidth="18" fill="none" opacity={state.position === "left_side_down" ? 0.25 : 0.85} />
          {/* cecum */}
          <ellipse cx="215" cy="95" rx="42" ry="30" fill="#d18a78" opacity="0.95" />
          {/* appendix */}
          {!appendixGone && (
            <path
              d={done.has("mobilize_cecum") || !s.findings.join(" ").includes("retrocecal") ? "M205 118 C 195 140, 170 150, 150 158" : "M235 110 C 250 120, 258 132, 262 146"}
              stroke={s.findings.join(" ").includes("perforated") ? "#8c6a2a" : "#e0a080"}
              strokeWidth={done.has("grasp_appendix") ? 12 : 10}
              strokeLinecap="round"
              fill="none"
              opacity={done.has("explore") ? 1 : 0.35}
            />
          )}
          {done.has("divide_meso") && !appendixGone && <path d="M190 125 L 170 140" stroke="#f3d3a0" strokeWidth="2" strokeDasharray="3 3" />}
          {done.has("secure_base") && <circle cx="205" cy="120" r="4" fill="#dddddd" />}
          {/* instruments */}
          {s.running?.instrument && <line x1="320" y1="20" x2="200" y2="110" stroke="#9aa7b3" strokeWidth="5" strokeLinecap="round" />}
          {done.has("working_ports") && <line x1="0" y1="10" x2="150" y2="120" stroke="#8a96a1" strokeWidth="4" strokeLinecap="round" opacity="0.8" />}
          {s.bleeding && (
            <g>
              <circle cx="185" cy="130" r="22" fill="#b30000" opacity="0.75">
                <animate attributeName="r" values="18;28;18" dur="1.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="185" cy="130" r="40" fill="#7a0000" opacity="0.35" />
            </g>
          )}
          <rect width="320" height="180" fill="url(#vignette)" />
        </svg>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {done.has("desufflate") ? "Camera out — closing." : insufflating ? "Insufflating…" : "No camera in."}
        </div>
      )}
      <div className="absolute top-2 left-2 font-mono-data text-[11px] text-primary bg-muted rounded px-2 py-0.5">
        IAP {s.iap.toFixed(0)} mmHg
      </div>
      {s.running && (
        <div className="absolute bottom-0 inset-x-0 bg-muted px-3 py-2">
          <div className="flex justify-between text-xs">
            <span>{s.running.name}</span>
            <span className="font-mono-data">{Math.round(s.running.progress * 100)}%</span>
          </div>
          <div className="h-1 rounded bg-muted mt-1">
            <div className="h-1 rounded bg-sage" style={{ width: `${s.running.progress * 100}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

export function SurgeonStation({ state, act, say }: Props) {
  const s = state.surgery;
  const [instrument, setInstrument] = useState<string | null>(null);
  if (!s) return null;
  // A wrong instrument is sent on purpose: the scrub tech explains why it won't work.
  const perform = (taskId: string) => {
    act({ type: "surgical", verb: taskId, params: { task_id: taskId }, ...(instrument ? { instrument } : {}) });
    // The scrub hands it over for that step; a blocked step keeps the pick for the next try.
    if (s.tasks.find((t) => t.id === taskId)?.available) setInstrument(null);
  };
  // One button per instrument, even if two ids share a name.
  const instrumentList = Object.entries(s.instruments).filter(([, name], i, all) => all.findIndex(([, n]) => n === name) === i);
  const chole = isChole(state);
  const visible = s.tasks.filter((t) => !t.done && (t.available || !t.optional));
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div className="space-y-3">
        <ScopeView state={state} />
        {s.findings.length > 0 && <div className="text-xs text-amber-warm">{s.findings.join(" ")}</div>}
        <Section title="Instrument (scrub hands you…)">
          <div className="flex flex-wrap gap-1">
            {instrumentList.map(([id, name]) => (
              <OrButton key={id} active={instrument === id} tone="teal" onClick={() => setInstrument(instrument === id ? null : id)}>
                {name}
              </OrButton>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {instrument
              ? `${s.instruments[instrument]} ready — now click a step to use it. Steps it fits are marked.`
              : "Optional: pick an instrument, then a step. Without one, the scrub hands you the usual instrument."}
          </div>
        </Section>
      </div>
      <div className="space-y-3">
        <Section title="Operative steps" right={<span className="text-[11px] text-muted-foreground">{s.done.length} done</span>}>
          <div className="space-y-1 max-h-[330px] overflow-y-auto pr-1">
            {visible.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.blocked ?? ""}
                onClick={() => perform(t.id)}
                className={`w-full flex items-center justify-between rounded-sm border px-3 py-1.5 text-left text-xs transition-colors ${
                  t.available ? "border-sage/40 hover:bg-sage/10" : "border-border text-muted-foreground"
                } ${s.running?.task === t.id ? "bg-sage/10" : ""}`}
              >
                <span>{t.name}</span>
                <span className="text-[10px]">
                  {instrument && t.instruments.includes(instrument) ? "✓ fits · " : ""}
                  {s.running?.task === t.id ? "in progress" : t.available ? "ready" : "blocked"}
                </span>
              </button>
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Steps aren't graded right/wrong — order, technique and instrument all change what happens. Hover a blocked step to see why.
          </div>
        </Section>
        <Section title="Talk to the team">
          <div className="flex flex-wrap gap-1.5">
            <OrButton onClick={() => act({ type: "say", intent: "time_out", text: "Let's do a time-out." })}>Time-out</OrButton>
            {chole ? (
              <OrButton onClick={() => act({ type: "position", position: "reverse_trendelenburg" })}>Reverse Trendelenburg</OrButton>
            ) : (
              <OrButton onClick={() => act({ type: "position", position: "left_side_down" })}>Trendelenburg, left side down</OrButton>
            )}
            <OrButton onClick={() => say("Can I get more relaxation please?")}>More relaxation</OrButton>
            <OrButton onClick={() => say("The patient's moving, can you go deeper?")}>Deeper please</OrButton>
            <OrButton onClick={() => act({ type: "assess", what: "ask_surgeon" })}>Status</OrButton>
            <OrButton onClick={() => act({ type: "position", position: "level" })}>Level the table</OrButton>
          </div>
        </Section>
      </div>
    </div>
  );
}
