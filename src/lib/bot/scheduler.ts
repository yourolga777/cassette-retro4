import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { config } from "./config";
import { api } from "./services/telegram";
import { logger } from "./utils/logger";
import { gte, sql } from "drizzle-orm";

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startDailyReport(): void {
  if (intervalId) return;

  const check = async () => {
    const now = new Date();
    if (now.getHours() !== 10 || now.getMinutes() !== 0) return;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 3, 0, 0);
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

    try {
      const [count] = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(orders)
        .where(gte(orders.createdAt, yesterdayStart));

      const [revenue] = await db
        .select({ total: sql<number>`coalesce(sum(total_amount), 0)::int` })
        .from(orders)
        .where(gte(orders.createdAt, yesterdayStart));

      const msg = [
        `📊 <b>Ежедневный отчёт</b>`,
        ``,
        `Заказов за сутки: ${count.c}`,
        `Выручка: ${fmtPrice(revenue.total)}`,
      ].join("\n");

      for (const adminId of config.bot.adminIds) {
        await api.sendMessage(adminId, msg);
      }
    } catch (e) {
      logger.error({ err: e }, "Daily report error");
    }
  };

  intervalId = setInterval(check, 60000);
  logger.info("Daily report scheduler started");
}

export function stopDailyReport(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info("Daily report scheduler stopped");
  }
}

function fmtPrice(k: number): string {
  return (k / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}
