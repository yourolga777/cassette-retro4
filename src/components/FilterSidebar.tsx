"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FilterSidebarProps {
  currentCategory: string;
  currentBrand: string;
}

const CATEGORIES = [
  { value: "", label: "Все" },
  { value: "blank", label: "Пустые кассеты" },
  { value: "recorded", label: "С записями" },
  { value: "equipment", label: "Оборудование" },
];

const BRANDS = [
  { value: "", label: "Все бренды" },
  { value: "TDK", label: "TDK" },
  { value: "BASF", label: "BASF" },
  { value: "Sony", label: "Sony" },
  { value: "Denon", label: "Denon" },
];

export function FilterSidebar({ currentCategory, currentBrand }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-heading text-sm text-wood font-semibold mb-3 uppercase tracking-wider">
          Категория
        </h3>
        <div className="flex flex-wrap lg:flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleFilter("category", cat.value)}
              className={`tag-badge text-xs ${
                currentCategory === cat.value ? "tag-badge--active" : ""
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-sm text-wood font-semibold mb-3 uppercase tracking-wider">
          Бренд
        </h3>
        <div className="flex flex-wrap lg:flex-col gap-2">
          {BRANDS.map((brand) => (
            <button
              key={brand.value}
              type="button"
              onClick={() => handleFilter("brand", brand.value)}
              className={`tag-badge text-xs ${
                currentBrand === brand.value ? "tag-badge--active" : ""
              }`}
            >
              {brand.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
