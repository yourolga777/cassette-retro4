import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq, desc, lt } from "drizzle-orm";
import { api } from "../services/telegram";
import { getSession, setSession, clearSession } from "../session";

const CATEGORIES = ["blank", "recorded", "equipment"] as const;
const PAGE_SIZE = 10;

export async function cmdCatalog(chatId: string, page = 1): Promise<void> {
  const all = await db.select().from(products).orderBy(desc(products.createdAt));
  const total = all.length;
  const offset = (page - 1) * PAGE_SIZE;
  const pageItems = all.slice(offset, offset + PAGE_SIZE);

  if (!pageItems.length) {
    await api.sendMessage(chatId, "📭 Каталог пуст.");
    return;
  }

  const lines = pageItems.map((p) => {
    const stock = p.stockCount ?? 0;
    return `ID: ${p.id} | ${p.name}${p.typeLabel ? ` (${p.typeLabel})` : ""} | ${fmtPrice(p.price)} | ${stock > 0 ? `📦 ${stock}` : "❌ Нет"}`;
  });

  const nav: { text: string; callback_data: string }[] = [];
  if (page > 1) nav.push({ text: "⬅ Назад", callback_data: `catalog:${page - 1}` });
  if (offset + PAGE_SIZE < total) nav.push({ text: "Вперёд ➡", callback_data: `catalog:${page + 1}` });

  await api.sendMessage(chatId, [
    `<b>📀 Каталог</b> (стр. ${page}/${Math.ceil(total / PAGE_SIZE)})`,
    "",
    ...lines,
  ].join("\n"), nav.length ? [nav] : undefined);
}

export async function cmdAddProductStart(chatId: string): Promise<void> {
  setSession(chatId, { step: "addproduct_name", data: {} });
  await api.sendMessage(chatId, "📀 Название товара:\n\n(отправьте /cancel чтобы отменить)");
}

export async function cmdEditProduct(chatId: string, args: string): Promise<void> {
  const parts = args.split(" ");
  const id = parseInt(parts[0]);
  if (!id) {
    await api.sendMessage(chatId, "❓ /edit_product N цена|количество значение");
    return;
  }
  const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product.length) {
    await api.sendMessage(chatId, `❌ Товар ID ${id} не найден.`);
    return;
  }
  const field = parts[1]?.toLowerCase();
  const value = parts.slice(2).join(" ");
  if (field === "цена" || field === "price") {
    const price = parseInt(value.replace(/\D/g, ""));
    if (!price) { await api.sendMessage(chatId, "❌ Некорректная цена."); return; }
    await db.update(products).set({ price: price * 100, updatedAt: new Date() }).where(eq(products.id, id));
    await api.sendMessage(chatId, `✅ Цена товара #${id}: ${fmtPrice(price * 100)}`);
  } else if (field === "количество" || field === "stock") {
    const stock = parseInt(value.replace(/\D/g, ""));
    if (stock < 0) { await api.sendMessage(chatId, "❌ Некорректное количество."); return; }
    await db.update(products).set({ stockCount: stock, updatedAt: new Date() }).where(eq(products.id, id));
    await api.sendMessage(chatId, `✅ Количество товара #${id}: ${stock} шт.`);
  } else {
    await api.sendMessage(chatId, "❓ /edit_product N цена 1500\n   /edit_product N количество 10");
  }
}

export async function cmdDeleteProduct(chatId: string, args: string): Promise<void> {
  const id = parseInt(args);
  if (!id) { await api.sendMessage(chatId, "❓ /delete_product N"); return; }
  const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product.length) { await api.sendMessage(chatId, `❌ Товар ID ${id} не найден.`); return; }
  const p = product[0];
  await api.sendMessage(chatId,
    `🗑 <b>Удалить товар?</b>\n\nID: ${p.id}\n${p.name}\n\nПодтвердите:`,
    [[
      { text: "✅ Да, удалить", callback_data: `del_yes:${id}` },
      { text: "❌ Нет", callback_data: "del_no" },
    ]]
  );
}

