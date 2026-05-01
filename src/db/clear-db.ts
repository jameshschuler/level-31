import "dotenv/config";
import { db } from "./client";
import {
  playerDailySteps,
  players,
  playerStepSummaries,
  stepReports,
  teamDailyScores,
  teamScoreSummaries,
  teams,
} from "./schema";

export async function clearDb() {
  await db.transaction(async (tx) => {
    await tx.delete(teamScoreSummaries);
    await tx.delete(teamDailyScores);
    await tx.delete(playerDailySteps);
    await tx.delete(playerStepSummaries);
    await tx.delete(stepReports);
    await tx.delete(players);
    await tx.delete(teams);
  });

  console.log("Database cleared.");
}

export async function clearDbExceptTeamsAndPlayers() {
  await db.transaction(async (tx) => {
    await tx.delete(teamScoreSummaries);
    await tx.delete(teamDailyScores);
    await tx.delete(playerDailySteps);
    await tx.delete(playerStepSummaries);
    await tx.delete(stepReports);
  });

  console.log("Cleared report and score data. Teams and players were kept.");
}
