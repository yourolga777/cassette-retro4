"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Как выбрать подходящую аудиокассету?",
    answer:
      "Всё зависит от ваших задач. Type I (Normal) — для записи речи и бытового использования. Type II (High Bias / Chrome) — для музыки: чище высокие частоты. Type IV (Metal) — максимальное качество записи для профессионального использования. В карточке каждого товара мы указываем тип и рекомендации.",
  },
  {
    question: "Какие способы оплаты вы принимаете?",
    answer:
      "Вы можете оплатить заказ банковской картой (Visa, Mastercard, МИР) онлайн через Тинькофф Кассу, а также через СБП. Для заказов в Москве и Санкт-Петербурге доступна оплата наличными при получении.",
  },
  {
    question: "Сколько времени занимает доставка?",
    answer:
      "Отправляем заказы в течение 1-2 рабочих дней после подтверждения. Сроки доставки: по Москве и СПб — 1-2 дня, по России — от 3 до 7 дней в зависимости от региона. Каждый заказ отправляется с трекинг-номером.",
  },
  {
    question: "Что делать, если кассета не подошла?",
    answer:
      "Вы можете вернуть товар в течение 14 дней с момента получения. Важно: упаковка и плёнка должны быть в сохранности. Для возврата напишите нам в Telegram — мы оформим всё быстро и без лишних вопросов.",
  },
  {
    question: "Вы проверяете кассеты перед отправкой?",
    answer:
      "Да, каждую кассету мы проверяем визуально и тестируем на совместимость с кассетной декой. Оборудование перед отправкой проходит полную диагностику. Мы гарантируем, что вы получите товар в заявленном состоянии.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="divide-y divide-border">
      {faqs.map((faq, index) => (
        <div key={index}>
          <button
            type="button"
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between py-5 text-left group"
          >
            <span className="text-sm font-medium text-primary pr-4 group-hover:text-brass transition-colors">
              {faq.question}
            </span>
            <ChevronDown
              size={18}
              className={`text-brass flex-shrink-0 transition-transform duration-200 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-200 ${
              openIndex === index ? "max-h-96 pb-5" : "max-h-0"
            }`}
          >
            <p className="text-sm text-muted leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
