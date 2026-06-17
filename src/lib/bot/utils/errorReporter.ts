import { config } from "../config";
import { api } from "../services/telegram";

export async function reportError(error: Error, context: string): Promise<void> {
  if (!config.bot.errorChannelId) return;
  const text = [
    `🚨 <b>Ошибка бота</b>`,
    ``,
    `<b>${error.name}</b>: ${error.message}`,
    context ? `\nКонтекст: ${context}` : "",
    error.stack ? `\n<pre>${error.stack.slice(0, 1000)}</pre>` : "",
  ].join("\n");
  await api.sendMessage(config.bot.errorChannelId, text);
}
