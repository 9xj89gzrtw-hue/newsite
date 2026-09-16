"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import {
  Phone,
  Mail,
  Heart,
  ChevronRight,
  Send,
  Youtube,
  MonitorPlay,
} from "lucide-react";
import {
  SOPRANOS_CITIES,
  CONTACTS,
  YANDEX_MAPS,
} from "@/lib/media";
import { LEGAL_INFO, SITE_CONFIG } from "@/lib/config";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
/* c83-B (Impl-B): VelocitySkew на вордмарке (§3a) + анимационный
   слой соц-иконок y-hop (§3b, site-footer-anim.css). */
import { VelocitySkew } from "@/components/motion/velocity-skew";
import "./site-footer-anim.css";

/**
 * Stable current year — computed once on mount to avoid SSR/CSR
 * hydration mismatch (server timezone vs client timezone may differ
 * across the year boundary, causing "© 2026" vs "© 2027" mismatch).
 */
function useCurrentYear() {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return year;
}

/** Nav */
const FOOTER_NAV = [
  { label: "Главная", href: "#main-content" },
  { label: "Услуги", href: "#services" },
  { label: "Меню и цены", href: "#menu" },
  { label: "Видео событий", href: "#events-video-carousel" },
  { label: "Калькулятор", href: "#calculator" },
  { label: "О компании", href: "#about" },
  { label: "Вопросы и ответы", href: "#faq" },
  { label: "Контакты", href: "#contact" },
] as const;

/** Stagger reveal container variant — columns fade up one after another. */
const columnVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.05,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
};

/** Shared premium ease (same curve as founder block / EA sections). */
const EASE = [0.22, 1, 0.36, 1] as const;

/** One pass of the cities list for the marquee. */
function CitiesTrack({ trackId = '' }: { trackId?: string }) {
  return (
    <div className="flex items-center gap-6 px-3" aria-hidden="true">
      {SOPRANOS_CITIES.map((city, i) => (
        <span
          key={`${trackId}-${city}-${i}`}
          className="flex items-center gap-3 font-display text-sm uppercase tracking-widest text-[#C9A87E]"
        >
          <span className="text-gold/60" aria-hidden="true">
            •
          </span>
          <span>{city}</span>
        </span>
      ))}
    </div>
  );
}

/* ══════════════ Task 2-c — WOW-слой футера ══════════════
   1) Гигантский кинетический вордмарк «NILOV CATERING.» (две строки
      «NILOV» / «CATERING.») — визуальный якорь
      на месте удалённой полосы подписки (newsletter удалён по запросу
      владельца). Посимвольный подъём из-под маски (whileInView stagger,
      лёгкий rotate), непрерывный золотой shimmer-сweep по буквам.
   2) Курсорный gold-spotlight — radial-gradient на MotionValues +
      rAF-spring (framer useSpring), только background/opacity,
      pointer-events-none; рендерится ТОЛЬКО на fine-pointer
      (hover:hover + pointer:fine) и вне prefers-reduced-motion.
   §34/§35 дисциплина:
   - mounted-гейт: SSR и первый клиентский рендер = полностью статичный
     футер (в SSR-разметке нет opacity:0 — no-JS видит весь контент);
   - settled = mounted && !reduce — ветвление анимационных пропсов только
     через settled; key-ремонт контейнера вордмарка при флипе settled
     («initial»
     framer-motion не перевооружается пост-монтом, §35);
   - spotlight и shimmer не рендерятся/не вешаются до mount;
   - измерения букв (shimmer-тайл) — разовые layout-reads post-mount +
     resize/fonts.ready, запись напрямую в DOM (classList/custom props),
     ноль setState на кадр; анимации: transform/opacity/background-position. */

/* Латиница «NILOV CATERING.» — чистый Oswald latin-субсет (§35: кириллический
   фоллбек не задействован). Точка — фирменный золотой акцент бренда.
   Ребрендинг 3-A (Interfood → nilov catering): ДВЕ строки «NILOV» /
   «CATERING.» — одна строка из 15 глифов Oswald при исходном
   clamp(3.4rem, 16.5vw, 17rem) из .fw-line давала бы ~130vw (горизонтальное
   переполнение), а ужимание font-size убивало бы «гигантскость» вордмарка;
   две строки сохраняют исходный масштаб без правок globals.css (файл —
   владение другого агента). Широкая строка «CATERING.» ≈ 5em × 16.5vw ≈
   82vw ≤ 100vw на всех брейкпоинтах. */
const WORDMARK_LINES = [
  ["N", "I", "L", "O", "V"],
  ["C", "A", "T", "E", "R", "I", "N", "G", "."],
] as const;

