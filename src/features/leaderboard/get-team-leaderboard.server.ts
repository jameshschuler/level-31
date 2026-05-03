import { desc } from "drizzle-orm";
import { db } from "#/db/client";
import { stepReports } from "#/db/schema";
import {
  getLatestPlayerDailyStepRows,
  getLatestTeamDailyScoreRows,
} from "#/features/steps/get-latest-step-snapshots.server";

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
  const rows = await getLatestTeamDailyScoreRows();
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
  const [scoreRows, playerRows] = await Promise.all([
    getLatestTeamDailyScoreRows(month),
    getLatestPlayerDailyStepRows(month),
  ]);

  const teamsById = new Map<number, TeamLeaderboardRow>();

  for (const row of scoreRows) {
    const existing = teamsById.get(row.teamId) ?? {
      teamId: row.teamId,
      teamName: row.teamName,
      teamIcon: row.teamIcon,
      totalPoints: 0,
      daysMetRequirement: 0,
      daysHitDoubleMilestone: 0,
      totalDays: 0,
      totalSteps: 0,
    };

    existing.totalPoints += row.totalPoints;
    existing.daysMetRequirement += row.metRequirement ? 1 : 0;
    existing.daysHitDoubleMilestone += row.hitDoubleMilestone ? 1 : 0;
    existing.totalDays += 1;
    teamsById.set(row.teamId, existing);
  }

  for (const row of playerRows) {
    const existing = teamsById.get(row.teamId);
    if (existing) {
      existing.totalSteps += row.steps;
    }
  }

  return Array.from(teamsById.values()).sort(
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
  const dailyRows = await getLatestPlayerDailyStepRows(month);

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

  const playerRows = Array.from(
    new Map(
      dailyRows.map((row) => [
        row.playerId,
        {
          playerId: row.playerId,
          playerName: row.playerName,
          teamId: row.teamId,
          teamName: row.teamName,
          teamIcon: row.teamIcon,
        },
      ]),
    ).values(),
  );

  return playerRows
    .map((row) => {
      const daily = dailyByPlayer.get(row.playerId) ?? [];
      daily.sort((a, b) => a.stepDate.localeCompare(b.stepDate));
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