export async function cmdStockLow(chatId: string): Promise<void> {
  const low = await db.select().from(products).where(lt(products.stockCount, 3)).orderBy(products.stockCount);
  if (!low.length) { await api.sendMessage(chatId, "✅ Все товары в достатке."); return; }
  const lines = low.map((p) => `ID: ${p.id} | ${p.name} | Осталось: <b>${p.stockCount ?? 0}</b> шт.`);
  await api.sendMessage(chatId, `⚠️ <b>Товары с остатком < 3 шт.</b>\n\n${lines.join("\n")}`);
}

export async function doDeleteProduct(chatId: string, productId: number, messageId: number): Promise<void> {
  await db.delete(products).where(eq(products.id, productId));
  await api.editMessageText(chatId, messageId, `✅ Товар ID ${productId} удалён.`);
}

export async function processAddProductStep(chatId: string, text: string, step: string, data: Record<string, unknown>): Promise<string | null> {
  switch (step) {
    case "addproduct_name": data.name = text; return "addproduct_price";
    case "addproduct_price": {
      const price = parseInt(text.replace(/\D/g, ""));
      if (!price || price < 1) { await api.sendMessage(chatId, "❌ Введите целое число рублей:"); return step; }
      data.price = price * 100; return "addproduct_category";
    }
    case "addproduct_category": {
      const cat = text.trim().toLowerCase();
      if (!CATEGORIES.includes(cat as typeof CATEGORIES[number])) {
        await api.sendMessage(chatId, "❌ blank / recorded / equipment"); return step;
      }
      data.category = cat; return "addproduct_brand";
    }
    case "addproduct_brand": data.brand = text === "-" ? null : text; return "addproduct_type";
    case "addproduct_type": data.typeLabel = text === "-" ? null : text; return "addproduct_desc";
    case "addproduct_desc": data.description = text; return "addproduct_image";
    case "addproduct_image": {
      if (!text.startsWith("http")) { await api.sendMessage(chatId, "❌ Введите URL:"); return step; }
      data.imageUrl = text; return "addproduct_stock";
    }
    case "addproduct_stock": {
      const stock = parseInt(text.replace(/\D/g, "")) || 0;
      data.stockCount = stock;
      await finishAddProduct(chatId, data);
      return null;
    }
    default: return null;
  }
}

async function finishAddProduct(chatId: string, data: Record<string, unknown>): Promise<void> {
  try {
    const [product] = await db.insert(products).values({
      name: data.name as string,
      slug: slugify(data.name as string),
      price: data.price as number,
      category: data.category as "blank" | "recorded" | "equipment",
      brand: (data.brand as string) || null,
      typeLabel: (data.typeLabel as string) || null,
      description: data.description as string,
      imageUrl: data.imageUrl as string,
      stockCount: data.stockCount as number,
    }).returning();
    clearSession(chatId);
    await api.sendMessage(chatId, `✅ <b>Товар добавлен!</b>\n\nID: ${product.id}\n${product.name}\n${fmtPrice(product.price)}\n${product.category}\nСклад: ${product.stockCount} шт.`);
  } catch (e) {
    await api.sendMessage(chatId, `❌ Ошибка: ${e instanceof Error ? e.message : "неизвестная"}`);
    clearSession(chatId);
  }
}

export function getAddProductPrompt(step: string): string {
  return ({
    addproduct_name: "📀 Название товара:",
    addproduct_price: "💰 Цена (рублей, целое число):",
    addproduct_category: "📂 Категория: blank / recorded / equipment",
    addproduct_brand: "🏷 Бренд (или «-»):",
    addproduct_type: "🔤 Тип/лейбл (или «-»):",
    addproduct_desc: "📝 Описание:",
    addproduct_image: "🖼 URL изображения:",
    addproduct_stock: "📦 Количество на складе:",
  } as Record<string, string>)[step] || "Продолжите:";
}

import { slugify } from "@/lib/utils";

function fmtPrice(k: number): string {
  return (k / 100).toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
}