/* Варианты вордмарка (per-line). Триггер анимации — КОНТЕЙНЕР .fw-line: whileInView
   на самих буквах не работает в принципе — буква в hidden сдвинута на
   118% вниз и полностью клипается маской (overflow: clip), visible-бокс
   пуст → IntersectionObserver всегда isIntersecting=false («курица и
   яйцо»; замер live). Бокс .fw-line не клипается → IO стреляет на нём;
   лейблы variants-пропагацией доходят до букв сквозь немоушн .fw-mask
   (контекст React, DOM-вложенность не рвёт цепочку), staggerChildren
   0.055s/буква — тот же каскад, что бывший delay: i * 0.055. Вторая
   строка получает delayChildren = lineIndex × 0.26s — каскад идёт
   «волной» сверху вниз, а не двумя одновременными параллелями. */
const wordmarkLineVariants = (lineIndex: number) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: lineIndex * 0.26 } },
});

const WORDMARK_LETTER_VARIANTS = {
  hidden: { y: "118%", rotate: 7 },
  visible: {
    y: "0%",
    rotate: 0,
    transition: { duration: 0.9, ease: EASE },
  },
};

/**
 * KineticWordmark — ОДНА строка кинетического вордмарка (3-A: строк две —
 * «NILOV» и «CATERING.», рендерятся двумя экземплярами компонента).
 * Декоративный (aria-hidden; бренд-имя «nilov catering.»
 * остаётся видимым текстом в колонке «Контакты», дублирующего landmark
 * нет). Буквы поднимаются из-под clip-маски с лёгким rotate. Триггер —
 * контейнер .fw-line (initial="hidden" + whileInView="visible" +
 * staggerChildren), буквы наследуют лейблы через variants-пропагацию:
 * буква в hidden полностью клипается маской, её visible-бокс пуст и
 * СОБСТВЕННЫЙ whileInView не стреляет никогда. Settled-гейт (§34/§35):
 * до settled — ноль анимационных пропсов (SSR/no-JS/reduce видят
 * вордмарк целиком); на флипе settled контейнер ремоунтится key-ремонтом
 * (initial перевооружается только remount'ом), ключи букв стабильны.
 * Золотой shimmer — один общий градиент-тайл шириной в строку,
 * выровненный по всем буквам через измеренные --fw-sx/--fw-w,
 * анимируется CSS keyframes по background-position (гвард
 * prefers-reduced-motion: no-preference в globals.css). Ховер-подъём
 * буквы — CSS на .fw-mask (fine-pointer гвард в CSS, transform двигает
 * букву вместе с её градиентом).
 */
function KineticWordmark({
  settled,
  glyphs,
  lineIndex = 0,
}: {
  settled: boolean;
  glyphs: readonly string[];
  lineIndex?: number;
}) {
  const lineRef = useRef<HTMLDivElement>(null);
  const maskRefs = useRef<(HTMLSpanElement | null)[]>([]);

  /* Shimmer-paint: разовое измерение строки + оффсетов букв (маски —
     layout-позиции, transform ховера на offsetLeft не влияет), запись
     custom-props в буквы напрямую. Повтор — на resize (clamp vw) и
     document.fonts.ready (swap Oswald меняет метрики). Ноль ререндеров. */
  useEffect(() => {
    if (!settled) return;
    const line = lineRef.current;
    if (!line) return;
    let alive = true;
    const paint = () => {
      if (!alive) return;
      const w = Math.round(line.getBoundingClientRect().width);
      maskRefs.current.forEach((mask) => {
        if (!mask) return;
        const letter = mask.firstElementChild as HTMLElement | null;
        if (!letter || letter.classList.contains("is-dot")) return;
        letter.style.setProperty("--fw-sx", `${-Math.round(mask.offsetLeft)}px`);
        letter.style.setProperty("--fw-w", `${w}px`);
        letter.classList.add("fw-shimmer");
      });
    };
    paint();
    let raf = 0;
    const queue = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(paint);
    };
    window.addEventListener("resize", queue);
    document.fonts?.ready.then(queue);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", queue);
      maskRefs.current.forEach((mask) => {
        const letter = mask?.firstElementChild as HTMLElement | null;
        letter?.classList.remove("fw-shimmer");
      });
    };
  }, [settled]);

  return (
    /* key-ремонт (§35) на КОНТЕЙНЕРЕ: флип settled ремоунтит весь сабтри,
       initial="hidden" перевооружается. Контейнер — motion-родитель:
       initial/whileInView/viewport живут на нём (его бокс не клипается),
       лейблы «hidden»/«visible» спускаются в буквы пропагацией. Ключ —
       уникальный per-line (два экземпляра в 3-A). */
    <motion.div
      key={`fw-line-${lineIndex}-${settled ? "a" : "s"}`}
      ref={lineRef}
      className="fw-line"
      data-footer-wordmark
      aria-hidden="true"
      {...(settled
        ? {
            initial: "hidden",
            whileInView: "visible",
            viewport: { once: true, margin: "-60px 0px -40px 0px" },
            variants: wordmarkLineVariants(lineIndex),
          }
        : {})}
    >
      {glyphs.map((glyph, i) => {
        const isDot = glyph === ".";
        return (
          <span
            key={`fw-mask-${i}`}
            className="fw-mask"
            ref={(el) => {
              maskRefs.current[i] = el;
            }}
          >
            <motion.span
              /* Лейблы приходят от контейнера (пропагация сквозь немоушн
                 .fw-mask); собственных initial/whileInView у буквы НЕТ —
                 они разорвали бы пропагацию. Ключ стабильный: ремоунт
                 при флипе settled гарантирует контейнерный key. */
              key={`fw-letter-${i}`}
              className={isDot ? "fw-letter is-dot" : "fw-letter"}
              style={{ transformOrigin: "18% 100%" }}
              {...(settled ? { variants: WORDMARK_LETTER_VARIANTS } : {})}
            >
              {glyph}
            </motion.span>
          </span>
        );
      })}
    </motion.div>
  );
}

