import { NextResponse } from "next/server";
import { config } from "@/lib/bot/config";

async function tryFetch(label: string, url: string, init?: RequestInit): Promise<{ label: string; ok: boolean; status?: number; error?: string }> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000), ...init });
    return { label, ok: true, status: res.status };
  } catch (e) {
    return { label, ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function GET() {
  const results = await Promise.all([
    tryFetch("Google", "https://google.com"),
    tryFetch("Telegram API (getMe)", `https://api.telegram.org/bot${config.bot.token}/getMe`),
    tryFetch("Telegram API (getWebhookInfo)", `https://api.telegram.org/bot${config.bot.token}/getWebhookInfo`),
  ]);

  return NextResponse.json({
    env: {
      hasToken: !!config.bot.token,
      tokenPrefix: config.bot.token ? config.bot.token.slice(0, 20) + "..." : "MISSING",
      adminIds: config.bot.adminIds,
      channelId: config.bot.channelId,
    },
    tests: results,
  });
}
