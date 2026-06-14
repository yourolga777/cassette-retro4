import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc, sql } from "drizzle-orm";
import { ProductCard } from "@/components/retro/ProductCard";
import { SearchFilters } from "./SearchFilters";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    category?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 12;
  const offset = (page - 1) * limit;
  const minPrice = params.minPrice;
  const maxPrice = params.maxPrice;
  const inStock = params.inStock;
  const category = params.category;

  let totalCount = 0;
  let found: typeof products.$inferSelect[] = [];

  if (q) {
    const searchTerm = `%${q}%`;
    const conditions: ReturnType<typeof sql>[] = [];

    conditions.push(
      sql`(${products.name} ILIKE ${searchTerm} OR ${products.brand} ILIKE ${searchTerm} OR ${products.description} ILIKE ${searchTerm})`
    );

    if (minPrice) conditions.push(sql`${products.price} >= ${parseInt(minPrice)}`);
    if (maxPrice) conditions.push(sql`${products.price} <= ${parseInt(maxPrice)}`);
    if (inStock === "true") conditions.push(sql`${products.stockCount} > 0`);
    if (category) conditions.push(sql`${products.category} = ${category}`);

    const whereClause = conditions.length === 1
      ? conditions[0]
      : sql`(${sql.join(conditions, sql` AND `)})`;

    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(products)
      .where(whereClause);

    totalCount = countResult?.count ?? 0;

    found = await db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(
        sql`CASE WHEN ${products.name} ILIKE ${q} THEN 0 ELSE 1 END`,
        desc(products.createdAt)
      )
      .limit(limit)
      .offset(offset);
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl text-wood font-bold mb-2">
        Поиск: &ldquo;{q}&rdquo;
      </h1>
      <p className="font-mono text-xs text-wood/50 mb-6">
        Найдено: {totalCount}
      </p>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 flex-shrink-0">
          <SearchFilters
            currentQ={q}
            currentMinPrice={minPrice || ""}
            currentMaxPrice={maxPrice || ""}
            currentInStock={inStock || ""}
            currentCategory={category || ""}
          />
        </aside>

        <div className="flex-1">
          {found.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {found.map((product) => (
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

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <a
                    href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}${inStock ? `&inStock=${inStock}` : ""}${category ? `&category=${category}` : ""}`}
                    className={`font-mono text-xs ${page <= 1 ? "text-wood/20 pointer-events-none" : "text-copper hover:text-neon"} transition-colors`}
                  >
                    ← Назад
                  </a>
                  <span className="font-mono text-xs text-wood/50">
                    {page} / {totalPages}
                  </span>
                  <a
                    href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}${inStock ? `&inStock=${inStock}` : ""}${category ? `&category=${category}` : ""}`}
                    className={`font-mono text-xs ${page >= totalPages ? "text-wood/20 pointer-events-none" : "text-copper hover:text-neon"} transition-colors`}
                  >
                    Вперёд →
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="font-heading text-xl text-wood/40 mb-2">Ничего не найдено</p>
              <p className="font-mono text-xs text-wood/30">Попробуйте изменить запрос или фильтры</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
