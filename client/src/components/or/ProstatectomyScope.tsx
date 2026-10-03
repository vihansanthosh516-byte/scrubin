import type { CaseState } from "@/engine/types";

/** True when the running procedure is a prostatectomy (its task graph has the dorsal venous complex step). */
export function isProstatectomy(state: CaseState): boolean {
  return !!state.surgery?.tasks.some((t) => t.id === "dvc_ligate");
}

/** Robotic console view of the pelvis: bladder, prostate, dorsal venous complex, neurovascular bundles, rectum. */
export default function ProstatectomyScope({ state }: { state: CaseState }) {
  const s = state.surgery!;
  const done = new Set(s.done);
  const retzius = done.has("drop_bladder");
  const endopelvic = done.has("endopelvic_fascia");
  const dvc = done.has("dvc_ligate");
  const neck = done.has("bladder_neck");
  const vesicles = done.has("seminal_vesicles");
  const spared = done.has("spare_nerves");
  const taken = done.has("wide_excision");
  const free = done.has("divide_urethra");
  const bagged = done.has("bag");
  const joined = done.has("anastomose");
  const out = done.has("remove_specimen");
  const tested = done.has("leak_test");
  return (
    <svg viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <radialGradient id="pro-scope" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#6e3434" />
          <stop offset="70%" stopColor="#331414" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <radialGradient id="pro-vignette" cx="50%" cy="50%" r="50%">
          <stop offset="75%" stopColor="transparent" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#pro-scope)" />
      {/* pelvic sidewalls and endopelvic fascia */}
      <rect x="0" y="0" width="320" height="180" fill="#9a5a4a" opacity="0.35" />
      {!endopelvic && retzius && <rect x="70" y="60" width="180" height="80" rx="30" fill="#e6cf8a" opacity="0.45" />}
      {/* bladder, dropped off the abdominal wall */}
      <path d={`M80 0 H240 C 236 ${retzius ? 28 : 12}, 200 ${retzius ? 42 : 20}, 160 ${retzius ? 42 : 20} S 84 ${retzius ? 28 : 12}, 80 0 Z`} fill="#e3c07e" opacity="0.92" />
      {/* prostate */}
      {!out && !bagged && (
        <g transform={free ? "translate(0 -26)" : undefined}>
          <ellipse cx="160" cy="92" rx="40" ry="34" fill="#c98a82" />
          {vesicles && !free && (
            <g>
              <path d="M130 120 C 112 134, 98 150, 92 168" stroke="#e8d6c0" strokeWidth="9" fill="none" strokeLinecap="round" />
              <path d="M190 120 C 208 134, 222 150, 228 168" stroke="#e8d6c0" strokeWidth="9" fill="none" strokeLinecap="round" />
            </g>
          )}
        </g>
      )}
      {/* dorsal venous complex across the apex */}
      {!free && <path d="M118 126 C 140 140, 180 140, 202 126" stroke="#4a5ea8" strokeWidth="9" fill="none" strokeLinecap="round" />}
      {dvc && !free && <rect x="152" y="132" width="16" height="5" fill="#f3f3f3" />}
      {/* neurovascular bundles */}
      {!taken && endopelvic && (
        <g>
          <path d="M112 90 C 108 108, 112 124, 124 138" stroke={spared ? "#f6e27a" : "#d8c26a"} strokeWidth="5" fill="none" opacity={spared ? 1 : 0.7} />
          <path d="M208 90 C 212 108, 208 124, 196 138" stroke={spared ? "#f6e27a" : "#d8c26a"} strokeWidth="5" fill="none" opacity={spared ? 1 : 0.7} />
        </g>
      )}
      {/* rectum behind, pushed away after the posterior plane */}
      <ellipse cx="160" cy={done.has("denonvilliers") ? 176 : 164} rx="70" ry="14" fill="#a85a58" opacity="0.85" />
      {neck && !joined && !free && <line x1="130" y1="62" x2="190" y2="62" stroke="#ffe27a" strokeWidth="2" strokeDasharray="4 3" />}
      {/* anastomosis */}
      {joined && <circle cx="160" cy="70" r="14" fill="none" stroke="#d9e7ee" strokeWidth="3" strokeDasharray="4 3" />}
      {tested && joined && <circle cx="160" cy="70" r="20" fill="#bfe3ff" opacity="0.2" />}
      {/* robotic arms */}
      {done.has("dock_robot") && !done.has("undock_robot") && (
        <g stroke="#8a96a1" strokeLinecap="round" opacity="0.85">
          <line x1="0" y1="20" x2="120" y2="92" strokeWidth="4" />
          <line x1="320" y1="20" x2="200" y2="92" strokeWidth="4" />
          <line x1="320" y1="150" x2="206" y2="110" strokeWidth="4" />
        </g>
      )}
      {s.bleeding && (
        <g>
          <circle cx="160" cy="132" r="20" fill="#b30000" opacity="0.75">
            <animate attributeName="r" values="16;26;16" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="160" cy="132" r="36" fill="#7a0000" opacity="0.35" />
        </g>
      )}
      <rect width="320" height="180" fill="url(#pro-vignette)" />
    </svg>
  );
}
