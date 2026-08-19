"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Search, X, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { Reveal } from "./reveal";

type FaqCategory = "ordering" | "logistics" | "menu" | "payment";

const CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: "ordering", label: "Заказ" },
  { id: "logistics", label: "Логистика" },
  { id: "menu", label: "Меню" },
  { id: "payment", label: "Оплата" },
];

const faqItems: {
  category: FaqCategory;
  question: string;
  answer: string;
}[] = [
  {
    category: "ordering",
    question: "За какое время нужно заказать кейтеринг?",
    answer:
      "Рекомендуем делать заказ минимум за 3–5 дней до мероприятия. Для крупных событий (от 100 человек) лучше заказать за 1–2 недели. Экстренные заказы рассматриваем индивидуально — позвоните нам, и мы постараемся помочь.",
  },
  {
    category: "payment",
    question: "Какая минимальная сумма заказа?",
    answer:
      "Минимальная сумма заказа зависит от формата: для фуршета — от 49 000 ₽ (от 20 гостей × 2 450 ₽), для кофе-брейка — от 13 500 ₽ (от 15 гостей × 900 ₽), для банкета — от 134 100 ₽ (от 30 гостей × 4 470 ₽). Точную стоимость рассчитает наш менеджер под ваши задачи.",
  },
  {
    category: "logistics",
    question: "Выезжаете ли вы за пределы Санкт-Петербурга?",
    answer:
      "Да, мы работаем по всему Санкт-Петербургу и Ленинградской области (в радиусе 50 км включено в стоимость). Для более удалённых локаций (Выборг, Тихвин, Лодейное Поле) рассчитывается дополнительная логистическая надбавка.",
  },
  {
    category: "logistics",
    question: "Предоставляете ли вы посуду, сервировку и персонал?",
    answer:
      "Да, это наша стандартная услуга. В стоимость входит одноразовая или многоразовая посуда (на выбор), сервировка стола, а также обслуживающий персонал (официанты, бармены, шеф-повар). Для премиум-мероприятий предлагаем декор и флористику.",
  },
  {
    category: "menu",
    question: "Можно ли учесть пищевые ограничения (аллергии, веганство)?",
    answer:
      "Обязательно! Мы готовим меню с учётом любых пищевых ограничений: без глютена, лактозы, орехов, а также halal, kosher, вегетарианские и веганские опции. Укажите ограничения при заказе — мы адаптируем меню.",
  },
  {
    category: "payment",
    question: "Как происходит оплата?",
    answer:
      "Работаем как с юридическими, так и с физическими лицами. Оплата возможна безналичным расчётом (с НДС и без), наличными или банковским переводом. Условия предоплаты: обычно 30–50 % при заключении договора, остаток — после мероприятия.",
  },
  {
    category: "menu",
    question: "Готовите ли вы блюда по индивидуальному меню?",
    answer:
      "Да, наш шеф-повар составит индивидуальное меню под ваши предпочтения, бюджет и стилистику мероприятия. Можно согласовать дегустацию перед заказом — это стандартная практика для банкетов и свадеб.",
  },
  {
    category: "ordering",
    question: "Можно ли скорректировать заказ после его оформления?",
    answer:
      "Да, изменения можно вносить бесплатно за 48 часов до мероприятия. Позже — по согласованию с менеджером, возможна доплата за срочную закупку продуктов.",
  },
];

/**
 * Highlight matched query substring inside text.
 * Returns array of React nodes.
 */
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const out: (string | { key: string; value: string })[] = [];
  let i = 0;
  let k = 0;
  while (i < text.length) {
    const idx = lower.indexOf(q, i);
    if (idx === -1) {
      out.push(text.slice(i));
      break;
    }
    if (idx > i) out.push(text.slice(i, idx));
    out.push({ key: `m-${k++}`, value: text.slice(idx, idx + q.length) });
    i = idx + q.length;
  }
  return out.map((part, idx) =>
    typeof part === "string" ? (
      <span key={`s-${idx}-${part.slice(0, 6)}`}>{part}</span>
    ) : (
      <mark
        key={part.key}
        className="rounded-sm bg-gold/30 px-0.5 text-ink"
      >
        {part.value}
      </mark>
    )
  );
}

