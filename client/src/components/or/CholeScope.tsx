import type { CaseState } from "@/engine/types";

/** True when the running procedure is a cholecystectomy (its task graph has the hepatocystic triangle). */
export function isChole(state: CaseState): boolean {
  return !!state.surgery?.tasks.some((t) => t.id === "dissect_triangle");
}

/** Laparoscopic view of the right upper quadrant: liver, gallbladder, cystic duct and artery. */
export default function CholeScope({ state }: { state: CaseState }) {
  const s = state.surgery!;
  const done = new Set(s.done);
  const findings = s.findings.join(" ");
  const inflamed = findings.includes("acute cholecystitis");
  const gbGone = done.has("specimen_out") || done.has("remove_specimen");
  const gbFree = done.has("dissect_liver_bed");
  const retracted = done.has("retract_fundus");
  const dissected = done.has("dissect_triangle");
  const divided = done.has("divide_cystic");
  const headUp = state.position === "reverse_trendelenburg" || state.position === "left_tilt";
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <radialGradient id="chole-scope" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#6b2a2a" />
          <stop offset="70%" stopColor="#3a1414" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <radialGradient id="chole-vignette" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#chole-scope)" />
      {/* liver edge */}
      <path d="M0 0 H320 V60 C 260 75, 200 55, 150 70 S 40 70, 0 58 Z" fill="#7a2e26" />
      {/* duodenum / colon falling away when the table is head-up */}
      <path d="M30 165 C 90 135, 150 175, 230 150" stroke="#c97b6b" strokeWidth="24" fill="none" opacity={headUp ? 0.3 : 0.85} />
      {/* cystic plate after the gallbladder comes off */}
      {gbFree && <path d="M150 62 C 175 70, 205 66, 225 58" stroke="#a8473a" strokeWidth="8" fill="none" />}
      {/* gallbladder */}
      {!gbGone && (
        <g opacity={done.has("explore") ? 1 : 0.4} transform={gbFree ? "translate(30 25)" : retracted ? "translate(10 -12)" : undefined}>
          <ellipse cx="190" cy="78" rx="42" ry="20" fill={inflamed ? "#6f8f4a" : "#8fae5c"} transform="rotate(-18 190 78)" />
          <path d="M155 92 C 145 100, 140 108, 132 116" stroke={inflamed ? "#6f8f4a" : "#8fae5c"} strokeWidth="12" strokeLinecap="round" fill="none" />
        </g>
      )}
      {/* cystic duct and artery, visible once the triangle is cleared */}
      {dissected && !divided && (
        <g>
          <path d="M132 116 C 120 126, 110 134, 98 142" stroke="#e6d39a" strokeWidth="5" fill="none" />
          <path d="M140 106 C 132 112, 122 116, 110 118" stroke="#c0392b" strokeWidth="3" fill="none" />
        </g>
      )}
      {done.has("clip_duct") && <rect x="112" y="128" width="8" height="4" fill="#dddddd" transform="rotate(-40 116 130)" />}
      {done.has("clip_artery") && <rect x="118" y="112" width="8" height="4" fill="#dddddd" transform="rotate(-20 122 114)" />}
      {/* instruments */}
      {s.running?.instrument && <line x1="320" y1="40" x2="170" y2="100" stroke="#9aa7b3" strokeWidth="5" strokeLinecap="round" />}
      {done.has("working_ports") && <line x1="320" y1="0" x2="205" y2="70" stroke="#8a96a1" strokeWidth="4" strokeLinecap="round" opacity="0.8" />}
      {s.bleeding && (
        <g>
          <circle cx="140" cy="112" r="20" fill="#b30000" opacity="0.75">
            <animate attributeName="r" values="16;26;16" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="112" r="36" fill="#7a0000" opacity="0.35" />
        </g>
      )}
      <rect width="320" height="180" fill="url(#chole-vignette)" />
    </svg>
  );
}
