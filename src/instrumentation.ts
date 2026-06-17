import { startDailyReport } from "@/lib/bot/scheduler";
import { startPolling } from "@/lib/bot/polling";
import { logger } from "@/lib/bot/utils/logger";

export function register() {
  if (typeof process !== "undefined" && typeof process.on === "function") {
    import("@/lib/bot/utils/errorReporter")
      .then(({ reportError }) => {
        process.on("uncaughtException", async (error) => {
          logger.error({ err: error }, "Uncaught exception");
          await reportError(error, "uncaughtException");
        });
        process.on("unhandledRejection", async (reason) => {
          const error = reason instanceof Error ? reason : new Error(String(reason));
          logger.error({ err: error }, "Unhandled rejection");
          await reportError(error, "unhandledRejection");
        });
      })
      .catch((e) => logger.error({ err: e }, "Failed to setup error handling"));
  }

  startPolling().catch((e) => logger.error({ err: e }, "Failed to start polling"));
  startDailyReport();
}
