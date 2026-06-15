import { NextRequest, NextResponse } from "next/server";
import { handleUpdate } from "@/lib/bot/router";
import { logger } from "@/lib/bot/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "Webhook error");
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
