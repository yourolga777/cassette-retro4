import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { ReviewSection } from "./ReviewSection";
import { RetroButton } from "@/components/retro/RetroButton";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const slug = id;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (!product) {
    const [productById] = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(slug)))
      .limit(1);
    if (!productById) notFound();
    return <ProductDetail product={productById} />;
  }

  return <ProductDetail product={product} />;
}

function ProductDetail({
  product,
}: {
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
    category: "blank" | "recorded" | "equipment";
    brand: string | null;
    typeLabel: string | null;
    stockCount: number | null;
    slug: string;
  };
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/shop"
        className="font-mono text-xs uppercase tracking-wider text-copper hover:text-neon transition-colors mb-6 inline-block"
      >
        ← Назад в каталог
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="tape-box w-full">
          <div className="relative w-full h-full min-h-[300px] sm:min-h-[400px]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            {product.brand && (
              <span className="font-heading text-xs text-copper uppercase tracking-wider">
                {product.brand}
              </span>
            )}
            {product.typeLabel && (
              <span className="font-mono text-[10px] text-wood/40 uppercase tracking-wider border border-wood/20 px-2 py-0.5">
                {product.typeLabel}
              </span>
            )}
            <span className="font-mono text-[10px] text-wood/40 uppercase tracking-wider">
              {getCategoryLabel(product.category)}
            </span>
          </div>

          <h1 className="font-heading text-3xl text-wood font-bold mb-4">
            {product.name}
          </h1>

          <p className="font-mono text-4xl text-neon font-semibold mb-6 glow-text">
            {formatPrice(product.price)}
          </p>

          <div className="font-mono text-sm text-wood/70 leading-relaxed mb-8 whitespace-pre-line">
            {product.description}
          </div>

          <div className="flex items-center gap-4">
            <AddToCartButton product={product} />
            {product.stockCount !== null && (
              <span className="font-mono text-xs text-wood/40">
                {product.stockCount > 0
                  ? `В наличии: ${product.stockCount} шт.`
                  : "Нет в наличии"}
              </span>
            )}
          </div>
        </div>
      </div>

      <ReviewSection productId={product.id} />
    </div>
  );
}
