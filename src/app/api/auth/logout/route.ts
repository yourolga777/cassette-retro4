import { NextResponse } from "next/server";
import { clearUserSessionCookie } from "@/lib/auth-user";

export async function POST() {
  const cookie = clearUserSessionCookie();
  return NextResponse.json(
    { success: true },
    { headers: { "Set-Cookie": cookie } }
  );
}
