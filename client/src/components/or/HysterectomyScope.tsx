import type { CaseState } from "@/engine/types";

/** True when the running procedure is a hysterectomy (its task graph has the uterine arteries step). */
export function isHysterectomy(state: CaseState): boolean {
  return !!state.surgery?.tasks.some((t) => t.id === "uterine_arteries");
}

/** Laparoscopic view of the pelvis: uterus on the manipulator, round ligaments, bladder, ureter and uterine artery. */
export default function HysterectomyScope({ state }: { state: CaseState }) {
  const s = state.surgery!;
  const done = new Set(s.done);
  const round = done.has("round_ligaments");
  const adnexa = done.has("adnexa");
  const flap = done.has("bladder_flap");
  const broad = done.has("open_broad_ligament");
  const ureter = done.has("identify_ureter");
  const arteries = done.has("uterine_arteries");
  const colpo = done.has("colpotomy");
  const out = done.has("remove_specimen");
  const cuff = done.has("close_cuff");
  const large = s.findings.join(" ").includes("14 weeks");
  const r = large ? 62 : 48;
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <radialGradient id="hys-scope" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#7a3a3a" />
          <stop offset="70%" stopColor="#3a1616" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <radialGradient id="hys-vignette" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#hys-scope)" />
      <rect x="0" y="120" width="320" height="60" fill="#8a4a44" opacity="0.6" />
      {/* bladder at the top (head-down), pushed away after the flap */}
      <path d={`M80 0 H240 C 230 ${flap ? 14 : 30}, 190 ${flap ? 22 : 44}, 160 ${flap ? 22 : 44} S 90 ${flap ? 14 : 30}, 80 0 Z`} fill="#e3c07e" opacity="0.9" />
      {/* uterus with fibroids on the manipulator */}
      {!out && (
        <g>
          <ellipse cx="160" cy="92" rx={r} ry={r * 0.8} fill="#c47a7a" />
          <circle cx="135" cy="80" r="13" fill="#d8a0a0" opacity="0.85" />
          <circle cx="188" cy="104" r="10" fill="#d8a0a0" opacity="0.85" />
          <line x1="160" y1="150" x2="160" y2="180" stroke="#bfc8cf" strokeWidth="7" />
        </g>
      )}
      {/* tubes and ovaries */}
      {!adnexa && (
        <g>
          <ellipse cx="70" cy="78" rx="18" ry="11" fill="#e7c9b0" />
          <ellipse cx="250" cy="78" rx="18" ry="11" fill="#e7c9b0" />
          <path d="M108 80 C 90 70, 84 66, 76 70 M212 80 C 230 70, 236 66, 244 70" stroke="#c98a7a" strokeWidth="4" fill="none" />
        </g>
      )}
      {/* round ligaments */}
      {!round && <path d="M115 72 C 90 50, 70 34, 52 14 M205 72 C 230 50, 250 34, 268 14" stroke="#e8d6c0" strokeWidth="4" fill="none" />}
      {/* broad ligament window, ureter and uterine artery */}
      {broad && !out && <path d="M60 110 C 90 130, 130 140, 130 140 M260 110 C 230 130, 190 140, 190 140" stroke="#e7b9a0" strokeWidth="18" fill="none" opacity="0.5" />}
      {ureter && (
        <g>
          <path d="M40 100 C 80 130, 112 150, 128 168" stroke="#f3e7a0" strokeWidth="3.5" fill="none" />
          <path d="M280 100 C 240 130, 208 150, 192 168" stroke="#f3e7a0" strokeWidth="3.5" fill="none" />
          <text x="26" y="96" fontSize="8" fill="#ffe27a">ureter</text>
        </g>
      )}
      {!arteries && broad && (
        <g>
          <path d="M108 128 C 118 134, 126 138, 138 138" stroke="#c0392b" strokeWidth="3" fill="none" />
          <path d="M212 128 C 202 134, 194 138, 182 138" stroke="#c0392b" strokeWidth="3" fill="none" />
        </g>
      )}
      {/* colpotomy ring and vaginal cuff */}
      {colpo && !cuff && <ellipse cx="160" cy="150" rx="34" ry="9" fill="none" stroke="#f0d6cf" strokeWidth="4" strokeDasharray={out ? undefined : "6 3"} />}
      {cuff && <path d="M126 150 L 194 150" stroke="#d9e7ee" strokeWidth="4" strokeDasharray="3 2" />}
      {/* instruments */}
      {s.running?.instrument && <line x1="320" y1="40" x2="196" y2="96" stroke="#9aa7b3" strokeWidth="5" strokeLinecap="round" />}
      {done.has("working_ports") && <line x1="0" y1="40" x2="124" y2="96" stroke="#8a96a1" strokeWidth="4" strokeLinecap="round" opacity="0.8" />}
      {s.bleeding && (
        <g>
          <circle cx="132" cy="132" r="20" fill="#b30000" opacity="0.75">
            <animate attributeName="r" values="16;26;16" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="132" cy="132" r="36" fill="#7a0000" opacity="0.35" />
        </g>
      )}
      <rect width="320" height="180" fill="url(#hys-vignette)" />
    </svg>
  );
}
