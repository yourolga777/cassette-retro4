import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { generateOrderId } from "@/lib/utils";
import { notifyAdmin, formatOrderNotification } from "@/lib/telegram";
import { sendOrderConfirmation } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, customerName, customerPhone, customerEmail, shippingAddress, comment } = body;

    if (!items?.length || !customerName || !customerPhone || !customerEmail || !shippingAddress) {
      return NextResponse.json(
        { error: "Заполните все поля" },
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
      paymentMethod: "cash",
      items: JSON.parse(JSON.stringify(items)),
    });

    notifyAdmin(
      formatOrderNotification({
        orderId,
        customerName,
        customerPhone,
        customerEmail,
        totalAmount,
        paymentMethod: "cash",
        status: "pending",
        comment: comment || undefined,
        items: items.map((i: { name: string; quantity: number }) => ({
          name: i.name,
          quantity: i.quantity,
        })),
      })
    );

    sendOrderConfirmation({
      orderId,
      customerName,
      customerEmail,
      totalAmount,
      paymentMethod: "cash",
      status: "pending",
      comment: comment || null,
      items: items.map((i: { name: string; quantity: number; price: number }) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error("Create cash order error:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
