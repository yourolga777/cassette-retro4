"use client";

import { useTranslation } from "@/contexts/LanguageContext";

export function LanguageSwitcher() {
  const { locale, toggle } = useTranslation();

  return (
    <button
      onClick={toggle}
      className="font-mono text-[11px] uppercase tracking-widest text-wood/40 hover:text-neon transition-colors"
      title={locale === "ru" ? "Switch to English" : "Переключить на русский"}
    >
      {locale === "ru" ? "EN" : "RU"}
    </button>
  );
}
