import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { desc, eq, and } from "drizzle-orm";
import { ProductCard } from "@/components/retro/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SectionTitle } from "@/components/corporate/SectionTitle";

interface ShopPageProps {
  searchParams: Promise<{ category?: string; brand?: string; type?: string; }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const conditions = [];
  if (params.category) conditions.push(eq(products.category, params.category as "blank" | "recorded" | "equipment"));
  if (params.brand) conditions.push(eq(products.brand, params.brand));
  if (params.type) conditions.push(eq(products.typeLabel, params.type));

  const allProducts = conditions.length > 0
    ? await db.select().from(products).where(and(...conditions)).orderBy(desc(products.createdAt))
    : await db.select().from(products).orderBy(desc(products.createdAt));

  return (
    <div className="section-container py-8 md:py-12">
      <SectionTitle title="Каталог" subtitle={`${allProducts.length} позиций в наличии`} />

      <div className="flex flex-col lg:flex-row gap-8 mt-8">
        <aside className="lg:w-56 flex-shrink-0">
          <FilterSidebar currentCategory={params.category || ""} currentBrand={params.brand || ""} />
        </aside>

        <div className="flex-1">
          {allProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {allProducts.map((product) => (
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
          ) : (
            <div className="text-center py-16">
              <p className="font-heading text-xl text-muted mb-2">Ничего не найдено</p>
              <p className="text-xs text-muted-light">Попробуйте другие фильтры</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
