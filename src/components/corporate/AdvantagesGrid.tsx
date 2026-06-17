import { ShieldCheck, Package, Truck, Headphones, MessageCircle } from "lucide-react";

const advantages = [
  {
    icon: Package,
    title: "Оригинальная плёнка",
    description: "Только проверенные бренды — TDK, BASF, Sony, Denon. Никаких подделок.",
  },
  {
    icon: Truck,
    title: "Быстрая доставка",
    description: "Отправляем в день заказа. По России — от 2 дней. Трекинг каждого заказа.",
  },
  {
    icon: ShieldCheck,
    title: "Проверка качества",
    description: "Каждая кассета проходит визуальный и технический контроль перед отправкой.",
  },
  {
    icon: Headphones,
    title: "Гарантия 14 дней",
    description: "Вернём деньги, если товар не подошёл. Без лишних вопросов и сложностей.",
  },
  {
    icon: MessageCircle,
    title: "Поддержка в Telegram",
    description: "Отвечаем на вопросы за час в рабочее время. Поможем с выбором и настройкой.",
  },
];

export function AdvantagesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {advantages.map((adv) => {
        const Icon = adv.icon;
        return (
          <div key={adv.title} className="bg-white border border-border p-6 text-center group hover:border-brass transition-colors">
            <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-brass/10 transition-colors">
              <Icon size={20} className="text-primary group-hover:text-brass transition-colors" />
            </div>
            <h3 className="text-sm font-semibold text-primary mb-2">{adv.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{adv.description}</p>
          </div>
        );
      })}
    </div>
  );
}
