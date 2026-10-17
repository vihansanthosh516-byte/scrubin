import { Link } from "wouter";
import { cn } from "@/lib/utils";

/** The ScrubIn wordmark: "Scrub" in ink, "In" in terracotta, with the pulsing dot. Set in type, never an image. */
export function Wordmark({ size = "md", href = "/", className }: { size?: "md" | "lg"; href?: string | null; className?: string }) {
  const body = (
    <>
      <span className={cn("relative flex items-center justify-center", size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")} aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-primary/20" />
        <span className={cn("rounded-full bg-primary motion-safe:animate-pulse", size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2")} />
      </span>
      <span className={cn("font-bold tracking-tight text-foreground", size === "lg" ? "text-3xl" : "text-xl")}>
        Scrub<span className="text-primary">In</span>
      </span>
    </>
  );
  const cls = cn("inline-flex items-center gap-2.5", className);
  if (href === null) return <span className={cls}>{body}</span>;
  return (
    <Link href={href} className={cls} aria-label="ScrubIn home">
      {body}
    </Link>
  );
}
