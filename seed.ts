import { db } from "./src/lib/db";
import { products, posts } from "./src/lib/schema";
import { eq } from "drizzle-orm";
import { slugify } from "./src/lib/utils";

async function seed() {
  console.log("🌱 Seeding database...");

  const seedProducts = [
    {
      name: "TDK SA90",
      slug: slugify("TDK SA90"),
      price: 35000,
      category: "blank" as const,
      brand: "TDK",
      typeLabel: "Type II (High Bias)",
      description:
        "Легендарные кассеты TDK SA (Super Avilyn) — золотой стандарт Type II.\n\nИдеальны для записи музыки: широкий динамический диапазон, низкий уровень шума, чистое и детальное звучание. 90 минут записи.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/TDK_SA90.jpg/800px-TDK_SA90.jpg",
      stockCount: 50,
    },
    {
      name: "BASF Ferro Extra I C90",
      slug: slugify("BASF Ferro Extra I C90"),
      price: 25000,
      category: "blank" as const,
      brand: "BASF",
      typeLabel: "Type I (Normal Bias)",
      description:
        "Качественные ферромагнитные кассеты BASF Ferro Extra. Отличный выбор для повседневной записи. Надёжный механизм, точное литьё корпуса.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/BASF_Ferro_Extra_I_C90.jpg/800px-BASF_Ferro_Extra_I_C90.jpg",
      stockCount: 100,
    },
    {
      name: "Sony Walkman WM-EX194",
      slug: slugify("Sony Walkman WM-EX194"),
      price: 450000,
      category: "equipment" as const,
      brand: "Sony",
      typeLabel: null,
      description:
        "Портативный кассетный плеер Sony Walkman WM-EX194. Сверхплоский корпус, автореверс, система Mega Bass для глубоких низких частот.\n\nРаботает от 1 батарейки AA до 40 часов.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sony_Walkman_WM-EX194.jpg/800px-Sony_Walkman_WM-EX194.jpg",
      stockCount: 5,
    },
    {
      name: "Lo-Fi Dreams Mixtape",
      slug: slugify("Lo-Fi Dreams Mixtape"),
      price: 80000,
      category: "recorded" as const,
      brand: "Cassette Retro",
      typeLabel: "Type I",
      description:
        "Эксклюзивный микстейп «Lo-Fi Dreams» — коллекция атмосферных лоу-фай треков, записанных вручную на плёнку.\n\nТреки:\n1. Midnight Signal — 4:20\n2. Fade to Grey — 3:45\n3. Velvet Dusk — 5:10\n4. Static Echo — 3:30\n5. Broken Radio — 4:00\n\nКаждая кассета — уникальна. Ручная упаковка.",
      imageUrl:
        "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c6b?w=800",
      stockCount: 15,
    },
    {
      name: "Denon DR-M44HX",
      slug: slugify("Denon DR-M44HX"),
      price: 2500000,
      category: "equipment" as const,
      brand: "Denon",
      typeLabel: null,
      description:
        "Винтажная кассетная дека Denon DR-M44HX. Трёхголовочная система, кварцевый таймер, система Dolby B/C/HX Pro.\n\nСостояние: отличное, произведена замена ремней и калибровка.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Denon_DR-M44HX.jpg/800px-Denon_DR-M44HX.jpg",
      stockCount: 1,
    },
  ];

  for (const product of seedProducts) {
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.slug, product.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(products).values(product);
      console.log(`  ✓ ${product.name}`);
    } else {
      console.log(`  − ${product.name} (exists)`);
    }
  }

  const seedPosts = [
    {
      title: "Почему кассеты звучат теплее",
      slug: slugify("Почему кассеты звучат теплее"),
      type: "original" as const,
      content:
        "## Аналоговое тепло\n\nЦифровой звук — это сэмплы. Аналоговый — непрерывная волна. Кассета, даже будучи \"компактным\" носителем, сохраняет эту непрерывность.\n\n### Магнитное насыщение\n\nКогда вы записываете на кассету с нормальным уровнем, лента входит в зону магнитного насыщения. Это создаёт приятную компрессию высоких частот — тот самый \"тёплый\" саунд, который так любят лоу-фай продюсеры.\n\n### Wow & Flutter\n\nНестабильность скорости протяжки — не баг, а фича. Лёгкое плавание высоты тона (wow) делает звук \"живым\". Идеально ровный звук — это неестественно для человеческого уха.\n\n### Совет\n\nПопробуйте записать один и тот же трек в цифре и на кассету TDK SA90. Разница будет слышна даже на бюджетной акустике.",
      summary: null,
      sourceUrl: null,
      coverUrl: null,
      tags: ["кассеты", "музыка", "звук"],
      published: true,
    },
    {
      title: "Как почистить головки деки",
      slug: slugify("Как почистить головки деки"),
      type: "saved" as const,
      content: null,
      summary:
        "Подробное руководство по очистке магнитных головок кассетной деки. Вам понадобятся: изопропиловый спирт (99%), ватные палочки, безворсовая салфетка. Ни в коем случае не используйте ацетон или спиртосодержащие жидкости с добавками — они разрушают головки.\n\nАккуратно протирайте головку движениями вдоль, не нажимая сильно. После чистки — дайте высохнуть 2-3 минуты. Рекомендуется чистить головки каждые 20-30 часов эксплуатации.",
      sourceUrl: "https://example.com/clean-tape-heads",
      coverUrl: null,
      tags: ["ремонт", "деки", "DIY"],
      published: true,
    },
  ];

  for (const post of seedPosts) {
    const existing = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, post.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(posts).values(post);
      console.log(`  ✓ ${post.title}`);
    } else {
      console.log(`  − ${post.title} (exists)`);
    }
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
