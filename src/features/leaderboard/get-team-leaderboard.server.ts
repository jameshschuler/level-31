import { desc, eq } from "drizzle-orm";
import { db } from "#/db/client";
import { players, stepReports, teams } from "#/db/schema";
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

export type PlayerTeamEntry = {
  teamId: number;
  teamName: string;
  teamIcon: string;
};

export type PlayerLeaderboardRow = {
  playerKey: string;
  playerName: string;
  teams: PlayerTeamEntry[];
  totalSteps: number;
  avgDailySteps: number;
  dailySteps: PlayerDailyEntry[];
};

function normalizePlayerName(name: string): string {
  return name.trim().toLowerCase();
}

export async function getPlayerLeaderboard(
  month?: string,
): Promise<PlayerLeaderboardRow[]> {
  const [dailyRows, membershipRows] = await Promise.all([
    getLatestPlayerDailyStepRows(month),
    db
      .select({
        playerName: players.displayName,
        teamId: teams.id,
        teamName: teams.name,
        teamIcon: teams.icon,
      })
      .from(players)
      .innerJoin(teams, eq(players.teamId, teams.id)),
  ]);

  const membershipsByPlayerKey = new Map<
    string,
    Map<number, PlayerTeamEntry>
  >();
  for (const row of membershipRows) {
    const playerKey = normalizePlayerName(row.playerName);
    const existing = membershipsByPlayerKey.get(playerKey) ?? new Map();
    existing.set(row.teamId, {
      teamId: row.teamId,
      teamName: row.teamName,
      teamIcon: row.teamIcon,
    });
    membershipsByPlayerKey.set(playerKey, existing);
  }

  const groups = new Map<
    string,
    {
      playerName: string;
      dailyByDate: Map<string, number>;
      teamsById: Map<number, PlayerTeamEntry>;
    }
  >();

  for (const row of dailyRows) {
    const playerKey = normalizePlayerName(row.playerName);
    const existing = groups.get(playerKey) ?? {
      playerName: row.playerName,
      dailyByDate: new Map<string, number>(),
      teamsById: new Map<number, PlayerTeamEntry>(),
    };

    existing.teamsById.set(row.teamId, {
      teamId: row.teamId,
      teamName: row.teamName,
      teamIcon: row.teamIcon,
    });

    const currentDateSteps = existing.dailyByDate.get(row.stepDate) ?? 0;
    // Multiple team memberships can produce duplicate day rows for one person.
    // Keep one day value so player totals are not multiplied by team count.
    existing.dailyByDate.set(
      row.stepDate,
      Math.max(currentDateSteps, row.steps ?? 0),
    );

    groups.set(playerKey, existing);
  }

  return Array.from(groups.entries())
    .map(([playerKey, group]) => {
      const daily = Array.from(group.dailyByDate.entries())
        .map(([stepDate, steps]) => ({ stepDate, steps }))
        .sort((a, b) => a.stepDate.localeCompare(b.stepDate));

      const totalSteps = daily.reduce((sum, entry) => sum + entry.steps, 0);
      const avgDailySteps =
        daily.length > 0 ? Math.round(totalSteps / daily.length) : 0;
      const teams = Array.from(
        membershipsByPlayerKey.get(playerKey) ?? group.teamsById,
      ).map(([, team]) => team);
      teams.sort((a, b) => a.teamName.localeCompare(b.teamName));

      return {
        playerKey,
        playerName: group.playerName,
        teams,
        totalSteps,
        avgDailySteps,
        dailySteps: daily,
      };
    })
    .filter((r) => r.totalSteps > 0)
    .sort(
      (a, b) =>
        b.totalSteps - a.totalSteps || a.playerName.localeCompare(b.playerName),
    );
}
