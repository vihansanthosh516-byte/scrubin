import type { ReactNode } from "react";
import { Link } from "wouter";
import { Wordmark } from "./Wordmark";

/**
 * Layout for the signed-out and first-run screens (sign in, onboarding, welcome back):
 * cream ground, wordmark, a display-serif headline, one white card, and the legal line.
 */
export function AuthShell({ title, lead, children, footer }: { title: ReactNode; lead?: ReactNode; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center px-4 py-6 sm:px-6">
        <Wordmark href={null} />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl">{title}</h1>
            {lead && <p className="mt-3 text-base text-muted-foreground">{lead}</p>}
          </div>
          <div className="surface-raised p-6 sm:p-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          <p className="mx-auto mt-8 max-w-sm text-center text-xs leading-relaxed text-muted-foreground">
            By continuing you agree to ScrubIn's{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</Link> and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>. ScrubIn is an
            educational simulation with fictional patients, not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
