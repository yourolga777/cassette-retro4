import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyUserSession } from "@/lib/auth-user";

export async function PATCH(request: NextRequest) {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { emailSubscribed, telegramSubscribed } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof emailSubscribed === "boolean") updateData.emailSubscribed = emailSubscribed;
    if (typeof telegramSubscribed === "boolean") updateData.telegramSubscribed = telegramSubscribed;
    updateData.updatedAt = new Date();

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        emailSubscribed: users.emailSubscribed,
        telegramSubscribed: users.telegramSubscribed,
      });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update subscriptions error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
