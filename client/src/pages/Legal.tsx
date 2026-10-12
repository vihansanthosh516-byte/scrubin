import type { ReactNode } from "react";
import { Link } from "wouter";

const ISSUES = "https://github.com/vihansanthosh516-byte/scrubin/issues";
const UPDATED = "October 12, 2026";

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">ScrubIn</div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-xs text-muted-foreground mt-1">Last updated {UPDATED}</p>
        </div>
        <div className="space-y-5 text-sm leading-relaxed text-foreground/90">{children}</div>
        <p className="text-xs text-muted-foreground pt-4">
          <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/" className="underline">Home</Link>
        </p>
      </div>
    </div>
  );
}

const H = ({ children }: { children: ReactNode }) => <h2 className="text-base font-semibold pt-1">{children}</h2>;

export function Terms() {
  return (
    <Page title="Terms of Use">
      <p>
        ScrubIn is a surgical training simulator for education. By using it you agree to these terms. If you don't agree, please don't use the site.
      </p>
      <H>Education only, not medical advice</H>
      <p>
        Everything in ScrubIn (patients, vitals, drugs, doses, outcomes, scores and attending notes) comes from a simplified model and from AI
        text. It can be wrong or incomplete and is not a substitute for clinical training, supervision, guidelines or your own judgement. Never use
        ScrubIn to make decisions about real patients. The patients and cases are fictional.
      </p>
      <H>Your account</H>
      <p>
        You are responsible for what happens under your account. Give accurate sign-up details and don't share your login. We may suspend accounts
        that abuse the service.
      </p>
      <H>Acceptable use</H>
      <p>
        Don't try to break, overload or scrape the service, bypass its limits, attack other users, or use it to generate harmful content. The AI
        features (typed and spoken orders, attending notes) have usage limits that may change.
      </p>
      <H>Availability and changes</H>
      <p>
        ScrubIn is provided as is, without warranties. It may be unavailable, change, or lose data (for example if you clear your browser data or if we
        remove a feature). Scores and rankings are for fun and learning and may be reset.
      </p>
      <H>Liability</H>
      <p>To the extent the law allows, ScrubIn and its creators are not liable for any loss arising from your use of the site or from relying on its content.</p>
      <H>Contact</H>
      <p>
        Questions or problems: <a className="underline" href={ISSUES} target="_blank" rel="noreferrer">open an issue</a>. We may update these terms;
        the date above shows the latest version.
      </p>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy Policy">
      <p>This explains what ScrubIn stores and who it is shared with. We keep it to what the site needs.</p>
      <H>What we collect</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>Account details from sign-up or from GitHub or Google sign-in: your name, email address and profile picture.</li>
        <li>Your simulation results: scores, outcomes, your decisions and the cases you save.</li>
        <li>Real-time operating room cases (your orders and what happened) are kept in your browser, and also in your account if you are signed in so they follow you across devices.</li>
        <li>The text you type and the speech you record to give orders or get feedback (see below).</li>
        <li>Basic site usage statistics, if analytics is turned on.</li>
      </ul>
      <H>Who processes it</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>Supabase stores accounts, results and saved cases.</li>
        <li>Vercel hosts the website and its serverless functions.</li>
        <li>Groq and OpenRouter (AI providers) receive the text of free-text orders, the data used to write attending notes, and, when you use the microphone, the audio recording for transcription. ScrubIn does not keep the audio. Those providers handle it under their own terms.</li>
        <li>GitHub and Google handle sign-in if you choose those options.</li>
        <li>Google Fonts serves the site's fonts.</li>
      </ul>
      <H>What we don't do</H>
      <p>We don't sell your data and we don't show ads. Don't type real patient information or anything confidential: all cases are fictional.</p>
      <H>Your choices</H>
      <ul className="list-disc pl-5 space-y-1">
        <li>Delete a saved case from "My OR cases" (the trash icon, or "Delete all unfinished"). This also removes it from your account.</li>
        <li>Clear data kept in your browser from your browser's settings.</li>
        <li>To delete your account and its data, <a className="underline" href={ISSUES} target="_blank" rel="noreferrer">open an issue</a> and ask. Don't post private information there: we will explain how to verify you.</li>
      </ul>
      <H>Children</H>
      <p>ScrubIn is meant for students and trainees of working age. It is not for children under 13.</p>
      <H>Changes</H>
      <p>We may update this policy. The date above shows the latest version.</p>
    </Page>
  );
}
