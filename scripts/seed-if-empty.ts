import "dotenv/config";
import { db } from "../src/lib/db";
import { products } from "../src/lib/schema";
import { sql } from "drizzle-orm";

async function main() {
  const result = await db.select({ count: sql<number>`count(*)::int` }).from(products);
  const count = result[0]?.count ?? 0;

  if (count === 0) {
    console.log("Database empty — seeding...");
    await import("../seed");
  } else {
    console.log(`Database has ${count} products — skipping seed`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