/**
 * FooterWatermark — ГИГАНТСКИЙ фоновый логотип-водяной знак «во весь
 * футер» (задача владельца, C76; C77 — замена на НАСТОЯЩИЙ логотип
 * компании по указанию владельца: растр /brand/logo-round-1024.png —
 * тот же кругляж, что в шапке/фавиконе; «векторный двойник» C76
 * монограммой НЕ был логотипом компании). Масштаб
 * ~min(115vmin, 1060px), ghost ~5.5% opacity на тёплом espresso #161312: белые буквы
 * дают крем-призрак, золотые кольца — тёплый ореол.
 *
 * Слои: z-index:-1 внутри isolate-футера (как .fw-spotlight) — над
 * фоном, ПОД контентом; в DOM стоит РАНЬШЕ spotlight → свечение
 * курсора красится ПОВЕРХ водяного знака (золотая подсветка мягко
 * «проявляет» эмблему при движении).
 *
 * Кинетика (тренд 09.2026, продолжение C74): нативный CSS scroll-driven
 * дрейф — translateY ±4% + rotate ∓2.5° по animation-timeline: view()
 * (эмблема въезжает с лёгким наклоном и оседает по мере проскролла
 * футера). Ноль JS-кадров. Деградации: @supports not → статика по
 * центру; prefers-reduced-motion → статика; печать — не печатается
 * (print-медиа). SSR-статичен (чистый CSS, §34 — не гейтится).
 * loading="lazy": футер — самый низ страницы, грузим по мере надобности.
 */
function FooterWatermark() {
  return (
    <div className="fw-watermark" aria-hidden="true">
      <img
        src="/brand/logo-round-1024.png"
        alt=""
        width={1024}
        height={1033}
        loading="lazy"
        decoding="async"
        className="fw-watermark__badge"
      />
    </div>
  );
}

/**
 * FooterSpotlight — мягкое золотое свечение, следующее за курсором.
 * Монтируется только после mount на fine-pointer вне reduce (гейт в
 * SiteFooter) — SSR-разметка не содержит этот слой. Позиция —
 * MotionValues + useSpring (rAF-цикл framer), фон собирается
 * useMotionTemplate: ноль setState на кадр. pointer-events-none.
 */
function FooterSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 150, damping: 28, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 150, damping: 28, mass: 0.6 });
  const glow = useSpring(0, { stiffness: 110, damping: 30 });
  const background = useMotionTemplate`radial-gradient(36rem circle at ${sx}px ${sy}px, color-mix(in srgb, var(--gold) 16%, transparent) 0%, transparent 68%)`;

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement; // <footer>
    if (!el || !host) return;
    /* rect кэшируется на enter/scroll/resize — pointermove читает только
       clientX/Y (ноль layout-reads на движение). */
    let rect: DOMRect | null = null;
    const cache = () => {
      rect = host.getBoundingClientRect();
    };
    const move = (e: PointerEvent) => {
      if (!rect) cache();
      if (!rect) return;
      mx.set(e.clientX - rect.left);
      my.set(e.clientY - rect.top);
    };
    const enter = (e: PointerEvent) => {
      cache();
      move(e);
      glow.set(1);
    };
    const leave = () => glow.set(0);
    host.addEventListener("pointerenter", enter);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", cache, { passive: true });
    window.addEventListener("resize", cache);
    cache();
    return () => {
      host.removeEventListener("pointerenter", enter);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", cache);
      window.removeEventListener("resize", cache);
    };
  }, [mx, my, glow]);

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className="fw-spotlight"
      style={{ background, opacity: glow }}
    />
  );
}

