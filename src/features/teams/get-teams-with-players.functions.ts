import { createServerFn } from "@tanstack/react-start";

export const getTeamsWithPlayers = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getTeamsWithPlayers } =
      await import("#/features/teams/get-teams-with-players.server");

    return getTeamsWithPlayers();
  },
);
