import { api } from "@/lib/bot/services/telegram";
import { handleUpdate } from "@/lib/bot/router";
import { logger } from "@/lib/bot/utils/logger";

let offset = 0;
let running = false;
let intervalId: ReturnType<typeof setInterval> | null = null;

export async function startPolling(): Promise<void> {
  if (running) return;
  running = true;

  try {
    await api.deleteWebhook();
    logger.info("Webhook deleted, switching to polling");
  } catch (e) {
    logger.warn({ err: e }, "Failed to delete webhook (non-critical)");
  }

  const poll = async () => {
    try {
      const updates = await api.getUpdates(offset, 50, 30);
      for (const raw of updates) {
        const updateId = raw.update_id as number;
        if (updateId !== undefined) {
          offset = updateId + 1;
        }
        try {
          await handleUpdate(raw);
        } catch (e) {
          logger.error({ err: e, updateId }, "Update processing error");
        }
      }
    } catch (e) {
      logger.error({ err: e }, "Polling error");
    }
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
