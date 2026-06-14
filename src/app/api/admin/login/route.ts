import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (
      login === process.env.ADMIN_LOGIN &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = await createSession();
      const cookie = setSessionCookie(token);
      return NextResponse.json(
        { success: true },
        { headers: { "Set-Cookie": cookie } }
      );
    }

    return NextResponse.json(
      { error: "Неверный логин или пароль" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
