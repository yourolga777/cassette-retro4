import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, dailyStats } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyWebhook, checkPaymentStatus } from "@/lib/tinkoff";
import { notifyAdmin, formatOrderNotification } from "@/lib/telegram";
import { sendPaymentReceipt } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { OrderId, Status, PaymentId } = data;

    if (!verifyWebhook(data)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, OrderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (Status === "CONFIRMED" || Status === "AUTHORIZED") {
      let receiptUrl: string | null = null;
      try {
        const state = await checkPaymentStatus(PaymentId || order.tinkoffPaymentId || "");
        receiptUrl = state.ReceiptUrl || null;
      } catch {
        // receipt URL is optional
      }

      await db
        .update(orders)
        .set({
          status: "paid",
          tinkoffPaymentId: PaymentId,
          receiptUrl,
          updatedAt: new Date(),
        })
        .where(eq(orders.orderId, OrderId));

      const today = new Date().toISOString().split("T")[0];
      const [existing] = await db
        .select()
        .from(dailyStats)
        .where(eq(dailyStats.date, today))
        .limit(1);

      if (existing) {
        await db
          .update(dailyStats)
          .set({ soldCount: (existing.soldCount || 0) + 1 })
          .where(eq(dailyStats.date, today));
      } else {
        await db.insert(dailyStats).values({ date: today, soldCount: 1 });
      }

      notifyAdmin(
        formatOrderNotification({
          orderId: order.orderId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          totalAmount: order.totalAmount,
          paymentMethod: "card",
          status: "paid",
          items: (order.items as { name: string; quantity: number }[]) || [],
        })
      );

      sendPaymentReceipt({
        orderId: order.orderId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        receiptUrl,
        items: (order.items as { name: string; quantity: number; price: number }[]) || [],
      });
    } else if (Status === "REJECTED" || Status === "CANCELED") {
      await db
        .update(orders)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(orders.orderId, OrderId));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
