import "dotenv/config";
import { seedDb } from "./seed";

seedDb().catch((error) => {
  console.error(error);
  process.exit(1);
});
