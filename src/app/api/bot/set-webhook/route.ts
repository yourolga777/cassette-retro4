import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/bot/services/telegram";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminPassword) {
      const token = authHeader.replace("Bearer ", "").trim();
      if (token !== adminPassword) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return NextResponse.json({ error: "NEXT_PUBLIC_SITE_URL not set" }, { status: 400 });
    }

    const webhookUrl = `${siteUrl.replace(/\/+$/, "")}/api/bot/webhook`;

    const ok = await api.setWebhook(webhookUrl);
    const info = await api.getWebhookInfo();

    return NextResponse.json({
      ok,
      webhookUrl,
      info,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
