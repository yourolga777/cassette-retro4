"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { RetroButton } from "@/components/retro/RetroButton";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  slug: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    if (res.status === 401) return router.push("/admin/login");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить товар?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((p) => p.filter((x) => x.id !== id));
  };

  if (loading) return <div className="flex justify-center py-16"><div className="reel" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-wood font-bold">Товары</h1>
        <Link href="/admin/products/new">
          <RetroButton variant="neon" size="sm">+ Новый товар</RetroButton>
        </Link>
      </div>
      <Link href="/admin" className="font-mono text-xs text-copper hover:text-neon transition-colors mb-4 inline-block">
        ← Назад
      </Link>

      {products.length === 0 ? (
        <p className="font-mono text-sm text-wood/40 text-center py-8">Нет товаров</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-2 border-wood/10 p-3">
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm text-wood truncate">{p.name}</p>
                <p className="font-mono text-xs text-wood/40">
                  {formatPrice(p.price)} — {p.category}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Link href={`/admin/products/${p.id}/edit`}>
                  <RetroButton variant="ghost" size="sm">Ред.</RetroButton>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="font-mono text-xs text-wood/30 hover:text-neon transition-colors"
                >
                  Уд.
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
