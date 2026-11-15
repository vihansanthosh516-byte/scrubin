import type { CaseState } from "@/engine/types";

/** True when the running procedure is a caesarean section (its task graph has the deliver-the-baby step). */
export function isCesarean(state: CaseState): boolean {
  return !!state.surgery?.tasks.some((t) => t.id === "deliver_baby");
}

/** Open operative field from above: skin, sheath, muscles, peritoneum, then the uterus, the baby and the closure. */
export default function CesareanScope({ state }: { state: CaseState }) {
  const s = state.surgery!;
  const done = new Set(s.done);
  const skin = done.has("incision");
  const fat = done.has("dissect_subcut");
  const sheath = done.has("open_fascia");
  const recti = done.has("separate_recti");
  const perit = done.has("open_peritoneum");
  const blade = done.has("expose_uterus");
  const hyst = done.has("hysterotomy");
  const baby = done.has("deliver_baby");
  const cord = done.has("clamp_cord");
  const placenta = done.has("deliver_placenta");
  const closedUterus = done.has("close_uterus");
  const fascia = done.has("close_fascia");
  const closedSkin = done.has("close_skin");
  const open = perit && !fascia;
  return (
    <svg role="img" aria-label="Operative view" viewBox="0 0 320 180" className="w-full h-full">
      <defs>
        <radialGradient id="cs-field" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--ill-e8c3a8)" />
          <stop offset="100%" stopColor="var(--ill-b98a6e)" />
        </radialGradient>
        <radialGradient id="cs-vignette" cx="50%" cy="50%" r="55%">
          <stop offset="80%" stopColor="transparent" />
          <stop offset="100%" stopColor="#0008" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="url(#cs-field)" />
      {/* drapes */}
      <rect x="0" y="0" width="320" height="22" fill="var(--ill-4f8f96)" />
      <rect x="0" y="158" width="320" height="22" fill="var(--ill-4f8f96)" />
      {!closedSkin && skin && (
        <g>
          {/* wound layers */}
          <rect x="40" y="82" width="240" height={open ? 34 : 16} rx="8" fill={fat ? "var(--ill-f2dc9a)" : "var(--ill-c9786a)"} />
          {fat && !sheath && <rect x="60" y="86" width="200" height="8" rx="4" fill="var(--ill-f4f0e4)" />}
          {sheath && !fascia && <rect x="70" y="88" width="180" height={open ? 22 : 8} rx="5" fill={recti ? "var(--ill-a8403a)" : "var(--ill-f4f0e4)"} />}
          {recti && !perit && <line x1="160" y1="88" x2="160" y2="108" stroke="var(--ill-f4f0e4)" strokeWidth="2" />}
        </g>
      )}
      {open && (
        <g>
          {/* uterus in the depth of the wound */}
          {!baby || !cord ? (
            <ellipse cx="160" cy="98" rx={placenta ? 44 : 62} ry={placenta ? 14 : 20} fill={closedUterus ? "var(--ill-b85a6a)" : "var(--ill-c8707c)"} />
          ) : (
            <ellipse cx="160" cy="98" rx="46" ry="14" fill={closedUterus ? "var(--ill-b85a6a)" : "var(--ill-c8707c)"} />
          )}
          {blade && <rect x="120" y="82" width="80" height="6" rx="3" fill="var(--ill-aeb8c2)" />}
          {hyst && !closedUterus && <path d="M118 100 Q 160 108 202 100" stroke="var(--ill-7a1f2e)" strokeWidth="4" fill="none" />}
          {/* baby */}
          {hyst && !baby && <ellipse cx="160" cy="100" rx="22" ry="9" fill="var(--ill-f0c9a6)" />}
          {baby && !cord && (
            <g>
              <circle cx="160" cy="62" r="20" fill="var(--ill-f0c9a6)" />
              <rect x="150" y="76" width="20" height="22" rx="6" fill="var(--ill-f0c9a6)" />
            </g>
          )}
          {baby && cord && !placenta && <ellipse cx="160" cy="100" rx="26" ry="8" fill="var(--ill-a85a5a)" />}
          {closedUterus && <path d="M120 100 Q 160 108 200 100" stroke="var(--ill-e8d8d0)" strokeWidth="2" strokeDasharray="4 3" fill="none" />}
        </g>
      )}
      {closedSkin && <path d="M44 90 H276" stroke="var(--ill-f1e8dc)" strokeWidth="6" strokeLinecap="round" />}
      {!skin && <text x="160" y="94" textAnchor="middle" fill="var(--ill-6b4a3a)" fontSize="11">Drapes up, waiting for the knife</text>}
      {s.running?.instrument && <line x1="320" y1="30" x2="196" y2="92" stroke="var(--ill-9aa7b3)" strokeWidth="5" strokeLinecap="round" />}
      {s.bleeding && (
        <g>
          <circle cx="176" cy="104" r="20" fill="var(--ill-b30000)" opacity="0.7">
            <animate attributeName="r" values="16;26;16" dur="1.4s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      <rect width="320" height="180" fill="url(#cs-vignette)" />
    </svg>
  );
}
