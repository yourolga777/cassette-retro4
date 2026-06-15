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
  const token = config.bot.token;
  const adminId = config.bot.adminIds[0] || "1100115774";

  const results = await Promise.all([
    tryFetch("Google", "https://google.com"),
    tryFetch("getMe (GET)", `https://api.telegram.org/bot${token}/getMe`),
    tryFetch("getWebhookInfo (GET)", `https://api.telegram.org/bot${token}/getWebhookInfo`),
    tryFetch("getWebhookInfo (POST)", `https://api.telegram.org/bot${token}/getWebhookInfo`, { method: "POST" }),
    tryFetch("sendMessage to admin",
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: parseInt(adminId),
          text: "🧪 Тест sendMessage — если видите это, всё работает!",
          parse_mode: "HTML",
        }),
      }
    ),
  ]);

  return NextResponse.json({
    env: {
      hasToken: !!token,
      tokenPrefix: token ? token.slice(0, 20) + "..." : "MISSING",
      adminIds: config.bot.adminIds,
    },
    tests: results,
  });
}
