import type { CaseState } from "@/engine/types";

/** True when the running procedure is a TAPP hernia repair (its task graph has the landmark step). */
export function isHernia(state: CaseState): boolean {
  return !!state.surgery?.tasks.some((t) => t.id === "identify_landmarks");
}

/** Laparoscopic view of the right groin from inside: ligaments, epigastric vessels, deep ring, cord, mesh. */
export default function HerniaScope({ state }: { state: CaseState }) {
  const s = state.surgery!;
  const done = new Set(s.done);
  const explored = done.has("explore");
  const landmarks = done.has("identify_landmarks");
  const opened = done.has("incise_peritoneum");
  const flap = done.has("develop_flap");
  const reduced = done.has("reduce_sac");
  const mesh = done.has("place_mesh");
  const tacked = done.has("fix_mesh");
  const closed = done.has("close_peritoneum");
  const direct = s.findings.join(" ").includes("direct hernia") && !s.findings.join(" ").includes("indirect");
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <radialGradient id="hernia-scope" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#7a3535" />
          <stop offset="70%" stopColor="#3a1414" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <radialGradient id="hernia-vignette" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#hernia-scope)" />
      {/* peritoneum of the lower abdominal wall */}
      <rect x="0" y="0" width="320" height="180" fill="#b97a6a" opacity={flap ? 0.25 : 0.55} />
      {/* bladder dome and median umbilical ligament */}
      <path d="M0 150 C 40 120, 90 120, 130 150 L 130 180 L 0 180 Z" fill="#d6b27a" opacity={done.has("empty_bladder") ? 0.55 : 0.95} />
      <line x1="70" y1="0" x2="70" y2="125" stroke="#e6d7b8" strokeWidth="4" opacity={explored ? 0.9 : 0.3} />
      {/* medial umbilical ligament (obliterated umbilical artery) */}
      <path d="M120 0 C 130 60, 150 100, 160 140" stroke="#e6d7b8" strokeWidth="5" fill="none" opacity={explored ? 0.9 : 0.3} />
      {/* inferior epigastric vessels */}
      <g opacity={landmarks ? 1 : 0.35}>
        <path d="M250 0 C 230 50, 205 85, 195 105" stroke="#c0392b" strokeWidth="3.5" fill="none" />
        <path d="M257 0 C 238 52, 212 88, 202 108" stroke="#5b6fb0" strokeWidth="3" fill="none" />
      </g>
      {/* deep ring and sac */}
      <ellipse cx="205" cy="125" rx="24" ry="17" fill="#2a0e0e" opacity={reduced ? 0.4 : 0.9} />
      {!reduced && explored && (
        <path d={direct ? "M175 140 C 185 165, 215 165, 225 140" : "M200 130 C 190 150, 180 165, 160 178"} stroke="#c98a7a" strokeWidth="13" strokeLinecap="round" fill="none" />
      )}
      {/* vas and testicular vessels */}
      <g opacity={flap || landmarks ? 1 : 0.4}>
        <path d="M215 140 C 190 150, 150 150, 130 165" stroke="#f2e6c8" strokeWidth="4" fill="none" />
        <path d="M225 135 C 240 150, 255 170, 265 180" stroke="#8c3a3a" strokeWidth="3" fill="none" />
      </g>
      {/* Cooper's ligament */}
      {flap && <path d="M110 172 C 150 160, 190 164, 230 174" stroke="#f4efe4" strokeWidth="6" fill="none" />}
      {/* danger zones, shown once the landmarks are identified */}
      {landmarks && (
        <g fontSize="8" fill="#ffd54a" opacity="0.8">
          <ellipse cx="170" cy="168" rx="26" ry="12" fill="none" stroke="#ff6b6b" strokeDasharray="3 3" />
          <text x="146" y="172">doom</text>
          <ellipse cx="262" cy="160" rx="26" ry="14" fill="none" stroke="#ffd54a" strokeDasharray="3 3" />
          <text x="244" y="164">pain</text>
        </g>
      )}
      {/* peritoneal incision */}
      {opened && !closed && <path d="M110 92 C 160 78, 220 82, 275 100" stroke="#e8c9b8" strokeWidth="2" strokeDasharray="5 3" fill="none" />}
      {/* mesh and tacks */}
      {mesh && !closed && (
        <g>
          <rect x="105" y="95" width="155" height="68" rx="6" fill="#d9e7ee" opacity="0.5" stroke="#9fb8c4" />
          {[...Array(7)].map((_, i) => (
            <line key={i} x1={118 + i * 22} y1="95" x2={118 + i * 22} y2="163" stroke="#9fb8c4" strokeWidth="0.6" />
          ))}
          {tacked && [125, 160, 195, 230].map((x) => <circle key={x} cx={x} cy="103" r="2.2" fill="#fff" />)}
        </g>
      )}
      {closed && <path d="M105 92 C 160 78, 230 84, 270 100" stroke="#c98a7a" strokeWidth="14" fill="none" opacity="0.85" />}
      {/* instruments */}
      {s.running?.instrument && <line x1="320" y1="40" x2="215" y2="110" stroke="#9aa7b3" strokeWidth="5" strokeLinecap="round" />}
      {done.has("working_ports") && <line x1="0" y1="30" x2="110" y2="95" stroke="#8a96a1" strokeWidth="4" strokeLinecap="round" opacity="0.8" />}
      {s.bleeding && (
        <g>
          <circle cx="205" cy="112" r="20" fill="#b30000" opacity="0.75">
            <animate attributeName="r" values="16;26;16" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="205" cy="112" r="36" fill="#7a0000" opacity="0.35" />
        </g>
      )}
      <rect width="320" height="180" fill="url(#hernia-vignette)" />
    </svg>
  );
}
