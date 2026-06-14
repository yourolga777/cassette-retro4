"use client";

import { useCart } from "@/store/cart";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartIcon() {
  const totalItems = useCart((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-wood/70 hover:text-neon transition-colors px-2 py-1"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon text-wood text-[10px] font-bold flex items-center justify-center">
          {totalItems > 9 ? "9+" : totalItems}
        </span>
      )}
    </Link>
  );
}
