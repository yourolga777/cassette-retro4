"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RetroButton } from "@/components/retro/RetroButton";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "blank",
    brand: "",
    typeLabel: "",
    description: "",
    imageUrl: "",
    stockCount: "",
  });

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = { ...form, price: String(Number(form.price) * 100) };
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/products");
    } else {
      const data = await res.json();
      setError(data.error || "Ошибка");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl text-wood font-bold mb-6">Новый товар</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Название *</label>
          <input name="name" value={form.name} onChange={handleChange} className="retro-input" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Цена (руб.) *</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} className="retro-input" required />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Категория *</label>
            <select name="category" value={form.category} onChange={handleChange} className="retro-input">
              <option value="blank">Пустые</option>
              <option value="recorded">С записями</option>
              <option value="equipment">Оборудование</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Бренд</label>
            <input name="brand" value={form.brand} onChange={handleChange} className="retro-input" />
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Тип ленты</label>
            <input name="typeLabel" value={form.typeLabel} onChange={handleChange} className="retro-input" placeholder="Type I / II / IV" />
          </div>
        </div>
        <ImageUpload
          label="Изображение"
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          required
        />
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Описание *</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="retro-input resize-none" required />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Количество на складе</label>
          <input name="stockCount" type="number" value={form.stockCount} onChange={handleChange} className="retro-input" />
        </div>

        {error && <p className="font-mono text-xs text-neon">{error}</p>}

        <div className="flex gap-3">
          <RetroButton type="submit" variant="neon" disabled={loading}>
            {loading ? "Сохранение..." : "Создать"}
          </RetroButton>
          <RetroButton type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
            Отмена
          </RetroButton>
        </div>
      </form>
    </div>
  );
}
