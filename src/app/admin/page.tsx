"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EqualizerBars } from "@/components/retro/EqualizerBars";
import { RetroButton } from "@/components/retro/RetroButton";

export default function AdminDashboard() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [productCount, setProductCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProductCount(data.length);
        setAuthed(true);
      } else {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setChecking(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((data) => setPostCount(data.length))
      .catch(() => {});
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => setOrderCount(data.length))
      .catch(() => {});
  }, [authed]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="reel" />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <EqualizerBars />
          <h1 className="font-heading text-3xl text-wood font-bold">Админка</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="font-mono text-xs text-wood/40 hover:text-neon transition-colors"
        >
          Выйти
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
        <div className="border-2 border-wood/20 p-6">
          <p className="font-mono text-xs text-wood/50 uppercase tracking-wider mb-1">Товары</p>
          <p className="font-heading text-4xl text-wood font-bold mb-4">{productCount}</p>
          <div className="flex gap-3">
            <Link href="/admin/products">
              <RetroButton variant="ghost" size="sm">Все товары</RetroButton>
            </Link>
            <Link href="/admin/products/new">
              <RetroButton variant="neon" size="sm">+ Новый</RetroButton>
            </Link>
          </div>
        </div>
        <div className="border-2 border-wood/20 p-6">
          <p className="font-mono text-xs text-wood/50 uppercase tracking-wider mb-1">Посты</p>
          <p className="font-heading text-4xl text-wood font-bold mb-4">{postCount}</p>
          <div className="flex gap-3">
            <Link href="/admin/posts">
              <RetroButton variant="ghost" size="sm">Все посты</RetroButton>
            </Link>
            <Link href="/admin/posts/new">
              <RetroButton variant="neon" size="sm">+ Новый</RetroButton>
            </Link>
          </div>
        </div>
        <div className="border-2 border-wood/20 p-6">
          <p className="font-mono text-xs text-wood/50 uppercase tracking-wider mb-1">Заказы</p>
          <p className="font-heading text-4xl text-wood font-bold mb-4">{orderCount}</p>
          <div className="flex gap-3">
            <Link href="/admin/orders">
              <RetroButton variant="ghost" size="sm">Все заказы</RetroButton>
            </Link>
          </div>
        </div>
        <div className="border-2 border-wood/20 p-6">
          <p className="font-mono text-xs text-wood/50 uppercase tracking-wider mb-1">Отзывы</p>
          <p className="font-heading text-4xl text-wood font-bold mb-4">—</p>
          <div className="flex gap-3">
            <Link href="/admin/reviews">
              <RetroButton variant="ghost" size="sm">Модерация</RetroButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-2 border-wood/20 p-6">
        <h2 className="font-heading text-lg text-wood font-semibold mb-4">Быстрые ссылки</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="font-mono text-xs text-copper hover:text-neon transition-colors">
            → На сайт
          </Link>
          <Link href="/shop" className="font-mono text-xs text-copper hover:text-neon transition-colors">
            → Магазин
          </Link>
          <Link href="/blog" className="font-mono text-xs text-copper hover:text-neon transition-colors">
            → Блог
          </Link>
        </div>
      </div>
    </div>
  );
}
