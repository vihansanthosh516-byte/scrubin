import { supabase } from './supabase';

interface SessionData {
  userId: string;
  procedureId: string;
  procedureName: string;
  score: number;
  outcome: string;
  timeSeconds: number;
  decisionsCorrect: number;
  decisionsTotal: number;
  complicationsCount: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url: string;
  total_surgeries: number;
  avg_score: number;
  success_rate: number;
  last_session: string;
  rank?: number;
}

interface UserStats {
  totalSurgeries: number;
  avgScore: number;
  successRate: number;
  complications: number;
  bestScore: number;
}

// Save a surgery session to the database
export async function saveSession(data: SessionData): Promise<boolean> {
  const { error } = await supabase.from('sessions').insert([{
    user_id: data.userId,
    procedure_id: data.procedureId,
    procedure_name: data.procedureName,
    score: data.score,
    outcome: data.outcome,
    time_seconds: data.timeSeconds,
    decisions_correct: data.decisionsCorrect,
    decisions_total: data.decisionsTotal,
    complications_count: data.complicationsCount,
  }]);

  if (error) {
    console.error('Save session error:', error);
    return false;
  }
  return true;
}

// Get leaderboard data
export async function getLeaderboard(
  filter: 'global' | 'week' | 'procedure' = 'global',
  procedureId?: string
): Promise<LeaderboardEntry[]> {
  let query = supabase
    .from('leaderboard_view')
    .select('*')
    .order('avg_score', { ascending: false })
    .limit(100);

  const { data, error } = await query;

  if (error) {
    console.error('Leaderboard error:', error);
    return [];
  }

  // Filter by week if needed (client-side for now)
  if (filter === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return (data || []).filter((entry: LeaderboardEntry) =>
      new Date(entry.last_session) >= weekAgo
    );
  }

  // Filter by procedure if needed
  if (filter === 'procedure' && procedureId) {
    // For procedure-specific, we'd need a different view
    // For now, return all and let the UI handle it
    return data || [];
  }

  return data || [];
}

// Get user stats from database
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('User stats error:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return {
      totalSurgeries: 0,
      avgScore: 0,
      successRate: 0,
      complications: 0,
      bestScore: 0,
    };
  }

  const totalSurgeries = data.length;
  const avgScore = Math.round(data.reduce((acc, s) => acc + s.score, 0) / totalSurgeries);
  const successCount = data.filter(s => s.outcome === 'Successful').length;
  const successRate = Math.round((successCount / totalSurgeries) * 100);
  const complications = data.filter(s => s.outcome === 'Complicated' || s.outcome === 'Critical').length;
  const bestScore = Math.max(...data.map(s => s.score));

  return {
    totalSurgeries,
    avgScore,
    successRate,
    complications,
    bestScore,
  };
}

// Create or update user in database
export async function upsertUser(user: { id: string; name: string; login: string; avatar_url: string }): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .upsert([{
      id: user.id,
      name: user.name,
      login: user.login,
      avatar_url: user.avatar_url,
    }], { onConflict: 'id' });

  if (error) {
    console.error('Upsert user error:', error);
    return false;
  }
  return true;
}
