import type { ReactNode } from "react";

// Small shared controls for the OR workstations.

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] uppercase tracking-[0.14em] text-primary font-semibold">{title}</h4>
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
    blue: active ? "bg-primary/10 border-primary text-primary" : "border-border hover:border-primary/60 hover:bg-primary/10",
    teal: active ? "bg-sage/10 border-sage/40 text-sage dark:text-[#5E8C74]" : "border-sage/40 hover:border-sage/40 hover:bg-sage/10",
    red: active ? "bg-destructive/10 border-destructive/40 text-destructive" : "border-destructive/40 text-destructive hover:bg-destructive/10",
    amber: active ? "bg-amber-warm/10 border-amber-warm/40 text-amber-warm" : "border-amber-warm/40 text-amber-warm hover:bg-amber-warm/10",
    neutral: active ? "bg-muted border-border" : "border-border hover:border-border hover:bg-accent",
  } as const;
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-sm border text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left ${tones[tone]} ${className}`}
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
    <div className="rounded-sm border border-border bg-muted px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex items-center gap-1.5">
        <button type="button" className="w-6 h-6 rounded bg-muted hover:bg-accent text-sm" onClick={() => onChange(clamp(value - step))} aria-label={`decrease ${label}`}>
          −
        </button>
        <div className="flex-1 text-center font-mono-data text-base tabular-nums">
          {value.toFixed(decimals)}
          {unit && <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>}
        </div>
        <button type="button" className="w-6 h-6 rounded bg-muted hover:bg-accent text-sm" onClick={() => onChange(clamp(value + step))} aria-label={`increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}
