import "dotenv/config";
import { db } from "./src/lib/db";
import { products } from "./src/lib/schema";
import { eq } from "drizzle-orm";

const localImages: Record<string, string> = {
  "TDK SA90": "/images/products/tdk-sa90.jpg",
  "BASF Ferro Extra I C90": "/images/products/basf-ferro.jpg",
  "Sony Walkman WM-EX194": "/images/products/sony-walkman.jpg",
  "Lo-Fi Dreams Mixtape": "/images/products/lofi-mixtape.jpg",
  "Denon DR-M44HX": "/images/products/denon-deck.jpg",
};

async function fixProductImages() {
  console.log("🖼 Фикс изображений товаров...");

  const allProducts = await db.select().from(products);
  let updated = 0;

  for (const product of allProducts) {
    const localPath = localImages[product.name];
    if (!localPath) {
      console.log(`  − ${product.name}: не найден локальный файл`);
      continue;
    }

    const isExternal = product.imageUrl.startsWith("http");
    const isWrong = !product.imageUrl.startsWith("/images/products/");

    if (isExternal || isWrong) {
      await db
        .update(products)
        .set({ imageUrl: localPath })
        .where(eq(products.id, product.id));
      console.log(`  ✓ ${product.name}: ${product.imageUrl} → ${localPath}`);
      updated++;
    } else {
      console.log(`  − ${product.name}: уже локальный (${product.imageUrl})`);
    }
  }

  console.log(`✅ Готово! Обновлено товаров: ${updated}`);
  process.exit(0);
}

fixProductImages().catch((err) => {
  console.error("Ошибка:", err);
  process.exit(1);
});
