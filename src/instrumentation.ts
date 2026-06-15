import { startDailyReport } from "@/lib/bot/scheduler";
import { startPolling } from "@/lib/bot/polling";
import { setupErrorHandling } from "@/lib/bot/utils/errorReporter";
import { logger } from "@/lib/bot/utils/logger";

export function register() {
  setupErrorHandling();
  startPolling().catch((e) => logger.error({ err: e }, "Failed to start polling"));
  startDailyReport();
}