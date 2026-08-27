"use client";

/**
 * HaccMenu — «Каталог меню» (Cycle 58: полный редизайн блока меню)
 * ---------------------------------------------------------------------------
 * Задача: блок «Меню» в том же дизайн-языке, что и блок «Услуги»
 * (hacc-services, gammacatering.com-механика): тот же горизонтальный
 * аккордеон-«корешки», те же пастельные тинты, Marck Script-заголовки,
 * магнитная CTA, ambient-подсветка секции.
 *
 * Один рэк из семи каталогов (Фуршет → Обеды в офис). Открытая панель:
 *
 *   ┌ tag ───────── Marck Script title ───────── цена ┐
 *   │ фото пакета          │ Базовый / Стандарт / Премиум │
 *   │ (Ken Burns +         │ список блюд гамма-строками   │
 *   │  параллакс мыши)     │ (волосяные линейки, вес)     │
 *   │                      │ «включено» с галочками от    │
 *   │                      │ руки (gamma service-grid)    │
 *   └ hook ────────────────────────── магнитная CTA ┘
 *
 * gamma mechanics (как в hacc-services):
 *  - flex-basis = ширина закрытого корешка, flex-grow 0→1 открывает
 *    (620ms easeInOutSine)
 *  - открытая панель: JS-измеренная ФИКСИРОВАННАЯ px-ширина — ноль
 *    reflow посреди анимации; .is-resizing guard на resize
 *  - full-bleed рэк (edge-to-edge), эксклюзивность: одна панель открыта
 *  - hover-intent открытие (380ms, fine pointer), APG-аккордеон a11y,
 *    inert на закрытых панелях, мобильный toggle-close + scrollIntoView
 *
 * Что перенесено из блоков услуг как есть: entrance-каскад корешков,
 * script-title settle (−6°), весенний параллакс фото, магнитная CTA,
 * ambient tint wash секции, prefers-reduced-motion / print / forced-colors.
 *
 * Что отличает меню от услуг (осознанно):
 *  - БЕЗ автоплея: меню — поверхность ЧТЕНИЯ, ротация категорий каждые
 *    6.5s сбивала бы читающего (WCAG 2.2.2 и просто честность).
 *  - БЕЗ номеров на корешках (заповедь 4: юзер дважды спрашивал «зачем»).
 *  - Пакеты (Базовый/Стандарт/Премиум) — табы, не аккордеон: гамма
 *    показывает ОДНУ вещь за раз; фото панели следует за выбранным пакетом.
 *  - Список блюд — донорский паттерн gamma `.service-section__list`:
 *    одноколоночные строки с волосяной линейкой, без карточек и точек.
 *  - Скачивание PDF всего каталога — одна ссылка в шапке секции
 *    (generateMenuPdf("all")), а не семь дублирующих кнопок.
 *
 * Умершие элементы старого блока (и почему):
 *  - тёмный hero «фирменные блюда» — дублировал панели и стоящий выше
 *    GammaMarquee; еда теперь в больших полотнах внутри панелей;
 *  - эвристические фильтры «веган/глютен/халяль» (угадывание по названию
 *    блюда = вранье; премиум-модель: состав обсуждается с менеджером);
 *  - раскрытие пакетов аккордеоном (заменено табами).
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight, Download, MousePointer2, Plus } from "lucide-react";

import { SmartImage } from "@/components/media/smart-image";
import { Magnetic } from "@/components/motion/magnetic";
import { MENU_TYPES, formatRUB, type MenuType } from "@/lib/pricing";
import { generateMenuPdf } from "@/lib/pdf-client";
import "./hacc-menu.css";

/* ------------------------------------------------------------------ config */

const EASE = [0.22, 1, 0.36, 1] as const;
/** Baymard: hover-intent delay — раскрытие при «проживании» на корешке. */
const HOVER_INTENT_MS = 380;
const DESKTOP_MQ = "(min-width: 1024px)";

/** Тёплый пергаментный placeholder 8×8 (тот же приём, что в hacc-services). */
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNGNUY1RUUyIi8+PC9zdmc+";

/* ----------------------------------------------------------------- content */

