import Link from "next/link";
import { CartIcon } from "../CartIcon";
import { SearchBar } from "../SearchBar";
import { MessageCircle } from "lucide-react";

export function CorporateHeader() {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-8 h-8 rounded-full border-2 border-brass flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-brass" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading text-lg font-bold text-primary tracking-tight">Cassette</span>
              <span className="font-heading text-lg font-bold text-brass">.Retro</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-sm text-muted hover:text-primary transition-colors">
              Магазин
            </Link>
            <Link href="/blog" className="text-sm text-muted hover:text-primary transition-colors">
              Блог
            </Link>
            <Link href="/profile" className="text-sm text-muted hover:text-primary transition-colors">
              Кабинет
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <SearchBar />
            <a
              href="https://t.me/cassette_retro"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary-light transition-colors px-4 py-2"
            >
              <MessageCircle size={16} />
              <span>Связаться</span>
            </a>
            <CartIcon />
          </div>
        </div>
      </div>
    </header>
  );
}
