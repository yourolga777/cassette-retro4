import { config } from "../config";

export function isAdmin(chatId: string): boolean {
  return config.bot.adminIds.includes(chatId);
}