interface MenuCat extends MenuType {
  /** Пастельный тинт панели — из палитры блока услуг (визуальная связь). */
  tint: string;
  ctaLabel: string;
  ctaHref: string;
  /** «за гостя» / «за человека» / «за порцию» — подпись под ценой. */
  priceLabel: string;
  /** Сниматель возражения одной строкой под хуком (симуляции клиентов C59). */
  hookNote?: string;
}

/**
 * Мета по каждому каталогу. Тинты взяты из палитры hacc-services —
 * категория меню наследует цвет «своего» формата услуг (фуршет = фуршет).
 */
const META: Record<
  string,
  {
    tint: string;
    ctaLabel: string;
    ctaHref: string;
    priceLabel?: string;
    hookNote?: string;
  }
> = {
  buffet: { tint: "#F5EEE2", ctaLabel: "Рассчитать фуршет", ctaHref: "#calculator" },
  banquet: {
    tint: "#F6E0DB",
    ctaLabel: "Рассчитать банкет",
    ctaHref: "#calculator",
    // симуляция C59 (Виктор, 25 гостей): минимум «от 30» не должен повисать;
    // Мила (W6): крючок «дегустация» рядом с CTA (дегустация есть в FAQ)
    hookNote:
      "Меньше 30 гостей? Соберём и на такую компанию — посчитаем индивидуально. Доступна дегустация банкетного меню — детали при расчёте.",
  },
  "snack-box": {
    tint: "#E6EBDF",
    ctaLabel: "Заказать наборы",
    ctaHref: "#calculator",
    priceLabel: "за гостя",
  },
  "coffee-break": { tint: "#F4DECD", ctaLabel: "Заказать кофе-брейк", ctaHref: "#calculator" },
  vegetarian: {
    tint: "#F6E9C9",
    ctaLabel: "Обсудить меню",
    ctaHref: "#contact",
    // симуляция C59 (Анастасия/жюри-W3): мостик «вегетарианцы на общем банкете»
    hookNote:
      "Включим вегетарианские позиции и в общий банкет: смешанный состав — это норма.",
  },
  bbq: { tint: "#F3E3E8", ctaLabel: "Рассчитать барбекю", ctaHref: "#calculator" },
  "office-lunch": {
    tint: "#F5EEE2",
    ctaLabel: "Заказать обеды",
    ctaHref: "#contact",
    priceLabel: "за порцию",
    // симуляция C59 (Елена): ответ про регулярность без выдуманных фактов
    hookNote:
      "Меню на неделю соберём под ваш офис: согласуем дни доставки и состав наборов.",
  },
};

const FALLBACK_META = {
  tint: "#F5EEE2",
  ctaLabel: "Обсудить меню",
  ctaHref: "#contact",
  priceLabel: "за гостя",
};

/** Если у пакета нет фото — показываем проверенный фуршетный кадр. */
const FALLBACK_PHOTO = "/media/furshet-1.jpg";

/** Автозаметка-сниматель для ЛЮБОГО каталога: минимум гостей не должен
    повисать вопросом (симуляции C59: Виктор 25, Ольга 14, Светлана 8).
    Явный hookNote из META имеет приоритет. */
function hookNoteFor(cat: MenuCat): string | undefined {
  return `Меньше ${cat.minGuests} гостей? Посчитаем индивидуально — позвоните или оставьте заявку.`;
}

/** Калькулятор читает ?type=… через nuqs (подхватывает history.replaceState). */
function presetCalculator(typeId: string, guests: number) {
  if (typeof window === "undefined") return;
  window.history.replaceState(null, "", `/?type=${typeId}&guests=${guests}#calculator`);
}

const MENUS: MenuCat[] = MENU_TYPES.map((m) => {
  const meta = META[m.id] ?? FALLBACK_META;
  return { ...m, ...meta, priceLabel: meta.priceLabel ?? "за гостя" };
});

/** Минимум банкетного каталога — для примера бюджета в приписке (из данных). */
const banquetPerGuest =
  MENU_TYPES.find((m) => m.id === "banquet")?.perGuest ?? 4470;

/** «от 20 гостей»: 21/101 → «гостя», остальное → «гостей». */
function guestsLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word = mod10 === 1 && mod100 !== 11 ? "гостя" : "гостей";
  return `от ${n} ${word}`;
}

/* ----------------------------------------------------- hand-drawn check ✎ */

