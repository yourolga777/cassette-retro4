import { config } from "../config";
import { api } from "../services/telegram";

const WELCOME = `<b>🎧 Cassette Retro — Бот администратора</b>

Добро пожаловать! Через этого бота вы управляете:
• 📦 Заказами — подтверждение, статусы, отмена
• 📀 Каталогом — добавление, редактирование товаров
• 📝 Блогом — новые посты, публикация
• 📢 Каналом — публикация в Telegram-канал
• 📊 Статистикой — отчёты и аналитика

Наберите /help для списка команд.`;

export async function cmdStart(chatId: string): Promise<void> {
  await api.sendMessage(chatId, WELCOME);
}
