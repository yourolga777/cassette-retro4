import { db } from "@/lib/db";
import { botSessions } from "@/lib/schema";
import { eq, lt, sql } from "drizzle-orm";

export interface BotSession {
  step: string;
  data: Record<string, unknown>;
}

const cache = new Map<string, BotSession>();

export async function getSession(chatId: string): Promise<BotSession | undefined> {
  if (cache.has(chatId)) return cache.get(chatId);
  const row = await db.select().from(botSessions).where(eq(botSessions.chatId, chatId)).limit(1);
  if (row.length) {
    const session: BotSession = { step: row[0].step || "", data: (row[0].data as Record<string, unknown>) || {} };
    cache.set(chatId, session);
    return session;
  }
  return undefined;
}

export async function setSession(chatId: string, session: BotSession): Promise<void> {
  cache.set(chatId, session);
  await db.insert(botSessions).values({
    chatId,
    step: session.step,
    data: session.data,
  }).onConflictDoUpdate({
    target: botSessions.chatId,
    set: { step: session.step, data: session.data, updatedAt: sql`now()` },
  });
}

export async function clearSession(chatId: string): Promise<void> {
  cache.delete(chatId);
  await db.delete(botSessions).where(eq(botSessions.chatId, chatId));
}

export function getSessionCount(): number {
  return cache.size;
}

setInterval(async () => {
  cache.clear();
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);
  await db.delete(botSessions).where(lt(botSessions.updatedAt, cutoff));
}, 30 * 60 * 1000);