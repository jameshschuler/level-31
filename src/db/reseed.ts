import "dotenv/config";
import { clearDb } from "./clear-db";
import { seedDb } from "./seed";

async function reseedDb() {
  await clearDb();
  await seedDb();
  console.log("Database reseeded.");
}

reseedDb().catch((error) => {
  console.error(error);
  process.exit(1);
});
