import { Link } from "wouter";
import { cn } from "@/lib/utils";

/** The ScrubIn wordmark: "Scrub" in ink, "In" in terracotta, with the pulsing dot. Set in type, never an image. */
export function Wordmark({ size = "md", href = "/", className }: { size?: "md" | "lg"; href?: string | null; className?: string }) {
  const body = (
    <>
      <span className={cn("font-display leading-none text-foreground", size === "lg" ? "text-4xl" : "text-2xl")}>ScrubIn</span>
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
