/**
 * ScrubIn Procedure Library: every procedure, filterable by difficulty and specialty (combinable),
 * with the student's XP gate. Each card opens the OR; "Briefing" opens the pre-op briefing first.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Baby, Bone, Brain, BookOpen, Clock, Heart, Lock, Scissors, Search, Shield, Star, Stethoscope, Zap } from "lucide-react";
import bundledCatalog from "@/data/procedureCatalog.json";
import { STOCK_STEP_BANKS } from "@/data/stockSteps";
import { ENGINE_SCENARIO } from "@/engine/scenarios";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api";
import { EASE } from "@/lib/motion";
import { useProcedureStore } from "@/state/procedureStore";
import { Button } from "@/components/ui/button";
import { DifficultyPill, EmptyState, ErrorBanner, FilterChips, PageHeader, Pill, SearchField } from "@/components/scrubin";
import { LearningPath } from "@/components/game/LearningPath";
import { LevelBar, StreakChip } from "@/components/game";
import { useProgress } from "@/hooks/useProgress";

// Humanized names for the engine's complication ids (server/engine/state/models.ts).
const RISK_LABELS: Record<string, string> = {
  hemorrhage: "Hemorrhage",
  infection: "Infection",
  hypoxia: "Hypoxia",
  nerve_injury: "Nerve injury",
  thrombosis: "Thrombosis",
  cardiac_arrhythmia: "Arrhythmia",
  anaphylaxis: "Anaphylaxis",
  fluid_overload: "Fluid overload",
};

const DIFFICULTIES = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const REQUIRED_XP: Record<string, number> = { beginner: 0, intermediate: 500, advanced: 2000 };

/** "Thoracic / Surgical Oncology" → "Thoracic": the family a specialty filter groups by. */
const familyOf = (specialty: string) => (specialty || "Other").split(" / ")[0].trim();

const FAMILY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "General Surgery": Scissors,
  "Trauma Surgery": Activity,
  Cardiovascular: Heart,
  Vascular: Heart,
  Neurological: Brain,
  Neurosurgery: Brain,
  Orthopedic: Bone,
  "OB/GYN": Baby,
  Urology: Shield,
  ENT: Stethoscope,
  Laparoscopic: Zap,
  Thoracic: Activity,
  Hepatobiliary: Scissors,
  "Surgical Oncology": Star,
};

interface Procedure {
  id: string;
  name: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  specialty: string;
  family: string;
  time: string;
  decisions: number;
  description: string;
}

function normalise(p: any): Procedure {
  // The registry reports difficulty as `category` (e.g. "beginner"); accept both.
  const raw = String(p.difficulty || p.category || "").toLowerCase();
  const difficulty = (["beginner", "intermediate", "advanced"].includes(raw) ? raw : "beginner") as Procedure["difficulty"];
  const specialty = p.specialty || "Other";
  return {
    id: p.id,
    name: p.name,
    difficulty,
    specialty,
    family: familyOf(specialty),
    time: p.estimated_time || `${p.totalTicks ?? 0} min`,
    // Real decision count = the engine's totalTicks (each tick is one decision step).
    decisions: p.totalTicks ?? p.phases?.length ?? 0,
    description: p.description,
  };
}

function KeyRisks({ procId }: { procId: string }) {
  const risks = (STOCK_STEP_BANKS as any)[procId]?.spec?.risks as string[] | undefined;
  if (!risks?.length) return null;
  return (
    <p className="mb-5 flex items-start gap-1.5 text-xs leading-relaxed text-label">
      <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>
        Key risks: <span className="text-muted-foreground">{risks.map((r) => RISK_LABELS[r] || r).join(" · ")}</span>
      </span>
    </p>
  );
}

