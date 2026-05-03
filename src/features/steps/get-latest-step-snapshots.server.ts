import { desc, eq, like } from "drizzle-orm";
import { db } from "#/db/client";
import {
  playerDailySteps,
  players,
  stepReports,
  teamDailyScores,
  teams,
} from "#/db/schema";

export type LatestTeamDailyScoreRow = {
  teamId: number;
  teamName: string;
  teamIcon: string;
  stepDate: string;
  teamSteps: number;
  requiredSteps: number;
  doubleMilestoneSteps: number;
  totalPoints: number;
  basePoints: number;
  bonusPoints: number;
  metRequirement: boolean;
  hitDoubleMilestone: boolean;
};

export type LatestPlayerDailyStepRow = {
  playerId: number;
  playerName: string;
  teamId: number;
  teamName: string;
  teamIcon: string;
  stepDate: string;
  steps: number;
};

export async function getLatestTeamDailyScoreRows(month?: string) {
  const query = db
    .select({
      recordId: teamDailyScores.id,
      createdAt: stepReports.createdAt,
      teamId: teamDailyScores.teamId,
      teamName: teams.name,
      teamIcon: teams.icon,
      stepDate: teamDailyScores.stepDate,
      teamSteps: teamDailyScores.teamSteps,
      requiredSteps: teamDailyScores.requiredSteps,
      doubleMilestoneSteps: teamDailyScores.doubleMilestoneSteps,
      totalPoints: teamDailyScores.totalPoints,
      basePoints: teamDailyScores.basePoints,
      bonusPoints: teamDailyScores.bonusPoints,
      metRequirement: teamDailyScores.metRequirement,
      hitDoubleMilestone: teamDailyScores.hitDoubleMilestone,
    })
    .from(teamDailyScores)
    .innerJoin(stepReports, eq(teamDailyScores.reportId, stepReports.id))
    .innerJoin(teams, eq(teamDailyScores.teamId, teams.id))
    .$dynamic();

  const rows = month
    ? await query
        .where(like(teamDailyScores.stepDate, `${month}%`))
        .orderBy(desc(stepReports.createdAt), desc(teamDailyScores.id))
    : await query.orderBy(
        desc(stepReports.createdAt),
        desc(teamDailyScores.id),
      );

  const latestByTeamDate = new Map<string, LatestTeamDailyScoreRow>();

  for (const row of rows) {
    const key = `${row.teamId}:${row.stepDate}`;
    if (!latestByTeamDate.has(key)) {
      latestByTeamDate.set(key, {
        teamId: row.teamId,
        teamName: row.teamName,
        teamIcon: row.teamIcon,
        stepDate: row.stepDate,
        teamSteps: row.teamSteps,
        requiredSteps: row.requiredSteps,
        doubleMilestoneSteps: row.doubleMilestoneSteps,
        totalPoints: row.totalPoints,
        basePoints: row.basePoints,
        bonusPoints: row.bonusPoints,
        metRequirement: row.metRequirement,
        hitDoubleMilestone: row.hitDoubleMilestone,
      });
    }
  }

  return Array.from(latestByTeamDate.values()).sort(
    (a, b) =>
      a.stepDate.localeCompare(b.stepDate) ||
      a.teamName.localeCompare(b.teamName),
  );
}

export async function getLatestPlayerDailyStepRows(month?: string) {
  const query = db
    .select({
      recordId: playerDailySteps.id,
      createdAt: stepReports.createdAt,
      playerId: playerDailySteps.playerId,
      playerName: players.displayName,
      teamId: players.teamId,
      teamName: teams.name,
      teamIcon: teams.icon,
      stepDate: playerDailySteps.stepDate,
      steps: playerDailySteps.steps,
    })
    .from(playerDailySteps)
    .innerJoin(stepReports, eq(playerDailySteps.reportId, stepReports.id))
    .innerJoin(players, eq(playerDailySteps.playerId, players.id))
    .innerJoin(teams, eq(players.teamId, teams.id))
    .$dynamic();

  const rows = month
    ? await query
        .where(like(playerDailySteps.stepDate, `${month}%`))
        .orderBy(desc(stepReports.createdAt), desc(playerDailySteps.id))
    : await query.orderBy(
        desc(stepReports.createdAt),
        desc(playerDailySteps.id),
      );

  const latestByPlayerDate = new Map<string, LatestPlayerDailyStepRow>();

  for (const row of rows) {
    const key = `${row.playerId}:${row.stepDate}`;
    if (!latestByPlayerDate.has(key)) {
      latestByPlayerDate.set(key, {
        playerId: row.playerId,
        playerName: row.playerName,
        teamId: row.teamId,
        teamName: row.teamName,
        teamIcon: row.teamIcon,
        stepDate: row.stepDate,
        steps: row.steps ?? 0,
      });
    }
  }

  return Array.from(latestByPlayerDate.values()).sort(
    (a, b) =>
      a.playerName.localeCompare(b.playerName) ||
      a.stepDate.localeCompare(b.stepDate),
  );
}
