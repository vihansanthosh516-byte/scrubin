/**
 * One pre-op briefing: the patient, what to know before incision, the key risks and the steps
 * grouped into phases, ending in "Start this case".
 */
import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { Activity, AlertTriangle, ArrowLeft, BookOpen } from "lucide-react";
import { getBriefing } from "@/lib/briefings";
import { CtaLink, DifficultyPill, EmptyState, Eyebrow, Pill } from "@/components/scrubin";

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function Briefing() {
  const { procId } = useParams<{ procId: string }>();
  const b = getBriefing(procId ?? "");

  useEffect(() => {
    if (b) document.title = `${b.name} briefing · ScrubIn`;
  }, [b]);

  if (!b) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28">
        <EmptyState icon={<BookOpen />} title="No briefing for this procedure" description="It may have been renamed." action={<CtaLink href="/learn">All briefings</CtaLink>} />
      </div>
    );
  }

  const v = b.patient.vitals ?? {};
  const vitals = [
    { label: "HR", value: v.hr, unit: "bpm" },
    { label: "BP", value: v.bp, unit: "mmHg" },
    { label: "SpO₂", value: v.spo2, unit: "%" },
    { label: "RR", value: v.rr, unit: "/min" },
    { label: "Temp", value: v.temp, unit: "°C" },
  ].filter((x) => x.value !== undefined && x.value !== null);

  return (
    <article className="bg-background text-foreground">
      <header className="border-b border-border pb-10 pt-28">
        <div className="mx-auto max-w-4xl px-4">
          <Link href="/learn" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All briefings
          </Link>
          <Eyebrow variant="hero" className="mb-4 flex">
            Pre-op briefing · {b.specialty}
          </Eyebrow>
          <h1 className="font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">{b.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{b.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <DifficultyPill difficulty={cap(b.difficulty)} />
            {b.realtime ? <Pill tone="terracotta">Real-time OR</Pill> : <Pill>Decision-based case</Pill>}
            <Pill>{b.stepCount} steps</Pill>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={`/simulation?proc=${b.id}`} size="lg" className="px-8 font-semibold">
              <Activity className="h-5 w-5" aria-hidden="true" /> Start this case
            </CtaLink>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-4xl gap-10 px-4 py-12">
        {/* The patient */}
        <section aria-labelledby="patient-h" className="surface p-6 md:p-8">
          <h2 id="patient-h" className="section-tag">The patient</h2>
          <p className="mt-3 text-xl font-semibold">
            {b.patient.name}, {b.patient.age}
            {b.patient.sex ? `, ${b.patient.sex.toLowerCase()}` : ""}
            {b.patient.weight ? ` · ${b.patient.weight}` : ""}
            {b.patient.bloodType ? ` · ${b.patient.bloodType}` : ""}
          </p>
          {b.patient.presentation && <p className="mt-2 text-muted-foreground">{b.patient.presentation}</p>}
          {b.patient.comorbidities.length > 0 && (
            <p className="mt-3 text-sm">
              <span className="font-semibold">Comorbidities:</span> <span className="text-muted-foreground">{b.patient.comorbidities.join(", ")}</span>
            </p>
          )}
          {vitals.length > 0 && (
            <dl className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {vitals.map((x) => (
                <div key={x.label} className="rounded-sm border border-border bg-background px-3 py-2">
                  <dt className="label-mono">{x.label}</dt>
                  <dd className="font-mono-data text-lg font-semibold tabular-nums">
                    {x.value}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">{x.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        {/* Know before incision */}
        {b.know.length > 0 && (
          <section aria-labelledby="know-h">
            <h2 id="know-h" className="font-display text-3xl tracking-tight">Know before you scrub in</h2>
            <dl className="mt-5 divide-y divide-border border-y border-border">
              {b.know.map((k) => (
                <div key={k.label} className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-6">
                  <dt className="label-mono pt-0.5">{k.label}</dt>
                  <dd className="text-sm">{k.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Risks */}
        {b.risks.length > 0 && (
          <section aria-labelledby="risks-h">
            <h2 id="risks-h" className="font-display text-3xl tracking-tight">What can go wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">Complications this case can develop. Watch the monitor for their early signs.</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {b.risks.map((r) => (
                <li key={r}>
                  <Pill tone="carmine" icon={<AlertTriangle className="h-3 w-3" aria-hidden="true" />}>
                    {r}
                  </Pill>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Steps */}
        <section aria-labelledby="steps-h">
          <h2 id="steps-h" className="font-display text-3xl tracking-tight">The case, step by step</h2>
          <p className="mt-2 text-sm text-muted-foreground">The usual path through the operation. What actually happens depends on your decisions and on the patient.</p>
          <div className="mt-6 space-y-8">
            {b.phases.map((ph) => (
              <div key={ph.name}>
                <h3 className="section-tag mb-3">{ph.name}</h3>
                <ol className="surface divide-y divide-border">
                  {ph.steps.map((title, i) => (
                    <li key={i} className="flex gap-4 px-5 py-3">
                      <span className="w-6 shrink-0 pt-0.5 font-mono-data text-xs text-label">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-medium">{title}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">Ready? The patient is on the table.</p>
          <CtaLink href={`/simulation?proc=${b.id}`} size="lg" className="px-8 font-semibold">
            <Activity className="h-5 w-5" aria-hidden="true" /> Start this case
          </CtaLink>
        </div>
      </div>
    </article>
  );
}
