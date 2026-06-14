import { config } from "../config";
import { api } from "../services/telegram";
import { logger } from "../utils/logger";

export async function handleReceiptPhoto(
  chatId: string,
  photos: { file_id: string }[],
  caption?: string
): Promise<void> {
  if (config.bot.adminIds.includes(chatId)) return;

  const bestPhoto = photos[photos.length - 1];
  const token = config.bot.token;

  for (const adminId of config.bot.adminIds) {
    const msg = [
      `🧾 <b>Фото чека от клиента</b>`,
      caption ? `\nКомментарий: ${caption}` : "",
      `\nЧат: ${chatId}`,
    ].join("\n");

    try {
      await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminId,
          photo: bestPhoto.file_id,
          caption: msg,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [[
              { text: "✅ Подтвердить оплату", callback_data: `confirm_receipt:${chatId}` },
            ]],
          },
        }),
      });
    } catch (e) {
      logger.error({ err: e, adminId }, "Error forwarding receipt");
    }
  }
}

export async function handleConfirmReceipt(adminChatId: string, customerChatId: string): Promise<void> {
  await api.sendMessage(customerChatId, "✅ <b>Ваш платёж подтверждён!</b>\n\nСпасибо! Заказ передан в обработку.");
  await api.sendMessage(adminChatId, `✅ Уведомление отправлено клиенту (${customerChatId}).`);
}
