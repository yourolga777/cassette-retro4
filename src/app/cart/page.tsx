"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { RetroButton } from "@/components/retro/RetroButton";
import { EqualizerBars } from "@/components/retro/EqualizerBars";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-3xl text-wood font-bold mb-4">Корзина пуста</h1>
        <p className="font-mono text-sm text-wood/60 mb-8">
          Добавьте что-нибудь из каталога
        </p>
        <Link href="/shop">
          <RetroButton variant="neon">В магазин</RetroButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <EqualizerBars />
        <h1 className="font-heading text-3xl text-wood font-bold">Корзина</h1>
      </div>

      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-2 border-wood/20 p-4"
          >
            <div className="relative w-16 h-16 flex-shrink-0 tape-box">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/shop/${item.slug}`}
                className="font-heading text-sm text-wood hover:text-neon transition-colors line-clamp-1"
              >
                {item.name}
              </Link>
              <p className="font-mono text-sm text-neon mt-1">
                {formatPrice(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 border-2 border-wood/30 text-wood/60 flex items-center justify-center font-mono text-sm hover:border-wood transition-colors"
              >
                -
              </button>
              <span className="font-mono text-sm text-wood w-8 text-center">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 border-2 border-wood/30 text-wood/60 flex items-center justify-center font-mono text-sm hover:border-wood transition-colors"
              >
                +
              </button>
            </div>
            <p className="font-mono text-sm text-wood font-semibold w-20 text-right">
              {formatPrice(item.price * item.quantity)}
            </p>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="font-mono text-xs text-wood/30 hover:text-neon transition-colors"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>

      <div className="border-t-2 border-wood/20 pt-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-wood/50">Итого</p>
          <p className="font-heading text-3xl text-wood font-bold">
            {formatPrice(totalAmount())}
          </p>
        </div>
        <Link href="/checkout">
          <RetroButton variant="neon" size="lg">
            Оформить заказ
          </RetroButton>
        </Link>
      </div>
    </div>
  );
}
