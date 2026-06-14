"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { RetroButton } from "@/components/retro/RetroButton";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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

  useEffect(() => {
    fetch(`/api/admin/products`)
      .then((r) => {
        if (r.status === 401) router.push("/admin/login");
        return r.json();
      })
      .then((products) => {
        const p = products.find((x: { id: number }) => x.id === Number(params.id));
        if (p) {
          setForm({
            name: p.name,
            price: String(Math.round(p.price / 100)),
            category: p.category,
            brand: p.brand || "",
            typeLabel: p.typeLabel || "",
            description: p.description,
            imageUrl: p.imageUrl,
            stockCount: String(p.stockCount || 0),
          });
        }
        setFetching(false);
      });
  }, [params.id, router]);

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
    const res = await fetch(`/api/admin/products/${params.id}`, {
      method: "PUT",
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

  if (fetching) return <div className="flex justify-center py-16"><div className="reel" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl text-wood font-bold mb-6">Редактировать товар</h1>

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
            <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Категория</label>
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
            <input name="typeLabel" value={form.typeLabel} onChange={handleChange} className="retro-input" />
          </div>
        </div>
        <ImageUpload
          label="Изображение"
          value={form.imageUrl}
          onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          required
        />
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Описание</label>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} className="retro-input resize-none" required />
        </div>
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-wood/70 block mb-2">Количество на складе</label>
          <input name="stockCount" type="number" value={form.stockCount} onChange={handleChange} className="retro-input" />
        </div>

        {error && <p className="font-mono text-xs text-neon">{error}</p>}

        <div className="flex gap-3">
          <RetroButton type="submit" variant="neon" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </RetroButton>
          <RetroButton type="button" variant="ghost" onClick={() => router.push("/admin/products")}>
            Отмена
          </RetroButton>
        </div>
      </form>
    </div>
  );
}
