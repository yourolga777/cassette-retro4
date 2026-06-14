"use client";

import { useCart } from "@/store/cart";
import { RetroButton } from "@/components/retro/RetroButton";

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem);

  return (
    <RetroButton
      variant="neon"
      size="lg"
      onClick={() =>
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          slug: product.slug,
        })
      }
    >
      В корзину
    </RetroButton>
  );
}
