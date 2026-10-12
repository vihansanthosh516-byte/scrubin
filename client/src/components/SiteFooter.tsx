import { Link } from "wouter";

/** Small, always-visible reminder that ScrubIn is for education only, with links to the legal pages. */
export default function SiteFooter() {
  return (
    <footer className="px-4 py-5 text-center text-[11px] leading-relaxed text-muted-foreground border-t border-border/60">
      ScrubIn is an educational simulation with fictional patients. It is not medical advice and must not be used for real patient care.{" "}
      <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link>
    </footer>
  );
}
