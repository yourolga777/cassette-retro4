import Link from "next/link";
import { db } from "@/lib/db";
import { products, posts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import { ProductCard } from "@/components/retro/ProductCard";
import { CassettePlayer } from "@/components/retro/CassettePlayer";
import { EqualizerBars } from "@/components/retro/EqualizerBars";
import { RetroButton } from "@/components/retro/RetroButton";
import { formatPrice, formatDate, getCategoryLabel } from "@/lib/utils";

async function getLatestProducts() {
  try {
    return await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(3);
  } catch {
    return [];
  }
}

async function getLatestPosts() {
  try {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.published, true))
      .orderBy(desc(posts.createdAt))
      .limit(3);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [latestProducts, latestPosts] = await Promise.all([
    getLatestProducts(),
    getLatestPosts(),
  ]);

  return (
    <div>
      <section className="relative border-b-2 border-wood/20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="text-center lg:text-left max-w-[12rem]">
              <div className="inline-flex items-center gap-2 mb-4">
                <EqualizerBars />
                <span className="font-mono text-xs text-copper uppercase tracking-widest">
                  Сайт открыт
                </span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-wood leading-tight mb-4">
                Cassette
                <br />
                <span className="text-neon glow-text">Retro</span>
              </h1>
              <p className="font-mono text-sm text-wood/70 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
                Магазин аудиокассет, микстейпов и оборудования. 
                TDK, BASF, Sony — плёнка с доставкой по России.
              </p>
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <Link href="/shop">
                  <RetroButton variant="neon">В магазин</RetroButton>
                </Link>
                <Link href="/blog">
                  <RetroButton variant="ghost">Блог</RetroButton>
                </Link>
              </div>
            </div>
            <div className="flex-shrink-0">
              <CassettePlayer />
            </div>
          </div>
        </div>
      </section>

      {latestProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading text-2xl text-wood font-bold">Новинки</h2>
            <Link
              href="/shop"
              className="font-mono text-xs uppercase tracking-wider text-copper hover:text-neon transition-colors"
            >
              Все товары →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                slug={product.slug}
                category={product.category}
                brand={product.brand}
              />
            ))}
          </div>
        </section>
      )}

      {latestPosts.length > 0 && (
        <section className="border-y-2 border-wood/20 bg-wood/5">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-wood font-bold">
                Последние посты
              </h2>
              <Link
                href="/blog"
                className="font-mono text-xs uppercase tracking-wider text-copper hover:text-neon transition-colors"
              >
                Все записи →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block border-2 border-wood/20 hover:border-copper transition-colors group"
                >
                  <div className="p-4">
                    {post.coverUrl && (
                      <div className="tape-box w-full h-32 mb-4 overflow-hidden">
                        <Image
                          src={post.coverUrl}
                          alt={post.title}
                          width={200}
                          height={128}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <p className="font-mono text-xs text-copper mb-2">
                      {formatDate(post.createdAt!)}
                    </p>
                    <h3 className="font-heading text-sm text-wood group-hover:text-neon transition-colors font-semibold mb-2 leading-tight">
                      {post.title}
                    </h3>
                    <p className="font-mono text-xs text-wood/60 line-clamp-2">
                      {post.summary || post.content?.slice(0, 120)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
