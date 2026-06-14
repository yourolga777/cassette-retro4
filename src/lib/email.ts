export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  console.log("EMAIL STUB:", { subject, htmlLength: html.length });
  return true;
}

export function formatOrderHtml(order: {
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  comment?: string | null;
  items: { name: string; quantity: number; price: number }[];
}): string {
  const itemsRows = order.items
    .map((i) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>${(i.price * i.quantity / 100).toLocaleString("ru-RU")} ₽</td></tr>`)
    .join("");
  const total = (order.totalAmount / 100).toLocaleString("ru-RU") + " ₽";
  const commentBlock = order.comment ? `<p><strong>Комментарий:</strong> ${order.comment}</p>` : "";
  return `
    <h2>Заказ #${order.orderId}</h2>
    <p>Статус: ${order.status === "paid" ? "Оплачен" : "Принят"}</p>
    <p>Способ оплаты: ${order.paymentMethod === "card" ? "Карта онлайн" : "Наличные при получении"}</p>
    ${commentBlock}
    <table border="1" cellpadding="8"><tr><th>Товар</th><th>Кол-во</th><th>Сумма</th></tr>${itemsRows}</table>
    <p><strong>Итого: ${total}</strong></p>
  `.trim();
}

export async function sendOrderConfirmation(order: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  comment?: string | null;
  items: { name: string; quantity: number; price: number }[];
}): Promise<boolean> {
  const html = formatOrderHtml(order);
  return sendEmail(
    order.customerEmail,
    `Заказ #${order.orderId} принят`,
    html
  );
}

export async function sendPaymentReceipt(order: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  receiptUrl?: string | null;
  items: { name: string; quantity: number; price: number }[];
}): Promise<boolean> {
  const total = (order.totalAmount / 100).toLocaleString("ru-RU") + " ₽";
  const receiptLink = order.receiptUrl
    ? `<p><a href="${order.receiptUrl}">Чек онлайн</a></p>`
    : "";
  const html = `
    <h2>Оплата заказа #${order.orderId} подтверждена</h2>
    <p>Сумма: ${total}</p>
    ${receiptLink}
    <p>Спасибо за покупку!</p>
  `.trim();
  return sendEmail(order.customerEmail, `Заказ #${order.orderId} оплачен`, html);
}
