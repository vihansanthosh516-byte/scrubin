import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Uppercase tracked label above a headline or a number. */
export function Eyebrow({ children, variant = "section", className }: { children: ReactNode; variant?: "section" | "mono" | "hero"; className?: string }) {
  if (variant === "hero") {
    return (
      <span className={cn("inline-flex items-center gap-2 text-base font-semibold text-primary", className)}>
                {children}
      </span>
    );
  }
  return <span className={cn(variant === "mono" ? "label-mono" : "section-tag", className)}>{children}</span>;
}

/**
 * Page title block: hero eyebrow, display h1 (with an optional terracotta accent word) and a lead.
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
        <h1 className="font-display text-5xl leading-[1.02] text-foreground sm:text-6xl md:text-7xl">
          {title}
          {accent && <> <span className="text-primary">{accent}</span></>}
        </h1>
        {lead && <p className="mt-4 text-lg text-muted-foreground">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
