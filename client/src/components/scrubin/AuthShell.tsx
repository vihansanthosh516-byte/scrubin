import type { ReactNode } from "react";
import { Link } from "wouter";
import { Wordmark } from "./Wordmark";

/**
 * Layout for the signed-out and first-run screens (sign in, onboarding, welcome back):
 * cream ground, wordmark, a display-serif headline, one white card, and the legal line.
 */
export function AuthShell({ title, lead, children, footer }: { title: ReactNode; lead?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-black">
      <video className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70" src="/media/hero.mp4" poster="/media/or-05.webp" autoPlay muted loop playsInline aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" />
      <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-6 sm:px-6">
        <Wordmark href={null} className="[&_span]:text-white" />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center text-white">
            <h1 className="text-5xl font-light leading-[1.02] tracking-tight sm:text-6xl">{title}</h1>
            {lead && <p className="mt-3 text-base text-white/75">{lead}</p>}
          </div>
          <div className="rounded-3xl bg-background/85 p-6 backdrop-blur-xl sm:p-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-white/70">{footer}</div>}
          <p className="mx-auto mt-8 max-w-sm text-center text-xs leading-relaxed text-white/60">
            By continuing you agree to ScrubIn's{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-white">Terms</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-white">Privacy Policy</Link>. ScrubIn is an
            educational simulation with fictional patients, not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
