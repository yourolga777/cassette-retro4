import { startDailyReport } from "@/lib/bot/scheduler";
import { startPolling } from "@/lib/bot/polling";
import { setupErrorHandling } from "@/lib/bot/utils/errorReporter";
import { logger } from "@/lib/bot/utils/logger";

export async function register() {
  setupErrorHandling();
  try {
    await startPolling();
  } catch (e) {
    logger.error({ err: e }, "Failed to start polling");
  }
  try {
    await startDailyReport();
  } catch (e) {
    logger.error({ err: e }, "Failed to start daily report");
  }
}
