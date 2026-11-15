/**
 * ScrubIn Learn: a pre-op briefing for every procedure, built from the same data as the cases.
 */
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen } from "lucide-react";
import { BRIEFINGS } from "@/lib/briefings";
import { Button } from "@/components/ui/button";
import { DifficultyPill, EmptyState, FilterChips, PageHeader, Pill, SearchField } from "@/components/scrubin";

const family = (s: string) => s.split(" / ")[0];
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function LearnHub() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");

  const families = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of BRIEFINGS) counts.set(family(b.specialty), (counts.get(family(b.specialty)) ?? 0) + 1);
    return [{ value: "all", label: "All specialties" }, ...Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([f]) => ({ value: f, label: f }))];
  }, []);

  const order = { beginner: 0, intermediate: 1, advanced: 2 } as const;
  const visible = BRIEFINGS.filter((b) => {
    const q = query.trim().toLowerCase();
    return (specialty === "all" || family(b.specialty) === specialty) && (!q || b.name.toLowerCase().includes(q) || b.specialty.toLowerCase().includes(q));
  }).sort((a, b) => order[a.difficulty] - order[b.difficulty] || a.name.localeCompare(b.name));

  return (
    <div className="bg-background text-foreground">
      <div className="border-b border-border pb-10 pt-28">
        <div className="mx-auto max-w-6xl px-4">
          <PageHeader
            eyebrow="Learn"
            title="Pre-op briefings"
            lead="The patient, the anatomy at risk and the steps of every case, before you scrub in."
          />
          <div className="mt-8 space-y-4">
            <SearchField label="Search briefings" placeholder="Search by procedure or specialty" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-md" />
            <FilterChips label="Specialty" options={families} value={specialty} onChange={setSpecialty} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {visible.length ? (
          <ul className="border-t border-foreground">
            {visible.map((b) => (
              <li key={b.id} className="rise group relative grid grid-cols-1 gap-x-8 gap-y-3 border-b border-border py-7 transition-colors hover:bg-muted/60 md:grid-cols-[minmax(0,5fr)_minmax(0,5fr)_auto] md:px-3">
                <div className="min-w-0">
                  <h2 className="text-3xl leading-tight">
                    <Link href={`/learn/${b.id}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-foreground">
                      {b.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{b.specialty}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <DifficultyPill difficulty={cap(b.difficulty)} />
                    {b.realtime && <Pill tone="terracotta">Real-time OR</Pill>}
                  </div>
                </div>
                <p className="line-clamp-3 leading-relaxed text-foreground">
                  {b.patient.name}, {b.patient.age}
                  {b.patient.sex ? ` ${b.patient.sex.toLowerCase()}` : ""}. {b.patient.presentation}
                </p>
                <div className="flex items-start justify-between gap-6 md:flex-col md:items-end">
                  <span className="font-mono-data text-sm text-muted-foreground">
                    {b.stepCount} steps, {b.risks.length} key risks
                  </span>
                  <ArrowRight className="h-5 w-5 text-foreground transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<BookOpen />}
            title="No briefings match"
            description="Try another specialty or clear the search."
            action={
              <Button
                onClick={() => {
                  setQuery("");
                  setSpecialty("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
