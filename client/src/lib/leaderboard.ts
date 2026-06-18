import { request } from "./api";

export interface LeaderboardEntry {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
  score: number;
}

/** Get leaderboard sorted by score */
export function getLeaderboard() {
  // Backend endpoint not yet implemented; placeholder for future
  return request<{ entries: LeaderboardEntry[] }>("/api/leaderboard");
}
