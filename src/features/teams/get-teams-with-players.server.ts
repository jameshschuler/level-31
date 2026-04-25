import { asc } from "drizzle-orm";
import { db } from "#/db/client";
import { players, teams } from "#/db/schema";

export type TeamWithPlayers = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  players: Array<{
    id: number;
    displayName: string;
  }>;
};

export async function getTeamsWithPlayers() {
  const teamRows = await db
    .select({
      id: teams.id,
      name: teams.name,
      slug: teams.slug,
      icon: teams.icon,
    })
    .from(teams)
    .orderBy(asc(teams.name));

  const playerRows = await db
    .select({
      id: players.id,
      displayName: players.displayName,
      teamId: players.teamId,
    })
    .from(players)
    .orderBy(asc(players.displayName));

  const playersByTeamId = new Map<number, TeamWithPlayers["players"]>();

  for (const player of playerRows) {
    const existing = playersByTeamId.get(player.teamId) ?? [];
    existing.push({
      id: player.id,
      displayName: player.displayName,
    });
    playersByTeamId.set(player.teamId, existing);
  }

  return teamRows.map((team) => ({
    id: team.id,
    name: team.name,
    slug: team.slug,
    icon: team.icon,
    players: playersByTeamId.get(team.id) ?? [],
  }));
}
