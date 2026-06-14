import { db } from "@/lib/db";
import { posts, botConfig } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { api } from "../services/telegram";

export async function cmdPostToChannel(chatId: string, args: string): Promise<void> {
  const id = parseInt(args);
  if (!id) { await api.sendMessage(chatId, "❓ /post_to_tg N"); return; }
  const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post.length) { await api.sendMessage(chatId, `❌ Пост ID ${id} не найден.`); return; }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const postUrl = `${siteUrl}/blog/${post[0].slug}`;
  const text = [
    `📝 <b>${post[0].title}</b>`,
    ``,
    (post[0].content || "").slice(0, 200),
    ``,
    `🔗 <a href="${postUrl}">Читать полностью на сайте</a>`,
  ].join("\n");

  const ok = await api.sendChannel(text, [[{ text: "📀 Перейти к товарам", url: `${siteUrl}/shop` }]]);
  if (ok) {
    await api.sendMessage(chatId, `✅ Пост #${id} опубликован в канале.`);
  } else {
    await api.sendMessage(chatId, `❌ Ошибка публикации. Проверьте TELEGRAM_CHANNEL_ID.`);
  }
}

export async function cmdAutoPublishOn(chatId: string): Promise<void> {
  await db.insert(botConfig).values({ key: "auto_publish", value: "true" })
    .onConflictDoUpdate({ target: botConfig.key, set: { value: "true" } });
  await api.sendMessage(chatId, "✅ Автопубликация <b>включена</b>.");
}

export async function cmdAutoPublishOff(chatId: string): Promise<void> {
  await db.insert(botConfig).values({ key: "auto_publish", value: "false" })
    .onConflictDoUpdate({ target: botConfig.key, set: { value: "false" } });
  await api.sendMessage(chatId, "✅ Автопубликация <b>отключена</b>.");
}

export async function isAutoPublishEnabled(): Promise<boolean> {
  const row = await db.select().from(botConfig).where(eq(botConfig.key, "auto_publish")).limit(1);
  return row.length > 0 && row[0].value === "true";
}
