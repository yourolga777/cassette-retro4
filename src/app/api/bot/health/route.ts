import { NextResponse } from "next/server";
import { getPollingStatus, startPolling } from "@/lib/bot/polling";
import { getSessionCount } from "@/lib/bot/session";
import { startDailyReport } from "@/lib/bot/scheduler";
import { setupErrorHandling } from "@/lib/bot/utils/errorReporter";

const startedAt = Date.now();
let initialized = false;
let initError: string | null = null;

export async function GET() {
  if (!initialized) {
    initialized = true;
    try {
      setupErrorHandling();
      await startPolling();
      startDailyReport();
    } catch (e) {
      initError = e instanceof Error ? e.message : String(e);
    }
  }

  const polling = getPollingStatus();
  return NextResponse.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    initError,
    polling,
    sessions: getSessionCount(),
  });
}