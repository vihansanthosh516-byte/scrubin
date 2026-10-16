import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Uppercase tracked label above a headline or a number. */
export function Eyebrow({ children, variant = "section", className }: { children: ReactNode; variant?: "section" | "mono" | "hero"; className?: string }) {
  if (variant === "hero") {
    return (
      <span className={cn("inline-flex items-center gap-2.5 font-mono-data text-xs uppercase tracking-[0.16em] text-label", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        {children}
      </span>
    );
  }
  return <span className={cn(variant === "mono" ? "label-mono" : "section-tag", className)}>{children}</span>;
}

/**
 * Page title block: hero eyebrow, Instrument Serif h1 (with an optional terracotta accent word) and a lead.
 * Every page uses this so titles are consistent and each page has exactly one h1.
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  lead,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="max-w-3xl">
        {eyebrow && <Eyebrow variant="hero" className="mb-4">{eyebrow}</Eyebrow>}
        <h1 className="font-display text-4xl leading-[1.02] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {title}
          {accent && <> <span className="text-primary">{accent}</span></>}
        </h1>
        {lead && <p className="mt-4 text-lg text-muted-foreground">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
