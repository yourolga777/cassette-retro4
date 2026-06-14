"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/retro/RetroButton";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "original",
    content: "",
    sourceUrl: "",
    summary: "",
    coverUrl: "",
    tags: "",
    published: false,
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setForm((f) => ({ ...f, [e.target.name]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      }),
    });

    if (res.ok) {
      router.push("/admin/posts");
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl text-wood font-bold mb-6">Новый пост</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Заголовок *</label>
          <input name="title" value={form.title} onChange={handleChange} className="retro-input" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Тип</label>
            <select name="type" value={form.type} onChange={handleChange} className="retro-input">
              <option value="original">Моя статья (MDX)</option>
              <option value="saved">Из интернета</option>
            </select>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">
              Теги (через запятую)
            </label>
            <input name="tags" value={form.tags} onChange={handleChange} className="retro-input" placeholder="кассеты, музыка, ремонт" />
          </div>
        </div>

        {form.type === "original" && (
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">MDX / Markdown *</label>
            <textarea name="content" rows={12} value={form.content} onChange={handleChange} className="retro-input resize-none font-mono text-sm" />
          </div>
        )}

        {form.type === "saved" && (
          <>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Ссылка на оригинал</label>
              <input name="sourceUrl" value={form.sourceUrl} onChange={handleChange} className="retro-input" />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Краткий пересказ</label>
              <textarea name="summary" rows={6} value={form.summary} onChange={handleChange} className="retro-input resize-none" />
            </div>
          </>
        )}

        <ImageUpload
          label="Обложка поста"
          value={form.coverUrl}
          onChange={(url) => setForm((f) => ({ ...f, coverUrl: url }))}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="published" checked={form.published} onChange={handleChange} className="w-4 h-4 accent-copper" />
          <span className="font-mono text-xs text-wood/70">Опубликовать сразу</span>
        </label>

        {error && <p className="font-mono text-xs text-neon">{error}</p>}

        <div className="flex gap-3">
          <RetroButton type="submit" variant="neon" disabled={loading}>
            {loading ? "Сохранение..." : "Создать"}
          </RetroButton>
          <RetroButton type="button" variant="ghost" onClick={() => router.push("/admin/posts")}>
            Отмена
          </RetroButton>
        </div>
      </form>
    </div>
  );
}
