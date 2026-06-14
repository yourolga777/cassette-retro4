import { db } from "./src/lib/db";
import { posts, products } from "./src/lib/schema";
import { eq } from "drizzle-orm";

async function updateImages() {
  console.log("🖼 Обновляем изображения...");

  // Обновляем посты
  const postUpdates = [
    { slug: "type-i-ii-iv-kak-vybrat-kassetu", img: "/images/blog/cassette-colors.jpg" },
    { slug: "remont-kassetnyh-dek-svoimi-rukami", img: "/images/blog/studio-mixer.jpg" },
    { slug: "luchshie-portativnye-kassetnye-pleery", img: "/images/blog/headphones-retro.jpg" },
    { slug: "kak-pochistit-magnitnye-golovki", img: "/images/blog/cassette-pewter.jpg" },
    { slug: "lo-fi-na-kassetah-pochemu-lenta-snova-v-mode", img: "/images/blog/turntable.jpg" },
  ];

  // Назначаем посты без обложек
  const allPosts = await db.select().from(posts);
  let updatedPosts = 0;
  for (const post of allPosts) {
    const match = postUpdates.find(u => u.slug === post.slug);
    if (match) {
      await db.update(posts).set({ coverUrl: match.img }).where(eq(posts.slug, post.slug));
      updatedPosts++;
      console.log(`  ✓ пост: ${post.title} → ${match.img}`);
    } else if (!post.coverUrl || post.coverUrl.includes("unsplash") || post.coverUrl.includes("images.unsplash")) {
      const img = "/images/blog/cassette-stack.jpg";
      await db.update(posts).set({ coverUrl: img }).where(eq(posts.slug, post.slug));
      console.log(`  ✓ пост: ${post.title} → ${img} (заглушка)`);
      updatedPosts++;
    }
  }

  // Обновляем изображения товаров
  const allProducts = await db.select().from(products);
  let updatedProducts = 0;
  for (const product of allProducts) {
    if (!product.imageUrl || product.imageUrl.includes("wikipedia") || product.imageUrl.includes("unsplash")) {
      // Assign appropriate images based on category
      let img: string;
      switch (product.category) {
        case "blank":
          img = "/images/blog/cassette-black.jpg";
          break;
        case "recorded":
          img = "/images/blog/cassette-colors.jpg";
          break;
        case "equipment":
          img = "/images/blog/studio-mixer.jpg";
          break;
        default:
          img = "/images/blog/cassette-stack.jpg";
      }
      await db.update(products).set({ imageUrl: img }).where(eq(products.id, product.id));
      console.log(`  ✓ товар: ${product.name} → ${img}`);
      updatedProducts++;
    }
  }

  console.log(`✅ Готово! Обновлено: ${updatedPosts} постов, ${updatedProducts} товаров`);
  process.exit(0);
}

updateImages().catch((err) => {
  console.error("Ошибка:", err);
  process.exit(1);
});
