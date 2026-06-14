import { db } from "@/lib/db";
import { posts, botConfig } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { api } from "../services/telegram";
import { getSession, setSession, clearSession } from "../session";
import { slugify } from "@/lib/utils";

export async function cmdNewPost(chatId: string): Promise<void> {
  setSession(chatId, { step: "newpost_title", data: {} });
  await api.sendMessage(chatId, "📝 Заголовок нового поста:\n\n(отправьте /cancel чтобы отменить)");
}

export async function cmdPostsList(chatId: string): Promise<void> {
  const recent = await db
    .select({ id: posts.id, title: posts.title, published: posts.published, createdAt: posts.createdAt })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(5);

  if (!recent.length) { await api.sendMessage(chatId, "📭 В блоге пока нет постов."); return; }
  const lines = recent.map((p) => `ID: ${p.id} | ${p.published ? "✅" : "📝 Черновик"} | ${p.title}`);
  await api.sendMessage(chatId, `<b>📝 Последние посты</b>\n\n${lines.join("\n")}`);
}

export async function cmdPublishPost(chatId: string, args: string): Promise<void> {
  const id = parseInt(args);
  if (!id) { await api.sendMessage(chatId, "❓ /publish_post N"); return; }
  const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post.length) { await api.sendMessage(chatId, `❌ Пост ID ${id} не найден.`); return; }
  if (post[0].published) { await api.sendMessage(chatId, `✅ Пост #${id} уже опубликован.`); return; }

  await db.update(posts).set({ published: true, updatedAt: new Date() }).where(eq(posts.id, id));
  await api.sendMessage(chatId, `✅ Пост #${id} опубликован на сайте!`);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const postUrl = `${siteUrl}/blog/${post[0].slug}`;
  const preview = [
    `📝 <b>${post[0].title}</b>`,
    ``,
    (post[0].content || "").slice(0, 200),
    ``,
    `🔗 <a href="${postUrl}">Читать полностью на сайте</a>`,
  ].join("\n");
  await api.sendChannel(preview, [[{ text: "📀 Перейти к товарам", url: `${siteUrl}/shop` }]]);
}

export async function cmdEditPost(chatId: string, args: string): Promise<void> {
  const parts = args.split(" ");
  const id = parseInt(parts[0]);
  if (!id) { await api.sendMessage(chatId, "❓ /edit_post N Новый заголовок"); return; }
  const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post.length) { await api.sendMessage(chatId, `❌ Пост ID ${id} не найден.`); return; }
  const newTitle = parts.slice(1).join(" ");
  if (newTitle.length < 2) { await api.sendMessage(chatId, "❓ /edit_post N Новый заголовок"); return; }
  await db.update(posts).set({ title: newTitle, slug: slugify(newTitle), updatedAt: new Date() }).where(eq(posts.id, id));
  await api.sendMessage(chatId, `✅ Заголовок поста #${id} изменён.`);
}

export async function processNewPostStep(
  chatId: string, text: string, step: string, data: Record<string, unknown>
): Promise<string | null> {
  switch (step) {
    case "newpost_title": data.title = text; return "newpost_content";
    case "newpost_content": data.content = text; return "newpost_tags";
    case "newpost_tags": {
      data.tags = text.split(",").map((t) => t.trim()).filter(Boolean);
      await showPreview(chatId, data);
      return "newpost_confirm";
    }
    case "newpost_confirm": {
      if (text.toLowerCase() === "да" || text === "yes") {
        await finishNewPost(chatId, data);
      } else {
        clearSession(chatId);
        await api.sendMessage(chatId, "❌ Пост отменён.");
      }
      return null;
    }
    default: return null;
  }
}

async function showPreview(chatId: string, data: Record<string, unknown>): Promise<void> {
  const preview = [
    `📝 <b>Предпросмотр</b>`,
    ``,
    `<b>Заголовок:</b> ${data.title}`,
    ``,
    `<b>Текст:</b>`,
    (data.content as string).slice(0, 500),
    ``,
    `<b>Теги:</b> ${(data.tags as string[]).join(", ")}`,
    ``,
    `Сохранить как черновик?`,
  ].join("\n");
  setSession(chatId, { step: "newpost_confirm", data });
  await api.sendMessage(chatId, preview, [
    [{ text: "✅ Да, сохранить", callback_data: "confirm_post" }],
    [{ text: "❌ Отмена", callback_data: "cancel_post" }],
  ]);
}

async function finishNewPost(chatId: string, data: Record<string, unknown>): Promise<void> {
  try {
    const title = data.title as string;
    const [post] = await db.insert(posts).values({
      title,
      slug: slugify(title) + "-" + Date.now(),
      type: "original",
      content: data.content as string,
      tags: data.tags as string[],
      published: false,
    }).returning();
    clearSession(chatId);
    await api.sendMessage(chatId, `✅ <b>Пост сохранён как черновик!</b>\n\nID: ${post.id}\n«${title}»\n\nОпубликовать: /publish_post ${post.id}`);
  } catch (e) {
    await api.sendMessage(chatId, `❌ Ошибка: ${e instanceof Error ? e.message : "неизвестная"}`);
    clearSession(chatId);
  }
}

export function getNewPostPrompt(step: string): string {
  return ({
    newpost_title: "📝 Заголовок поста:",
    newpost_content: "📝 Текст поста:",
    newpost_tags: "🏷 Теги через запятую:",
  } as Record<string, string>)[step] || "Продолжите:";
}
