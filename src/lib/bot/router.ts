import { isAdmin } from "@/lib/bot/middleware/auth";
import { checkRateLimit } from "@/lib/bot/middleware/rateLimit";
import { getSession, setSession, clearSession } from "@/lib/bot/session";
import { api } from "@/lib/bot/services/telegram";
import { logger } from "@/lib/bot/utils/logger";

import { cmdStart } from "@/lib/bot/handlers/start";
import { cmdHelp } from "@/lib/bot/handlers/help";
import {
  cmdPending, cmdOrdersToday, cmdOrderDetail, cmdMarkPaid,
  cmdSetStatus, cmdCancelOrder, handleConfirmOrder, handleRejectOrder,
  processCancelReason, processRejectReason,
} from "@/lib/bot/handlers/orders";
import {
  cmdCatalog, cmdAddProductStart, cmdEditProduct,
  cmdDeleteProduct, cmdStockLow, doDeleteProduct,
  processAddProductStep, getAddProductPrompt,
} from "@/lib/bot/handlers/catalog";
import {
  cmdNewPost, cmdPostsList, cmdPublishPost, cmdEditPost,
  processNewPostStep, getNewPostPrompt,
} from "@/lib/bot/handlers/blog";
import { cmdPostToChannel, cmdAutoPublishOn, cmdAutoPublishOff } from "@/lib/bot/handlers/channel";
import { cmdStats } from "@/lib/bot/handlers/stats";
import { cmdFeedback, processFeedbackText } from "@/lib/bot/handlers/feedback";
import { cmdBroadcast, processBroadcastText } from "@/lib/bot/handlers/broadcast";
import { handleReceiptPhoto, handleConfirmReceipt } from "@/lib/bot/handlers/photo";

interface TelegramUpdate {
  update_id?: number;
  message?: {
    chat: { id: number; type?: string };
    text?: string;
    message_id: number;
    from?: { id: number; username?: string; is_bot?: boolean };
    photo?: { file_id: string }[];
    caption?: string;
  };
  callback_query?: {
    id: string;
    data?: string;
    message?: { chat: { id: number }; message_id: number };
    from: { id: number };
  };
  my_chat_member?: Record<string, unknown>;
}

function getUpdateType(update: TelegramUpdate): string {
  if (update.message?.text) return "text";
  if (update.message?.photo) return "photo";
  if (update.callback_query) return "callback";
  if (update.my_chat_member) return "chat_member";
  return "unknown";
}

export function handleUpdate(update: TelegramUpdate): void {
  logger.info({ updateType: getUpdateType(update) }, "Update");

  if (update.message?.text) {
    handleMessage(update.message);
  } else if (update.message?.photo) {
    handlePhoto(update.message);
  } else if (update.callback_query) {
    handleCallback(update.callback_query);
  }
}

async function handleMessage(msg: NonNullable<TelegramUpdate["message"]>) {
  const chatId = String(msg.chat.id);
  const text = String(msg.text || "").trim();
  const username = msg.from?.username;

  if (!isAdmin(chatId)) {
    logger.warn({ chatId, username }, "Non-admin message");
    return;
  }

  if (!checkRateLimit(chatId)) {
    await api.sendMessage(chatId, "⏳ Слишком много запросов. Подождите минуту.");
    return;
  }

  logger.info({ chatId, text }, "Command");

  const session = getSession(chatId);
  if (session && text === "/cancel") {
    clearSession(chatId);
    await api.sendMessage(chatId, "❌ Действие отменено.");
    return;
  }

  if (session) {
    await handleSessionStep(chatId, text, session);
    return;
  }

  const cmd = text.split(" ")[0].toLowerCase();
  const args = text.slice(cmd.length).trim();

  switch (cmd) {
    case "/start": await cmdStart(chatId); break;
    case "/help": await cmdHelp(chatId); break;
    case "/pending": await cmdPending(chatId); break;
    case "/orders_today": case "/orders": await cmdOrdersToday(chatId); break;
    case "/order": await cmdOrderDetail(chatId, args); break;
    case "/mark_paid": await cmdMarkPaid(chatId, args); break;
    case "/status": await cmdSetStatus(chatId, args); break;
    case "/cancel_order": await cmdCancelOrder(chatId, args); break;
    case "/catalog": await cmdCatalog(chatId); break;
    case "/addproduct": await cmdAddProductStart(chatId); break;
    case "/edit_product": await cmdEditProduct(chatId, args); break;
    case "/delete_product": await cmdDeleteProduct(chatId, args); break;
    case "/stock_low": await cmdStockLow(chatId); break;
    case "/new_post": await cmdNewPost(chatId); break;
    case "/posts_list": await cmdPostsList(chatId); break;
    case "/publish_post": await cmdPublishPost(chatId, args); break;
    case "/edit_post": await cmdEditPost(chatId, args); break;
    case "/post_to_tg": await cmdPostToChannel(chatId, args); break;
    case "/auto_publish_on": await cmdAutoPublishOn(chatId); break;
    case "/auto_publish_off": await cmdAutoPublishOff(chatId); break;
    case "/stats": await cmdStats(chatId); break;
    case "/feedback": await cmdFeedback(chatId); break;
    case "/broadcast": await cmdBroadcast(chatId); break;
    default:
      await api.sendMessage(chatId, "❓ Неизвестная команда. /help");
  }
}

