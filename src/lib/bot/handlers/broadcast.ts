import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { api } from "../services/telegram";
import { setSession, clearSession } from "../session";

export async function cmdBroadcast(chatId: string): Promise<void> {
  const subs = await db
    .select({ telegramId: users.telegramId })
    .from(users)
    .where(eq(users.telegramSubscribed, true));

  if (!subs.length) {
    await api.sendMessage(chatId, "📭 Нет подписанных клиентов.");
    return;
  }

  setSession(chatId, { step: "broadcast_text", data: { count: subs.length } });
  await api.sendMessage(chatId, `📢 Подписчиков: ${subs.length}\n\nВведите текст рассылки (или /cancel):`);
}

export async function processBroadcastText(chatId: string, text: string, data: Record<string, unknown>): Promise<void> {
  clearSession(chatId);
  const subs = await db
    .select({ telegramId: users.telegramId })
    .from(users)
    .where(eq(users.telegramSubscribed, true));

  await api.sendMessage(chatId, `📢 Начинаю рассылку ${subs.length} подписчикам...`);

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    if (!sub.telegramId) continue;
    try {
      const ok = await api.sendMessage(sub.telegramId, text);
      if (ok) sent++; else failed++;
    } catch { failed++; }
    await sleep(35);
  }

  await api.sendMessage(chatId, `✅ Рассылка завершена.\nОтправлено: ${sent}\nОшибок: ${failed}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
