"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Reveal } from "./reveal";

const faqItems = [
  {
    question: "За какое время нужно заказать кейтеринг?",
    answer:
      "Рекомендуем делать заказ минимум за 3–5 дней до мероприятия. Для крупных событий (от 100 человек) лучше заказать за 1–2 недели. Экстренные заказы рассматриваем индивидуально — позвоните нам, и мы постараемся помочь.",
  },
  {
    question: "Какая минимальная сумма заказа?",
    answer:
      "Минимальная сумма заказа зависит от формата: для фуршета — от 15 000 ₽, для кофе-брейка — от 8 000 ₽, для банкета — от 25 000 ₽. Точную стоимость рассчитает наш менеджер под ваши задачи.",
  },
  {
    question: "Выезжаете ли вы за пределы Санкт-Петербурга?",
    answer:
      "Да, мы работаем по всему Санкт-Петербургу и Ленинградской области (в радиусе 50 км включено в стоимость). Для более удалённых локаций (Петергоф, Пушкин, Гатчина, Выборг) рассчитывается дополнительная логистическая надбавка.",
  },
  {
    question: "Предоставляете ли вы посуду, сервировку и персонал?",
    answer:
      "Да, это наша стандартная услуга. В стоимость входит одноразовая или многоразовая посуда (на выбор), сервировка стола, а также обслуживающий персонал (официанты, бармены, шеф-повар). Для премиум-мероприятий предлагаем декор и флористику.",
  },
  {
    question: "Можно ли учесть пищевые ограничения (аллергии, веганство)?",
    answer:
      "Обязательно! Мы готовим меню с учётом любых пищевых ограничений: без глютена, лактозы, орехов, а также halal, kosher, вегетарианские и веганские опции. Укажите ограничения при заказе — мы адаптируем меню.",
  },
  {
    question: "Как происходит оплата?",
    answer:
      "Работаем как с юридическими, так и с физическими лицами. Оплата возможна безналичным расчётом (с НДС и без), наличными или банковским переводом. Условия предоплаты: обычно 30–50 % при заключении договора, остаток — после мероприятия.",
  },
];

/**
 * FAQ section — LIGHT THEME with elegant accordion
 */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative overflow-hidden bg-white py-24 md:py-32">
      {/* Subtle decoration */}
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-gold/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-gold bg-gold/10 px-3 py-1.5 rounded-full">
              <HelpCircle className="size-3" />
              FAQ
            </span>
            <h2
              className="mt-4 font-display text-ink"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)", lineHeight: 1.2 }}
            >
              Частые вопросы
            </h2>
            <p className="mt-4 text-base text-ink/60">
              Ответы на популярные вопросы о нашем кейтеринге
            </p>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <Reveal key={index} delay={index * 0.05}>
              <div
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  openIndex === index
                    ? "border-gold/30 bg-white shadow-lg shadow-gold/5"
                    : "border-border-line bg-cream/50 hover:border-gold/20"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={openIndex === index}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left group"
                >
                  <span className="flex items-center gap-3 font-display text-lg text-ink pr-4">
                    <span className={`flex size-7 items-center justify-center rounded-full text-sm font-mono transition-colors ${
                      openIndex === index ? "bg-gradient-to-r from-gold to-terracotta text-white" : "bg-gold/15 text-gold group-hover:bg-gold/25"
                    }`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-gold transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 pl-16 leading-relaxed text-ink/70 text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
