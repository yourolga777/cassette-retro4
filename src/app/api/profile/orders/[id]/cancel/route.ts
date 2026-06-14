import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyUserSession } from "@/lib/auth-user";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyUserSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, id))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Это не ваш заказ" }, { status: 403 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Можно отменить только заказы в статусе «Ожидает оплаты»" }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(orders.id, order.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
