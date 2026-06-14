import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyUserSession, clearUserSessionCookie } from "@/lib/auth-user";

export async function GET() {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      address: users.address,
      emailSubscribed: users.emailSubscribed,
      telegramSubscribed: users.telegramSubscribed,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: NextRequest) {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, address } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    updateData.updatedAt = new Date();

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        address: users.address,
      });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE() {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.delete(users).where(eq(users.id, userId));

    const cookie = clearUserSessionCookie();
    return NextResponse.json(
      { success: true },
      { headers: { "Set-Cookie": cookie } }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
