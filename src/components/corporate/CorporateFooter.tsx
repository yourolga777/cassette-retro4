import Link from "next/link";

export function CorporateFooter() {
  return (
    <footer className="bg-primary text-white/60 mt-auto">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-brass flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-brass" />
              </div>
              <span className="font-heading text-lg font-bold text-white">Cassette.Retro</span>
            </div>
            <p className="text-sm text-white/40 max-w-sm leading-relaxed">
              Магазин оригинальных аудиокассет, микстейпов и кассетного оборудования. TDK, BASF, Sony — с доставкой по всей России.
            </p>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-white/80 mb-4">Магазин</h4>
            <ul className="space-y-2">
              <li><Link href="/shop?category=blank" className="text-sm text-white/40 hover:text-brass transition-colors">Пустые кассеты</Link></li>
              <li><Link href="/shop?category=recorded" className="text-sm text-white/40 hover:text-brass transition-colors">С записями</Link></li>
              <li><Link href="/shop?category=equipment" className="text-sm text-white/40 hover:text-brass transition-colors">Оборудование</Link></li>
              <li><Link href="/blog" className="text-sm text-white/40 hover:text-brass transition-colors">Блог</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-white/80 mb-4">Информация</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-white/40 hover:text-brass transition-colors">Политика конфиденциальности</Link></li>
              <li><a href="https://t.me/cassette_retro" target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 hover:text-brass transition-colors">Telegram</a></li>
              <li><span className="text-sm text-white/20">cassette@retro.ru</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">
            Cassette.Retro © {new Date().getFullYear()} — Сделано с любовью к плёнке.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/20">Принимаем к оплате</span>
            <span className="text-xs text-white/30">Visa</span>
            <span className="text-xs text-white/30">Mastercard</span>
            <span className="text-xs text-white/30">СБП</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
