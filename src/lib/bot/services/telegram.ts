import { config } from "../config";

const BASE = `https://api.telegram.org/bot${config.bot.token}`;

async function call(
  method: string,
  body?: Record<string, unknown>
): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  const res = await fetch(`${BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram API ${method}: ${res.status} ${text}`);
  }
  return res.json() as Promise<{ ok: boolean; result?: unknown; description?: string }>;
}

type InlineButton = { text: string; callback_data?: string; url?: string };

export const api = {
  async sendMessage(
    chatId: string,
    text: string,
    inlineButtons?: InlineButton[][]
  ): Promise<boolean> {
    const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" };
    if (inlineButtons) body.reply_markup = { inline_keyboard: inlineButtons };
    const data = await call("sendMessage", body);
    return data.ok;
  },

  async editMessageText(
    chatId: string,
    messageId: number,
    text: string,
    inlineButtons?: InlineButton[][]
  ): Promise<boolean> {
    const body: Record<string, unknown> = { chat_id: chatId, message_id: messageId, text, parse_mode: "HTML" };
    if (inlineButtons) body.reply_markup = { inline_keyboard: inlineButtons };
    const data = await call("editMessageText", body);
    return data.ok;
  },

  async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<boolean> {
    const body: Record<string, unknown> = { callback_query_id: callbackQueryId };
    if (text) body.text = text;
    const data = await call("answerCallbackQuery", body);
    return data.ok;
  },

  async sendChannel(text: string, inlineButtons?: InlineButton[][]): Promise<boolean> {
    if (!config.bot.channelId) return false;
    return this.sendMessage(config.bot.channelId, text, inlineButtons);
  },

  async setWebhook(url: string): Promise<boolean> {
    const data = await call("setWebhook", { url });
    return data.ok;
  },

  async deleteWebhook(): Promise<boolean> {
    const data = await call("deleteWebhook");
    return data.ok;
  },

  async getMe(): Promise<{ id: number; username: string } | null> {
    const data = await call("getMe");
    if (data.ok && data.result) {
      return data.result as { id: number; username: string };
    }
    return null;
  },

  async getWebhookInfo(): Promise<Record<string, unknown> | null> {
    const data = await call("getWebhookInfo");
    if (data.ok && data.result) {
      return data.result as Record<string, unknown>;
    }
    return null;
  },

  async getUpdates(
    offset: number,
    limit = 100,
    timeout = 30
  ): Promise<Array<Record<string, unknown>>> {
    const data = await call("getUpdates", { offset, limit, timeout });
    if (data.ok && Array.isArray(data.result)) {
      return data.result as Array<Record<string, unknown>>;
    }
    return [];
  },
};