/**
 * SiteFooter — тёмный тёплый espresso-футер nilov catering.
 *
 * 81-W2F2 (критик E MAJOR): было bg-ink #1F2937 — холодный slate/Tailwind
 * gray-800, диссонанс с тёплыми тёмными секциями сайта (#161312 — фон
 * ea-founder-story, gg-конвейер; шапка в тёмном варианте — #161312/85).
 * Фон переведён на тот же тёплый эспрессо #161312; производные
 * (bg-ink/60 банд, from-ink фейды) — следом. Текст остаётся светлым
 * (cream/gold — контрасты только выросли, см. K2-комментарий ниже).
 *
 * Layout (Task 2-c; c89 — полоса реквизитов + карта):
 * 1. «Накрыто с любовью» (intro band, Marck Script + подзаголовок;
 *    c86-D: было «Сделано с любовью» — фраза переписана под суть
 *    кейтеринга — накрыть на стол)
 * 2. Двухколоночный контент: Контакты (расширенная) / Навигация
 *    — колонка «Нам доверяют» и полоса подписки удалены по запросу
 *    владельца; c86-D: стат «2 400+ мероприятий с 2007 года» снят
 *    (de-numbering — владелец уводит сайт от чисел).
 *    c89 в контактах: строка «Макс» (+7 911 826-39-26) под основным
 *    телефоном; соц-ряд = 5 профилей (Instagram* · VK · Телеграм
 *    канал · YouTube · Rutube, мессенджеры убраны в «Напишите нам»).
 * 2R. Реквизиты (c89): dl ИП + счёта ТБанка (LEGAL_INFO + .bank).
 * 3. Гигантский кинетический вордмарк «NILOV CATERING.» (wow-якорь,
 *    две строки «NILOV» / «CATERING.» — ребрендинг 3-A)
 * 3M. Яндекс.Карта офиса (c89: перенесена из зоны контактов в подвал).
 * 4. «Накрываем столы по всему городу» — маркие районов СПб
 * 5. Копирайт + RF-сноска Instagram* (c86-D: маркер — на кнопке
 *    Instagram* в соц-строке, сноска Meta — последней строкой футера)
 */