function ProcedureCard({ proc, locked, index }: { proc: Procedure; locked: boolean; index: number }) {
  const Icon = FAMILY_ICON[proc.family] ?? Activity;
  const realtime = Boolean(ENGINE_SCENARIO[proc.id]);
  const needXp = REQUIRED_XP[proc.difficulty];
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.06, ease: EASE }}
      className={locked ? "procedure-card relative flex flex-col p-6 opacity-70" : "procedure-card group relative flex flex-col p-6"}
      aria-disabled={locked || undefined}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-background text-primary" aria-hidden="true">
          <Icon className="h-6 w-6" />
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {realtime && <Pill tone="terracotta">Real-time OR</Pill>}
          <DifficultyPill difficulty={proc.difficulty[0].toUpperCase() + proc.difficulty.slice(1)} />
        </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold leading-snug tracking-tight text-foreground">
        {locked ? (
          proc.name
        ) : (
          // The title link covers the whole card; the Briefing link sits above it.
          <Link href={`/simulation?proc=${proc.id}`} className="after:absolute after:inset-0 after:content-[''] group-hover:text-primary">
            {proc.name}
          </Link>
        )}
      </h3>
      <p className="label-mono mb-3">{proc.specialty}</p>
      <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{proc.description}</p>
      <KeyRisks procId={proc.id} />

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 font-mono-data text-xs text-label">
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {proc.time}
          </span>
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" aria-hidden="true" /> {proc.decisions} decisions
          </span>
        </span>
        {locked ? (
          <span className="flex items-center gap-1.5 text-warning">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {needXp} XP
          </span>
        ) : (
          <Link href={`/learn/${proc.id}`} className="relative z-10 flex items-center gap-1.5 font-sans text-xs font-semibold text-primary hover:underline">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> Briefing
          </Link>
        )}
      </div>
      {locked && <p className="mt-3 text-xs text-muted-foreground">Earn {needXp} XP to unlock {proc.difficulty} cases.</p>}
    </motion.li>
  );
}

