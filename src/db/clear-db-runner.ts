import "dotenv/config";
import { clearDb } from "./clear-db";

clearDb().catch((error) => {
  console.error(error);
  process.exit(1);
});
