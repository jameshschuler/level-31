import Papa from "papaparse";
import { and, inArray } from "drizzle-orm";
import { db } from "#/db/client";
import {
  playerDailySteps,
  players,
  playerStepSummaries,
  stepReports,
  teamDailyScores,
  teamScoreSummaries,
  teams,
} from "#/db/schema";

export type UploadPlayerStepsCsvInput = {
  csvText: string;
  sourceFileName?: string;
  uploadPassword: string;
};

type CsvRow = Record<string, string>;

const DATE_HEADER_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const HEADER_MAP = {
  rank: "Total Steps Rank",
  name: "Name",
  totalSteps: "Total Steps",
  avgDailySteps: "Avg Daily Steps",
  dailyStepGoal: "Daily Step Goal",
  totalDistanceMi: "Total Distance (mi)",
  totalDistanceKm: "Total Distance (km)",
  avgDailyDistanceMi: "Avg Daily Distance (mi)",
  avgDailyDistanceKm: "Avg Daily Distance (km)",
} as const;

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseInteger(value: string | undefined, defaultValue = 0) {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.replaceAll(",", "").trim();
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parseFloatValue(value: string | undefined, defaultValue = 0) {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.replaceAll(",", "").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function parseStepValue(value: string | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "n.a" || normalized === "n/a") {
    return null;
  }

  const parsed = Number.parseInt(normalized.replaceAll(",", ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCsvRows(csvText: string) {
  const parsed = Papa.parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
    transform: (value) => value.trim(),
  });

  if (parsed.errors.length > 0) {
    const firstError = parsed.errors[0];
    throw new Error(`Invalid CSV: ${firstError.message}`);
  }

  const rows = parsed.data.filter((row) => Object.values(row).some(Boolean));

  if (rows.length === 0) {
    throw new Error("CSV has no player rows");
  }

  return rows;
}

function getDateHeaders(row: CsvRow) {
  return Object.keys(row).filter((header) => DATE_HEADER_REGEX.test(header));
}

function getDayOfMonth(stepDate: string) {
  const day = Number.parseInt(stepDate.slice(-2), 10);
  if (!Number.isFinite(day) || day < 1 || day > 31) {
    throw new Error(`Invalid step date header: ${stepDate}`);
  }
  return day;
}

function calculateDailyScore(teamSteps: number, dayOfMonth: number) {
  const requiredSteps = dayOfMonth * 1000;
  const doubleMilestoneSteps = requiredSteps * 2;
  const metRequirement = teamSteps >= requiredSteps;
  const hitDoubleMilestone = teamSteps >= doubleMilestoneSteps;
  const basePoints = metRequirement ? dayOfMonth * 100 : 0;
  const bonusPoints = hitDoubleMilestone ? dayOfMonth * 75 : 0;

  return {
    requiredSteps,
    doubleMilestoneSteps,
    metRequirement,
    hitDoubleMilestone,
    basePoints,
    bonusPoints,
    totalPoints: basePoints + bonusPoints,
  };
}

export async function importPlayerStepsCsv(input: UploadPlayerStepsCsvInput) {
  const configuredPassword = process.env.CSV_UPLOAD_PASSWORD;

  if (!configuredPassword) {
    throw new Error("CSV upload password is not configured");
  }

  if (input.uploadPassword !== configuredPassword) {
    throw new Error("Invalid upload password");
  }

  const rows = parseCsvRows(input.csvText);
  const dateHeaders = getDateHeaders(rows[0]);

  if (dateHeaders.length === 0) {
    throw new Error("CSV is missing daily date columns");
  }

  const startDate = dateHeaders[0];
  const endDate = dateHeaders[dateHeaders.length - 1];
  const sourceLabel =
    input.sourceFileName?.replace(/\.csv$/i, "") || "CSV Upload";

  return db.transaction(async (tx) => {
    const allPlayers = await tx
      .select({
        id: players.id,
        displayName: players.displayName,
        teamId: players.teamId,
      })
      .from(players);

    const playerByNormalizedName = new Map<
      string,
      (typeof allPlayers)[number]
    >();

    for (const player of allPlayers) {
      const key = normalizeName(player.displayName);
      if (!playerByNormalizedName.has(key)) {
        playerByNormalizedName.set(key, player);
      }
    }

    const teamRows = await tx
      .select({ id: teams.id, name: teams.name })
      .from(teams);
    const teamNameById = new Map(teamRows.map((team) => [team.id, team.name]));

    const reportByTeamId = new Map<number, number>();
    const teamDailyTotals = new Map<number, Map<string, number>>();

    const unmatchedNames: string[] = [];
    const matchedRows: Array<{
      row: CsvRow;
      matchedPlayer: (typeof allPlayers)[number];
    }> = [];

    for (const row of rows) {
      const displayName = row[HEADER_MAP.name]?.trim();
      if (!displayName) {
        continue;
      }

      const matchedPlayer = playerByNormalizedName.get(
        normalizeName(displayName),
      );

      if (!matchedPlayer) {
        unmatchedNames.push(displayName);
        continue;
      }

      matchedRows.push({ row, matchedPlayer });
    }

    if (matchedRows.length === 0) {
      throw new Error(
        "No players were matched. Ensure CSV Name values match existing player names in the database.",
      );
    }

    const matchedPlayerIds = [
      ...new Set(matchedRows.map(({ matchedPlayer }) => matchedPlayer.id)),
    ];
    const matchedTeamIds = [
      ...new Set(matchedRows.map(({ matchedPlayer }) => matchedPlayer.teamId)),
    ];

    await tx
      .delete(playerDailySteps)
      .where(
        and(
          inArray(playerDailySteps.playerId, matchedPlayerIds),
          inArray(playerDailySteps.stepDate, dateHeaders),
        ),
      );

    await tx
      .delete(teamDailyScores)
      .where(
        and(
          inArray(teamDailyScores.teamId, matchedTeamIds),
          inArray(teamDailyScores.stepDate, dateHeaders),
        ),
      );

    let importedPlayers = 0;
    let dailyRecords = 0;

    for (const { row, matchedPlayer } of matchedRows) {
      let reportId = reportByTeamId.get(matchedPlayer.teamId);

      if (!reportId) {
        const teamName = teamNameById.get(matchedPlayer.teamId) ?? "Team";
        const createdReport = await tx
          .insert(stepReports)
          .values({
            teamId: matchedPlayer.teamId,
            label: `${sourceLabel} ${teamName} ${startDate} to ${endDate}`,
            startDate,
            endDate,
          })
          .returning({ id: stepReports.id });

        reportId = createdReport[0]?.id;

        if (!reportId) {
          throw new Error("Unable to create report record");
        }

        reportByTeamId.set(matchedPlayer.teamId, reportId);
      }

      const playerId = matchedPlayer.id;

      await tx.insert(playerStepSummaries).values({
        reportId,
        playerId,
        rank: parseInteger(row[HEADER_MAP.rank], 0),
        totalSteps: parseInteger(row[HEADER_MAP.totalSteps], 0),
        avgDailySteps: parseInteger(row[HEADER_MAP.avgDailySteps], 0),
        dailyStepGoal: parseInteger(row[HEADER_MAP.dailyStepGoal], 0),
        totalDistanceMi: parseFloatValue(row[HEADER_MAP.totalDistanceMi], 0),
        totalDistanceKm: parseFloatValue(row[HEADER_MAP.totalDistanceKm], 0),
        avgDailyDistanceMi: parseFloatValue(
          row[HEADER_MAP.avgDailyDistanceMi],
          0,
        ),
        avgDailyDistanceKm: parseFloatValue(
          row[HEADER_MAP.avgDailyDistanceKm],
          0,
        ),
      });

      const dailyRows = dateHeaders.map((stepDate) => ({
        reportId,
        playerId,
        stepDate,
        steps: parseStepValue(row[stepDate]),
      }));

      if (dailyRows.length > 0) {
        await tx.insert(playerDailySteps).values(dailyRows);

        let totalsByDate = teamDailyTotals.get(matchedPlayer.teamId);
        if (!totalsByDate) {
          totalsByDate = new Map<string, number>();
          teamDailyTotals.set(matchedPlayer.teamId, totalsByDate);
        }

        for (const dailyRow of dailyRows) {
          const steps = dailyRow.steps ?? 0;
          const current = totalsByDate.get(dailyRow.stepDate) ?? 0;
          totalsByDate.set(dailyRow.stepDate, current + steps);
        }
      }

      importedPlayers += 1;
      dailyRecords += dailyRows.length;
    }

    for (const [teamId, reportId] of reportByTeamId.entries()) {
      const totalsByDate =
        teamDailyTotals.get(teamId) ?? new Map<string, number>();

      let summaryTotalPoints = 0;
      let summaryDaysMetRequirement = 0;
      let summaryDaysHitDoubleMilestone = 0;

      for (const stepDate of dateHeaders) {
        const teamSteps = totalsByDate.get(stepDate) ?? 0;
        const dayOfMonth = getDayOfMonth(stepDate);
        const score = calculateDailyScore(teamSteps, dayOfMonth);

        await tx.insert(teamDailyScores).values({
          reportId,
          teamId,
          stepDate,
          dayOfMonth,
          requiredSteps: score.requiredSteps,
          doubleMilestoneSteps: score.doubleMilestoneSteps,
          teamSteps,
          metRequirement: score.metRequirement,
          hitDoubleMilestone: score.hitDoubleMilestone,
          basePoints: score.basePoints,
          bonusPoints: score.bonusPoints,
          totalPoints: score.totalPoints,
        });

        summaryTotalPoints += score.totalPoints;
        summaryDaysMetRequirement += score.metRequirement ? 1 : 0;
        summaryDaysHitDoubleMilestone += score.hitDoubleMilestone ? 1 : 0;
      }

      await tx.insert(teamScoreSummaries).values({
        reportId,
        teamId,
        totalPoints: summaryTotalPoints,
        daysMetRequirement: summaryDaysMetRequirement,
        daysHitDoubleMilestone: summaryDaysHitDoubleMilestone,
      });
    }

    return {
      createdReports: reportByTeamId.size,
      importedPlayers,
      dailyRecords,
      unmatchedNames,
      dateHeaders,
    };
  });
}
