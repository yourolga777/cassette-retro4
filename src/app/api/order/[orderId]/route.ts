import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { maskEmail, maskPhone } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.orderId,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      receiptUrl: order.receiptUrl,
      customerName: order.customerName,
      customerEmail: maskEmail(order.customerEmail),
      customerPhone: maskPhone(order.customerPhone),
      shippingAddress: order.shippingAddress,
      comment: order.comment,
      items: order.items,
      createdAt: order.createdAt,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
