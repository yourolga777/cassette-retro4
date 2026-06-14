"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchFiltersProps {
  currentQ: string;
  currentMinPrice: string;
  currentMaxPrice: string;
  currentInStock: string;
  currentCategory: string;
}

export function SearchFilters({
  currentQ,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
  currentCategory,
}: SearchFiltersProps) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [inStock, setInStock] = useState(currentInStock === "true");
  const [category, setCategory] = useState(currentCategory);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (currentQ) params.set("q", currentQ);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (inStock) params.set("inStock", "true");
    if (category) params.set("category", category);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-sm text-wood font-semibold uppercase tracking-wider">Фильтры</h3>

      <div>
        <label className="font-mono text-xs text-wood/60 block mb-1">Цена от</label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="retro-input text-sm"
          placeholder="0"
          min={0}
        />
      </div>

      <div>
        <label className="font-mono text-xs text-wood/60 block mb-1">Цена до</label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="retro-input text-sm"
          placeholder="50000"
          min={0}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="accent-neon"
        />
        <span className="font-mono text-xs text-wood/70">Только в наличии</span>
      </label>

      <div>
        <label className="font-mono text-xs text-wood/60 block mb-1">Категория</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="retro-input text-sm"
        >
          <option value="">Все категории</option>
          <option value="blank">Пустые кассеты</option>
          <option value="recorded">С записями</option>
          <option value="equipment">Оборудование</option>
        </select>
      </div>

      <button
        onClick={applyFilters}
        className="retro-btn retro-btn--neon text-sm w-full"
      >
        Применить
      </button>

      {currentQ && (
        <a
          href={`/search?q=${encodeURIComponent(currentQ)}`}
          className="block text-center font-mono text-xs text-wood/40 hover:text-neon transition-colors"
        >
          Сбросить фильтры
        </a>
      )}
    </div>
  );
}
