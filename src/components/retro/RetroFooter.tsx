import Link from "next/link";
import { EqualizerBars } from "./EqualizerBars";

export function RetroFooter() {
  return (
    <footer className="border-t-2 border-wood/20 bg-wood text-paper/70 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full border border-copper" />
              <div className="w-4 h-4 rounded-full border border-copper" />
            </div>
            <span className="font-heading text-sm text-paper/50">
              CASSETTE.RETRO © 2026
            </span>
          </div>

          <EqualizerBars className="opacity-50" />

          <div className="flex items-center gap-4">
            <Link
              href="/shop"
              className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-neon transition-colors"
            >
              Магазин
            </Link>
            <Link
              href="/blog"
              className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-neon transition-colors"
            >
              Блог
            </Link>
            <Link
              href="/privacy"
              className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-neon transition-colors"
            >
              Политика конфиденциальности
            </Link>
            <a
              href="https://t.me/cassette_retro"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-wider text-paper/50 hover:text-neon transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="font-mono text-[10px] text-paper/30">
            Сделано с любовью к плёнке. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
