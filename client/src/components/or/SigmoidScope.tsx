import type { CaseState } from "@/engine/types";

/** True when the running procedure is a sigmoid colectomy (its task graph has the IMA step). */
export function isSigmoid(state: CaseState): boolean {
  return !!state.surgery?.tasks.some((t) => t.id === "divide_ima");
}

/** Laparoscopic view of the pelvis in steep Trendelenburg: sigmoid, mesentery, IMA, left ureter, rectosigmoid. */
export default function SigmoidScope({ state }: { state: CaseState }) {
  const s = state.surgery!;
  const done = new Set(s.done);
  const swept = done.has("sweep_bowel");
  const entered = done.has("medial_dissect");
  const ureter = done.has("identify_ureter");
  const ima = done.has("divide_ima");
  const mobilized = done.has("lateral_mobilize");
  const distal = done.has("divide_distal");
  const out = done.has("remove_specimen");
  const anvil = done.has("place_anvil");
  const joined = done.has("anastomose");
  const leak = done.has("leak_test");
  const inflamed = s.findings.join(" ").includes("phlegmon");
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <radialGradient id="sig-scope" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#6b3a30" />
          <stop offset="70%" stopColor="#35150f" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <radialGradient id="sig-vignette" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#sig-scope)" />
      {/* retroperitoneum and sacral promontory */}
      <rect x="0" y="105" width="320" height="75" fill="#8a4a3c" opacity="0.7" />
      <ellipse cx="160" cy="165" rx="34" ry="12" fill="#d9c9b0" opacity="0.85" />
      {/* small bowel loops, swept out of the field once the pelvis is cleared */}
      {!swept && <path d="M0 40 C 60 10, 100 70, 160 30 S 260 60, 320 20" stroke="#d98f80" strokeWidth="26" fill="none" opacity="0.9" />}
      {/* mesentery and the sigmoid colon */}
      {!out && (
        <g opacity={done.has("explore") ? 1 : 0.4}>
          <path d="M60 90 C 120 40, 210 40, 262 96 L 250 116 C 200 76, 130 76, 76 116 Z" fill={inflamed ? "#c98a5a" : "#d9a77a"} opacity="0.75" />
          <path d="M60 96 C 120 50, 210 50, 262 102" stroke={inflamed ? "#8f7a3a" : "#c88f6a"} strokeWidth="16" fill="none" strokeLinecap="round" transform={mobilized ? "translate(0 -10)" : undefined} />
        </g>
      )}
      {/* white line of Toldt */}
      {!mobilized && <line x1="286" y1="20" x2="286" y2="150" stroke="#f0e6d4" strokeWidth="2" strokeDasharray="6 4" />}
      {/* retroperitoneal window after medial dissection */}
      {entered && !out && <ellipse cx="170" cy="116" rx="74" ry="20" fill="#e7b9a0" opacity="0.5" />}
      {/* left ureter with gonadal vessels */}
      {ureter && (
        <g>
          <path d="M240 108 C 210 124, 170 130, 126 150" stroke="#f3e7a0" strokeWidth="4" fill="none" />
          <path d="M240 100 C 215 114, 180 118, 140 134" stroke="#9a3b3b" strokeWidth="2.5" fill="none" />
          <text x="244" y="108" fontSize="8" fill="#ffe27a">ureter</text>
        </g>
      )}
      {/* inferior mesenteric artery pedicle */}
      {entered && !ima && <path d="M165 118 C 165 90, 160 72, 150 58" stroke="#c0392b" strokeWidth="4" fill="none" />}
      {ima && <g><rect x="160" y="96" width="8" height="4" fill="#dddddd" /><path d="M165 118 L 165 100" stroke="#c0392b" strokeWidth="4" /></g>}
      {/* rectosigmoid staple line */}
      {distal && !joined && <rect x="152" y="132" width="26" height="4" fill="#cfd8dc" />}
      {/* proximal colon with anvil, then the anastomosis ring */}
      {anvil && !joined && <circle cx="160" cy="86" r="9" fill="#d9a77a" stroke="#cfd8dc" strokeWidth="3" />}
      {joined && <circle cx="160" cy="134" r="8" fill="none" stroke="#cfd8dc" strokeWidth="4" />}
      {leak && joined && [150, 160, 170].map((x, i) => <circle key={x} cx={x} cy={148 - i * 4} r="1.8" fill="#bfe3ff" opacity="0.6" />)}
      {/* instruments */}
      {s.running?.instrument && <line x1="320" y1="150" x2="190" y2="110" stroke="#9aa7b3" strokeWidth="5" strokeLinecap="round" />}
      {done.has("working_ports") && <line x1="0" y1="170" x2="120" y2="120" stroke="#8a96a1" strokeWidth="4" strokeLinecap="round" opacity="0.8" />}
      {s.bleeding && (
        <g>
          <circle cx="162" cy="106" r="20" fill="#b30000" opacity="0.75">
            <animate attributeName="r" values="16;26;16" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="162" cy="106" r="36" fill="#7a0000" opacity="0.35" />
        </g>
      )}
      <rect width="320" height="180" fill="url(#sig-vignette)" />
    </svg>
  );
}
