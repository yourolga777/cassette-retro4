function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  return { token, channelId, adminChatId };
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  const { token } = getConfig();
  if (!token) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendTelegramHtml(
  chatId: string,
  text: string,
  buttons?: { text: string; callback_data: string }[][]
): Promise<boolean> {
  const { token } = getConfig();
  if (!token) return false;
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    };
    if (buttons) {
      body.reply_markup = { inline_keyboard: buttons };
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendTelegramChannel(text: string): Promise<boolean> {
  const { channelId } = getConfig();
  if (!channelId) return false;
  return sendTelegramMessage(channelId, text);
}

export async function notifyAdmin(text: string): Promise<boolean> {
  const { adminChatId } = getConfig();
  if (!adminChatId) return false;
  return sendTelegramMessage(adminChatId, text);
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
  const itemsList = order.items.map((i) => `  • ${i.name} × ${i.quantity}`).join("\n");
  const rubles = (order.totalAmount / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
  return [
    `🆕 <b>Новый заказ</b> #${order.orderId}`,
    ``,
    `👤 ${order.customerName}`,
    `📞 ${order.customerPhone}`,
    `📧 ${order.customerEmail}`,
    ``,
    `📦 <b>Состав:</b>`,
    itemsList,
    order.comment ? `` : "",
    order.comment ? `💬 <b>Комментарий:</b> ${order.comment}` : "",
    ``,
    `💰 <b>Сумма:</b> ${rubles}`,
    `💳 <b>Оплата:</b> ${order.paymentMethod === "card" ? "Картой онлайн" : "Наличными при получении"}`,
    `📋 <b>Статус:</b> ${order.status === "paid" ? "Оплачен" : "Ожидает подтверждения"}`,
  ].join("\n");
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<boolean> {
  const { token } = getConfig();
  if (!token) return false;
  try {
    const body: Record<string, unknown> = {
      callback_query_id: callbackQueryId,
    };
    if (text) body.text = text;
    const res = await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function editMessageText(
  chatId: string,
  messageId: number,
  text: string,
  buttons?: { text: string; callback_data: string }[][]
): Promise<boolean> {
  const { token } = getConfig();
  if (!token) return false;
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
    };
    if (buttons) {
      body.reply_markup = { inline_keyboard: buttons };
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
