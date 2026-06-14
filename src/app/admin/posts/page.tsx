"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { RetroButton } from "@/components/retro/RetroButton";

interface Post {
  id: number;
  title: string;
  type: string;
  slug: string;
  published: boolean;
  createdAt: string;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    if (res.status === 401) return router.push("/admin/login");
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  }, [router]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить пост?")) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) setPosts((p) => p.filter((x) => x.id !== id));
  };

  const togglePublish = async (id: number, published: boolean) => {
    const res = await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    if (res.ok) {
      setPosts((p) => p.map((x) => (x.id === id ? { ...x, published: !published } : x)));
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="reel" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl text-wood font-bold">Посты</h1>
        <Link href="/admin/posts/new">
          <RetroButton variant="neon" size="sm">+ Новый пост</RetroButton>
        </Link>
      </div>
      <Link href="/admin" className="font-mono text-xs text-copper hover:text-neon transition-colors mb-4 inline-block">
        ← Назад
      </Link>

      {posts.length === 0 ? (
        <p className="font-mono text-sm text-wood/40 text-center py-8">Нет постов</p>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-2 border-wood/10 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-heading text-sm text-wood truncate">{p.title}</p>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 ${p.published ? "bg-copper/20 text-copper" : "bg-wood/10 text-wood/40"}`}>
                    {p.published ? "Опубликовано" : "Черновик"}
                  </span>
                </div>
                <p className="font-mono text-xs text-wood/40">
                  {p.type === "original" ? "Моя статья" : "Сохранённая"} — {formatDate(p.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  type="button"
                  onClick={() => togglePublish(p.id, p.published)}
                  className="font-mono text-[10px] text-wood/40 hover:text-copper transition-colors"
                >
                  {p.published ? "Снять" : "Опубл."}
                </button>
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
