import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { RetroButton } from "./RetroButton";

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
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-wood/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {brand && (
            <p className="font-heading text-xs text-copper uppercase tracking-wider mb-1">
              {brand}
            </p>
          )}
          <h3 className="font-heading text-sm text-paper font-semibold leading-tight mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="font-mono text-lg text-neon font-semibold">
            {formatPrice(price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="tape-box bg-paper-dark animate-pulse flex items-center justify-center">
      <div className="reel" />
    </div>
  );
}
