import { NextResponse } from "next/server";
import { api } from "@/lib/bot/services/telegram";
import { config } from "@/lib/bot/config";

export async function GET() {
  const adminId = config.bot.adminIds[0];
  if (!adminId) {
    return NextResponse.json({ error: "No admin IDs configured" }, { status: 400 });
  }

  try {
    await api.sendMessage(
      adminId,
      "🧪 <b>Тестовое сообщение</b>\n\nЕсли вы это читаете — бот работает, sendMessage проходит успешно."
    );
    return NextResponse.json({ ok: true, sentTo: adminId });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
