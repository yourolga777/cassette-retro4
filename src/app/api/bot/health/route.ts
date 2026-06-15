import { NextResponse } from "next/server";
import { getPollingStatus } from "@/lib/bot/polling";
import { getSessionCount } from "@/lib/bot/session";

const startedAt = Date.now();

export async function GET() {
  const polling = getPollingStatus();
  return NextResponse.json({
    status: "ok",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    polling,
    sessions: getSessionCount(),
  });
}
