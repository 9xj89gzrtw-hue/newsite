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
  Instagram,
  Send,
  MessageCircle,
} from "lucide-react";
import {
  SOPRANOS_CITIES,
  CONTACTS,
} from "@/lib/media";
import { LEGAL_INFO, SITE_CONFIG } from "@/lib/config";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";

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
 * ~min(115vmin, 1060px), ghost ~5.5% opacity на bg-ink: белые буквы
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
 * SiteFooter — тёмный navy футер nilov catering.
 *
 * Layout (Task 2-c):
 * 1. «Сделано с любовью» (intro band, Great Vibes script + подзаголовок)
 * 2. Двухколоночный контент: Контакты (расширенная) / Навигация
 *    — колонка «Нам доверяют» и полоса подписки удалены по запросу
 *    владельца; факт «2 400+ мероприятий с 2007 года» сохранён в контактах.
 * 3. Гигантский кинетический вордмарк «NILOV CATERING.» (wow-якорь,
 *    две строки «NILOV» / «CATERING.» — ребрендинг 3-A)
 * 4. «С гордостью обслуживаем» — маркие районов СПб
 * 5. Копирайт
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
      /* isolate: stacking-context корень — spotlight с z-index:-1 живёт
         над фоном футера и под контентом; overflow-x: clip (не hidden, §2). */
      className="grain relative isolate mt-auto overflow-x-clip bg-ink text-cream"
    >
      {/* Гигантский фоновый логотип-водяной знак (z:-1, под контентом;
          в DOM РАНЬШЕ spotlight — свечение красится поверх монограммы) */}
      <FooterWatermark />

      {/* Курсорный gold-spotlight — fine-pointer + не-reduce, post-mount */}
      {mounted && !reduce && finePointer ? <FooterSpotlight /> : null}

      {/* Decorative top gold rule */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true" />

      {/* ============ Section 1 — «Сделано с любовью» intro band ============ */}
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
              Сделано с любовью
            </span>
            <Heart
              className="size-7 fill-gold text-gold"
              aria-hidden="true"
              style={{ marginBottom: "0.4rem" }}
            />
          </motion.div>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-cream/80 md:text-base">
            Семейное торжество или праздник на сотню гостей — доверьте
            кухню, сервировку и подачу нам, а сами наслаждайтесь днём в
            кругу близких. Мы позаботимся обо всём.
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
                text-xs + cream/60 = 5.81:1 на тёмном футере (замер D2). */}
            <p className="text-xs leading-relaxed text-cream/60">
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
            </div>

            {/* Соцсети — VK / MAX / Instagram / Telegram / WhatsApp.
                MAX (max.ru/nilovcatering) — российский мессенджер, бейдж
                в том же стиле, что VK (font-display-спан, не иконка). */}
            <div className="mt-2 flex items-center gap-3">
              <a
                href={CONTACTS.vkHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="nilov catering в ВКонтакте (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
                /* C78: wiggle на hover (micro-delights.css, reduce → none). */
                data-wiggle
              >
                <span className="font-display text-xs font-bold uppercase text-cream">VK</span>
              </a>
              <a
                href={CONTACTS.maxHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="nilov catering в MAX (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
                /* C78: wiggle на hover (micro-delights.css, reduce → none). */
                data-wiggle
              >
                <span className="font-display text-xs font-bold uppercase text-cream">MAX</span>
              </a>
              <a
                href={CONTACTS.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="nilov catering в Instagram (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
                /* C78: wiggle на hover (micro-delights.css, reduce → none). */
                data-wiggle
              >
                <Instagram className="size-5 text-cream" aria-hidden="true" />
              </a>
              <a
                href={CONTACTS.telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="nilov catering в Telegram (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
                /* C78: wiggle на hover (micro-delights.css, reduce → none). */
                data-wiggle
              >
                <Send className="size-5 text-cream" aria-hidden="true" />
              </a>
              <a
                href={CONTACTS.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в WhatsApp (открывается в новой вкладке)"
                className="flex size-10 items-center justify-center rounded-full border border-cream/20 transition-colors hover:border-gold hover:bg-gold/10 min-h-[44px] min-w-[44px]"
                /* C78: wiggle на hover (micro-delights.css, reduce → none). */
                data-wiggle
              >
                <MessageCircle className="size-5 text-cream" aria-hidden="true" />
              </a>
            </div>

            {/* Task 2-c: факт «2 400+ мероприятий с 2007 года» сохранён из
                удалённой колонки «Нам доверяют» — как брендовая строка-стат
                под hairline. Цифры каноничны (цикл 28 / c66-V9: 2007). */}
            <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-cream/10 pt-4">
              <span className="font-display text-2xl font-semibold tracking-wide text-gold">
                2 400+
              </span>
              <span className="text-xs uppercase tracking-wider text-cream/60">
                мероприятий с 2007 года
              </span>
            </p>
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
      </div>

      {/* ============ Section 3 — гигантский кинетический вордмарк ============
          Task 2-c: визуальный якорь на месте удалённой полосы подписки.
          Полный bleed, aria-hidden (бренд-имя читается в колонке «Контакты»),
          не heading. overflow-x: clip — гвард от горизонтального скролла.
          3-A: ДВЕ строки «NILOV» / «CATERING.» — два экземпляра
          KineticWordmark; каждая .fw-line — width:100% + flex-центрировка,
          блоки складываются в столбец без обёртки. */}
      <div className="relative overflow-x-clip px-2 pb-8 pt-2 md:pb-12">
        {WORDMARK_LINES.map((glyphs, lineIndex) => (
          <KineticWordmark
            key={`fw-row-${lineIndex}`}
            settled={settled}
            glyphs={glyphs}
            lineIndex={lineIndex}
          />
        ))}
      </div>

      {/* ============ Section 4 — «С гордостью обслуживаем» маркие ============ */}
      <div className="border-t border-cream/10 bg-ink/60">
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
          <div className="mb-4 flex flex-col items-center text-center">
            <SplitTextReveal as="h2" className="eyebrow-wide text-sm text-gold">
              С гордостью обслуживаем
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
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent md:w-24"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent md:w-24"
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
            смешивании). /60 = 5.83:1 — запас. Ссылки легала и так /60; ·
            — декоративный (aria-hidden), не текст. */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-cream/60 md:flex-row md:px-8">
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
            className="font-display tracking-wide text-cream/60 transition-colors hover:text-gold min-h-[44px] flex items-center"
          >
            {CONTACTS.phone}
          </a>
        </div>
      </div>
    </footer>
  );
}
