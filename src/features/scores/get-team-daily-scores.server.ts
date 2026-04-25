import { asc, desc, eq } from "drizzle-orm";
import { db } from "#/db/client";
import { teamDailyScores, teams } from "#/db/schema";

export type TeamDailyScoreResult = {
  stepDate: string;
  rows: Array<{
    teamId: number;
    teamName: string;
    teamIcon: string;
    teamSteps: number;
    requiredSteps: number;
    doubleMilestoneSteps: number;
    totalPoints: number;
    basePoints: number;
    bonusPoints: number;
    metRequirement: boolean;
    hitDoubleMilestone: boolean;
  }>;
};

export async function getTeamDailyScores() {
  const scoreRows = await db
    .select({
      stepDate: teamDailyScores.stepDate,
      teamId: teamDailyScores.teamId,
      teamName: teams.name,
      teamIcon: teams.icon,
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
    .innerJoin(teams, eq(teamDailyScores.teamId, teams.id))
    .orderBy(asc(teamDailyScores.stepDate), desc(teamDailyScores.totalPoints));

  const grouped = new Map<string, TeamDailyScoreResult["rows"]>();

  for (const row of scoreRows) {
    const existing = grouped.get(row.stepDate) ?? [];
    existing.push({
      teamId: row.teamId,
      teamName: row.teamName,
      teamIcon: row.teamIcon,
      teamSteps: row.teamSteps,
      requiredSteps: row.requiredSteps,
      doubleMilestoneSteps: row.doubleMilestoneSteps,
      totalPoints: row.totalPoints,
      basePoints: row.basePoints,
      bonusPoints: row.bonusPoints,
      metRequirement: row.metRequirement,
      hitDoubleMilestone: row.hitDoubleMilestone,
    });
    grouped.set(row.stepDate, existing);
  }

  return Array.from(grouped.entries()).map(([stepDate, rows]) => ({
    stepDate,
    rows,
  }));
}
