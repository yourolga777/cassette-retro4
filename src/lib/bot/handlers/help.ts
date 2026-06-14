import { api } from "../services/telegram";

const COMMANDS = [
  "",
  "<b>📋 Команды бота</b>",
  "",
  "📦 <b>ЗАКАЗЫ</b>",
  "/pending — Неподтверждённые заказы",
  "/orders_today — Заказы за сегодня",
  "/order N — Детали заказа",
  "/mark_paid N — Отметить оплаченным",
  "/status N СТАТУС — Изменить статус",
  "/cancel_order N — Отменить с причиной",
  "",
  "📀 <b>КАТАЛОГ</b>",
  "/catalog — Список товаров",
  "/addproduct — Новый товар (диалог)",
  "/edit_product N — Изменить цену/количество",
  "/delete_product N — Удалить товар",
  "/stock_low — Товары с остатком < 3",
  "",
  "📝 <b>БЛОГ</b>",
  "/new_post — Новый пост (диалог)",
  "/posts_list — Последние 5 постов",
  "/publish_post N — Опубликовать черновик",
  "/edit_post N — Изменить заголовок",
  "",
  "📢 <b>КАНАЛ</b>",
  "/post_to_tg N — Пост в канал",
  "/auto_publish_on — Автопубликация вкл",
  "/auto_publish_off — Автопубликация выкл",
  "",
  "📊 <b>ДРУГОЕ</b>",
  "/stats — Статистика",
  "/feedback — Предложения по боту",
  "/broadcast — Рассылка подписчикам",
  "/cancel — Отменить диалог",
];

export async function cmdHelp(chatId: string): Promise<void> {
  await api.sendMessage(chatId, COMMANDS.join("\n"));
}
