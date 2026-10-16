/**
 * ScrubIn Leaderboard: all-time XP ranking (the `leaderboard` view), as a real table,
 * with the signed-in student's row highlighted and pinned below if they're outside the top 50.
 */
import { useEffect, useState } from "react";
import { Crown, Medal, Trophy, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/leaderboard";
import { CtaLink, EmptyState, LoadingState, PageHeader, Pill } from "@/components/scrubin";
import { cn } from "@/lib/utils";

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-primary" aria-label="First place" />;
  if (rank <= 3) return <Medal className="h-5 w-5 text-primary" aria-label={rank === 2 ? "Second place" : "Third place"} />;
  return <span className="font-mono-data text-base font-semibold text-label">{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLeaderboard().then(({ entries }) => !cancelled && setEntries(entries));
    return () => {
      cancelled = true;
    };
  }, []);

  const myIndex = entries && user ? entries.findIndex((e) => e.user_id === user.id) : -1;

  return (
    <div className="bg-background text-foreground">
      <div className="border-b border-border pb-10 pt-28">
        <div className="mx-auto max-w-4xl px-4">
          <PageHeader
            eyebrow="All-time rankings"
            title="Leader"
            accent="board"
            lead="XP from every completed case: 100 per case plus a tenth of your score."
          />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {entries === null ? (
          <LoadingState label="Loading the leaderboard" />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Trophy />}
            title="No ranked surgeons yet"
            description="Complete a case to put your name on the board."
            action={<CtaLink href="/procedures">Choose a procedure</CtaLink>}
          />
        ) : (
          <>
            {user && myIndex < 0 && (
              <p className="mb-6 rounded-sm border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                You're not in the top {entries.length} yet. Complete cases to earn XP and climb the board.
              </p>
            )}
            <div className="surface overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Top {entries.length} surgeons by all-time XP</caption>
                <thead className="border-b border-border font-mono-data text-[11px] uppercase tracking-[0.14em] text-label">
                  <tr>
                    <th scope="col" className="w-16 px-5 py-3 font-normal">Rank</th>
                    <th scope="col" className="px-5 py-3 font-normal">Surgeon</th>
                    <th scope="col" className="hidden px-5 py-3 text-right font-normal sm:table-cell">Cases</th>
                    <th scope="col" className="px-5 py-3 text-right font-normal">XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entries.map((e, i) => {
                    const me = i === myIndex;
                    return (
                      <tr key={e.user_id} className={cn("transition-colors hover:bg-background", me && "bg-primary/5")} aria-current={me ? "true" : undefined}>
                        <td className="px-5 py-4">
                          <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-border">
                            <RankMark rank={i + 1} />
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted">
                              {e.avatar_url ? <img src={e.avatar_url} alt="" className="h-full w-full object-cover" /> : <User className="h-5 w-5 text-label" aria-hidden="true" />}
                            </span>
                            <span className="truncate font-semibold">{e.username || "Unknown"}</span>
                            {me && <Pill tone="terracotta">You</Pill>}
                          </div>
                        </td>
                        <td className="hidden px-5 py-4 text-right font-mono-data text-muted-foreground tabular-nums sm:table-cell">{e.procedures_completed}</td>
                        <td className="px-5 py-4 text-right font-mono-data text-lg font-semibold tabular-nums">{(e.total_xp ?? 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
