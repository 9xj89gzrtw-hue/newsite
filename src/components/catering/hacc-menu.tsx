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
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Download,
  MousePointer2,
  Plus,
} from "lucide-react";

import { SmartImage } from "@/components/media/smart-image";
import { Magnetic } from "@/components/motion/magnetic";
import { ScrambleText } from "@/components/motion/scramble-text";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { MENU_TYPES, formatRUB, type MenuType } from "@/lib/pricing";
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
  /** W2-FIX: капс-лейбл для data-cursor корешка (1–2 слова, капсом
      в бейдже курсора — см. cursor.tsx: label/preview). */
  cursorLabel: string;
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
    cursorLabel: string;
  }
> = {
  buffet: { tint: "#F5EEE2", ctaLabel: "Рассчитать фуршет", ctaHref: "#calculator", cursorLabel: "ФУРШЕТ" },
  banquet: {
    tint: "#F6E0DB",
    ctaLabel: "Рассчитать банкет",
    ctaHref: "#calculator",
    cursorLabel: "БАНКЕТ",
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
    cursorLabel: "ЗАКУСКИ",
  },
  "coffee-break": { tint: "#F4DECD", ctaLabel: "Заказать кофе-брейк", ctaHref: "#calculator", cursorLabel: "КОФЕ-БРЕЙК" },
  vegetarian: {
    tint: "#F6E9C9",
    ctaLabel: "Обсудить меню",
    ctaHref: "#contact",
    cursorLabel: "ВЕГЕ МЕНЮ",
    // симуляция C59 (Анастасия/жюри-W3): мостик «вегетарианцы на общем банкете»
    hookNote:
      "Включим вегетарианские позиции и в общий банкет: смешанный состав — это норма.",
  },
  bbq: { tint: "#F3E3E8", ctaLabel: "Рассчитать барбекю", ctaHref: "#calculator", cursorLabel: "БАРБЕКЮ" },
  "office-lunch": {
    tint: "#F5EEE2",
    ctaLabel: "Заказать обеды",
    ctaHref: "#contact",
    priceLabel: "за порцию",
    cursorLabel: "ОБЕДЫ",
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
  cursorLabel: "МЕНЮ",
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

/** 1 блюдо / 2–4 блюда / 5+ блюд — для подписи «Ещё N …» у списка. */
function dishesWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "блюдо";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "блюда";
  return "блюд";
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
  // C62 hydration-safety: entrance variants serialize into SSR HTML — the
  // reduce branch resolves only after mount (direct branch = mismatch:
  // useReducedMotion() is false at SSR, true on reduce-clients' first render).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduceSettled = mounted && reduced;

  const rackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spineRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const N = cats.length;

  /** Одна панель открыта (SSR: первая — как в услугах). null = все закрыты. */
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  /** Выбранный пакет на категорию — память не сбрасывается при переключении. */
  const [pkgs, setPkgs] = useState<Record<string, number>>({});

  /** C61 (жалоба клиента): список, раскрытый кнопкой «Ещё N блюд» на
   *  ПОЛНУЮ высоту: рэк отдаёт фиксированную высоту, панель растёт
   *  естественной, чтение идёт скроллом СТРАНИЦЫ — привычным способом;
   *  в конце списка — пилюля «Свернуть список». */
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    const update = () => {
      setDesktopFine(fine.matches);
      /* уход с десктопа при раскрытом списке: мгновенный сброс, иначе
         inline-высота рэка (px) ломает мобильную grid-раскладку */
      if (!fine.matches) {
        const rack = rackRef.current;
        if (rack) {
          rack.classList.remove("is-animating");
          rack.classList.remove("is-expanded");
          rack.style.height = "";
        }
        setExpandedId(null);
      }
    };
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

  /* C60: после КАЖДОГО открытия рэк переверстывается — под неподвижный
     курсор попадает ДРУГОЙ корешок и hover-intent «угоняет» панель
     (на 1024 поймано живьём: 5 кликов подряд дергались обратно).
     700ms тишины после открытия гасят перехват на переверстке */
  const suppressHoverUntil = useRef(0);

  const open = useCallback(
    (i: number, manual: boolean) => {
      if (i < 0 || i >= N) return;
      suppressHoverUntil.current = Date.now() + 700;
      /* смена категории при раскрытом списке: мгновенный схлоп без
         анимации — иначе высотная и ширинная анимации рэка конфликтуют */
      const rack = rackRef.current;
      if (rack && expandedId !== null) {
        rack.classList.remove("is-animating");
        rack.classList.remove("is-expanded");
        rack.style.height = "";
        setExpandedId(null);
      }
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
    [N, reduced, expandedId],
  );

  /* hover-intent (desktop, fine pointer) ----------------------------------- */
  const hoverTimer = useRef(0);
  const onSpineEnter = useCallback(
    (i: number) => {
      if (!desktopFine || reduced) return;
      if (Date.now() < suppressHoverUntil.current) return;
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
     панели (перепроверяется при смене пакета/категории и на resize).
     C60 (жалоба клиента): fade+тонкий скроллбар НЕ читаются на десктопе —
     добавлен явный счётчик скрытых блюд (кнопка «Ещё N блюд»),
     пересчитывается live при скролле/resize/смене пакета ------------------- */
  const listRefs = useRef<(HTMLUListElement | null)[]>([]);
  const [scrollable, setScrollable] = useState<Record<string, boolean>>({});
  const [hiddenCount, setHiddenCount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (openIndex === null) return;
    const cat = cats[openIndex];
    const el = listRefs.current[openIndex];
    if (!cat || !el) return;
    let raf = 0;
    const check = () => {
      raf = 0;
      const can = el.scrollHeight > el.clientHeight + 1;
      setScrollable((prev) =>
        prev[cat.id] === can ? prev : { ...prev, [cat.id]: can },
      );
      /* сколько блюд ещё НЕ ПРОЧИТАНО целиком: строка считается скрытой,
         пока её низ ниже нижней кромки списка. Такое правило сходится
         ровно в ноль В МОМЕНТ доскролла до дна (паддинг гарантирует,
         что у дна последняя строка видна целиком) — кнопка не может
         погаснуть, пока что-то срезано (волна-2, аудитор-блокер) */
      const bottom = el.getBoundingClientRect().bottom;
      let n = 0;
      el.querySelectorAll(".hmenu__dish").forEach((li) => {
        if (li.getBoundingClientRect().bottom > bottom + 2) n += 1;
      });
      setHiddenCount((prev) =>
        prev[cat.id] === n ? prev : { ...prev, [cat.id]: n },
      );
      /* C60 (аудитор-блокер): на первом визите куки-баннер (fixed, низ,
         ~77px) ложится НА кнопку-счётчик и перехватывает её клики.
         Если позиция покоя кнопки пересекает полосу баннера И кнопка ещё
         видима — прижимаем её ПОВЕРХ верхней кромки баннера (sticky- effect),
         с клампом внутрь обёртки списка. Волна-3: условие «низ списка на
         экране» оставляло мёртвую зону, когда низ списка уже уехал за сгиб */
      const wrap = el.closest(".hmenu__listwrap");
      if (wrap instanceof HTMLElement) {
        const banner = document.querySelector('[data-component="ea-cookie-banner"]');
        if (banner) {
          const br = banner.getBoundingClientRect();
          const wrapBottom = wrap.getBoundingClientRect().bottom;
          const cueRestBottom = wrapBottom - 10; // bottom:10px в покое
          const vb = window.innerHeight;
          if (cueRestBottom > br.top + 4 && cueRestBottom - 48 < vb) {
            const lift = Math.ceil(cueRestBottom - br.top + 8);
            const maxLift = Math.max(0, Math.floor(wrap.clientHeight - 52));
            wrap.style.setProperty("--hmenu-cue-lift", `${Math.min(lift, maxLift)}px`);
          } else {
            wrap.style.removeProperty("--hmenu-cue-lift");
          }
        } else {
          wrap.style.removeProperty("--hmenu-cue-lift");
        }
      }
    };
    check();
    /* C61/волна-1 (QA): после смены пакета список ремоунтится (key=pkg.name):
       ul приобретает финальный размер сразу, а ОБЁРТКА (listwrap) дозжимается
       позже — ResizeObserver на ul больше НЕ срабатывает, и check() мог
       зафиксировать устаревший scrollHeight>clientHeight → пилюля «Ещё N»
       врёт (видна при полностью видимом списке). Лечится наблюдением за
       обёрткой + контрольными перепроверками после кадра — состояние
       гарантированно сходится */
    const wrapEl = el.closest(".hmenu__listwrap");
    const roWrap = new ResizeObserver(check);
    if (wrapEl) roWrap.observe(wrapEl);
    const rechecks = [340, 800].map((t) => window.setTimeout(check, t));
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(check);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    /* C60/волна-3 (аудитор): скролл СТРАНИЦЫ тоже меняет положение кнопки
       относительно куки-баннера — без этого слушателя lift был бы
       устаревшим и кнопка могла бы лечь ПОД баннер (видима, некликабельна) */
    window.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    /* C61: куки-баннер закрыли — events нет (скролла не было), а lift уже
       выставлен: без MutationObserver кнопка остаётся поднятой над обёрткой
       и уходит под overflow:clip (невидима и некликабельна навсегда) */
    const mo = new MutationObserver(() => {
      if (!raf) raf = window.requestAnimationFrame(check);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      roWrap.disconnect();
      mo.disconnect();
      rechecks.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", check);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [openIndex, pkgs, cats, expandedId]);

  /* клик по «Ещё N блюд»: C61 (жалоба клиента) — список раскрывается на
     ПОЛНУЮ высоту: рэк отдаёт clamp-высоту, панель растёт естественной,
     и дочитывать меню можно СКРОЛЛОМ СТРАНИЦЫ (привычным способом),
     а не невидимым скроллом внутри окна. Ровно это чинит «непонятно
     как скроллить после этого вверх, чтобы прочитать целиком»:
     вверх скроллит сама страница. В конце списка — пилюля «Свернуть». */
  /* C61/волна-1 (QA): последовательный номер анимации рэка — отменяет
     отложенные done()-колбэки предыдущей анимации (иначе таймер страховки
     прерванного схлопа убивал новое раскрытие на 950-м миллисекунде) */
  const animSeq = useRef(0);

  /** Программный скролл страницы: через Lenis, если он жив (гасит колесную
      инерцию), иначе нативно. reduced-motion → мгновенно. Смещение на
      sticky-шапку (~96px) УЖЕ учтено в y вызывающим кодом. */
  const scrollPageTo = useCallback(
    (y: number) => {
      const target = Math.max(0, y);
      const lenis = (
        window as unknown as {
          __lenis?: { scrollTo: (t: number, o?: object) => void };
        }
      ).__lenis;
      if (lenis?.scrollTo) {
        lenis.scrollTo(target, { duration: 1.1 });
      } else {
        window.scrollTo({
          top: target,
          behavior: reduced ? "auto" : "smooth",
        });
      }
    },
    [reduced],
  );

  const expandList = useCallback(
    (catId: string, k: number) => {
      const rack = rackRef.current;
      const list = listRefs.current[k];
      if (!rack || !list) return;
      /* прерванная анимация (быстрый цикл collapse→reveal, QA-случай 3):
         мгновенно завершаем её в компактное состояние и мерим с чистого */
      if (rack.classList.contains("is-animating")) {
        animSeq.current += 1;
        rack.classList.remove("is-animating");
        rack.classList.remove("is-expanded");
        rack.style.height = "";
      }
      /* ВАЖНО: все замеры — ДО смены классов, иначе clientHeight/scrollHeight
         уже пересчитаны под auto-высоту и deficit == 0. Паддинг-компенсацию
         (3.2rem под кнопку-счётчик) вычитаем: вместе с is-scrollable она
         снимется, и без вычета рэк получит лишние ~51px воздуха в конце */
      const fromH = rack.clientHeight;
      const preListClient = list.clientHeight;
      const padBottom =
        parseFloat(getComputedStyle(list).paddingBottom) || 0;
      const deficit = Math.max(
        0,
        list.scrollHeight - padBottom - list.clientHeight,
      );
      const seq = ++animSeq.current;
      setExpandedId(catId);
      rack.classList.add("is-expanded"); // высота auto (цель анимации)

      const finish = () => {
        if (seq !== animSeq.current) return; // отменено новой анимацией
        rack.classList.remove("is-animating");
        rack.style.height = ""; // дальше высоту ведёт .is-expanded (auto)
      };

      if (reduced || deficit <= 4) {
        finish();
        return;
      }

      /* жюри-волна-1: после раскрытия читатель должен оказаться на ПЕРВОЙ
         из скрытых строк — скроллим страницу к линии прежнего сгиба */
      scrollPageTo(
        list.getBoundingClientRect().top + window.scrollY + preListClient - 96,
      );

      rack.classList.add("is-animating");
      rack.style.height = `${fromH}px`; // старт = компактная высота
      void rack.offsetHeight; // фиксируем стартовое значение
      rack.style.height = `${fromH + deficit}px`;
      const done = () => finish();
      rack.addEventListener("transitionend", done, { once: true });
      // страховка: transitionend может не прийти (вкладка в фоне и т.п.)
      window.setTimeout(done, 950);
    },
    [reduced, scrollPageTo],
  );

  const collapseList = useCallback(
    (k: number) => {
      const rack = rackRef.current;
      if (!rack) return;
      const item = itemRefs.current[k];
      /* QA-волна-1: если пилюля в фокусе, после размонтирования фокус упадёт
         в <body> (Tab начнёт со страницы). Заранее переводим фокус на
         корешок открытой панели — стабильная точка возврата */
      const pillFocused =
        document.activeElement?.closest(".hmenu__collapse") != null;
      if (pillFocused) {
        spineRefs.current[k]?.focus({ preventScroll: true });
      }
      setExpandedId(null);
      const seq = ++animSeq.current;

      const finish = () => {
        if (seq !== animSeq.current) return;
        rack.classList.remove("is-animating");
        rack.classList.remove("is-expanded");
        rack.style.height = "";
      };

      if (reduced) {
        finish();
        // возвращаем верх панели в кадр — точка чтения сбрасывается наверх
        item?.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }

      /* порядок критичен: curH — при снятой inline-высоте и ЖИВОМ
         is-expanded; targetH — после снятия is-expanded (clamp из
         стилей), но ещё БЕЗ inline px (иначе замер вернёт inline) */
      const curH = rack.getBoundingClientRect().height;
      rack.classList.add("is-animating");
      rack.classList.remove("is-expanded");
      const targetH = rack.clientHeight; // clamp из стилей
      rack.style.height = `${curH}px`; // визуально без change (rendered = curH)
      void rack.offsetHeight;
      rack.style.height = `${targetH}px`;
      // верх панели — в кадр (sticky header ≈ 96px); позиция панели в
      // документе при схлопе не меняется — контент выше неё статичен
      scrollPageTo(item.getBoundingClientRect().top + window.scrollY - 96);
      const done = () => finish();
      rack.addEventListener("transitionend", done, { once: true });
      window.setTimeout(done, 950);
    },
    [reduced, scrollPageTo],
  );

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
  const rackVariants = reduceSettled
    ? undefined
    : { hidden: { opacity: 0 }, show: { opacity: 1 } };
  const itemVariants = reduceSettled
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
      className={
        "hmenu__rack" + (expandedId !== null ? " is-expanded" : "")
      }
      role="group"
      aria-label="Каталоги меню — семь направлений кейтеринга"
      initial={reduceSettled ? false : "hidden"}
      whileInView={reduceSettled ? undefined : "show"}
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
                /* W2-FIX (ВАУ-фича курсора): на каждом корешке каталога —
                   превью-фото выбранного пакета (120px карточка у курсора,
                   cursor.tsx читает data-cursor-image с ближайшего
                   интерактива; атрибут на самой кнопке = closest(button)).
                   Бейдж-лейбл — data-cursor (1–2 слова капсом). Пока панель
                   закрыта — превью фото пакета; открытая панель и так
                   показывает это фото крупно (undefined → без превью). */
                data-cursor={cat.cursorLabel}
                data-cursor-image={
                  !isOpen ? (cat.packages[pkgIdx]?.photo ?? FALLBACK_PHOTO) : undefined
                }
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
                    {/* сырой <img>: next/image с sizes=64px отдавал вариант
                        64px шириной, который растягивался в полосу 54×648
                        (10–15× апскейл — «каша» на самой кликаемой рейке).
                        Декоративный слой за hover — оригинал даёт резкость,
                        файлы панели и так загружены */}
                    <img
                      src={cat.packages[pkgIdx].photo as string}
                      alt=""
                      loading="lazy"
                      draggable={false}
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
                      initial={reduceSettled ? false : { opacity: 0, y: 8 }}
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
                        initial={reduceSettled ? false : { opacity: 0 }}
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
                      <span className="hmenu__media-cap-name">{pkg.name}</span>
                      {/* описание пакета: на 1024–1279 прячем (col ~246px —
                          текст резался на 2-й строке без хвоста, аудитор C60);
                          полный состав и так рядом — в списке блюд */}
                      <span className="hmenu__media-cap-desc">
                        {" · "}
                        {pkg.description}
                      </span>
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
                          /* W2-FIX: строка меню с фото — превью пакета у
                             курсора (см. spine выше), бейдж = имя ступени
                             (скобочные уточнения срезаем — бейдж 1–2 слова) */
                          data-cursor={p.name.split(" (")[0].toUpperCase()}
                          data-cursor-image={p.photo ?? undefined}
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
                          /* C60: fade честен — гаснет, когда скрытых блюд не
                             осталось (доскроллили до дна), даже если
                             scrollHeight ещё больше clientHeight (паддинг) */
                          (scrollable[cat.id] && (hiddenCount[cat.id] ?? 0) > 0
                            ? " is-scrollable"
                            : "")
                        }
                      >
                        {/* кроссфейд списка при смене пакета (моушн-критик
                            C59): remount по имени пакета, opacity/y — без
                            reflow; ref живёт на motion.ul как на ul */}
                        <motion.ul
                          key={pkg.name}
                          className="hmenu__list"
                          initial={reduceSettled ? false : "hidden"}
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

                        {/* C60/C61: явный аффорданс скролла — живой счётчик скрытых
                            блюд; клик теперь РАСКРЫВАЕТ список на всю высоту
                            (чтение — скроллом страницы, жалоба клиента C61);
                            в раскрытом состоянии кнопка исчезает (счётчик 0) */}
                        {scrollable[cat.id] && (hiddenCount[cat.id] ?? 0) > 0 ? (
                          <button
                            type="button"
                            className="hmenu__scrollcue"
                            data-testid={`hmenu-scrollcue-${cat.id}`}
                            onClick={() => expandList(cat.id, k)}
                            aria-label={`Раскрыть весь список — ещё ${hiddenCount[cat.id]} ${dishesWord(hiddenCount[cat.id])} из пакета «${pkg.name}»`}
                          >
                            <span aria-hidden="true">
                              Ещё {hiddenCount[cat.id]} {dishesWord(hiddenCount[cat.id])}
                            </span>
                            <ChevronDown aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>

                      {/* C61: пилюля «Свернуть список» — конец раскрытого списка.
                          Возвращает компактную высоту рэка и верх панели в кадр */}
                      {expandedId === cat.id ? (
                        <button
                          type="button"
                          className="hmenu__collapse"
                          data-testid={`hmenu-collapse-${cat.id}`}
                          onClick={() => collapseList(k)}
                          aria-label="Свернуть список — вернуться к компактному виду"
                        >
                          <ChevronUp aria-hidden="true" />
                          <span>Свернуть список</span>
                        </button>
                      ) : null}
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
  // C62 hydration-safety: the head's entrance props serialize into SSR HTML —
  // the reduce branch resolves only after mount (direct branch = mismatch).
  const [headMounted, setHeadMounted] = useState(false);
  useEffect(() => setHeadMounted(true), []);
  const headReduceSettled = headMounted && prefersReduced;
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
      // FIX-4 [F4, W1-D]: jspdf+pako (~127КБ) больше НЕ в стартовом бандле —
      // статический импорт заменён на dynamic по клику. Кнопка уже в
      // loading-состоянии: disabled + «Готовим PDF…» (первый клик — чанк
      // качается ~200–500ms, последующие — из кэша модулей). API pdf-client
      // не менялся: generateMenuPdf("all") как раньше.
      const { generateMenuPdf } = await import("@/lib/pdf-client");
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
          initial={headReduceSettled ? false : { opacity: 0, y: 26 }}
          whileInView={headReduceSettled ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="hmenu__head-text">
            {/* C71: eyebrow собирается перебором символов (ScrambleText):
                тот же класс/шрифт/цвет, a11y — aria-label + aria-hidden узел. */}
            <ScrambleText className="ea-eyebrow" delayMs={150}>
              Каталог меню
            </ScrambleText>
            {/* C71: H2 — слова поднимаются каскадом (SplitTextReveal, дефолты
                SPEC: words / stagger 0.06 / 0.7s / [0.22,1,0.36,1]). Визуальный
                стиль не меняется: те же id/классы, тот же <i>-фрагмент —
                сплит-спаны живут ВНУТРИ h2, курсив-кусок наследует
                .ea-italic-fragment как раньше. */}
            <h2 id="hmenu-heading" className="ea-section-h2">
              <SplitTextReveal as="span" mode="words">
                Настоящие блюда.
              </SplitTextReveal>{" "}
              <i className="ea-italic-fragment">
                <SplitTextReveal as="span" mode="words" delay={0.12}>
                  Честные цены.
                </SplitTextReveal>
              </i>
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
          выборе даты в расчёте сразу виден сезонный коэффициент (май–сентябрь
          и декабрь — ×1,15), срочные заказы — по правилам из
          вопросов ниже. Ориентир: банкет на 40 гостей — от{" "}
          {formatRUB(40 * banquetPerGuest)}. Алкоголь, аренда площадки,
          музыка и расширенное оформление — отдельными строками по запросу.
          Состав любого пакета пересобираем под ваше событие: замените
          блюдо или соберите смешанный уровень — это нормальная практика.
        </p>
      </div>

      {/* Task 7-E: «Не нашли нужное?» — мостик к индивидуальному меню.
          Заголовок — Marck Script-акцент с наклоном (тот же приём, что
          корешки рэка); золотая линейка перекликается с пульс-точкой бейджа
          «Отвечаем в любое время» в блоке заявки. CTA ведёт на #contact —
          тот же якорь, что «Обсудить меню» вегетарианского и офисного
          каталогов. Вход — whileInView (y+opacity, transform-only),
          hydration-гейт как у шапки секции (C62 §34). */}
      <div className="ea-container ea-container--wide">
        <motion.div
          className="mt-10 md:mt-14"
          initial={headReduceSettled ? false : { opacity: 0, y: 26 }}
          whileInView={headReduceSettled ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p className="hmenu__rack-label">Своё меню</p>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
            <div>
              <h3 className="tott-script-ru origin-left -rotate-3 text-[length:clamp(1.8rem,2.6vw,2.75rem)] leading-[1.08] text-[color:var(--hmenu-ink)]">
                Не нашли нужное?
              </h3>
              <span
                className="mt-2 block h-[3px] w-14 rounded-full bg-gold"
                aria-hidden="true"
              />
              <p className="hmenu__lede">
                Составим меню специально под ваше событие — под бюджет, кухню
                и повод.
              </p>
            </div>
            <Magnetic className="hmenu__cta-wrap" strength={0.17}>
              <a
                href="#contact"
                className="ea-outline-btn hmenu__cta"
                aria-label="Обсудить меню — составим под ваше событие"
              >
                Обсудить меню
                <ArrowUpRight aria-hidden="true" />
              </a>
            </Magnetic>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HaccMenu;
