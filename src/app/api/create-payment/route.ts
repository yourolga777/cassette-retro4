import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { initPayment } from "@/lib/tinkoff";
import { generateOrderId } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { sendOrderConfirmation } from "@/lib/email";
import { notifyAdmin, formatOrderNotification } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerName, customerPhone, customerEmail, shippingAddress, comment } = body;

    if (!items?.length || !customerName || !customerPhone || !customerEmail || !shippingAddress) {
      return NextResponse.json(
        { error: "Zapolnite vse polya" },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const orderId = generateOrderId();

    await db.insert(orders).values({
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      comment: comment || null,
      totalAmount,
      status: "pending",
      paymentMethod: "card",
      items: JSON.parse(JSON.stringify(items)),
    });

    const paymentResult = await initPayment({
      amount: totalAmount,
      orderId,
      customerKey: customerEmail,
      email: customerEmail,
      phone: customerPhone,
      items: items.map((item: { name: string; price: number; quantity: number }) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    if (!paymentResult.Success || !paymentResult.PaymentURL) {
      await db
        .update(orders)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(orders.orderId, orderId));

      return NextResponse.json(
        { error: paymentResult.Message || "Oshibka platezhnoi sistemy" },
        { status: 502 }
      );
    }

    await db
      .update(orders)
      .set({
        paymentUrl: paymentResult.PaymentURL,
        tinkoffPaymentId: paymentResult.PaymentId,
        updatedAt: new Date(),
      })
      .where(eq(orders.orderId, orderId));

    const orderData = {
      orderId,
      customerName,
      customerEmail,
      totalAmount,
      paymentMethod: "card" as const,
      status: "pending",
      comment: comment || null,
      items: items.map((i: { name: string; quantity: number; price: number }) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    sendOrderConfirmation(orderData);
    notifyAdmin(
      formatOrderNotification({
        orderId,
        customerName,
        customerPhone,
        customerEmail,
        totalAmount,
        paymentMethod: "card",
        status: "pending",
        comment: comment || undefined,
        items: items.map((i: { name: string; quantity: number }) => ({
          name: i.name,
          quantity: i.quantity,
        })),
      })
    );

    return NextResponse.json({ paymentUrl: paymentResult.PaymentURL, orderId });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { error: "Vnutrennyaya oshibka servera" },
      { status: 500 }
    );
  }
}