export default function ProcedureLibrary() {
  const { user } = useAuth();
  const progress = useProgress();
  const userXP = progress.xp;
  const [specialty, setSpecialty] = useState("all");
  // The path is the default way in; the library tab keeps search and filters.
  const [view, setView] = useState<"path" | "library">(() => (new URLSearchParams(window.location.search).get("view") === "library" ? "library" : "path"));
  const { procedures, loading, error, query, difficulty, setProcedures, setLoading, setError, setQuery, setDifficulty } = useProcedureStore();

  // Show the catalog bundled with the site at once, then swap in the live registry if the
  // (free, often sleeping) server answers. Filtering happens on the client so the filters combine.
  const fetchProcedures = async () => {
    setError(null);
    if (!(procedures as Procedure[]).length) setProcedures((bundledCatalog as any).procedures.map(normalise));
    setLoading(false);
    try {
      const res = await fetch(`${API_BASE}/api/procedures/search`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.procedures || data.scenarios || [];
      if (list.length) setProcedures(list.map(normalise));
    } catch {
      /* the bundled catalog is already showing */
    }
  };

  useEffect(() => {
    fetchProcedures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const families = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of procedures as Procedure[]) counts.set(p.family, (counts.get(p.family) ?? 0) + 1);
    return [{ value: "all", label: "All specialties" }, ...Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([f]) => ({ value: f, label: f }))];
  }, [procedures]);

  const level = difficulty || "all";
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (procedures as Procedure[]).filter(
      (p) =>
        (level === "all" || p.difficulty === level) &&
        (specialty === "all" || p.family === specialty) &&
        (!q || p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q)),
    );
  }, [procedures, level, specialty, query]);

  // The dev server unlocks everything for testing; production keeps the XP gate.
  const isLocked = (p: Procedure) => !import.meta.env.DEV && userXP < REQUIRED_XP[p.difficulty];

  const clearFilters = () => {
    setQuery("");
    setDifficulty("");
    setSpecialty("all");
  };

  const nextTier = userXP < 500 ? { at: 500, label: "Intermediate", from: 0 } : userXP < 2000 ? { at: 2000, label: "Advanced", from: 500 } : null;
  const tierProgress = nextTier ? Math.min(((userXP - nextTier.from) / (nextTier.at - nextTier.from)) * 100, 100) : 100;

  return (
    <div className="bg-background text-foreground">
      <div className="border-b border-border pb-10 pt-28">
        <div className="mx-auto max-w-6xl px-4">
          <PageHeader
            eyebrow={view === "path" ? "Your learning path" : "Procedure library"}
            title={view === "path" ? "One case at a" : "Choose your"}
            accent={view === "path" ? "time." : "procedure"}
            lead={view === "path" ? "Beginner to advanced. Finish cases to earn XP and unlock the next unit." : loading ? "Loading the library…" : `${visible.length} of ${procedures.length} procedures`}
            actions={user && <StreakChip streak={progress.streak} doneToday={progress.doneToday} className="text-base" />}
          />
          <div role="tablist" aria-label="View" className="mt-8 inline-flex rounded-2xl border-2 border-border bg-card p-1">
            {(["path", "library"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`rounded-xl px-5 py-2 text-sm font-bold transition-colors ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v === "path" ? "Learning path" : "All procedures"}
              </button>
            ))}
          </div>
          {view === "library" && <div className="mt-6 space-y-4">
            <SearchField label="Search procedures" placeholder="Search by name, specialty or description" value={query} onChange={(e) => setQuery(e.target.value)} className="max-w-md" />
            <FilterChips label="Difficulty" options={DIFFICULTIES} value={level as (typeof DIFFICULTIES)[number]["value"]} onChange={(v) => setDifficulty(v === "all" ? "" : v)} />
            <FilterChips label="Specialty" options={families} value={specialty} onChange={setSpecialty} />
          </div>}
        </div>
      </div>

      {view === "path" ? (
        <div className="mx-auto max-w-6xl px-4 py-12">
          {user && <LevelBar xp={userXP} className="mx-auto mb-12 max-w-xl" />}
          <LearningPath procedures={procedures as Procedure[]} sessions={progress.sessions} xp={userXP} devUnlocked={import.meta.env.DEV} />
        </div>
      ) : (

      <div className="mx-auto max-w-6xl px-4 py-12">
        {user && (
          <section aria-labelledby="xp-heading" className="surface mb-12 p-6 md:p-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="xp-heading" className="label-mono mb-2">Your experience</h2>
                <p className="font-mono-data text-4xl font-semibold tracking-tight">
                  {userXP.toLocaleString()}
                  <span className="ml-1 text-xl font-bold text-primary">XP</span>
                </p>
              </div>
              <p className={`flex items-center gap-2 text-sm font-medium ${nextTier ? "text-warning" : "text-success"}`}>
                {nextTier ? <Lock className="h-4 w-4" aria-hidden="true" /> : <Star className="h-4 w-4" aria-hidden="true" />}
                {nextTier ? `${nextTier.label} unlocks at ${nextTier.at.toLocaleString()} XP` : "All procedures unlocked"}
              </p>
            </div>
            <div className="h-1.5 w-full bg-accent" role="progressbar" aria-label={nextTier ? `Progress to ${nextTier.label}` : "All tiers unlocked"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(tierProgress)}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${tierProgress}%` }} transition={{ duration: 1, ease: EASE }} className={`h-full ${nextTier ? (userXP >= 500 ? "bg-warning" : "bg-primary") : "bg-success"}`} />
            </div>
          </section>
        )}

        {error && (
          <ErrorBanner className="mb-8" action={<Button variant="ghost" size="sm" onClick={() => fetchProcedures()}>Retry</Button>}>
            {error}
          </ErrorBanner>
        )}

        {loading ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i} className="h-72 animate-pulse rounded-sm border border-border bg-muted" />
            ))}
          </ul>
        ) : visible.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((proc, i) => (
              <ProcedureCard key={proc.id} proc={proc} locked={isLocked(proc)} index={i} />
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Search />}
            title="No procedures match"
            description="Try another specialty or difficulty, or clear the search."
            action={<Button onClick={clearFilters}>Clear filters</Button>}
          />
        )}
      </div>
      )}
    </div>
  );
}
