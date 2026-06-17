import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
  category: string;
  brand?: string | null;
}

export function ProductCard({
  id,
  name,
  price,
  imageUrl,
  slug,
  category,
  brand,
}: ProductCardProps) {
  return (
    <Link href={`/shop/${slug}`} className="tape-box block group">
      <div className="relative aspect-[3/4]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {brand && (
            <p className="font-heading text-xs text-brass uppercase tracking-wider mb-1">
              {brand}
            </p>
          )}
          <h3 className="text-sm text-white font-semibold leading-tight mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-lg text-brass font-semibold">
            {formatPrice(price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="tape-box animate-pulse flex items-center justify-center aspect-[3/4]">
      <div className="reel" />
    </div>
  );
}
