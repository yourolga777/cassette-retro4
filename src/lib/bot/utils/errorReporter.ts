import { config } from "../config";
import { logger } from "./logger";
import { api } from "../services/telegram";

export function setupErrorHandling(): void {
  process.on("uncaughtException", async (error) => {
    logger.error({ err: error }, "Uncaught exception");
    await reportError(error, "uncaughtException");
  });

  process.on("unhandledRejection", async (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error({ err: error }, "Unhandled rejection");
    await reportError(error, "unhandledRejection");
  });
}

async function reportError(error: Error, context: string): Promise<void> {
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
