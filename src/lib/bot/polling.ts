import { db } from "@/lib/db";
import { botConfig } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { api } from "@/lib/bot/services/telegram";
import { handleUpdate } from "@/lib/bot/router";
import { logger } from "@/lib/bot/utils/logger";

let offset = 0;
let running = false;
let intervalId: ReturnType<typeof setInterval> | null = null;
let lastUpdateTime = Date.now();

export async function startPolling(): Promise<void> {
  if (running) return;
  running = true;

  try {
    await api.deleteWebhook();
    logger.info("Webhook deleted, switching to polling");
  } catch (e) {
    logger.warn({ err: e }, "Failed to delete webhook (non-critical)");
  }

  const saved = await db.select().from(botConfig).where(eq(botConfig.key, "last_update_id")).limit(1);
  if (saved.length) {
    offset = parseInt(saved[0].value, 10);
    logger.info({ offset }, "Resumed polling from saved offset");
  }

  const poll = async () => {
    try {
      const updates = await api.getUpdates(offset, 50, 30);
      for (const raw of updates) {
        const updateId = raw.update_id as number;
        if (updateId !== undefined) {
          offset = updateId + 1;
          lastUpdateTime = Date.now();
        }
        try {
          await handleUpdate(raw);
        } catch (e) {
          logger.error({ err: e, updateId }, "Update processing error");
        }
      }
      if (updates.length > 0) {
        await db.insert(botConfig).values({ key: "last_update_id", value: String(offset) })
          .onConflictDoUpdate({ target: botConfig.key, set: { value: String(offset) } });
      }
    } catch (e) {
      logger.error({ err: e }, "Polling error");
    }
    checkKeepalive();
  };

  poll();
  intervalId = setInterval(poll, 3000);
  logger.info("Polling started (interval: 3s)");
}

export function stopPolling(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  running = false;
  logger.info("Polling stopped");
}

export function getPollingStatus(): { running: boolean; offset: number; lastUpdateSecondsAgo: number } {
  return {
    running,
    offset,
    lastUpdateSecondsAgo: Math.floor((Date.now() - lastUpdateTime) / 1000),
  };
}

function checkKeepalive(): void {
  const idle = Date.now() - lastUpdateTime;
  if (idle > 5 * 60 * 1000) {
    logger.warn({ idleSeconds: idle / 1000 }, "Polling idle too long, restarting");
    stopPolling();
    startPolling();
  }
}
