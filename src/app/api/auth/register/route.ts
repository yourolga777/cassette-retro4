import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createUserSession, setUserSessionCookie } from "@/lib/auth-user";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email и пароль обязательны" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, name: name || null })
      .returning();

    await db
      .update(orders)
      .set({ userId: user.id })
      .where(eq(orders.customerEmail, email));

    const token = await createUserSession(user.id);
    const cookie = setUserSessionCookie(token);

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201, headers: { "Set-Cookie": cookie } }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
