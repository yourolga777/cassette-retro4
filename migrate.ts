import "dotenv/config";
import { db } from "./src/lib/db";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running migrations...");
  await migrate(db, {
    migrationsFolder: "./src/drizzle",
  });

  console.log("Enabling pg_trgm extension...");
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    console.log("pg_trgm extension ready");
  } catch {
    console.log("pg_trgm not available, ILIKE fallback will be used");
  }

  console.log("Migrations complete!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
