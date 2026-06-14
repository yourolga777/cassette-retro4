import { config } from "../config";
import { api } from "../services/telegram";
import { setSession, clearSession } from "../session";

export async function cmdFeedback(chatId: string): Promise<void> {
  setSession(chatId, { step: "feedback_text", data: {} });
  await api.sendMessage(chatId, "📝 Напишите ваше предложение или замечание по работе бота:");
}

export async function processFeedbackText(chatId: string, text: string): Promise<void> {
  clearSession(chatId);
  const msg = `💬 <b>Новое предложение по боту</b>\n\nОт: ${chatId}\n\n${text}`;
  for (const adminId of config.bot.adminIds) {
    await api.sendMessage(adminId, msg);
  }
  await api.sendMessage(chatId, "✅ Спасибо! Предложение отправлено разработчику.");
}
