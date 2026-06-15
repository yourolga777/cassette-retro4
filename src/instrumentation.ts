import { startDailyReport } from "@/lib/bot/scheduler";
import { startPolling } from "@/lib/bot/polling";
import { setupErrorHandling } from "@/lib/bot/utils/errorReporter";

export function register() {
  setupErrorHandling();
  startPolling();
  startDailyReport();
}