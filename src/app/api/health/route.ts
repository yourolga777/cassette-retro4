import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {};

  checks["NODE_ENV"] = process.env.NODE_ENV || "ne ustanovlen";
  checks["DATABASE_URL"] = process.env.DATABASE_URL ? "zadan" : "ne zadan";
  checks["TINKOFF_TERMINAL_KEY"] = process.env.TINKOFF_TERMINAL_KEY ? "zadan" : "ne zadan";
  checks["TINKOFF_API_URL"] = process.env.TINKOFF_API_URL ? "zadan" : "ne zadan";

  if (process.env.TINKOFF_TERMINAL_KEY && process.env.TINKOFF_API_URL) {
    try {
      const { createHash } = await import("crypto");
      const password = process.env.TINKOFF_PASSWORD || "";
      const token = createHash("sha256")
        .update((process.env.TINKOFF_TERMINAL_KEY || "") + password)
        .digest("hex");
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      const res = await fetch(process.env.TINKOFF_API_URL + "/GetState", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ TerminalKey: process.env.TINKOFF_TERMINAL_KEY, Token: token, PaymentId: "0" }),
        signal: controller.signal,
      });
      const data = await res.json();
      checks["Tinkoff API"] = data.ErrorCode === "0" || data.ErrorCode === "101" ? "dostupen" : "oshibka: " + (data.Message || data.Details || "neizvestno");
    } catch (e) {
      checks["Tinkoff API"] = "nedostupen: " + (e instanceof Error ? e.message : String(e));
    }
  }

  const healthy = Object.values(checks).every((v) => v === "zadan" || v === "dostupen");

  return NextResponse.json({ healthy, checks });
}