async function handleCallback(cb: NonNullable<TelegramUpdate["callback_query"]>) {
  const chatId = String(cb.message?.chat.id || "");
  const msgId = cb.message?.message_id || 0;
  const data = String(cb.data || "");
  const cbId = cb.id;

  if (!isAdmin(chatId)) {
    await api.answerCallbackQuery(cbId, "⛔ Доступ запрещён");
    return;
  }

  logger.info({ chatId, data }, "Callback");

  const [action, ...args] = data.split(":");

  switch (action) {
    case "confirm":
      await handleConfirmOrder(chatId, args[0]);
      await api.answerCallbackQuery(cbId, "✅ Подтверждён");
      break;
    case "reject":
      await handleRejectOrder(chatId, args[0]);
      await api.answerCallbackQuery(cbId, "✏️ Введите причину");
      break;
    case "catalog":
      await cmdCatalog(chatId, parseInt(args[0] || "1"));
      await api.answerCallbackQuery(cbId);
      break;
    case "del_yes":
      await doDeleteProduct(chatId, parseInt(args[0]), msgId);
      await api.answerCallbackQuery(cbId, "🗑 Удалён");
      break;
    case "del_no":
      await api.editMessageText(chatId, msgId, "❌ Удаление отменено.");
      await api.answerCallbackQuery(cbId);
      break;
    case "confirm_post": {
      const s = getSession(chatId);
      if (s && s.step === "newpost_confirm") {
        await processNewPostStep(chatId, "да", s.step, s.data);
      }
      await api.answerCallbackQuery(cbId, "✅ Сохранён");
      break;
    }
    case "cancel_post": {
      clearSession(chatId);
      await api.editMessageText(chatId, msgId, "❌ Пост отменён.");
      await api.answerCallbackQuery(cbId);
      break;
    }
    case "confirm_receipt":
      await handleConfirmReceipt(chatId, args[0]);
      await api.answerCallbackQuery(cbId, "✅ Оплата подтверждена");
      break;
    default:
      await api.answerCallbackQuery(cbId);
  }
}

async function handlePhoto(msg: NonNullable<TelegramUpdate["message"]>) {
  const chatId = String(msg.chat.id);
  const photos = msg.photo || [];
  const caption = msg.caption || "";

  if (isAdmin(chatId)) return;

  logger.info({ chatId }, "Photo from non-admin");
  await handleReceiptPhoto(chatId, photos, caption);
  await api.sendMessage(chatId, "✅ Фото чека отправлено администратору.");
}

async function handleSessionStep(chatId: string, text: string, session: { step: string; data: Record<string, unknown> }) {
  const { step, data } = session;

  if (step === "cancel_reason") {
    await processCancelReason(chatId, text, data);
    return;
  }
  if (step === "reject_reason") {
    await processRejectReason(chatId, text, data);
    return;
  }
  if (step.startsWith("addproduct_")) {
    const next = await processAddProductStep(chatId, text, step, data);
    if (next === null) return;
    if (next !== step) {
      setSession(chatId, { step: next, data });
      await api.sendMessage(chatId, getAddProductPrompt(next));
    }
    return;
  }
  if (step.startsWith("newpost_")) {
    const next = await processNewPostStep(chatId, text, step, data);
    if (next === null) return;
    if (next !== step) {
      setSession(chatId, { step: next, data });
      if (next !== "newpost_confirm") {
        await api.sendMessage(chatId, getNewPostPrompt(next));
      }
    }
    return;
  }
  if (step === "feedback_text") {
    await processFeedbackText(chatId, text);
    return;
  }
  if (step === "broadcast_text") {
    await processBroadcastText(chatId, text, data);
    return;
  }

  clearSession(chatId);
}
