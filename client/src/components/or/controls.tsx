import type { ReactNode } from "react";

// Small shared controls for the OR workstations.

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] uppercase tracking-[0.14em] text-[#7EC8E3]/80 font-semibold">{title}</h4>
        {right}
      </div>
      {children}
    </div>
  );
}

export function OrButton({
  children,
  onClick,
  active,
  tone = "blue",
  disabled,
  title,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  tone?: "blue" | "teal" | "red" | "amber" | "neutral";
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  const tones = {
    blue: active ? "bg-[#7EC8E3]/20 border-[#7EC8E3]/60 text-[#7EC8E3]" : "border-[#7EC8E3]/15 hover:border-[#7EC8E3]/40 hover:bg-[#7EC8E3]/5",
    teal: active ? "bg-[#5DCAA5]/20 border-[#5DCAA5]/60 text-[#5DCAA5]" : "border-[#5DCAA5]/20 hover:border-[#5DCAA5]/50 hover:bg-[#5DCAA5]/5",
    red: active ? "bg-red-500/25 border-red-400/70 text-red-300" : "border-red-500/25 text-red-300 hover:bg-red-500/10",
    amber: active ? "bg-amber-400/20 border-amber-300/60 text-amber-200" : "border-amber-400/25 text-amber-200 hover:bg-amber-400/10",
    neutral: active ? "bg-white/10 border-white/40" : "border-white/10 hover:border-white/25 hover:bg-white/5",
  } as const;
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  step,
  min,
  max,
  unit,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  min: number;
  max: number;
  unit?: string;
  decimals?: number;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  return (
    <div className="rounded-lg border border-[#7EC8E3]/10 bg-black/20 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-center gap-1.5">
        <button type="button" className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-sm" onClick={() => onChange(clamp(value - step))} aria-label={`decrease ${label}`}>
          −
        </button>
        <div className="flex-1 text-center font-mono-data text-base tabular-nums">
          {value.toFixed(decimals)}
          {unit && <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>}
        </div>
        <button type="button" className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-sm" onClick={() => onChange(clamp(value + step))} aria-label={`increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}
