"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RetroButton } from "@/components/retro/RetroButton";

interface Review {
  id: number;
  text: string;
  rating: number;
  status: string;
  helpfulCount: number;
  createdAt: string;
  user: { name: string | null; email: string } | null;
  product: { id: number; name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "На модерации",
  approved: "Одобрен",
  rejected: "Отклонён",
};

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    const res = await fetch("/api/admin/reviews");
    if (res.status === 401) return router.push("/admin/login");
    const data = await res.json();
    setReviews(data);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchReviews();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить отзыв?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  };

  if (loading) return <div className="flex justify-center py-16"><div className="reel" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-wood font-bold">Модерация отзывов</h1>
      </div>
      <Link href="/admin" className="font-mono text-xs text-copper hover:text-neon transition-colors mb-4 inline-block">
        ← Назад
      </Link>

      {reviews.length === 0 ? (
        <p className="font-mono text-sm text-wood/40 text-center py-8">Нет отзывов</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className={`border-2 p-4 ${r.status === "pending" ? "border-neon/30" : "border-wood/10"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-heading text-sm text-wood font-semibold">
                      {r.product?.name || "Товар удалён"}
                    </span>
                    <span className="font-mono text-[11px] text-wood/40">
                      {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                    <span className={`font-mono text-[11px] px-2 py-0.5 border ${
                      r.status === "pending" ? "border-yellow-500/30 text-yellow-500" :
                      r.status === "approved" ? "border-green-500/30 text-green-500" :
                      "border-neon/30 text-neon"
                    }`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                    <span className="font-mono text-xs text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p className="font-mono text-xs text-wood/70">
                    {r.user ? `${r.user.name || "Аноним"} (${r.user.email})` : "Пользователь удалён"}
                  </p>
                  <p className="font-mono text-sm text-wood mt-1">{r.text}</p>
                  <p className="font-mono text-[10px] text-wood/30">👍 {r.helpfulCount}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {r.status === "pending" && (
                    <>
                      <RetroButton variant="neon" size="sm" onClick={() => handleStatus(r.id, "approved")}>
                        Одобрить
                      </RetroButton>
                      <RetroButton variant="ghost" size="sm" onClick={() => handleStatus(r.id, "rejected")}>
                        Отклонить
                      </RetroButton>
                    </>
                  )}
                  {r.status !== "pending" && (
                    <RetroButton variant="ghost" size="sm" onClick={() => handleStatus(r.id, "pending")}>
                      Вернуть
                    </RetroButton>
                  )}
                  <RetroButton variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="text-neon border-neon/30">
                    Удалить
                  </RetroButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
