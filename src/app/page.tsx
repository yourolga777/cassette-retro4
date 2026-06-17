import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { products, posts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { ProductCard } from "@/components/retro/ProductCard";
import { CassettePlayer } from "@/components/retro/CassettePlayer";
import { SectionTitle } from "@/components/corporate/SectionTitle";
import { TrustStats } from "@/components/corporate/TrustStats";
import { AdvantagesGrid } from "@/components/corporate/AdvantagesGrid";
import { ReviewCard } from "@/components/corporate/ReviewCard";
import { FAQ } from "@/components/corporate/FAQ";
import { formatDate, getPostTypeLabel } from "@/lib/utils";
import { ArrowRight, Send } from "lucide-react";

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

const reviews = [
  {
    name: "Алексей П.",
    role: "Коллекционер, Москва",
    rating: 5,
    text: "Искал TDK SA-X 90 в хорошем состоянии — здесь нашёл идеальный вариант. Пришло быстро, упаковано отлично. Видно, что люди знают и любят своё дело. Буду заказывать ещё.",
  },
  {
    name: "Мария К.",
    role: "Музыкант, Санкт-Петербург",
    rating: 5,
    text: "Заказала партию BASF Chrome Maxima для записи альбома. Качество плёнки отличное, запись легла идеально. Отдельное спасибо за консультацию по выбору кассет для разных инструментов.",
  },
  {
    name: "Дмитрий В.",
    role: "Аудиофил, Екатеринбург",
    rating: 5,
    text: "Наконец нашёл магазин, где серьёзно относятся к кассетам. Sony Walkman WM-D6C приехал в идеальном состоянии, полностью рабочий, с родной упаковкой. Очень доволен.",
  },
];

export default async function HomePage() {
  const [latestProducts, latestPosts] = await Promise.all([
    getLatestProducts(),
    getLatestPosts(),
  ]);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative bg-white border-b border-border overflow-hidden">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row items-center gap-12 py-16 md:py-24">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="w-8 h-px bg-brass hidden sm:block" />
                <span className="text-xs font-medium text-brass uppercase tracking-[0.15em]">
                  Магазин с 2018 года
                </span>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary leading-[1.1] mb-6">
                Кассеты,
                <br />
                <span className="text-brass">которые звучат</span>
              </h1>
              <p className="text-muted text-sm sm:text-base max-w-lg mx-auto lg:mx-0 mb-4 leading-relaxed">
                Оригинальные аудиокассеты TDK, BASF, Sony, микстейпы и кассетное оборудование.
                Для коллекционеров, музыкантов и ценителей тёплого звука.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-brass/5 to-primary/5 rounded-full" />
                <div className="absolute inset-8 flex items-center justify-center">
                  <CassettePlayer />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST STATS ===== */}
      <TrustStats />

      {/* ===== НОВОЕ ПОСТУПЛЕНИЕ ===== */}
      {latestProducts.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="section-container">
            <SectionTitle
              title="Новое поступление"
              subtitle="Свежие поступления кассет и оборудования"
              align="center"
            />
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
            <div className="mt-8 text-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 text-sm font-medium hover:bg-primary-light transition-colors"
              >
                В магазин
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== ADVANTAGES ===== */}
      <section className="py-16 md:py-20 bg-white border-y border-border">
        <div className="section-container">
          <SectionTitle
            label="Почему мы"
            title="Работаем иначе"
            subtitle="Качество, которому можно доверять — в каждой детали"
            align="center"
          />
          <AdvantagesGrid />
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="py-16 md:py-20">
        <div className="section-container">
          <SectionTitle
            label="Отзывы"
            title="Что говорят клиенты"
            subtitle="Более 340 оценок — рейтинг 4.9 из 5"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== ИНТЕРЕСНОЕ ===== */}
      {latestPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-y border-border">
          <div className="section-container">
            <SectionTitle
              title="Интересное"
              subtitle="Статьи об аудиокассетах, плеерах и культуре тёплого звука"
              align="center"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <div className="overflow-hidden mb-4 bg-surface border border-border">
                    {post.coverUrl ? (
                      <div className="relative w-full aspect-[4/3]">
                        <Image
                          src={post.coverUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] bg-primary/5 flex items-center justify-center">
                        <div className="reel" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-brass">{formatDate(post.createdAt!)}</span>
                      <span className="text-border">·</span>
                      <span className="text-[11px] text-muted-light uppercase tracking-wider">{getPostTypeLabel(post.type)}</span>
                    </div>
                    <h3 className="font-heading text-base font-semibold text-primary group-hover:text-brass transition-colors mb-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {post.summary || post.content?.slice(0, 150)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 border border-border text-primary px-5 py-2.5 text-sm font-medium hover:bg-border-light transition-colors"
              >
                Читать еще
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== FAQ ===== */}
      <section className="py-16 md:py-20">
        <div className="section-container max-w-3xl mx-auto">
          <SectionTitle
            label="FAQ"
            title="Часто задаваемые вопросы"
            align="center"
          />
          <FAQ />
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 md:py-20 bg-primary text-white">
        <div className="section-container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Готовы сделать заказ?
          </h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Напишите нам в Telegram — поможем с выбором, ответим на вопросы и оформим заказ за пару минут
          </p>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://t.me/cassette_retro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brass text-white px-6 py-3 text-sm font-medium hover:bg-brass-dark transition-colors"
            >
              <Send size={16} />
              Написать в Telegram
            </a>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 border border-white/20 text-white/80 px-6 py-3 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Перейти в магазин <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
