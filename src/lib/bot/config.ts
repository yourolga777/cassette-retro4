export const config = {
  bot: {
    token: process.env.TELEGRAM_BOT_TOKEN || "",
    adminIds: (process.env.TELEGRAM_ADMIN_IDS || "").split(",").map((s) => s.trim()).filter(Boolean),
    channelId: process.env.TELEGRAM_CHANNEL_ID || "",
    errorChannelId: process.env.TELEGRAM_ERROR_CHANNEL_ID || "",
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
  rateLimit: {
    max: 10,
    windowMs: 60000,
  },
};

export function validateConfig(): string[] {
  const errors: string[] = [];
  if (!config.bot.token) errors.push("TELEGRAM_BOT_TOKEN is required");
  if (!config.bot.adminIds.length) errors.push("TELEGRAM_ADMIN_IDS is required (at least one ID)");
  if (!config.bot.channelId) errors.push("TELEGRAM_CHANNEL_ID is required");
  return errors;
}
