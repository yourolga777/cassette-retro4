import { NextRequest, NextResponse } from "next/server";
import { getPollingStatus, startPolling } from "@/lib/bot/polling";
import { getSessionCount } from "@/lib/bot/session";
import { startDailyReport } from "@/lib/bot/scheduler";

const startedAt = Date.now();
let initialized = false;
let initDone = false;
let initError: string | null = null;

export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get("force") === "1";

  if (!initialized || force) {
    initialized = true;
    initError = null;
    try {
      await startPolling();
      startDailyReport();
      initDone = true;
    } catch (e) {
      initError = e instanceof Error ? e.message : String(e);
      initialized = false; // allow retry
    }
  }

  const polling = getPollingStatus();
  return NextResponse.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    initDone,
    initError,
    polling,
    sessions: getSessionCount(),
  });
}