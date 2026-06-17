import "dotenv/config";
import { db } from "./src/lib/db";
import { posts, products } from "./src/lib/schema";
import { eq } from "drizzle-orm";

async function updateImages() {
  console.log("🖼 Обновляем изображения...");

  const productImages: Record<string, string> = {
    "TDK SA90": "/images/products/tdk-sa90.jpg",
    "BASF Ferro Extra I C90": "/images/products/basf-ferro.jpg",
    "Sony Walkman WM-EX194": "/images/products/sony-walkman.jpg",
    "Lo-Fi Dreams Mixtape": "/images/products/lofi-mixtape.jpg",
    "Denon DR-M44HX": "/images/products/denon-deck.jpg",
  };

  const allProducts = await db.select().from(products);
  let updatedProducts = 0;
  for (const product of allProducts) {
    const localPath = productImages[product.name];
    if (localPath && (product.imageUrl.startsWith("http") || !product.imageUrl.startsWith("/images/products/"))) {
      await db.update(products).set({ imageUrl: localPath }).where(eq(products.id, product.id));
      console.log(`  ✓ товар: ${product.name} → ${localPath}`);
      updatedProducts++;
    }
  }

  const blogImages = [
    "/images/blog/cassette-stack.jpg",
    "/images/blog/cassette-tapeplayer.jpg",
    "/images/blog/cassette-vintagetech.jpg",
    "/images/blog/cassette-vintage.jpg",
    "/images/blog/cassette-walkman.jpg",
    "/images/blog/cassette-pile.jpg",
    "/images/blog/cassette-modern.jpg",
    "/images/blog/cassette-colorful.jpg",
    "/images/blog/cassette-bw.jpg",
    "/images/blog/cassette-closeup.jpg",
    "/images/blog/cassette-closeup-b.jpg",
    "/images/blog/cassette-broken.jpg",
  ];

  const allPosts = await db.select().from(posts);
  let updatedPosts = 0;
  for (const post of allPosts) {
    if (!post.coverUrl || post.coverUrl.startsWith("http")) {
      const img = blogImages[updatedPosts % blogImages.length];
      await db.update(posts).set({ coverUrl: img }).where(eq(posts.slug, post.slug));
      console.log(`  ✓ пост: ${post.title} → ${img}`);
      updatedPosts++;
    }
  }

  console.log(`✅ Готово! Обновлено: ${updatedPosts} постов, ${updatedProducts} товаров`);
  process.exit(0);
}

updateImages().catch((err) => {
  console.error("Ошибка:", err);
  process.exit(1);
});
