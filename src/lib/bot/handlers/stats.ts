import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { gte, sql, and, eq } from "drizzle-orm";
import { api } from "../services/telegram";

export async function cmdStats(chatId: string): Promise<void> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0);
  const weekAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [todayCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(gte(orders.createdAt, todayStart));

  const [weekRevenue] = await db
    .select({ total: sql<number>`coalesce(sum(total_amount), 0)::int` })
    .from(orders)
    .where(and(gte(orders.createdAt, weekAgo), eq(orders.status, "paid")));

  const [weekCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(gte(orders.createdAt, weekAgo));

  const allItems = await db
    .select({ items: orders.items })
    .from(orders)
    .where(gte(orders.createdAt, weekAgo));

  const productCount = new Map<string, number>();
  for (const row of allItems) {
    const items = (row.items as { name: string; quantity: number }[] | null) || [];
    for (const item of items) {
      productCount.set(item.name, (productCount.get(item.name) || 0) + item.quantity);
    }
  }

  const top3 = [...productCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const top3Lines = top3.map(([name, count], i) => `  ${i + 1}. ${name} — ${count} шт.`);

  await api.sendMessage(chatId, [
    `<b>📊 Статистика</b>`,
    ``,
    `<b>За сегодня:</b>`,
    `  Заказов: ${todayCount.count}`,
    ``,
    `<b>За неделю:</b>`,
    `  Заказов: ${weekCount.count}`,
    `  Выручка: ${fmtPrice(weekRevenue.total)}`,
    ``,
    `<b>Топ-3 товара:</b>`,
    ...(top3Lines.length ? top3Lines : ["  (нет данных)"]),
  ].join("\n"));
}

function fmtPrice(k: number): string {
  return (k / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}
