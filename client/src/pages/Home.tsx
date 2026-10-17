/**
 * ScrubIn Home: an Apple-style scroll story (hero → the monitor crisis → roles → debrief) wrapped
 * around a Duolingo-style dashboard (streak, daily goal, level, continue).
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Flame, Play, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProgress } from "@/hooks/useProgress";
import { CtaLink, Eyebrow } from "@/components/scrubin";
import { GoalRing, LevelBar, StreakChip } from "@/components/game";
import { DebriefChapter, FinalChapter, HeroChapter, MonitorChapter, RolesChapter } from "@/components/home/ScrollStory";
import { cn } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const { user } = useAuth();
  const progress = useProgress();
  const firstName = user?.name?.split(" ")[0] || user?.login || "Doctor";
  const last = progress.sessions[0];
  const isNew = progress.loaded && progress.sessions.length === 0;

  return (
    <div className="bg-background text-foreground">
      <HeroChapter
        greeting={<Eyebrow variant="hero" className="mb-6 flex">{greeting()}, {firstName}</Eyebrow>}
        title={isNew ? <>Your first surgery<br />starts <span className="text-primary">here.</span></> : <>Ready to<br /><span className="text-primary">scrub in?</span></>}
        lead={isNew ? "Step into a real-time operating room, make the calls yourself, and see the consequences, with zero real risk." : last ? `Last time: ${last.procedure_name}, ${last.score}%. Keep your streak alive with one case today.` : "One case a day keeps your streak alive."}
        actions={
          <>
            {last ? (
              <CtaLink href={`/simulation?proc=${last.procedure_id}`} size="lg" className="px-8">
                <RotateCcw className="h-5 w-5" aria-hidden="true" /> Practise {last.procedure_name} again
              </CtaLink>
            ) : (
              <CtaLink href="/simulation?proc=appendectomy" size="lg" className="px-8">
                <Activity className="h-5 w-5" aria-hidden="true" /> Start with an appendectomy
              </CtaLink>
            )}
            <CtaLink href="/procedures" size="lg" variant="outline" className="px-8">
              <Play className="h-5 w-5" aria-hidden="true" /> Your learning path
            </CtaLink>
          </>
        }
      />

      {/* Duolingo-style dashboard: streak, daily goal, level. */}
      <section className="mx-auto max-w-6xl px-4 pb-24" aria-labelledby="today-h">
        <h2 id="today-h" className="sr-only">Today</h2>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ type: "spring", damping: 22 }} className="grid gap-4 md:grid-cols-3">
          <div className="surface flex items-center gap-5 p-6">
            <span className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl", progress.doneToday ? "bg-streak text-streak-foreground" : "bg-streak/10 text-streak")}>
              <Flame className={cn("h-9 w-9", progress.doneToday && "fill-current")} aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-4xl">{progress.streak}</p>
              <p className="text-sm font-semibold text-muted-foreground">{progress.doneToday ? "day streak · today done" : progress.streak ? "day streak · do a case today" : "start a streak today"}</p>
            </div>
          </div>
          <div className="surface flex items-center gap-5 p-6">
            <GoalRing value={progress.todayXp} goal={progress.goal} />
            <div>
              <p className="font-display text-4xl">
                {Math.min(progress.todayXp, progress.goal)}
                <span className="text-xl text-muted-foreground">/{progress.goal}</span>
              </p>
              <p className="text-sm font-semibold text-muted-foreground">XP daily goal</p>
            </div>
          </div>
          <div className="surface flex flex-col justify-center gap-3 p-6">
            <LevelBar xp={progress.xp} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{progress.xp.toLocaleString()} XP total</span>
              <StreakChip streak={progress.streak} doneToday={progress.doneToday} />
            </div>
          </div>
        </motion.div>
        <Link href="/procedures" className="group mt-4 flex items-center justify-between rounded-2xl border-2 border-border bg-card px-6 py-4 font-semibold transition-colors hover:border-primary">
          <span>Continue your learning path</span>
          <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </section>

      <MonitorChapter />
      <RolesChapter />
      <DebriefChapter />
      <FinalChapter />
    </div>
  );
}
