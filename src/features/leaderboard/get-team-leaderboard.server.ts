import { desc, eq, like, sql } from "drizzle-orm";
import { db } from "#/db/client";
import {
  playerDailySteps,
  playerStepSummaries,
  players,
  stepReports,
  teamDailyScores,
  teams,
} from "#/db/schema";

export type TeamLeaderboardRow = {
  teamId: number;
  teamName: string;
  teamIcon: string;
  totalPoints: number;
  daysMetRequirement: number;
  daysHitDoubleMilestone: number;
  totalDays: number;
  totalSteps: number;
};

export async function getAvailableMonths(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ stepDate: teamDailyScores.stepDate })
    .from(teamDailyScores)
    .orderBy(teamDailyScores.stepDate);
  const months = [...new Set(rows.map((r) => r.stepDate.slice(0, 7)))];
  return months.sort().reverse();
}

export async function getLastUpdated(): Promise<string | null> {
  const rows = await db
    .select({ createdAt: stepReports.createdAt })
    .from(stepReports)
    .orderBy(desc(stepReports.createdAt))
    .limit(1);
  return rows[0]?.createdAt?.toISOString() ?? null;
}

export async function getTeamLeaderboard(
  month?: string,
): Promise<TeamLeaderboardRow[]> {
  const query = db
    .select({
      teamId: teamDailyScores.teamId,
      teamName: teams.name,
      teamIcon: teams.icon,
      totalPoints: sql<number>`sum(${teamDailyScores.totalPoints})`,
      daysMetRequirement: sql<number>`sum(case when ${teamDailyScores.metRequirement} then 1 else 0 end)`,
      daysHitDoubleMilestone: sql<number>`sum(case when ${teamDailyScores.hitDoubleMilestone} then 1 else 0 end)`,
      totalDays: sql<number>`count(distinct ${teamDailyScores.stepDate})`,
    })
    .from(teamDailyScores)
    .innerJoin(teams, eq(teamDailyScores.teamId, teams.id))
    .$dynamic();

  const withFilter = month
    ? query.where(like(teamDailyScores.stepDate, `${month}%`))
    : query;

  const scoreRows = await withFilter
    .groupBy(teamDailyScores.teamId)
    .orderBy(desc(sql`sum(${teamDailyScores.totalPoints})`));

  // Get total steps from player summaries (filtered by same month via playerDailySteps dates)
  const stepQuery = db
    .select({
      teamId: players.teamId,
      totalSteps: sql<number>`sum(${playerStepSummaries.totalSteps})`,
    })
    .from(playerStepSummaries)
    .innerJoin(players, eq(playerStepSummaries.playerId, players.id))
    .$dynamic();

  const stepRows = month
    ? await stepQuery
        .innerJoin(
          playerDailySteps,
          eq(playerDailySteps.reportId, playerStepSummaries.reportId),
        )
        .where(like(playerDailySteps.stepDate, `${month}%`))
        .groupBy(players.teamId)
    : await stepQuery.groupBy(players.teamId);

  const stepsByTeam = new Map(stepRows.map((r) => [r.teamId, r.totalSteps]));

  return scoreRows
    .map((row) => ({
      teamId: row.teamId,
      teamName: row.teamName,
      teamIcon: row.teamIcon,
      totalPoints: row.totalPoints,
      daysMetRequirement: row.daysMetRequirement,
      daysHitDoubleMilestone: row.daysHitDoubleMilestone,
      totalDays: row.totalDays,
      totalSteps: stepsByTeam.get(row.teamId) ?? 0,
    }))
    .sort(
      (a, b) => b.totalPoints - a.totalPoints || b.totalSteps - a.totalSteps,
    );
}

export type PlayerDailyEntry = { stepDate: string; steps: number };

export type PlayerLeaderboardRow = {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  teamIcon: string;
  totalSteps: number;
  avgDailySteps: number;
  dailySteps: PlayerDailyEntry[];
};

export async function getPlayerLeaderboard(
  month?: string,
): Promise<PlayerLeaderboardRow[]> {
  const dailyQuery = db
    .select({
      playerId: playerDailySteps.playerId,
      stepDate: playerDailySteps.stepDate,
      steps: playerDailySteps.steps,
    })
    .from(playerDailySteps)
    .$dynamic();

  const dailyRows = month
    ? await dailyQuery
        .where(like(playerDailySteps.stepDate, `${month}%`))
        .orderBy(playerDailySteps.playerId, playerDailySteps.stepDate)
    : await dailyQuery.orderBy(
        playerDailySteps.playerId,
        playerDailySteps.stepDate,
      );

  const dailyByPlayer = new Map<number, PlayerDailyEntry[]>();
  for (const row of dailyRows) {
    const existing = dailyByPlayer.get(row.playerId) ?? [];
    existing.push({ stepDate: row.stepDate, steps: row.steps ?? 0 });
    dailyByPlayer.set(row.playerId, existing);
  }

  // Build total steps per player from daily rows (already month-filtered)
  const totalStepsByPlayer = new Map<number, number>();
  for (const [playerId, entries] of dailyByPlayer) {
    totalStepsByPlayer.set(
      playerId,
      entries.reduce((sum, e) => sum + e.steps, 0),
    );
  }

  const playerRows = await db
    .select({
      playerId: players.id,
      playerName: players.displayName,
      teamId: players.teamId,
      teamName: teams.name,
      teamIcon: teams.icon,
    })
    .from(players)
    .innerJoin(teams, eq(players.teamId, teams.id));

  return playerRows
    .map((row) => {
      const daily = dailyByPlayer.get(row.playerId) ?? [];
      const totalSteps = totalStepsByPlayer.get(row.playerId) ?? 0;
      const avgDailySteps =
        daily.length > 0 ? Math.round(totalSteps / daily.length) : 0;
      return {
        playerId: row.playerId,
        playerName: row.playerName,
        teamId: row.teamId,
        teamName: row.teamName,
        teamIcon: row.teamIcon,
        totalSteps,
        avgDailySteps,
        dailySteps: daily,
      };
    })
    .filter((r) => r.totalSteps > 0)
    .sort((a, b) => b.totalSteps - a.totalSteps);
}
