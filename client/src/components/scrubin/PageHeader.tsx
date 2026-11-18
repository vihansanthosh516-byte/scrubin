import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
 * Page title block: a photographic banner (Flow-generated stills in /media) with the h1 set over it,
 * a context line and a lead. Every page uses this so titles are consistent and each page has one h1.
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  lead,
  actions,
  image = "/media/or-05.webp",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  accent?: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  image?: string;
  className?: string;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <header className={cn("relative isolate flex min-h-[34svh] flex-wrap items-end justify-between gap-6 overflow-hidden rounded-3xl bg-black p-6 text-white sm:p-10", className)}>
      <motion.img
        src={image}
        alt=""
        aria-hidden="true"
        initial={reduce ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.8),rgb(0_0_0/0.2)_70%)]" aria-hidden="true" />
      <div className="max-w-3xl">
        <h1 className="text-4xl font-light leading-[1.02] tracking-tight sm:text-5xl md:text-7xl">
          {title}
          {accent}
        </h1>
        {eyebrow && <span className="mt-3 flex items-center gap-2 text-sm text-white/70">{eyebrow}</span>}
        {lead && <p className="mt-4 text-lg text-white/75">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}