/** SVG-«галочка от руки» — приём из gamma service-section grid. */
function HandCheck() {
  return (
    <svg
      className="hmenu__check"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.5 8.6c1.5 1.4 2.8 3 3.6 4.4C7.7 9.4 10.4 5 13.9 2.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------ rack (7 шт.) */

function MenuRack({
  cats,
  reduced,
  onOpenChange,
}: {
  cats: MenuCat[];
  reduced: boolean | null;
  /** Открытая категория → секции (для ambient wash). */
  onOpenChange: (i: number | null) => void;
}) {
  const baseId = useId();

  const rackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spineRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const N = cats.length;

  /** Одна панель открыта (SSR: первая — как в услугах). null = все закрыты. */
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  /** Выбранный пакет на категорию — память не сбрасывается при переключении. */
  const [pkgs, setPkgs] = useState<Record<string, number>>({});

  /** ≥1024px + fine pointer → hover-intent + параллакс разрешены. */
  const [desktopFine, setDesktopFine] = useState(false);

  const openIndexRef = useRef<number | null>(openIndex);
  useEffect(() => {
    openIndexRef.current = openIndex;
  }, [openIndex]);

  /* докладываем секции активную категорию (ambient wash) ------------------ */
  useEffect(() => {
    onOpenChange(openIndex);
  }, [openIndex, onOpenChange]);

  /* media queries ---------------------------------------------------------- */
  useEffect(() => {
    const fine = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const update = () => setDesktopFine(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);

  /* gamma: JS-измерение ширины открытой панели (px, без reflow) ------------ */
  useEffect(() => {
    const rack = rackRef.current;
    if (!rack) return;
    let raf = 0;
    let timer = 0;
    let prevW = -1;

    const measure = () => {
      const cs = getComputedStyle(rack);
      const spine = parseFloat(cs.getPropertyValue("--hmenu-spine")) || 0;
      const spineOpen = parseFloat(cs.getPropertyValue("--hmenu-spine-open")) || 0;
      const gap = parseFloat(cs.getPropertyValue("--hmenu-gap")) || 0;
      const w = rack.clientWidth - (N - 1) * (spine + gap) - spineOpen;
      rack.style.setProperty("--hmenu-panel-w", `${Math.max(w, 0)}px`);
    };

    const onResize = () => {
      if (!window.matchMedia(DESKTOP_MQ).matches) return;
      rack.classList.add("is-resizing");
      measure();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => rack.classList.remove("is-resizing"), 140);
    };

    measure();
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? -1;
      if (w === prevW) return; // высотные (мобильные) события игнорируем
      prevW = w;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(onResize);
    });
    ro.observe(rack);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      window.cancelAnimationFrame(raf);
    };
  }, [N]);

  /* open(): единственная точка входа (объявлена ДО hover-intent) ----------- */
  const scrollTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(scrollTimer.current), []);

  const open = useCallback(
    (i: number, manual: boolean) => {
      if (i < 0 || i >= N) return;
      if (openIndexRef.current === i) {
        // Мобильный: крестик обещает toggle — закрываем (в услугах так же).
        if (
          typeof window !== "undefined" &&
          !window.matchMedia(DESKTOP_MQ).matches
        ) {
          setOpenIndex(null);
        }
        return;
      }
      setOpenIndex(i);
      // Мобильный: скроллим к свежераскрытой панели ПОСЛЕ конца анимации.
      if (
        typeof window !== "undefined" &&
        !window.matchMedia(DESKTOP_MQ).matches &&
        !reduced
      ) {
        window.clearTimeout(scrollTimer.current);
        scrollTimer.current = window.setTimeout(() => {
          itemRefs.current[i]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 600);
      }
    },
    [N, reduced],
  );

  /* hover-intent (desktop, fine pointer) ----------------------------------- */
  const hoverTimer = useRef(0);
  const onSpineEnter = useCallback(
    (i: number) => {
      if (!desktopFine || reduced) return;
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = window.setTimeout(() => {
        if (i !== openIndexRef.current) open(i, false);
      }, HOVER_INTENT_MS);
    },
    [desktopFine, reduced, open],
  );
  const clearHoverIntent = useCallback(() => {
    window.clearTimeout(hoverTimer.current);
  }, []);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  /* параллакс фото от мыши (spring, как в услугах) -------------------------- */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const parallaxX = useSpring(px, { stiffness: 140, damping: 22, mass: 0.6 });
  const parallaxY = useSpring(py, { stiffness: 140, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (!desktopFine || reduced) {
      px.set(0);
      py.set(0);
    }
  }, [desktopFine, reduced, px, py]);

  const onRackMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!desktopFine || reduced) return;
      const idx = openIndexRef.current;
      if (idx === null) return;
      const item = itemRefs.current[idx];
      if (!item) return;
      const r = item.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      px.set(Math.max(-0.6, Math.min(0.6, nx)) * 26);
      py.set(Math.max(-0.6, Math.min(0.6, ny)) * 16);
    },
    [desktopFine, reduced, px, py],
  );

  /* клавиатура: стрелки в пределах рэка, Home/End --------------------------- */
  const onRackKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const idx = Number(
        (e.target as HTMLElement)
          .closest<HTMLElement>("[data-spine-index]")
          ?.dataset.spineIndex ?? -1,
      );
      if (idx < 0) return;
      let target = -1;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          target = (idx + 1) % N;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          target = (idx - 1 + N) % N;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = N - 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      spineRefs.current[target]?.focus();
    },
    [N],
  );

  /* табы пакетов: role=tablist + стрелки ------------------------------------ */
  const selectPkg = useCallback((catId: string, i: number) => {
    setPkgs((prev) => (prev[catId] === i ? prev : { ...prev, [catId]: i }));
  }, []);

  /* M1: fade-индикатор «список продолжается» — живой замер скролла открытой
     панели (перепроверяется при смене пакета/категории и на resize) --------- */
  const listRefs = useRef<(HTMLUListElement | null)[]>([]);
  const [scrollable, setScrollable] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (openIndex === null) return;
    const cat = cats[openIndex];
    const el = listRefs.current[openIndex];
    if (!cat || !el) return;
    const check = () => {
      const can = el.scrollHeight > el.clientHeight + 1;
      setScrollable((prev) =>
        prev[cat.id] === can ? prev : { ...prev, [cat.id]: can },
      );
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [openIndex, pkgs, cats]);

  const onTabKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, catId: string, pkgCount: number, current: number) => {
      let next = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (current + 1) % pkgCount;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (current - 1 + pkgCount) % pkgCount;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = pkgCount - 1;
      if (next < 0) return;
      e.preventDefault();
      selectPkg(catId, next);
      document
        .getElementById(`${baseId}-pkg-${catId}-${next}`)
        ?.focus();
    },
    [baseId, selectPkg],
  );

  const panelId = (i: number) => `${baseId}-panel-${cats[i].id}`;
  const spineId = (i: number) => `${baseId}-spine-${cats[i].id}`;

  /* entrance-каскад корешков (как в услугах) -------------------------------- */
  const rackVariants = reduced
    ? undefined
    : { hidden: { opacity: 0 }, show: { opacity: 1 } };
  const itemVariants = reduced
    ? undefined
    : {
        hidden: { opacity: 0, y: 44 },
        show: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: EASE, delay: 0.05 + i * 0.06 },
        }),
      };

  /* ─────────────────────────────────────────────────────────────── render */

  return (
    <motion.div
      ref={rackRef}
      className="hmenu__rack"
      role="group"
      aria-label="Каталоги меню — семь направлений кейтеринга"
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={rackVariants}
      onMouseMove={onRackMouseMove}
      onMouseLeave={() => {
        clearHoverIntent();
        px.set(0);
        py.set(0);
      }}
      onKeyDown={onRackKeyDown}
    >
      {cats.map((cat, k) => {
        const isOpen = openIndex === k;
        /* дефолтная ступень — самая доступная: тогда цена в шапке совпадает
           с «от N» калькулятора и лидом (симуляция Марина C59/W2: у
           snack-box минимальный пакет не первый в данных) */
        const minIdx = cat.packages.reduce(
          (best, p, i, arr) => (p.pricePerGuest < arr[best].pricePerGuest ? i : best),
          0,
        );
        const pkgIdx = Math.max(
          0,
          Math.min(pkgs[cat.id] ?? minIdx, cat.packages.length - 1),
        );
        // лёгкий guard от развязки данных (n6): пустой/битый массив пакетов
        const pkg = cat.packages[pkgIdx] ?? cat.packages[0];
        return (
          <motion.div
            key={cat.id}
            ref={(el) => {
              itemRefs.current[k] = el;
            }}
            className={"hmenu__item" + (isOpen ? " is-open" : "")}
            style={
              {
                backgroundColor: cat.tint,
                "--hmenu-item-tint": cat.tint,
              } as CSSProperties
            }
            variants={itemVariants}
            custom={k}
          >
            {/* — — корешок: вертикальная «обложка книги» — — */}
            <h3 className="hmenu__spine-heading">
              <button
                type="button"
                ref={(el) => {
                  spineRefs.current[k] = el;
                }}
                id={spineId(k)}
                data-spine-index={k}
                className="hmenu__spine"
                aria-expanded={isOpen}
                aria-controls={panelId(k)}
                aria-label={
                  isOpen
                    ? `${cat.label} — открыто`
                    : `Раскрыть каталог — ${cat.label}`
                }
                onClick={() => open(k, true)}
                onMouseEnter={() => onSpineEnter(k)}
                onMouseLeave={clearHoverIntent}
              >
                <span className="hmenu__spine-title">
                  <span className="hmenu__spine-title-text">{cat.label}</span>
                </span>
                <span className="hmenu__spine-plus" aria-hidden="true">
                  <Plus />
                </span>
                {/* фото-подглядывание: полоса кадра из-под корешка на hover
                    (сигнатурный момент жюри C59; ноль сдвигов layout) */}
                {!isOpen && cat.packages[pkgIdx]?.photo ? (
                  <span className="hmenu__spine-peek" aria-hidden="true">
                    <SmartImage
                      src={cat.packages[pkgIdx].photo as string}
                      alt=""
                      fill
                      sizes="64px"
                      className="hmenu__spine-peek-img"
                    />
                  </span>
                ) : null}
              </button>
            </h3>

            {/* — — открытая панель: фиксированная ширина, clip-reveal — — */}
            <div
              id={panelId(k)}
              className="hmenu__open"
              role="region"
              aria-labelledby={spineId(k)}
              inert={!isOpen}
            >
              {pkg ? (
              <div className="hmenu__body">
                {/* head: tag · script-заголовок · цена «от» */}
                <div className="hmenu__row-head">
                  <span className="hmenu__tag">{cat.short}</span>
                  <p className="hmenu__title">{cat.label}</p>
                  <span className="hmenu__price" aria-live="polite">
                    <motion.span
                      key={pkg?.name ?? "pkg"}
                      className="hmenu__price-num"
                      data-testid="hmenu-price-morph"
                      initial={reduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.34, ease: EASE }}
                    >
                      {/* «от» — честно только у минимального пакета:
                          выбранная ступень показывает точную цену */}
                      {pkg && pkg.pricePerGuest === cat.perGuest ? "от " : ""}
                      {formatRUB(pkg ? pkg.pricePerGuest : cat.perGuest)}
                    </motion.span>
                    <small>
                      {cat.priceLabel} · {guestsLabel(cat.minGuests)}
                    </small>
                  </span>
                </div>

                {/* середина: фото пакета + табы/блюда */}
                <div className="hmenu__mid">
                  <figure className="hmenu__media">
                    <motion.div
                      className="hmenu__media-inner"
                      style={{ x: parallaxX, y: parallaxY }}
                    >
                      <motion.div
                        key={pkg.photo ?? FALLBACK_PHOTO}
                        className="hmenu__media-fade"
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, ease: EASE }}
                      >
                        <SmartImage
                          src={pkg.photo ?? FALLBACK_PHOTO}
                          alt={`«${pkg.name}» — ${cat.label}: ${pkg.description}`}
                          fill
                          blurDataURL={BLUR_DATA_URL}
                          sizes="(max-width: 1023px) 100vw, 38vw"
                          loading={isOpen ? "eager" : "lazy"}
                          className="hmenu__img"
                        />
                      </motion.div>
                    </motion.div>
                    <figcaption className="hmenu__media-cap">
                      {pkg.name} · {pkg.description}
                    </figcaption>
                  </figure>

                  <div className="hmenu__details">
                    {/* табы пакетов */}
                    <div
                      className="hmenu__tabs"
                      role="tablist"
                      aria-label={`Уровень меню — ${cat.label}`}
                    >
                      {cat.packages.map((p, pi) => (
                        <button
                          key={p.name}
                          type="button"
                          role="tab"
                          id={`${baseId}-pkg-${cat.id}-${pi}`}
                          className="hmenu__tab"
                          aria-selected={pi === pkgIdx}
                          aria-controls={`${baseId}-dishlist-${cat.id}`}
                          tabIndex={pi === pkgIdx ? 0 : -1}
                          onClick={() => selectPkg(cat.id, pi)}
                          onKeyDown={(e) =>
                            onTabKeyDown(e, cat.id, cat.packages.length, pi)
                          }
                        >
                          {/* цена видна ДО клика — сравнение ступеней без
                              переключения (симуляции Марина/Артём C59/W2) */}
                          <span className="hmenu__tab-name">{p.name}</span>
                          <span className="hmenu__tab-sum">
                            {formatRUB(p.pricePerGuest)}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* блюда выбранного пакета. tabIndex=0 — панель со
                        скроллом доступна с клавиатуры (APG tabs) */}
                    <div
                      className="hmenu__tabpanel"
                      id={`${baseId}-dishlist-${cat.id}`}
                      role="tabpanel"
                      aria-labelledby={`${baseId}-pkg-${cat.id}-${pkgIdx}`}
                      tabIndex={0}
                      aria-label={`Состав — ${pkg.name}`}
                    >
                      <div
                        className={
                          "hmenu__listwrap" +
                          (scrollable[cat.id] ? " is-scrollable" : "")
                        }
                      >
                        {/* кроссфейд списка при смене пакета (моушн-критик
                            C59): remount по имени пакета, opacity/y — без
                            reflow; ref живёт на motion.ul как на ul */}
                        <motion.ul
                          key={pkg.name}
                          className="hmenu__list"
                          initial={reduced ? false : "hidden"}
                          animate="show"
                          variants={{
                            hidden: {},
                            show: {
                              transition: { staggerChildren: 0.024 },
                            },
                          }}
                          transition={{ duration: 0.32, ease: EASE }}
                          ref={(el) => {
                            listRefs.current[k] = el;
                          }}
                        >
                          {pkg.dishes.map((dish, di) => (
                            <motion.li
                              key={`${dish.name}-${di}`}
                              className="hmenu__dish"
                              variants={{
                                hidden: { opacity: 0, y: 8 },
                                show: {
                                  opacity: 1,
                                  y: 0,
                                  transition: { duration: 0.3, ease: EASE },
                                },
                              }}
                            >
                              <span className="hmenu__dish-name">{dish.name}</span>
                              {dish.weight ? (
                                <span className="hmenu__dish-weight">{dish.weight}</span>
                              ) : null}
                            </motion.li>
                          ))}
                        </motion.ul>
                      </div>
                    </div>

                    {/* «включено» — галочки от руки, gamma-style */}
                    <div className="hmenu__incl">
                      <p className="hmenu__incl-label">Включено в любой пакет</p>
                      <ul className="hmenu__incl-grid">
                        {cat.included.map((inc) => (
                          <li key={inc} className="hmenu__incl-item">
                            <HandCheck />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* foot: описание + сниматель возражения + магнитная CTA.
                    CTA калькулятора предварительно ставит ?type=&guests= —
                    калькулятор открывается с нужным форматом (свадьба C59) */}
                <div className="hmenu__row-foot">
                  <div className="hmenu__foot-text">
                    <p className="hmenu__hook">{cat.description}</p>
                    {(cat.hookNote ?? hookNoteFor(cat)) ? (
                      <p className="hmenu__hook-note">
                        {cat.hookNote ?? hookNoteFor(cat)}
                      </p>
                    ) : null}
                  </div>
                  <Magnetic className="hmenu__cta-wrap" strength={0.17}>
                    <a
                      href={cat.ctaHref}
                      className="ea-outline-btn hmenu__cta"
                      aria-label={`${cat.ctaLabel} — ${cat.label}`}
                      onClick={
                        cat.ctaHref === "#calculator"
                          ? () => presetCalculator(cat.id, cat.minGuests)
                          : undefined
                      }
                    >
                      {cat.ctaLabel}
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                  </Magnetic>
                </div>
              </div>
              ) : null}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ───────────────────────────────────────────────────────────── the section */

export function HaccMenu() {
  const prefersReduced = useReducedMotion();
  /** Скачивание PDF-каталога — единственная ссылка, в шапке секции. */
  const [pdfBusy, setPdfBusy] = useState(false);
  /** m3: честный статус ошибки — молча падать нельзя (проверка критика). */
  const [pdfError, setPdfError] = useState(false);
  /** Открытая категория — ведёт ambient wash (как focus-модель в услугах). */
  const [activeIdx, setActiveIdx] = useState<number | null>(0);
  const handleOpenChange = useCallback((i: number | null) => setActiveIdx(i), []);

  const downloadPdf = useCallback(async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    setPdfError(false);
    try {
      await generateMenuPdf("all");
    } catch {
      setPdfError(true);
    } finally {
      setPdfBusy(false);
    }
  }, [pdfBusy]);

  return (
    <section
      id="menu"
      data-header-theme="light"
      aria-labelledby="hmenu-heading"
      className="hmenu ea-section ea-section--cream"
    >
      {/* ambient tint wash — фон секции подсвечивается тинтом открытой панели.
          Реактивность: активный индекс живёт в MenuRack, поэтому wash
          сделан CSS-слоями с transition, а не состоянием секции. */}
      <div className="hmenu__ambient" aria-hidden="true">
        {MENUS.map((m, i) => (
          <span
            key={m.id}
            className="hmenu__ambient-layer"
            style={{
              backgroundColor: m.tint,
              opacity: activeIdx === i ? 0.34 : 0,
            }}
          />
        ))}
      </div>

      {/* шапка секции — в сетке сайта (как в услугах) */}
      <div className="ea-container ea-container--wide">
        <motion.div
          className="hmenu__head"
          initial={prefersReduced ? false : { opacity: 0, y: 26 }}
          whileInView={prefersReduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="hmenu__head-text">
            <span className="ea-eyebrow">Каталог меню</span>
            <h2 id="hmenu-heading" className="ea-section-h2">
              {"Настоящие блюда. "}
              <i className="ea-italic-fragment">Честные цены.</i>
            </h2>
            <p className="hmenu__lede">
              Семь каталогов — от канапе до мангала. Раскройте каталог:
              состав пакетов, список блюд и цена за гостя.
            </p>
          </div>
          <div className="hmenu__meta">
            <span
              className="hmenu__pdf-status"
              aria-live="polite"
              role="status"
            >
              {pdfError
                ? "Не удалось собрать PDF — попробуйте ещё раз."
                : ""}
            </span>
            <button
              type="button"
              className="ea-text-link hmenu__pdf"
              onClick={downloadPdf}
              disabled={pdfBusy}
            >
              <Download aria-hidden="true" />
              {pdfBusy ? "Готовим PDF…" : "Каталог в PDF"}
            </button>
            <span className="hmenu__hint" aria-hidden="true">
              <MousePointer2 aria-hidden="true" />
              Наведите на каталог — он развернётся
            </span>
          </div>
        </motion.div>
      </div>

      {/* метка рэка + сам рэк (full-bleed, как в услугах) */}
      <div className="ea-container ea-container--wide">
        <p className="hmenu__rack-label">От канапе до мангала — семь каталогов</p>
      </div>

      <MenuRack
        cats={MENUS}
        reduced={prefersReduced}
        onOpenChange={handleOpenChange}
      />

      {/* честная приписка под рэком: условия до заявки + ориентир бюджета
          (CFO/невеста C59/W5: коэффициент сезона публикуем, «не входит»
          дублируем у цен, пример бюджета считаем ИЗ ДАННЫХ, не руками) */}
      <div className="ea-container ea-container--wide">
        <p className="hmenu__note">
          Цены — за одного гостя. Условия называем заранее, до заявки: при
          выборе даты в расчёте сразу виден сезонный коэффициент (май–
          сентябрь и декабрь — ×1,15), срочные заказы — по правилам из
          вопросов ниже. Ориентир: банкет на 40 гостей — от{" "}
          {formatRUB(40 * banquetPerGuest)}. Алкоголь, аренда площадки,
          музыка и расширенное оформление — отдельными строками по запросу.
          Состав любого пакета пересобираем под ваше событие: замените
          блюдо или соберите смешанный уровень — это нормальная практика.
        </p>
      </div>
    </section>
  );
}

export default HaccMenu;
