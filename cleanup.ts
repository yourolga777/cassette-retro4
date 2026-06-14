import { db } from "./src/lib/db";
import { orders, users } from "./src/lib/schema";
import { lt, isNull, and, eq, sql } from "drizzle-orm";

async function main() {
  console.log("Running data cleanup...");

  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // 1. Delete orders older than 3 years
  const deletedOrders = await db
    .delete(orders)
    .where(lt(orders.createdAt, threeYearsAgo))
    .returning({ id: orders.id });
  console.log(`Deleted ${deletedOrders.length} orders older than 3 years`);

  // 2. Anonymize orders without user_id older than 1 year
  const anonymized = await db
    .update(orders)
    .set({
      customerName: sql`CONCAT('Клиент #', ${orders.id})`,
      customerPhone: sql`CONCAT('+7 (***) ***-**-', RIGHT(${orders.customerPhone}, 2))`,
      customerEmail: sql`CONCAT('client', ${orders.id}, '@anonymized')`,
      shippingAddress: "Адрес скрыт",
      comment: null,
      updatedAt: new Date(),
    })
    .where(and(isNull(orders.userId), lt(orders.createdAt, oneYearAgo)))
    .returning({ id: orders.id });
  console.log(`Anonymized ${anonymized.length} guest orders older than 1 year`);

  // 3. Anonymize registered users who haven't ordered in 3 years
  const usersWithoutOrders = await db
    .select({ id: users.id })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .where(
      and(
        isNull(orders.userId),
        lt(users.createdAt, threeYearsAgo)
      )
    );

  if (usersWithoutOrders.length > 0) {
    await db
      .update(users)
      .set({
        name: null,
        phone: null,
        address: null,
        emailSubscribed: false,
        telegramSubscribed: false,
      })
      .where(
        sql`${users.id} IN (${usersWithoutOrders.map(u => u.id).join(",")})`
      );
    console.log(`Anonymized ${usersWithoutOrders.length} inactive user accounts`);
  }

  console.log("Cleanup complete!");
}

main().catch((err) => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
