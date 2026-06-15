import { api } from "@/lib/bot/services/telegram";

const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

export async function notifyAdmin(text: string): Promise<boolean> {
  if (!adminChatId) return false;
  return api.sendMessage(adminChatId, text);
}

export function formatOrderNotification(order: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  comment?: string;
  items: { name: string; quantity: number }[];
}): string {
  const itemsList = order.items.map((i) => "  • " + i.name + " × " + i.quantity).join("\n");
  const rubles = (order.totalAmount / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
  return [
    "🆕 <b>Новый заказ</b> #" + order.orderId,
    "",
    "👤 " + order.customerName,
    "📞 " + order.customerPhone,
    "📧 " + order.customerEmail,
    "",
    "📦 <b>Состав:</b>",
    itemsList,
    order.comment ? "" : "",
    order.comment ? "💬 <b>Комментарий:</b> " + order.comment : "",
    "",
    "💰 <b>Сумма:</b> " + rubles,
    "💳 <b>Оплата:</b> " + (order.paymentMethod === "card" ? "Картой онлайн" : "Наличными при получении"),
    "📋 <b>Статус:</b> " + (order.status === "paid" ? "Оплачен" : "Ожидает подтверждения"),
  ].join("\n");
}
