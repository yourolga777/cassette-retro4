"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 1200, suffix: "+", label: "Товаров в наличии" },
  { value: 49, suffix: "", label: "Рейтинг покупателей", isRating: true },
  { value: 8, suffix: "", label: "Лет на рынке" },
  { value: 5000, suffix: "+", label: "Выполненных заказов" },
];

function AnimatedNumber({ target, isRating }: { target: number; isRating?: boolean }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 30;
          const increment = target / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            if (step >= steps) {
              setCurrent(target);
              clearInterval(timer);
            } else {
              setCurrent(Math.round(increment * step));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  if (isRating) {
    return <span ref={ref}>{(current / 10).toFixed(1)}</span>;
  }

  return <span ref={ref}>{current.toLocaleString("ru-RU")}</span>;
}

export function TrustStats() {
  return (
    <section className="py-16 bg-white border-y border-border">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="stat-number">
                {stat.isRating ? (
                  <>
                    <AnimatedNumber target={49} isRating />
                    <span className="text-brass ml-1">★</span>
                  </>
                ) : (
                  <>
                    <AnimatedNumber target={stat.value} />
                    <span className="text-brass">{stat.suffix}</span>
                  </>
                )}
              </p>
              <p className="text-sm text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