export function SiteFooter() {
  const year = useCurrentYear();
  const reduce = useReducedMotion();
  // C62 hydration-safety: reduce/fine branches (motionProps + wordmark
  // settled + spotlight tree) resolve only after mount — useReducedMotion()
  // is false at SSR and true on a reduce-user's first client render; a
  // direct branch = hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const reduceSettled = mounted && reduce;
  // §34: settled-ветка (анимации включены) — только post-mount и вне reduce.
  const settled = mounted && !reduce;
  const motionProps = reduceSettled
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-80px" } };

  return (
    <footer
      role="contentinfo"
      data-header-theme="dark"
      aria-label="Подвал сайта"
      /* 81-W2F2: isolate: stacking-context корень — spotlight с z-index:-1 живёт
         над фоном футера и под контентом; overflow-x: clip (не hidden, §2).
         bg-[#161312] — тёплый эспрессо тёмных секций (было bg-ink #1F2937 —
         холодный slate, критик E MAJOR волна-2). */
      className="grain relative isolate mt-auto overflow-x-clip bg-[#161312] text-cream"
    >
      {/* Гигантский фоновый логотип-водяной знак (z:-1, под контентом;
          в DOM РАНЬШЕ spotlight — свечение красится поверх монограммы) */}
      <FooterWatermark />

      {/* Курсорный gold-spotlight — fine-pointer + не-reduce, post-mount */}
      {mounted && !reduce && finePointer ? <FooterSpotlight /> : null}

      {/* Decorative top gold rule */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true" />

      {/* ============ Section 1 — «Накрыто с любовью» intro band ============
          c86-D: было «Сделано с любовью» — заменено на кейтеринговую
          правду: накрывать на стол — суть ремесла. Скрипт/анимация
          (Marck Script, золотая надпись + сердце, motion-каскад) — без
          изменений. */}
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-10 text-center md:px-8 md:pt-20">
        <motion.div
          {...motionProps}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <motion.div
            {...motionProps}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span
              className="font-script text-gold"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
            >
              Накрыто с любовью
            </span>
            <Heart
              className="size-7 fill-gold text-gold"
              aria-hidden="true"
              style={{ marginBottom: "0.4rem" }}
            />
          </motion.div>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-cream/80 md:text-base">
            Семейное торжество или большой праздник — мы накроем,
            сервируем и подадим, а вы наслаждайтесь днём в кругу близких.
            Мы позаботимся обо всём.
          </p>
        </motion.div>
      </div>

      {/* ============ Section 2 — Two-column main content ============
          Task 2-c: колонка «Нам доверяют» удалена; сетка перебалансирована
          5/12 → контакты шире и богаче (визуальный вес бренда), навигация —
          компактная правая колонка с hairline-разделителем. */}
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-5 md:gap-8 lg:gap-10">
          {/* ---- Column 1: Контакты (широкая, витринная) ---- */}
          <motion.section
            {...motionProps}
            custom={0}
            variants={columnVariants}
            aria-labelledby="footer-contact-heading"
            className="flex flex-col gap-4 md:col-span-3"
          >
            <h2
              id="footer-contact-heading"
              className="eyebrow-wide text-sm text-gold"
            >
              Контакты
            </h2>

            <span className="font-display text-3xl font-bold uppercase tracking-[0.02em] text-cream">
              nilov catering<span className="text-gold">.</span>
            </span>

            <address className="not-italic text-sm leading-relaxed text-cream/80">
              {LEGAL_INFO.legalName}
              <br />
              {/* Cycle 65: витринный адрес офиса (владелец: контакты теперь
                  Полевая-Сабировская 45к1). Полный юридический — в /privacy,
                  /terms, /offer (LEGAL_INFO.legalAddress). */}
              {CONTACTS.address}
            </address>

            {/* W3 (K5 MAJOR, задача 4): легенда трёх адресов. Критик K5:
                «Полевая-Сабировская 45к1 (footer) vs Большая Морская 18/33
                (оферта) vs студия на Петроградке (FAQ) — три адреса без
                пояснения». Легенда связывает витринный адрес офиса (выше) с
                юридическим (LEGAL_INFO.legalAddress — тот же источник, что
                /offer) — адреса сами НЕ меняются. Назначение Полевой не
                выдумываем: на сайте (llms.txt/config) она = «офис», поэтому
                просто связка. Студия на Петроградке живёт в своём контексте
                (FAQ/услуги дегустации) — легенда не трогает.
                c89 (читаемость для пожилых): text-sm (14px) + cream/60 —
                бывший 13px-кегль поднят до шкалы 0.875rem+. */}
            <p className="text-sm leading-relaxed text-cream/60">
              Юридический адрес: {LEGAL_INFO.legalAddress} — реквизиты в{" "}
              <a
                href="/offer"
                className="underline-offset-2 transition-colors hover:text-gold hover:underline"
              >
                оферте
              </a>
              .
            </p>

            <div className="flex flex-col gap-2 text-sm">
              <a
                href={`mailto:${CONTACTS.email}`}
                className="group inline-flex items-center gap-2 text-cream/80 transition-colors hover:text-gold min-h-[44px]"
              >
                <Mail
                  className="size-4 text-gold/70 transition-transform group-hover:rotate-12"
                  aria-hidden="true"
                />
                {CONTACTS.email}
              </a>
              <a
                href={CONTACTS.phoneHref}
                className="group inline-flex items-center gap-2 text-lg font-semibold text-cream transition-colors hover:text-gold min-h-[44px]"
              >
                <Phone
                  className="size-4 text-gold/70 transition-transform group-hover:rotate-12"
                  aria-hidden="true"
                />
                {CONTACTS.phone}
              </a>
              {/* c89 (владелец): строка «Макс» — второй номер компании
                  (+7 911 826-39-26, CONTACTS.maxPhone). Ссылка —
                  CONTACTS.maxHref (c92: реальный профиль в MAX от владельца,
                  см. config.ts). Визуально — вторая ступень телефонной
                  иерархии: тот же Phone-глиф, кегль text-sm (не lg),
                  метка «Макс:» приглушена. */}
              <a
                href={CONTACTS.maxHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-cream/80 transition-colors hover:text-gold min-h-[44px]"
              >
                <Phone
                  className="size-4 text-gold/70 transition-transform group-hover:rotate-12"
                  aria-hidden="true"
                />
                <span className="text-cream/60">Макс:</span> {CONTACTS.maxPhone}
              </a>
            </div>

            {/* Соцсети (c89, владелец): пять публичных профилей в порядке
                письма — Instagram* · VK · Телеграм канал · YouTube · Rutube.
                WhatsApp и Telegram-ЧАТ убраны из ряда — это мессенджеры
                «Напишите нам» зоны контактов, а не соцсети (футер компактнее).
                Все пять — ЕДИНАЯ идиома подписанных пилюль h-10 px-3.5
                (читаемость для пожилых: подпись видимой текстом, не только
                иконкой; flex-wrap переносит ряд на узких экранах без
                overflow). Instagram — RF-маркер «*» (сноска Meta — последней
                строкой футера). Rutube-канала пока нет — ссылка на поиск
                Rutube по бренду (CONTACTS.rutubeHref, см. config.ts).
                c83-B (Impl-B, задача 3b): y-hop глифа — подъём -4px +
                заливка золотом на hover/focus-visible (CSS в
                site-footer-anim.css; гейты fine-pointer + no-preference).
                fw-soc__glyph стоит и на иконке, и на подписи — поднимаются
                вместе. data-wiggle ЗАМЕНЁН на hop (разрешение задачи при
                конфликте: wiggle — CSS-анимация transform rotate+scale на
                ТОЙ ЖЕ кнопке по ТОМУ ЖЕ hover — два жеста конкурировали бы
                на одном триггере); data-press сохранён. */}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {/* c86-D: RF-маркер «Instagram*» видимой подписью —
                  звёздочка золотом (8.2:1 на espresso), текст кремом
                  (17:1). aria-label чистый — скринридеру звёздочка
                  не нужна. Текст-бейдж: слово — сам маркер. */}
              <a
                href={CONTACTS.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="nilov catering в Instagram (открывается в новой вкладке)"
                className="fw-soc flex h-10 items-center justify-center rounded-full border border-cream/20 px-3.5 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px]"
                /* C79: тач-нажатие — WAAPI-пружина (MicroDelights,
                    reduce → none). c83-B: wiggle → y-hop (см. докблок ряда). */
                data-press
              >
                <span className="fw-soc__glyph font-display text-xs font-bold text-cream">
                  Instagram<span className="text-gold">*</span>
                </span>
              </a>
              <a
                href={CONTACTS.vkHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="nilov catering в ВКонтакте (открывается в новой вкладке)"
                className="fw-soc flex h-10 items-center justify-center rounded-full border border-cream/20 px-3.5 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px]"
                /* C79: тач-нажатие — WAAPI-пружина (MicroDelights,
                    reduce → none). */
                data-press
              >
                <span className="fw-soc__glyph font-display text-xs font-bold uppercase text-cream">VK</span>
              </a>
              {/* c89: Телеграм-КАНАЛ @nilov_catering (c92, от владельца;
                  личный чат-диплинк убран вместе с WhatsApp — см. докблок). */}
              <a
                href={CONTACTS.telegramChannelHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Телеграм-канал nilov catering (открывается в новой вкладке)"
                className="fw-soc flex h-10 items-center justify-center gap-2 rounded-full border border-cream/20 px-3.5 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px]"
                /* C79: тач-нажатие — WAAPI-пружина (MicroDelights,
                    reduce → none). c83-B: wiggle → y-hop (см. докблок ряда). */
                data-press
              >
                <Send className="fw-soc__glyph size-4 text-cream" aria-hidden="true" />
                <span className="fw-soc__glyph font-display text-xs font-bold text-cream">
                  Телеграм канал
                </span>
              </a>
              {/* c89: YouTube-канал @nilovcatering (CONTACTS.youtubeHref). */}
              <a
                href={CONTACTS.youtubeHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube-канал nilov catering (открывается в новой вкладке)"
                className="fw-soc flex h-10 items-center justify-center gap-2 rounded-full border border-cream/20 px-3.5 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px]"
                /* C79: тач-нажатие — WAAPI-пружина (MicroDelights,
                    reduce → none). c83-B: wiggle → y-hop (см. докблок ряда). */
                data-press
              >
                <Youtube className="fw-soc__glyph size-4 text-cream" aria-hidden="true" />
                <span className="fw-soc__glyph font-display text-xs font-bold text-cream">YouTube</span>
              </a>
              {/* c89: Rutube (MonitorPlay + подпись) — канала нет, ссылка
                  на поиск по бренду (см. докблок ряда). */}
              <a
                href={CONTACTS.rutubeHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Rutube — видео nilov catering (открывается в новой вкладке)"
                className="fw-soc flex h-10 items-center justify-center gap-2 rounded-full border border-cream/20 px-3.5 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px]"
                /* C79: тач-нажатие — WAAPI-пружина (MicroDelights,
                    reduce → none). c83-B: wiggle → y-hop (см. докблок ряда). */
                data-press
              >
                <MonitorPlay className="fw-soc__glyph size-4 text-cream" aria-hidden="true" />
                <span className="fw-soc__glyph font-display text-xs font-bold text-cream">Rutube</span>
              </a>
            </div>

            {/* c86-D: стат «2 400+ мероприятий с 2007 года» удалён —
                de-numbering (владелец уводит сайт от чисел); hairline
                под ним ушёл вместе с блоком, колонка заканчивается
                соц-строкой с помеченным Instagram*. */}
          </motion.section>

          {/* ---- Column 2: Навигация (компактная, hairline слева) ---- */}
          <motion.nav
            {...motionProps}
            custom={1}
            variants={columnVariants}
            aria-labelledby="footer-nav-heading"
            className="flex flex-col gap-4 md:col-span-2 md:border-l md:border-cream/10 md:pl-8 lg:pl-10"
          >
            <h2
              id="footer-nav-heading"
              className="eyebrow-wide text-sm text-gold"
            >
              Навигация
            </h2>
            <ul className="flex flex-col gap-1">
              {FOOTER_NAV.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 py-1.5 text-sm text-cream/80 transition-colors hover:text-gold min-h-[44px]"
                  >
                    <ChevronRight
                      className="size-3 text-gold/60 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        </div>

        {/* ---- Реквизиты ИП + счёта (c89, владелец дал полные банковские
              реквизиты) — полоса под контактной сеткой, до вордмарка/карты.
              Все значения — из config (LEGAL_INFO + LEGAL_INFO.bank), ноль
              дублей: смена реквизитов в одном месте обновляет футер и
              юр-документы. dl → 2 колонки (sm:grid-cols-2, мобайл — одна),
              ячейка = метка над значением (длинные адреса переносятся без
              обрезки). Кегль text-sm (14px ≥ 0.85rem) — читаемость для
              пожилых; числа — tabular-nums, реквизиты копируют из браузера
              без рваных разрядов. Название организации собрано из legalName
              (капс — конвенция банковских реквизитов, как в письме
              владельца). Reveal — тем же stagger-каскадом, что колонки
              выше (custom={2}). */}
        <motion.section
          {...motionProps}
          custom={2}
          variants={columnVariants}
          aria-labelledby="footer-req-heading"
          className="mt-12 border-t border-cream/10 pt-8 md:mt-14"
        >
          <h2
            id="footer-req-heading"
            className="eyebrow-wide text-sm text-gold"
          >
            Реквизиты
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-10 gap-y-3 text-sm leading-relaxed sm:grid-cols-2">
            <div className="flex flex-col">
              <dt className="text-cream/60">Название организации</dt>
              <dd className="tabular-nums text-cream/85">
                {`ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ ${LEGAL_INFO.legalName.toUpperCase()}`}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">Юридический адрес</dt>
              <dd className="text-cream/85">{LEGAL_INFO.legalAddress}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">ИНН</dt>
              <dd className="tabular-nums text-cream/85">{LEGAL_INFO.inn}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">ОГРН/ОГРНИП</dt>
              <dd className="tabular-nums text-cream/85">{LEGAL_INFO.ogrn}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">Расчетный счет</dt>
              <dd className="tabular-nums text-cream/85">
                {LEGAL_INFO.bank.account}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">Банк</dt>
              <dd className="text-cream/85">{LEGAL_INFO.bank.name}</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">ИНН банка</dt>
              <dd className="tabular-nums text-cream/85">
                {LEGAL_INFO.bank.inn}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">БИК банка</dt>
              <dd className="tabular-nums text-cream/85">
                {LEGAL_INFO.bank.bik}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">Корр. счет</dt>
              <dd className="tabular-nums text-cream/85">
                {LEGAL_INFO.bank.corrAccount}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-cream/60">Адрес банка</dt>
              <dd className="text-cream/85">{LEGAL_INFO.bank.address}</dd>
            </div>
          </dl>
        </motion.section>
      </div>

      {/* ============ Section 3 — гигантский кинетический вордмарк ============
          Task 2-c: визуальный якорь на месте удалённой полосы подписки.
          Полный bleed, aria-hidden (бренд-имя читается в колонке «Контакты»),
          не heading. overflow-x: clip — гвард от горизонтального скролла.
          3-A: ДВЕ строки «NILOV» / «CATERING.» — два экземпляра
          KineticWordmark; каждая .fw-line — width:100% + flex-центрировка,
          блоки складываются в столбец без обёртки.
          c83-B (Impl-B): контейнер обёрнут VelocitySkew — «живой материал»:
          при быстрой прокрутке вордмарк чуть «запинается» (skewY, кламп
          ±4° fine / ±3° coarse — MotionValue-цепочка scroll-velocity →
          spring, transform-only, ноль ререндеров; работает и на тач-скролле
          — velocity считается от scrollY, не от указателя). В покое — 0°
          (тождественный transform, SSR-идентично). reduce-гейт внутри
          утилиты (обёртка без skewY). IO-триггер .fw-line (whileInView)
          и shimmer-измерения (offsetLeft/getBoundingClientRect — по ширине
          skewY не меняет) не затронуты; SplitTextReveal ниже (§4) — вне
          обёртки, работает как раньше. */}
      <VelocitySkew className="relative overflow-x-clip px-2 pb-8 pt-2 md:pb-12">
        {WORDMARK_LINES.map((glyphs, lineIndex) => (
          <KineticWordmark
            key={`fw-row-${lineIndex}`}
            settled={settled}
            glyphs={glyphs}
            lineIndex={lineIndex}
          />
        ))}
      </VelocitySkew>

      {/* ============ Section 3M — Яндекс.Карта офиса (c89) ============
          Владелец: карту из зоны контактов либо убрать, либо перенести
          «в самый подвал» — выбрали подвал (зона контактов разгружена,
          3-e снял оттуда LazyMap). Простой lazy-iframe (YANDEX_MAPS.
          embedSrc из media.ts — единый источник с CONTACTS.address):
          никакого tap-to-activate — карта сразу интерактивна, loading=
          "lazy" не тянет виджет до скролла к подвалу. Высота 260/320px,
          скруглённые углы + тонкая рамка cream/15 — тёмная эстетика
          футера. Подпись-строка: адрес (YANDEX_MAPS.address) + ссылка
          «открыть в Яндекс.Картах» (YANDEX_MAPS.href — короткая ссылка
          владельца). sandbox — минимальный набор для map-виджета
          (скрипты + same-origin + presentation; попапы виджета не
          нужны). Заголовок «Как нас найти» — eyebrow-идиома «Контактов»
          /«Навигации»/«Реквизитов», по центру — как-header районов. */}
      <div className="border-t border-cream/10">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
          <div className="mb-4 flex flex-col items-center text-center">
            <SplitTextReveal as="h2" className="eyebrow-wide text-sm text-gold">
              Как нас найти
            </SplitTextReveal>
            <p className="mt-2 text-sm text-cream/70">
              {YANDEX_MAPS.address} ·{" "}
              <a
                href={YANDEX_MAPS.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold underline-offset-2 transition-colors hover:text-cream hover:underline"
              >
                открыть в Яндекс.Картах
              </a>
            </p>
          </div>
          <iframe
            src={YANDEX_MAPS.embedSrc}
            title="Nilov Catering на карте — ул. Полевая Сабировская, 45, к. 1"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[260px] w-full rounded-2xl border border-cream/15 md:h-[320px]"
          />
        </div>
      </div>

      {/* ============ Section 4 — районы (c86-CRIT3: калкур
          «С гордостью обслуживаем» → «Накрываем столы по всему городу») ============ */}
      <div className="border-t border-cream/10 bg-[#161312]/60">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="mb-4 flex flex-col items-center text-center">
            <SplitTextReveal as="h2" className="eyebrow-wide text-sm text-gold">
              Накрываем столы по всему городу
            </SplitTextReveal>
            <p className="mt-2 text-sm text-cream/70">
              Санкт-Петербург и пригороды · Ленинградская область — выезд по договорённости
            </p>
          </div>

          {reduceSettled ? (
            // Reduced motion: static wrap of cities, no animation
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {SOPRANOS_CITIES.map((city, i) => (
                <span
                  key={`static-${city}-${i}`}
                  className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-[#C9A87E]"
                >
                  <span className="text-gold/60" aria-hidden="true">
                    •
                  </span>
                  <span>{city}</span>
                </span>
              ))}
            </div>
          ) : (
            <div
              className="marquee-pause relative flex overflow-hidden"
              role="presentation"
              style={{
                maskImage:
                  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              }}
            >
              {/* Edge fade masks */}
              <div
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#161312] to-transparent md:w-24"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#161312] to-transparent md:w-24"
                aria-hidden="true"
              />
              {/* Duplicated track — translateX(-50%) loops seamlessly */}
              <div className="marquee-track-logos flex">
                <CitiesTrack trackId="a" />
                <CitiesTrack trackId="b" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ Section 5 — Копирайт ============ */}
      <div className="border-t border-cream/10">
        {/* F4 / K2 (контрасты): копирайт-строка была text-cream/50 на bg-ink
            #1F2937 — 4.52:1 в srgb-миксе, но Tailwind-4 `/50` миксует в
            oklab — на грани 4.5 (замер K2 ~4.5, риск FAIL при другом
            смешивании). /60 = 5.83:1 — запас. 81-W2F2: фон теперь тёплый
            эспрессо #161312 (темнее прежнего slate) — контрасты /60 и
            gold только выросли (cream/60 ≈6.6:1, gold ≈8.2:1). Ссылки
            легала и так /60; · — декоративный (aria-hidden), не текст. */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-[13px] text-cream/60 md:flex-row md:px-8">
          <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4">
            <p className="text-center md:text-left">
              {/* FIX-5 (W1-D NIT): SITE_CONFIG.brandName несёт фирменную
                  хвостовую точку («nilov catering.») — уместную в вордмарке,
                  но дающую «nilov catering.,» в копирайте. Здесь бренд без
                  точки; config.ts не трогаем (чужой файл). */}
              © {year ?? 2025} {SITE_CONFIG.brandName.replace(/\.$/, "")}, Санкт-Петербург · Все права защищены
            </p>
            {/* Cycle 39 fix: legal document links — /offer was an orphan page,
                /terms required by the cookie banner. */}
            <span className="hidden md:inline text-cream/30" aria-hidden="true">·</span>
            <nav aria-label="Юридические документы" className="flex items-center gap-4">
              <a
                href="/offer"
                className="py-2 text-cream/60 underline-offset-2 transition-colors hover:text-gold hover:underline"
              >
                Публичная оферта
              </a>
              <a
                href="/terms"
                className="py-2 text-cream/60 underline-offset-2 transition-colors hover:text-gold hover:underline"
              >
                Пользовательское соглашение
              </a>
              <a
                href="/privacy"
                className="py-2 text-cream/60 underline-offset-2 transition-colors hover:text-gold hover:underline"
              >
                Политика конфиденциальности
              </a>
            </nav>
          </div>
          <a
            href={CONTACTS.phoneHref}
            className="font-display text-sm tracking-wide text-cream/60 transition-colors hover:text-gold min-h-[44px] flex items-center"
          >
            {CONTACTS.phone}
          </a>
        </div>

        {/* c86-D: RF legal footnote — Instagram* помечен в соц-строке
            (колонка «Контакты»), сноска стоит тем же экраном, последняя
            строка футера. cream/60 на #161312 ≈ 5.9–6.6:1 (замеры D2 /
            c84-F3, oklab/srgb-микс) — AA для мелкого кегля; c89
            (читаемость для пожилых): 12px мобайл → 13px на всех
            вьюпортах; max-w-2xl — читаемая мера, перенос по пробелам. */}
        <p
          data-ig-note
          className="mx-auto max-w-2xl px-5 pb-6 text-center text-[13px] leading-relaxed text-cream/60"
        >
          *Instagram принадлежит компании Meta, признанной экстремистской
          организацией; её деятельность запрещена на территории Российской
          Федерации.
        </p>
      </div>
    </footer>
  );
}
