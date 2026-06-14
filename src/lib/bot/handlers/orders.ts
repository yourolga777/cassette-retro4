import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq, gte, desc, and, sql } from "drizzle-orm";
import { api } from "../services/telegram";
import { getSession, setSession, clearSession } from "../session";

export async function cmdPending(chatId: string): Promise<void> {
  const pending = await db
    .select()
    .from(orders)
    .where(eq(orders.status, "pending"))
    .orderBy(desc(orders.createdAt));

  if (!pending.length) {
    await api.sendMessage(chatId, "✅ Нет неподтверждённых заказов.");
    return;
  }
  for (const order of pending) {
    await sendOrderCard(chatId, order);
  }
}

export async function cmdOrdersToday(chatId: string): Promise<void> {
  const today = new Date();
  today.setHours(3, 0, 0, 0);
  const list = await db
    .select()
    .from(orders)
    .where(gte(orders.createdAt, today))
    .orderBy(desc(orders.createdAt));

  if (!list.length) {
    await api.sendMessage(chatId, "📭 За сегодня заказов нет.");
    return;
  }
  await api.sendMessage(chatId, `📦 <b>Заказов за сегодня:</b> ${list.length}`);
  for (const order of list.slice(0, 10)) {
    await sendOrderCard(chatId, order);
  }
}

export async function cmdOrderDetail(chatId: string, ref: string): Promise<void> {
  const order = await findOrder(ref);
  if (!order) {
    await api.sendMessage(chatId, `❌ Заказ #${ref} не найден.`);
    return;
  }
  await sendOrderDetail(chatId, order);
}

export async function cmdMarkPaid(chatId: string, ref: string): Promise<void> {
  const order = await findOrder(ref);
  if (!order) {
    await api.sendMessage(chatId, `❌ Заказ #${ref} не найден.`);
    return;
  }
  await db.update(orders).set({ status: "paid", updatedAt: sql`now()` }).where(eq(orders.orderId, order.orderId));
  await api.sendMessage(chatId, `✅ Заказ #${order.orderId} отмечен как оплаченный.`);
}

export async function cmdSetStatus(chatId: string, args: string): Promise<void> {
  const parts = args.split(" ");
  const ref = parts[0];
  const newStatus = parts.slice(1).join(" ").toLowerCase();
  const valid = ["processing", "shipped", "delivered", "paid", "cancelled", "refunded"];
  if (!valid.includes(newStatus)) {
    await api.sendMessage(chatId, `❌ Допустимые статусы: ${valid.join(", ")}`);
    return;
  }
  const order = await findOrder(ref);
  if (!order) {
    await api.sendMessage(chatId, `❌ Заказ #${ref} не найден.`);
    return;
  }
  await db.update(orders).set({ status: newStatus as typeof order.status, updatedAt: sql`now()` }).where(eq(orders.orderId, order.orderId));
  await api.sendMessage(chatId, `✅ Заказ #${order.orderId} → <b>${statusLabel(newStatus)}</b>`);
}

export async function cmdCancelOrder(chatId: string, ref: string): Promise<void> {
  const order = await findOrder(ref);
  if (!order) {
    await api.sendMessage(chatId, `❌ Заказ #${ref} не найден.`);
    return;
  }
  setSession(chatId, { step: "cancel_reason", data: { orderId: order.orderId } });
  await api.sendMessage(chatId, `✏️ Напишите причину отмены заказа #${order.orderId}:`);
}

export async function handleConfirmOrder(chatId: string, ref: string): Promise<void> {
  const order = await findOrder(ref);
  if (!order) {
    await api.sendMessage(chatId, `❌ Заказ #${ref} не найден.`);
    return;
  }
  await db.update(orders).set({ status: "paid", updatedAt: sql`now()` }).where(eq(orders.orderId, order.orderId));
  await api.sendMessage(chatId, `✅ <b>Заказ #${order.orderId} подтверждён!</b>

Сумма: ${fmtPrice(order.totalAmount)}
Оплата: ${order.paymentMethod === "cash" ? "💵 Наличные" : "💳 Карта"}`);
}

export async function handleRejectOrder(chatId: string, ref: string): Promise<void> {
  setSession(chatId, { step: "reject_reason", data: { orderId: ref } });
  await api.sendMessage(chatId, `✏️ Напишите причину отклонения заказа #${ref}:`);
}

