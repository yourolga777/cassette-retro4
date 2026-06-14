import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyUserSession } from "@/lib/auth-user";

export async function POST(request: NextRequest) {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Укажите номер заказа" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    if (order.userId) {
      return NextResponse.json({ error: "Заказ уже привязан к другому пользователю" }, { status: 400 });
    }

    if (order.customerEmail !== user.email) {
      return NextResponse.json({ error: "Email заказа не совпадает с вашим email" }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set({ userId })
      .where(eq(orders.id, order.id))
      .returning();

    return NextResponse.json({ message: "Заказ привязан", order: updated });
  } catch (error) {
    console.error("Link order error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
