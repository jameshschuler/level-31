import "dotenv/config";
import { clearDbExceptTeamsAndPlayers } from "./clear-db";
import { seedDb } from "./seed";

async function seedTeamsAndPlayersOnly() {
  await clearDbExceptTeamsAndPlayers();
  await seedDb();
  console.log("Teams and players seeded. Non-team/player data cleared.");
}

seedTeamsAndPlayersOnly().catch((error) => {
  console.error(error);
  process.exit(1);
});
