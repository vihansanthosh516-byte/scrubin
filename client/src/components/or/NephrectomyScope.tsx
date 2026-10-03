import type { CaseState } from "@/engine/types";

/** True when the running procedure is a nephrectomy (its task graph has the renal artery step). */
export function isNephrectomy(state: CaseState): boolean {
  return !!state.surgery?.tasks.some((t) => t.id === "clip_renal_artery");
}

/** Laparoscopic view of the retroperitoneum from the flank: kidney in Gerota's fascia, colon, hilum, adrenal. */
export default function NephrectomyScope({ state }: { state: CaseState }) {
  const s = state.surgery!;
  const done = new Set(s.done);
  const left = s.findings.join(" ").toLowerCase().includes("left kidney");
  const explored = done.has("explore");
  const reflected = done.has("reflect_colon");
  const cleared = done.has("kocher_duodenum") || done.has("mobilize_spleen");
  const hilum = done.has("expose_hilum");
  const artery = done.has("clip_renal_artery");
  const vein = done.has("clip_renal_vein");
  const adrenalDone = done.has("spare_adrenal") || done.has("take_adrenal");
  const taken = done.has("take_adrenal");
  const freed = done.has("free_kidney");
  const gone = done.has("remove_specimen") || done.has("bag");
  const flip = left ? -1 : 1; // mirror the organ layout for the left side
  const x = (v: number) => (flip === 1 ? v : 320 - v);
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <radialGradient id="neph-scope" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#6e3a2c" />
          <stop offset="70%" stopColor="#35160f" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <radialGradient id="neph-vignette" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#neph-scope)" />
      <rect x="0" y="120" width="320" height="60" fill="#8a4a3c" opacity="0.6" />
      {/* colon, falling medially once reflected */}
      <path d={`M${x(reflected ? 20 : 150)} 180 C ${x(reflected ? 40 : 190)} 140, ${x(reflected ? 70 : 250)} 150, ${x(reflected ? 110 : 300)} 120`} stroke="#d9a88a" strokeWidth="26" fill="none" opacity="0.9" />
      {/* liver / spleen neighbour */}
      {explored && !cleared && (
        <ellipse cx={x(left ? 270 : 250)} cy="28" rx="52" ry="22" fill={left ? "#7a3a4a" : "#7a2e26"} />
      )}
      {cleared && <ellipse cx={x(left ? 295 : 290)} cy="14" rx="30" ry="12" fill={left ? "#7a3a4a" : "#7a2e26"} opacity="0.8" />}
      {/* kidney in Gerota's fat, with the upper pole tumour */}
      {!gone && (
        <g opacity={explored ? 1 : 0.35} transform={freed ? "translate(0 -6)" : undefined}>
          <ellipse cx={x(190)} cy="80" rx="52" ry="30" fill={freed ? "#9a4a50" : "#e6cf9a"} opacity={freed ? 1 : 0.8} />
          <ellipse cx={x(190)} cy="80" rx="40" ry="22" fill="#a14b52" />
          <circle cx={x(210)} cy="64" r="18" fill="#c7a25a" />
        </g>
      )}
      {/* adrenal gland at the upper pole */}
      {hilum && !taken && !gone && <ellipse cx={x(222)} cy="46" rx="14" ry="6" fill="#f2d98a" opacity={adrenalDone ? 1 : 0.8} />}
      {/* hilum: artery, vein, ureter */}
      {hilum && (
        <g>
          {!vein && <path d={`M${x(160)} 100 C ${x(130)} 112, ${x(104)} 120, ${x(70)} 122`} stroke="#5b6fb0" strokeWidth="7" fill="none" />}
          {!artery && <path d={`M${x(164)} 94 C ${x(130)} 100, ${x(104)} 106, ${x(70)} 108`} stroke="#c0392b" strokeWidth="4.5" fill="none" />}
          {artery && <rect x={x(112) - 4} y="104" width="8" height="4" fill="#dddddd" />}
          {vein && <rect x={x(110) - 6} y="120" width="12" height="4" fill="#cfd8dc" />}
          <path d={`M${x(170)} 112 C ${x(150)} 140, ${x(110)} 150, ${x(70)} 168`} stroke="#f3e7a0" strokeWidth="3.5" fill="none" />
        </g>
      )}
      {/* instruments */}
      {s.running?.instrument && <line x1="320" y1="150" x2="200" y2="100" stroke="#9aa7b3" strokeWidth="5" strokeLinecap="round" />}
      {done.has("working_ports") && <line x1="0" y1="30" x2="120" y2="80" stroke="#8a96a1" strokeWidth="4" strokeLinecap="round" opacity="0.8" />}
      {s.bleeding && (
        <g>
          <circle cx={x(150)} cy="104" r="20" fill="#b30000" opacity="0.75">
            <animate attributeName="r" values="16;26;16" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={x(150)} cy="104" r="36" fill="#7a0000" opacity="0.35" />
        </g>
      )}
      <rect width="320" height="180" fill="url(#neph-vignette)" />
    </svg>
  );
}