const VOTE_KEY = "faq-votes";
const POSITIVE_THRESHOLD = 5; // show "Спасибо за отзыв!" after this many aggregate votes (localStorage-only)

/**
 * Read all faq votes from localStorage. Returns map of question → "up"|"down".
 */
function readVotes(): Record<string, "up" | "down"> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VOTE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeVote(question: string, vote: "up" | "down") {
  if (typeof window === "undefined") return;
  try {
    const all = readVotes();
    all[question] = vote;
    window.localStorage.setItem(VOTE_KEY, JSON.stringify(all));
  } catch {
    // ignore quota errors
  }
}

/**
 * WasHelpful — "Was this helpful?" thumb-up/down per answer.
 * Vote persisted to localStorage; aggregates shown after threshold.
 */
function WasHelpful({ question }: { question: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [totalUp, setTotalUp] = useState(0);
  const [totalDown, setTotalDown] = useState(0);

  useEffect(() => {
    const all = readVotes();
    setVote(all[question] ?? null);
    // Aggregate from localStorage — only this device's votes (no backend).
    // For demo purposes; a real backend would store aggregates server-side.
    const votes = Object.entries(all);
    const up = votes.filter(([, v]) => v === "up").length;
    const down = votes.filter(([, v]) => v === "down").length;
    setTotalUp(up);
    setTotalDown(down);
  }, [question]);

  const onVote = (choice: "up" | "down") => {
    const newVote = vote === choice ? null : choice;
    setVote(newVote);
    if (newVote) {
      writeVote(question, newVote);
      // Optimistically update aggregate (localStorage-only state)
      if (newVote === "up") setTotalUp((n) => n + 1);
      else setTotalDown((n) => n + 1);
      if (vote && vote !== newVote) {
        // Undo previous vote
        if (vote === "up") setTotalUp((n) => Math.max(0, n - 1));
        else setTotalDown((n) => Math.max(0, n - 1));
      }
      // Phase 8: also POST to /api/faq-vote for server-side aggregate (152-ФЗ
      // compliant — captures IP + User-Agent as consent proof). Fire-and-forget
      // (no await) — UI doesn't block on server response. localStorage remains
      // the source of truth for instant UI feedback.
      fetch("/api/faq-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, vote: newVote }),
      }).catch(() => {
        // Silent fail — vote is already in localStorage, server is best-effort.
      });
    } else {
      // Undo
      if (vote === "up") setTotalUp((n) => Math.max(0, n - 1));
      else if (vote === "down") setTotalDown((n) => Math.max(0, n - 1));
    }
  };

  return (
    <div className="flex items-center gap-3 text-xs text-ink/50">
      <span>Помог ответ?</span>
      <button
        type="button"
        onClick={() => onVote("up")}
        aria-pressed={vote === "up"}
        aria-label="Да, помог"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all min-h-[44px] min-w-[44px] ${
          vote === "up"
            ? "border-sage/40 bg-sage/15 text-sage"
            : "border-border-line hover:border-sage/30 hover:text-sage"
        }`}
      >
        <ThumbsUp className="size-3" />
        Да
        {totalUp >= POSITIVE_THRESHOLD && (
          <span className="font-mono text-[10px] opacity-70">{totalUp}</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => onVote("down")}
        aria-pressed={vote === "down"}
        aria-label="Нет, не помог"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all min-h-[44px] min-w-[44px] ${
          vote === "down"
            ? "border-bordeaux/30 bg-bordeaux/5 text-bordeaux"
            : "border-border-line hover:border-bordeaux/30 hover:text-bordeaux"
        }`}
      >
        <ThumbsDown className="size-3" />
        Нет
        {totalDown >= POSITIVE_THRESHOLD && (
          <span className="font-mono text-[10px] opacity-70">{totalDown}</span>
        )}
      </button>
      <AnimatePresence>
        {vote && (
          <motion.span
            key="thanks"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25 }}
            className="inline-flex items-center gap-1 text-sage"
          >
            <Check className="size-3" />
            Спасибо за отзыв!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * FAQ section — LIGHT THEME with elegant accordion + search + category chips
 */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqItems
      .map((item, originalIndex) => ({ ...item, originalIndex }))
      .filter((item) => {
        if (category !== "all" && item.category !== category) return false;
        if (!q) return true;
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
        );
      });
  }, [query, category]);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      data-header-theme="light"
      className="section-light relative overflow-hidden bg-white py-24 md:py-32"
    >
      {/* Subtle decoration */}
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-gold/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <div className="mb-10 text-center">
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

        {/* Search-as-you-type */}
        <Reveal delay={0.1}>
          <div className="mb-5">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-ink/70"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по вопросам…"
                aria-label="Поиск по частым вопросам"
                className="w-full rounded-full border border-border-line bg-cream/60 pl-12 pr-12 py-3.5 text-base text-ink placeholder:text-ink/70 focus:border-gold/40 focus:outline-none focus:ring-2 focus:ring-gold/20 transition-colors min-h-[44px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Очистить поиск"
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex size-11 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink transition-colors min-h-[44px] min-w-[44px]"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </Reveal>

        {/* Category chips */}
        <Reveal delay={0.15}>
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all min-h-[44px] ${
                category === "all"
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border-line bg-cream/40 text-ink/70 hover:border-gold/30 hover:text-ink"
              }`}
            >
              Все
              <span className="font-mono text-[10px] text-ink/70">
                {faqItems.length}
              </span>
            </button>
            {CATEGORIES.map((c) => {
              const count = faqItems.filter((i) => i.category === c.id).length;
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all min-h-[44px] ${
                    active
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-border-line bg-cream/40 text-ink/70 hover:border-gold/30 hover:text-ink"
                  }`}
                >
                  {c.label}
                  <span className="font-mono text-[10px] text-ink/70">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Items count */}
        <div className="mb-4 text-center font-mono text-xs uppercase tracking-wider text-ink/70">
          {filtered.length === 0
            ? "Ничего не найдено"
            : `Показано ${filtered.length} из ${faqItems.length}`}
        </div>

        {/* Items list with AnimatePresence layout animation */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item, displayIndex) => {
              const isOpen = openIndex === item.originalIndex;
              return (
                <motion.div
                  key={`${item.category}-${item.originalIndex}`}
                  layout
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                      isOpen
                        ? "border-gold/30 bg-white shadow-lg shadow-gold/5"
                        : "border-border-line bg-cream/50 hover:border-gold/20"
                    }`}
                  >
                    <button
                      onClick={() => toggle(item.originalIndex)}
                      aria-expanded={isOpen ? "true" : "false"}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left group"
                    >
                      <span className="flex items-center gap-3 font-display text-lg text-ink pr-4">
                        <span
                          className={`flex size-7 items-center justify-center rounded-full text-sm font-mono transition-colors ${
                            isOpen
                              ? "bg-gradient-to-r from-gold to-terracotta text-white"
                              : "bg-gold/15 text-gold group-hover:bg-gold/25"
                          }`}
                        >
                          {String(displayIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1">
                          {highlightMatch(item.question, query)}
                        </span>
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="shrink-0 text-gold"
                      >
                        <ChevronDown className="size-5" />
                      </motion.span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 pl-16 leading-relaxed text-ink/70 text-base">
                          {highlightMatch(item.answer, query)}
                        </p>
                        {/* Was this helpful? — thumb up/down (localStorage) */}
                        <div className="px-6 pb-5 pl-16 border-t border-border-line/40 pt-3">
                          <WasHelpful question={item.question} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* CTA at bottom — for empty state or just always visible */}
        <Reveal delay={0.2}>
          <div className="mt-10 rounded-2xl border border-gold/20 bg-gradient-to-br from-cream to-cream/40 p-6 text-center">
            <p className="font-display text-lg text-ink">
              Не нашли ответ на свой вопрос?
            </p>
            <p className="mt-1 text-sm text-ink/60">
              Позвоните нам — подскажем за минуту
            </p>
            <a
              href="tel:+78129195911"
              className="mt-4 inline-flex items-center gap-2 rounded-full cta-gradient-punchy bg-gradient-to-r from-gold to-terracotta px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-gold/25 transition-transform hover:scale-[1.03] active:scale-[0.98] min-h-[44px]"
            >
              +7 (812) 919-59-11
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
