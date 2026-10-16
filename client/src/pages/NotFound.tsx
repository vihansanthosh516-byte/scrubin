import { CtaLink, Eyebrow } from "@/components/scrubin";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center bg-background px-4 pt-28 text-foreground">
      <div className="mx-auto w-full max-w-2xl">
        <Eyebrow variant="hero" className="mb-6 flex">Error 404</Eyebrow>
        <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
          This page isn't on the <span className="text-primary">schedule</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground">The link may be old, or the page may have moved. Here's where to go instead.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <CtaLink href="/" size="lg" className="px-8 font-semibold">Go home</CtaLink>
          <CtaLink href="/procedures" size="lg" variant="outline" className="px-8 font-semibold">Browse procedures</CtaLink>
          <CtaLink href="/learn" size="lg" variant="ghost" className="px-6 font-semibold">Read a briefing</CtaLink>
        </div>
      </div>
    </div>
  );
}
