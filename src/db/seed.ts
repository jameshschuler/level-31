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
  {
    username: "jamesschuler",
    displayName: "James Schuler",
    teamSlug: "birds",
  },
  { username: "lucyschuler", displayName: "Lucy Schuler", teamSlug: "birds" },
  { username: "samrueby", displayName: "Sam Rueby", teamSlug: "birds" },
  { username: "laurasnyder", displayName: "Laura Snyder", teamSlug: "cats" },
  {
    username: "girlsamruebot",
    displayName: "GirlSam RueBot",
    teamSlug: "cats",
  },
  {
    username: "jessicaschuler",
    displayName: "Jessica Schuler",
    teamSlug: "cats",
  },
  {
    username: "brendanstevenson",
    displayName: "Brendan Stevenson",
    teamSlug: "rabbits",
  },
  {
    username: "kevinstevensonbirds",
    displayName: "Kevin Stevenson",
    teamSlug: "birds",
  },
  {
    username: "kevinstevensoncats",
    displayName: "Kevin Stevenson",
    teamSlug: "cats",
  },
  {
    username: "kevinstevensonrabbits",
    displayName: "Kevin Stevenson",
    teamSlug: "rabbits",
  },
  {
    username: "kevinstevensondogs",
    displayName: "Kevin Stevenson",
    teamSlug: "dogs",
  },
  {
    username: "kevinstevensonpandas",
    displayName: "Kevin Stevenson",
    teamSlug: "pandas",
  },
  {
    username: "timothyschuler",
    displayName: "Timothy Schuler",
    teamSlug: "rabbits",
  },
  { username: "lauras", displayName: "Laura S", teamSlug: "rabbits" },
  { username: "robsnyder", displayName: "Rob Snyder", teamSlug: "dogs" },
  { username: "bobbyhoward", displayName: "Bobby Howard", teamSlug: "dogs" },
  {
    username: "patrickmaney",
    displayName: "Patrick Maney",
    teamSlug: "dogs",
  },
  { username: "sandyly", displayName: "Sandy Ly", teamSlug: "pandas" },
  { username: "abbyschuler", displayName: "Abby Schuler", teamSlug: "pandas" },
  { username: "bryanw", displayName: "Bryan W", teamSlug: "pandas" },
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
