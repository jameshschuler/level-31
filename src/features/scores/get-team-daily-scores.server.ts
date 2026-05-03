import { getLatestTeamDailyScoreRows } from "#/features/steps/get-latest-step-snapshots.server";

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
  const scoreRows = await getLatestTeamDailyScoreRows();

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

  return Array.from(grouped.entries())
    .map(([stepDate, rows]) => ({
      stepDate,
      rows: rows.sort(
        (a, b) => b.totalPoints - a.totalPoints || b.teamSteps - a.teamSteps,
      ),
    }))
    .sort((a, b) => b.stepDate.localeCompare(a.stepDate));
}
