export interface BotSession {
  step: string;
  data: Record<string, unknown>;
}

const sessions = new Map<string, BotSession>();

export function getSession(chatId: string): BotSession | undefined {
  return sessions.get(chatId);
}

export function setSession(chatId: string, session: BotSession): void {
  sessions.set(chatId, session);
}

export function clearSession(chatId: string): void {
  sessions.delete(chatId);
}

setInterval(() => {
  sessions.clear();
}, 30 * 60 * 1000);
