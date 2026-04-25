import "dotenv/config";
import { db } from "./client";
import { players, teams } from "./schema";

const seedTeams = [
  { name: "Birds", slug: "birds", icon: "Bird" },
  { name: "Cats", slug: "cats", icon: "Cat" },
  { name: "Rabbits", slug: "rabbits", icon: "Rabbit" },
  { name: "Dogs", slug: "dogs", icon: "Dog" },
  { name: "Pandas", slug: "pandas", icon: "Panda" },
] as const;

const seedPlayers = [
  { username: "lauras", displayName: "Laura S", teamSlug: "birds" },
  {
    username: "laurasnyder",
    displayName: "Laura Snyder",
    teamSlug: "dogs",
  },
  {
    username: "robsnyder",
    displayName: "Rob Snyder",
    teamSlug: "cats",
  },
  {
    username: "jamesschuler",
    displayName: "James Schuler",
    teamSlug: "pandas",
  },
  {
    username: "timothyschuler",
    displayName: "Timothy Schuler",
    teamSlug: "rabbits",
  },
  {
    username: "brendanstevenson",
    displayName: "Brendan Stevenson",
    teamSlug: "cats",
  },
  { username: "samrueby", displayName: "Sam Rueby", teamSlug: "pandas" },
  {
    username: "girlsamruebot",
    displayName: "GirlSam RueBot",
    teamSlug: "pandas",
  },
  {
    username: "jessicaschuler",
    displayName: "Jessica Schuler",
    teamSlug: "dogs",
  },
  { username: "sandyly", displayName: "Sandy Ly", teamSlug: "rabbits" },
  {
    username: "patrickmaney",
    displayName: "Patrick Maney",
    teamSlug: "birds",
  },
  { username: "bryanw", displayName: "Bryan W", teamSlug: "dogs" },
  {
    username: "bobbyhoward",
    displayName: "Bobby Howard",
    teamSlug: "rabbits",
  },
  {
    username: "abbyschuler",
    displayName: "Abby Schuler",
    teamSlug: "cats",
  },
  {
    username: "lucyschuler",
    displayName: "Lucy Schuler",
    teamSlug: "birds",
  },
] as const;

export async function seedDb() {
  for (const team of seedTeams) {
    await db
      .insert(teams)
      .values({
        name: team.name,
        slug: team.slug,
        icon: team.icon,
      })
      .onConflictDoUpdate({
        target: teams.slug,
        set: {
          name: team.name,
          icon: team.icon,
        },
      });
  }

  const teamRows = await db
    .select({ id: teams.id, slug: teams.slug })
    .from(teams);

  const teamIdBySlug = new Map(teamRows.map((team) => [team.slug, team.id]));

  for (const player of seedPlayers) {
    const teamId = teamIdBySlug.get(player.teamSlug);

    if (!teamId) {
      throw new Error(`Missing seeded team slug: ${player.teamSlug}`);
    }

    await db
      .insert(players)
      .values({
        username: player.username,
        displayName: player.displayName,
        teamId,
      })
      .onConflictDoUpdate({
        target: players.username,
        set: {
          displayName: player.displayName,
          teamId,
          updatedAt: new Date(),
        },
      });
  }

  console.log(
    `Seed complete: ${seedTeams.length} teams and ${seedPlayers.length} players upserted.`,
  );
}
