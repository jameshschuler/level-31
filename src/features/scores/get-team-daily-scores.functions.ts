import { createServerFn } from "@tanstack/react-start";

export const getTeamDailyScores = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getTeamDailyScores } =
      await import("#/features/scores/get-team-daily-scores.server");

    return getTeamDailyScores();
  },
);
