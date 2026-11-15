import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A short context line in the body face, set under a heading (never above it). */
export function Eyebrow({ children, variant = "section", className }: { children: ReactNode; variant?: "section" | "mono" | "hero"; className?: string }) {
  if (variant === "hero") {
    return (
      <span className={cn("inline-flex items-center gap-2 text-sm text-muted-foreground", className)}>{children}</span>
    );
  }
  return <span className={cn(variant === "mono" ? "label-mono" : "section-tag", className)}>{children}</span>;
}

/**
 * Page title block: Instrument Serif h1, a context line under it, and a lead.
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
        <h1 className="text-4xl leading-[1.02] text-foreground sm:text-5xl md:text-6xl">
          {title}
          {accent}
        </h1>
        {eyebrow && <Eyebrow variant="hero" className="mt-3 flex">{eyebrow}</Eyebrow>}
        {lead && <p className="mt-4 text-lg text-muted-foreground">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