export async function processCancelReason(chatId: string, reason: string, data: Record<string, unknown>): Promise<void> {
  const orderId = data.orderId as string;
  await db.update(orders).set({ status: "cancelled", updatedAt: sql`now()` }).where(eq(orders.orderId, orderId));
  clearSession(chatId);
  await api.sendMessage(chatId, `✅ Заказ #${orderId} отменён.\nПричина: ${reason}`);
}

export async function processRejectReason(chatId: string, reason: string, data: Record<string, unknown>): Promise<void> {
  const orderId = data.orderId as string;
  await db.update(orders).set({ status: "cancelled", updatedAt: sql`now()` }).where(eq(orders.orderId, orderId));
  clearSession(chatId);
  await api.sendMessage(chatId, `✅ Заказ #${orderId} отклонён.\nПричина: ${reason}`);
}

async function sendOrderCard(chatId: string, order: typeof orders.$inferSelect) {
  const items = (order.items as { name: string; quantity: number }[] | null) || [];
  const itemsList = items.map((i) => `  • ${i.name} × ${i.quantity}`).join("\n");
  const cashTag = order.paymentMethod === "cash" ? " 💵 <b>НАЛИЧНЫЕ</b>" : "";

  const buttons: { text: string; callback_data: string }[][] = [];
  if (order.status === "pending") {
    buttons.push([
      { text: "✅ Подтвердить", callback_data: `confirm:${order.orderId}` },
      { text: "❌ Отклонить", callback_data: `reject:${order.orderId}` },
    ]);
  }

  await api.sendMessage(chatId, [
    `<b>Заказ #${order.orderId}</b>${cashTag}`,
    `👤 ${order.customerName}`,
    `📞 ${order.customerPhone}`,
    `📧 ${order.customerEmail}`,
    ``,
    `<b>Состав:</b>`,
    itemsList,
    ``,
    `💰 ${fmtPrice(order.totalAmount)}`,
    `📋 Статус: ${statusLabel(order.status)}`,
  ].join("\n"), buttons);
}

async function sendOrderDetail(chatId: string, order: typeof orders.$inferSelect) {
  const items = (order.items as { name: string; price: number; quantity: number }[] | null) || [];
  const itemsList = items.map((i) => `  • ${i.name} × ${i.quantity} = ${fmtPrice(i.price * i.quantity)}`).join("\n");
  const cashTag = order.paymentMethod === "cash" ? " 💵 <b>НАЛИЧНЫЕ</b>" : "";

  await api.sendMessage(chatId, [
    `<b>📋 Детали заказа #${order.orderId}</b>${cashTag}`,
    ``,
    `👤 ${order.customerName}`,
    `📞 ${order.customerPhone}`,
    `📧 ${order.customerEmail}`,
    `📍 ${order.shippingAddress}`,
    order.comment ? `💬 ${order.comment}` : "",
    ``,
    `<b>Состав:</b>`,
    itemsList,
    ``,
    `💰 <b>Итого:</b> ${fmtPrice(order.totalAmount)}`,
    `💳 ${order.paymentMethod === "cash" ? "Наличными" : "Картой онлайн"}`,
    `📋 ${statusLabel(order.status)}`,
    order.receiptUrl ? `🧾 <a href="${order.receiptUrl}">Чек</a>` : "",
    `🕐 ${order.createdAt?.toLocaleString("ru-RU") || ""}`,
  ].filter(Boolean).join("\n"));
}

async function findOrder(ref: string) {
  const byOrderId = await db.select().from(orders).where(eq(orders.orderId, ref)).limit(1);
  if (byOrderId.length) return byOrderId[0];
  const num = parseInt(ref);
  if (num) {
    const byId = await db.select().from(orders).where(eq(orders.id, num)).limit(1);
    if (byId.length) return byId[0];
  }
}

function statusLabel(s: string): string {
  return ({
    pending: "⏳ Ожидает",
    paid: "✅ Оплачен",
    processing: "🔄 В обработке",
    shipped: "📦 Отправлен",
    delivered: "✅ Доставлен",
    cancelled: "❌ Отменён",
    refunded: "↩️ Возврат",
    failed: "❌ Ошибка",
  } as Record<string, string>)[s] || s;
}

function fmtPrice(k: number): string {
  return (k / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}
