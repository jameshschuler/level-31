import { createServerFn } from "@tanstack/react-start";
import {
  getAvailableMonths,
  getLastUpdated,
  getTeamLeaderboard,
  getPlayerLeaderboard,
} from "./get-team-leaderboard.server";

export const getAvailableMonthsFn = createServerFn({ method: "GET" }).handler(
  () => getAvailableMonths(),
);

export const getLastUpdatedFn = createServerFn({ method: "GET" }).handler(() =>
  getLastUpdated(),
);

export const getTeamLeaderboardFn = createServerFn({ method: "GET" })
  .inputValidator((month: string | undefined) => month)
  .handler(({ data }) => getTeamLeaderboard(data));

export const getPlayerLeaderboardFn = createServerFn({ method: "GET" })
  .inputValidator((month: string | undefined) => month)
  .handler(({ data }) => getPlayerLeaderboard(data));
