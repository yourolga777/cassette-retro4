import { config } from "../config";

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

export function checkRateLimit(chatId: string): boolean {
  const now = Date.now();
  const entry = store.get(chatId);

  if (!entry || now > entry.resetAt) {
    store.set(chatId, { count: 1, resetAt: now + config.rateLimit.windowMs });
    return true;
  }

  if (entry.count >= config.rateLimit.max) {
    return false;
  }

  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60 * 1000);
