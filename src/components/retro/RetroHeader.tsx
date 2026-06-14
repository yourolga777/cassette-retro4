import Link from "next/link";
import { EqualizerBars } from "./EqualizerBars";
import { CartIcon } from "../CartIcon";
import { SearchBar } from "../SearchBar";

export function RetroHeader() {
  return (
    <header className="border-b-2 border-wood/20 bg-paper/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded-full border-2 border-copper" />
              <div className="w-5 h-5 rounded-full border-2 border-copper" />
            </div>
            <span className="font-heading text-lg font-bold text-wood hidden sm:block group-hover:text-copper transition-colors">
              CASSETTE.RETRO
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              href="/shop"
              className="font-mono text-xs uppercase tracking-wider text-wood/70 hover:text-neon transition-colors px-2 py-1"
            >
              Магазин
            </Link>
            <Link
              href="/blog"
              className="font-mono text-xs uppercase tracking-wider text-wood/70 hover:text-neon transition-colors px-2 py-1"
            >
              Блог
            </Link>
            <Link
              href="/profile"
              className="font-mono text-xs uppercase tracking-wider text-wood/70 hover:text-neon transition-colors px-2 py-1"
            >
              Кабинет
            </Link>
            <SearchBar />
            <EqualizerBars className="hidden sm:flex mx-2" />
            <CartIcon />
          </nav>
        </div>
      </div>
    </header>
  );
}
