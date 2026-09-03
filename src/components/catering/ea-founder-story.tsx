"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import "./ea-founder-story.css";
import "@/components/motion/c74-kinetic.css";
import { BrandBadge } from "@/components/brand/brand-badge";

/**
 * EaFounderStory — Cycle 66 redesign: «Хроника одних рук».
 *
 * Полный редизайн секции #about по концепту из research/c66/FOUNDER-RESEARCH.md
 * (эталоны: La Table de Joakim — основатель = лицо кухни; Dishoom — founding
 * myth «2007, одна печка, Петроградская»; Monarque — vision-подача; GEM —
 * subtle motion; /nk.studio — юбилейная хроника с live-цифрами).
 *
 * ТЁМНАЯ editorial-секция (первая в нише about): тёплый ink #161312, cream
 * текст, зернистость CSS-only (SVG feTurbulence, opacity 0.055) + статичный
 * тёплый bloom. data-header-theme="dark" — потребитель (флип шапки на
 * тёмный вариант) реализован в site-header (FX5, волна-B c67).
 *
 * Структура (desktop ≥1024):
 *   ЛЕВАЯ (46%) — sticky (top 110px) дуэт-фото: портрет 3/4 (вход clip-path
 *   снизу + inner zoom 1.12→1.0) + карточка-сцена 42% внахлёст справа-снизу
 *   (белая рамка 4px, вход clip «шторка» слева→направо + rotate −10°→−5°,
 *   delay 0.4s; hover — lift + выпрямление). Дифференциальный scrub-дрейф
 *   фото по Y (±22px, противофаза) — MotionValues, ноль setState на кадр.
 *   За контентом на всю ширину низа — гигантское outlined «Нилов» (в JSX
 *   title-case, uppercase даёт CSS text-transform; Playfair, cyrillic ✓,
 *   stroke cream 15%) со scrub-дрейфом по X (±40px; на <768 — ±14px,
 *   FIX-6/W1-A MINOR-1, вместе с мобильным капом 16.5vw в CSS).
 *   ПРАВАЯ (54%) — eyebrow «ОСНОВАТЕЛЬ · ШЕФ-ПОВАР», H2 «Всё начинается с
 *   рук.» (italic-фрагмент — канон сайта), красный hairline, 3 МИНИМАЛЬНЫЕ
 *   главы (2007 / Философия / Сегодня — все факты из прежнего копирайта,
 *   ничего не выдумано), inline-строка count-up (19 / 2 400+ / 120 000+,
   портирован прежний CountUp), подпись Marck Script «чернильным» clip-reveal,
 *   CTA «Смотреть меню» (scrollToMenu: window.__lenis → lenis → native, §33).
 *
 * Мобайл (<1024): без sticky; фото → текст; сцена-карточка внахлёст; reveal-ы
 * короче (matchMedia-гейт, post-mount).
 *
 * §34/§35 hydration-дисциплина:
 *   - mounted-гейт: SSR и ПЕРВЫЙ клиентский рендер = полностью статичная
 *     секция (в SSR-разметке нет opacity:0 — no-JS видит весь контент).
 *   - settled = mounted && !reduce; ветвление анимационных пропсов ТОЛЬКО
 *     через settled, дерево не ветвится до mount (гидра-мина useReducedMotion).
 *   - все входные анимации навешиваются key-ремонтом при флипе settled
 *     (§35 «initial не перевооружается пост-монтом»).
 *   - clip-path строки — одинаковая токен-структура + animate-prop паттерн
 *     (§34, проверено на обложке-вайпе); transform/opacity/clip-path only.
 *   - overflow-x: clip (не hidden) на секции — sticky жив (§2).
 *   - бесконечных анимаций нет; background-attachment: fixed нет.
 *
 * Доступность: landmark + aria-labelledby; декор (слово/bloom/зерно/делители)
 * aria-hidden; честные alt (VLM-сверка фактического содержимого кадров);
 * контраст (замер research/c67/fix): cream ≈17:1 (AAA), muted 6.3:1,
 * мелкий красный #FF6B77 6.4:1; красный --ea-red остался только в h2 i и
 * hairline (подпись переведена на cream, F16); focus-ring CTA 2px ≥3:1.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/* «2 400+», «120 000+» — из прежнего блока (цикл 28), не выдуманы; «19 лет»
   считается от канона владельца (работаем с 2007 года, как в hacc-booking
   V9) — не хардкод (F3, волна-A: в 2027-м стата врёт). «35 человек» и
   «2 400+» из главы «Сегодня» сняты (F7): фигуры живут только в статах. */
const FOUNDER_YEARS = new Date().getFullYear() - 2007;

/* FX4 (волна-B): русская плюрализация — «19 лет» верно, но в 2028-м «21 лет»
   уже неверно (21 → «год»). Каноническая тройка год/года/лет: mod10 1 → год;
   2–4 → года; 0,5–9 → лет; исключение mod100 11–14 → лет
   (1 год, 2 года, 5 лет, 11 лет, 21 год, 22 года, 25 лет). */
function pluralRu(n: number, one: string, few: string, many: string): string {
  const per100 = Math.abs(n) % 100;
  if (per100 >= 11 && per100 <= 14) return many;
  const per10 = Math.abs(n) % 10;
  if (per10 === 1) return one;
  if (per10 >= 2 && per10 <= 4) return few;
  return many;
}

/* CX3 (волна-C): у «лет» подпись плюрализуется ПО КАДРАМ отсчёта — иначе
   мид-флит читал «2 лет». plural-тройка + labelTail (хвост неизменен);
   финальный label для SSR/no-JS/reduce остаётся прежней строкой. */
type Stat = {
  value: number;
  suffix: string;
  label: string;
  plural?: readonly [string, string, string];
  labelTail?: string;
};

const STATS: Stat[] = [
  {
    value: FOUNDER_YEARS,
    suffix: "",
    label: `${pluralRu(FOUNDER_YEARS, "год", "года", "лет")} в Петербурге`,
    plural: ["год", "года", "лет"],
    labelTail: " в Петербурге",
  },
  { value: 2400, suffix: "+", label: "событий" },
  { value: 120000, suffix: "+", label: "гостей" },
];

/* Тезисные главы — сжатие прежних трёх абзацев (интонация founding myth). */
const CHAPTERS = [
  {
    label: "2007",
    // FX8 (волна-B): имя основателя жило только в подписи у самого низа —
    // на мобиле до него доходили на ~85% прокрутки главы. Имя вплетено в
    // главу-2007 (факт: подпись и alt уже называют Дмитрия Нилова).
    // \u00A0 — имя не рвётся на переносе.
    text: "Одна печка, три повара и съёмная кухня на Петроградской стороне. Так Дмитрий\u00A0Нилов начинал nilov catering.",
  },
  {
    label: "Философия",
    text: "Лук для супа томится шесть часов. Хлеб встаёт рано утром, когда залы ещё спят. Полуфабрикатов нет — только руки, время и температура.",
  },
  {
    label: "Сегодня",
    // \u00A0 — неразрывные пробелы перед числами: число не отрывается от
    // предлога и не рвётся внутри (minor-находка волны-1). F7 (волна-A):
    // «2 400+» живёт только в стате ниже (без дублей цифр). FX7 (волна-B):
    // «Берёмся за всё:» — единственная масс-маркет интонация секции,
    // заменена на сенсорную подачу (B1, факты те же); ведущее «Сегодня»
    // снято — оно уже в лейбле главы.
    text: "nilov catering накрывает стол и на\u00A0камерной свадьбе на\u00A020 гостей, и на приёме на\u00A01\u00A0500 персон — в исторических особняках города.",
  },
] as const;

/**
 * CountUp — Cycle 67 (F8, волна-A: ноль ре-рендеров): финальное значение
 * живёт в HTML сразу (SSR/no-JS/reduce видят его без JS), при inView once —
 * отсчёт 0→target через Motion `animate()`, где onUpdate пишет textContent
 * ИМПЕРАТИВНО (ноль setState на кадр — было ~130 ре-рендеров на стату).
 * Страховка-таймер не нужна: без анимации в спане уже стоит финал.
 *
 * FX1 (волна-B): значение и суффикс — СОСЕДНИЕ узлы. Раньше onUpdate
 * перезаписывал весь span («2 400+») и после анимации «+» исчезал;
 * теперь пишется только в valueRef-узел, суффикс — статичный сиблинг
 * (SSR/no-JS читают конкатенацию «2 400+», скринридер — «2 400, плюс»).
 * B1-NIT: mid-flight значения квантуются (шаг 10 у тысяч, 100 у сотен
 * тысяч) — «2 398» не мигает; последний кадр пишет точный target.
 *
 * CX3 (волна-C): подпись стата тоже рендерится здесь (сиблинг значения) —
 * при заданном plural тройке она плюрализуется В ТОМ ЖЕ onUpdate
 * («2 года», «3 года» … «19 лет»; финал = «19 лет в Петербурге», хвост
 * labelTail бит-в-бит как в SSR). Reduce/no-JS/SSR: узел не трогается —
 * в HTML уже финал. setState по-прежнему ноль.
 */
function CountUp({
  to,
  suffix,
  label,
  plural,
  labelTail,
  reduce,
}: {
  to: number;
  suffix: string;
  label: string;
  plural?: readonly [string, string, string];
  labelTail?: string;
  reduce: boolean | null;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Reduced-motion / до inView: финальное значение уже в HTML — не трогаем.
    if (reduce || !inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const node = valueRef.current;
    if (!node) return;
    const pl = plural ?? null;
    const tail = labelTail ?? null;
    const labelNode = pl && tail ? labelRef.current : null;
    const writeLabel = (v: number) => {
      if (labelNode && pl && tail) {
        labelNode.textContent = pluralRu(v, pl[0], pl[1], pl[2]) + tail;
      }
    };
    const step = to >= 100000 ? 100 : to >= 1000 ? 10 : 1;
    const controls = animate(0, to, {
      duration: 2.2,
      ease: EASE,
      onUpdate: (v) => {
        const q = Math.round(v / step) * step;
        node.textContent = q.toLocaleString("ru-RU");
        writeLabel(q); // CX3: «2 года» мид-флит, не «2 лет»
      },
      onComplete: () => {
        node.textContent = to.toLocaleString("ru-RU");
        writeLabel(to);
      },
    });
    return () => controls.stop(); // unmount посреди отсчёта — стоп (F8)
  }, [inView, to, reduce, plural, labelTail]);

  return (
    <>
      <span ref={ref} className="efs__stat-num" suppressHydrationWarning>
        <span ref={valueRef} suppressHydrationWarning>
          {to.toLocaleString("ru-RU")}
        </span>
        {suffix ? <span>{suffix}</span> : null}
      </span>
      <span ref={labelRef} className="efs__stat-label" suppressHydrationWarning>
        {label}
      </span>
    </>
  );
}

/**
 * Smooth-scroll к #menu для CTA «Смотреть меню». Cycle 66: основной путь —
 * window.__lenis (грабля §33: Lenis перебивает программные smooth-скроллы,
 * провайдер экспортирует инстанс как __lenis), затем легаси window.lenis,
 * финальный фоллбек — нативный scrollIntoView. (?? здесь безопасен: слева
 * чтения свойств, не void-вызовы — §34.)
 *
 * Ретаргет-паттерн (замер оркестратора cycle 66): lenis.scrollTo(element)
 * вычисляет цель ОДИН раз на момент вызова, а лэйаут ВЫШЕ #menu дрейфует
 * во время полёта (ленивые next/image, дев-оптимизация — замер: цель уехала
 * на +862px, анимация сошлась к устаревшей точке). Повторные вызовы scrollTo
 * пересчитывают rect элемента в момент вызова — дрейф поглощается повторами
 * (паттерн hacc-booking V7). В проде с кэшированными картинками дрейф мал,
 * но anchor-jump-навигация получает тот же риск — паттерн на оба случая.
 *
 * F5 (волна-A): безусловные ретаргеты на 650/1250ms насильно возвращали
 * юзера, который во время полёта крутанул колесо вверх. ПЕРВОЕ намерение
 * (wheel/touchstart/keydown, passive) отменяет отложенные таймеры — юзер-
 * скролл побеждает. Страховочный таймер 2200ms чистит слушатели после
 * приземления (полёт 1.1s + ретаргеты ≤ 1.75s).
 */
function scrollToMenu() {
  if (typeof window === "undefined") return;
  const target = document.getElementById("menu");
  if (!target) return;
  const w = window as unknown as {
    __lenis?: { scrollTo?: (t: Element, o?: { offset?: number; duration?: number }) => void };
    lenis?: { scrollTo: (t: Element, o?: { offset?: number; duration?: number }) => void };
  };
  const lenis = w.__lenis ?? w.lenis;
  if (lenis?.scrollTo) {
    // Ретаргет: цель пересчитывается на каждый вызов (lenis читает rect
    // элемента в момент вызова) — лэйаут-дрейф выше #menu (ленивые фото,
    // дев-оптимизация) поглощается повторами. Паттерн hacc-booking V7.
    lenis.scrollTo(target, { offset: 0, duration: 1.1 });
    const timers = [
      window.setTimeout(() => lenis.scrollTo?.(target, { offset: 0, duration: 0.7 }), 650),
      window.setTimeout(() => lenis.scrollTo?.(target, { offset: 0, duration: 0.5 }), 1250),
    ];
    // Отмена по первому юзер-намерению (см. F5 в докблоке). Взаимное снятие
    // всех трёх слушателей; вызов после их же снятия — безопасен.
    const cancelRetargets = () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("wheel", cancelRetargets);
      window.removeEventListener("touchstart", cancelRetargets);
      window.removeEventListener("keydown", cancelRetargets);
    };
    window.addEventListener("wheel", cancelRetargets, { passive: true });
    window.addEventListener("touchstart", cancelRetargets, { passive: true });
    // FX9 (волна-B): keydown тоже passive — обработчик не вызывает
    // preventDefault (только снимает таймеры и слушатели), нечему блокировать.
    window.addEventListener("keydown", cancelRetargets, { passive: true });
    window.setTimeout(cancelRetargets, 2200);
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function EaFounderStory() {
  const reduce = useReducedMotion();

  // §34 mounted-гейт: первый клиентский рендер обязан совпадать с SSR.
  // settled=true — единственная дверь ко всем входным анимациям.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const settled = mounted && !reduce;
  const on = settled ? "on" : "off"; // суффикс key-ремонта (§35)

  // Мобильные reveal-ы короче (task: «все reveal-ы остаются, но короче»).
  // post-mount matchMedia — hydration-безопасно (как isCoarse в tott).
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // FIX-6 (W1-A MINOR-1): амплитуда X-дрейфа «НИЛОВ» на узких экранах.
  // Тот же §34-паттерн, что narrow выше: post-mount matchMedia — SSR и
  // первый клиентский рендер совпадают (false = десктопная амплитуда),
  // свап амплитуды после монта. Перевооружение честное: в framer-12
  // useCombineMotionValues пересчитывает combine-замыкание синхронно в
  // каждом рендере (updateValue() в теле хука) — при флипе wordNarrow
  // useTransform тут же пересобирается с новой амплитудой, пружина
  // перевозит значение плавно. settled-гейт ниже прикручивает x только
  // после монта — флеша десктопной амплитуды на мобиле нет (оба setState
  // из одного flush эффектов монта — один ререндер).
  const [wordNarrow, setWordNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setWordNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // FX2 (волна-B): вход сцены (1.0s + delay 0.4) раньше наследовался
  // возвратом из hover — после ухода курсора стояло ~505ms мёртвого delay
  // и ~1.0s плавного возврата. sceneEntered взводится onAnimationComplete
  // входа: ПЕРВЫЙ вход сохраняет delay 0.4s, каждый возврат из hover после
  // — короткий (0.35s) и мгновенный. Пишется только в колбеке (React
  // Compiler §37: ref-записи в рендере запрещены — использую state).
  const [sceneEntered, setSceneEntered] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);

  /* C74 (E3) «фонарик»: ref подвижного свечения. Слой и стили —
     efs__spot / efs__spot-glow (ea-founder-story.css), гварды —
     (hover:hover)+(pointer:fine) и в CSS, и в JS (двойная защита
     мобайла). */
  const spotGlowRef = useRef<HTMLDivElement>(null);

  /* ── C74 (E3) «фонарик» — курсорный светильник над точечной сеткой ──
     Тренд 2026: joshwcomeau.com «flashlight», wearedevelopers «Spotlight
     Text Effect» (10.2025), webflow «Spotlight Hover» — радиальное свечение
     следует за мышью, проявляя точечную текстуру секции («музейный
     фонарик» над призрачным «НИЛОВ»).
     Перф-модель: точки — статичный фон обёртки (репейнт один раз);
     свечение 600×600 — ЕДИНСТВЕННЫЙ подвижный слой, движение ТОЛЬКО
     transform (композитор). Трекинг — синхронная запись transform прямо
     в pointermove (§44/C73: без rAF-батчинга, без React-state — свечение
     в том же кадре, что и системный курсор, отставание исключено).
     Один gBCR на событие — браузер батчит, паттерн TiltCard.
     Fine pointer only: touch-скролл сечение не трогает. */
  useEffect(() => {
    const section = sectionRef.current;
    const glow = spotGlowRef.current;
    if (!section || !glow) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let visible = false;
    const show = () => {
      if (!visible) {
        visible = true;
        glow.style.opacity = "1";
      }
    };
    const hide = () => {
      if (visible) {
        visible = false;
        glow.style.opacity = "0";
      }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = section.getBoundingClientRect();
      glow.style.transform = `translate3d(${e.clientX - r.left - 300}px, ${
        e.clientY - r.top - 300
      }px, 0)`;
      show();
    };
    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", hide);
    return () => {
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", hide);
    };
  }, []);

  // useInView — на ВСЕГДА присутствующих обёртках (refs не ремоунтятся,
  // булевы стабильны при key-флипе внутренних слоёв).
  // margin -60px (не -80px): запас против anchor-jump на #about — замер
  // оркестратора (390×844): портрет top=89px срабатывал с запасом лишь 9px;
  // чуть иной паддинг — и reveal не сработал бы навсегда (clip inset(100%)).
  // Для элементов, входящих снизу, верхний инсет не участвует — скролл-поведение
  // не меняется, растёт только запас на краю (замер diag: clip inset(0%)).
  const portraitInView = useInView(portraitRef, { once: true, margin: "-60px" });
  const sceneInView = useInView(sceneRef, { once: true, margin: "-60px" });
  const signInView = useInView(signRef, { once: true, margin: "-80px" });

  // F19 (волна-A): на anchor-jump #about ленивая загрузка портрета гонка с
  // clip-reveal — кадр «выскакивал» наполовину загруженным. Reveal стартаует
  // только после img.decode() (race с 800ms-фоллбеком: reveal всегда
  // срабатывает ≤800ms). Decode зовётся ТОЛЬКО при inView — loading="lazy"
  // сохранён, вне вьюпорта ничего не форсируется. Reduce/no-JS: анимации нет
  // (settled=false), гейт не участвует.
  const [portraitReady, setPortraitReady] = useState(false);
  useEffect(() => {
    if (!portraitInView || portraitReady) return;
    let cancelled = false;
    const done = () => {
      if (!cancelled) setPortraitReady(true);
    };
    const fallback = window.setTimeout(done, 800);
    const img = portraitRef.current?.querySelector("img");
    if (img) {
      img.decode().then(done, done);
    } else {
      done();
    }
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [portraitInView, portraitReady]);

  // Scrub-дрейф: один useScroll + useTransform-слайсы + useSpring —
  // MotionValues, ноль setState на кадр (§35). Только transform.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // F10 (волна-A): 55/22 тащил упругий хвост (дрейф −32→+2px ~900ms после
  // резкого стопа — скорость, накопленная скроллом, давала перелёт даже при
  // формально overdamped пружине). 90/26 гасит заметно быстрее — замер в
  // research/c67/fix.
  const springOpts = { stiffness: 90, damping: 26, mass: 0.6 } as const;
  // FIX-6 (W1-A MINOR-1): ±40px на <768 при word-боксе во всю ширину секции
  // держали глифы в 8.95px от кромок overflow-x:clip на 390 (реальный текст
  // Playfair-500 ≈3.94em/слово; на 320 — 0.2px, обводка резалась). <768 —
  // ±14: с мобильным капом 16.5vw (ea-founder-story.css) инвариант задачи
  // «слово + 2×амплитуда ≤ 100vw» выполняется с запасом ≥50px на 320–414.
  // 768–1023 и desktop ≥1024 — прежние ±40 (там запас; десктоп не тронут).
  const wordAmp = wordNarrow ? 14 : 40;
  const wordX = useSpring(
    useTransform(scrollYProgress, [0, 1], [wordAmp, -wordAmp]),
    springOpts,
  );
  const portraitY = useSpring(useTransform(scrollYProgress, [0, 1], [22, -22]), springOpts);
  const sceneY = useSpring(useTransform(scrollYProgress, [0, 1], [-14, 18]), springOpts);

  // Fade-up вход текста: 26px, stagger 80–120ms; на мобиле короче/плотнее.
  const fadeUp = (delay: number) =>
    settled
      ? {
          initial: { opacity: 0, y: 26 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: {
            duration: narrow ? 0.6 : 0.8,
            delay: narrow ? delay * 0.7 : delay,
            ease: EASE,
          },
        }
      : {};

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="ea-founder-story-headline"
      data-header-theme="dark"
      className="efs"
    >
      {/* Тёплый bloom — статичный, один слой, не отвлекает (EA restraint). */}
      <div className="efs__bloom" aria-hidden="true" />

      {/* C74 (E3) «фонарик»: точечная сетка + курсорное свечение.
          z-2 — НАД призрачным «НИЛОВ» (z-1), ПОД контентом (z-10).
          overflow:hidden — свечение не выходит за границы секции. */}
      <div className="efs__spot" aria-hidden="true">
        <div className="efs__spot-glow" ref={spotGlowRef} />
      </div>

      {/* Гигантское outlined «НИЛОВ» — signature-typography на всю ширину
          низа. Декор: aria-hidden, pointer-events none. Дрейф — только
          когда settled (SSR = чистая статика без transform). */}
      <motion.div
        className="efs__word"
        aria-hidden="true"
        style={settled ? { x: wordX } : undefined}
      >
        Нилов
      </motion.div>

      <div className="efs__container">
        <div className="efs__grid">
          {/* — — ЛЕВАЯ: sticky дуэт-фото (мобайл: обычный поток, фото первым) — — */}
          <div className="efs__media">
            <motion.div
              ref={portraitRef}
              className="efs__portrait-pos"
              style={settled ? { y: portraitY } : undefined}
            >
              {/* Вход портрета: clip inset(100%→0) снизу-вверх + inner zoom
                  1.12→1.0. §34 паттерн: initial + animate по useInView
                  (строки одной токен-структуры), key-ремонт при settled-флипе. */}
              <motion.div
                key={`pclip-${on}`}
                className="efs__portrait-clip"
                {...(settled
                  ? {
                      initial: { clipPath: "inset(100% 0% 0% 0%)" },
                      animate:
                        portraitInView && portraitReady // F19: ждать decode кадра
                          ? { clipPath: "inset(0% 0% 0% 0%)" }
                          : undefined,
                      transition: { duration: narrow ? 0.9 : 1.1, ease: EASE },
                    }
                  : {})}
              >
                <motion.div
                  className="efs__portrait-zoom"
                  {...(settled
                    ? {
                        initial: { scale: 1.12 },
                        animate:
                          portraitInView && portraitReady // F19: ждать decode кадра
                            ? { scale: 1 }
                            : undefined,
                        transition: { duration: narrow ? 1.15 : 1.4, ease: EASE },
                      }
                    : {})}
                >
                  <div className="efs__portrait-frame">
                    <Image
                      src="/media/c67/founder-portrait-v5.webp"
                      alt="Дмитрий Нилов, основатель nilov catering, в фирменном фартуке на банкетной площадке"
                      fill
                      /* 480px = кап .efs__portrait-pos (≥1280) → DPR2 ровно 960
                         device-px (натив источника); бакет 1080 — ближайший в
                         дефолтном deviceSizes, не 1920 (FX10b). */
                      sizes="(max-width: 1023px) 92vw, 480px"
                      className="efs__portrait-img"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Карточка-сцена: внахлёст справа-снизу, белая рамка 4px.
                Вход: clip «шторка» слева→направо + rotate −10°→−5°, delay 0.4s
                после портрета. Hover (fine pointer): lift + выпрямление.
                Клип слит с карточкой (правка волны-1): clip-path режет в
                ЛОКАЛЬНЫХ координатах ДО transform — отдельная обёртка-клип
                точного размера срезала белую рамку rotate-нутой карточки со
                всех 4 сторон. «Шторка» теперь наклонена вместе с карточкой —
                приемлемо (угол карточки). §34: строки clip-path одной
                токен-структуры. */}
            <motion.div
              ref={sceneRef}
              className="efs__scene-pos"
              style={settled ? { y: sceneY } : undefined}
            >
              {/* Клип на ОБЁРТКЕ (не на карточке): clip-path режет и тень
                  карточки — обёртка имеет поле под тень (.efs__scene-clip).
                  §34: строки clip-path одной токен-структуры. */}
              <motion.div
                key={`sclip-${on}`}
                className="efs__scene-clip"
                {...(settled
                  ? {
                      initial: { clipPath: "inset(0% 100% 0% 0%)" },
                      animate: sceneInView
                        ? { clipPath: "inset(0% 0% 0% 0%)" }
                        : undefined,
                      transition: { duration: narrow ? 0.85 : 1.0, delay: 0.4, ease: EASE },
                    }
                  : {})}
              >
                <motion.div
                  key={`scard-${on}`}
                  className="efs__scene-card"
                  {...(settled
                    ? {
                        initial: { rotate: -10 },
                        animate: sceneInView ? { rotate: -5 } : undefined,
                        // F6 (волна-A): hover-переход свой — короткий, без
                        // delay 0.4; входной transition (1.0s + delay) больше
                        // не наследуется жестом (hover отвечал через 250ms,
                        // доезжал ~1.85s).
                        whileHover: {
                          rotate: 0,
                          y: -6,
                          transition: { duration: 0.3, ease: "easeOut" },
                        },
                        // FX2 (волна-B): возврат из hover больше не ездит на
                        // входном delay 0.4 — после завершения входа
                        // (onAnimationComplete → sceneEntered) возврат
                        // 0.35s БЕЗ delay; самый первый вход — прежний
                        // (1.0s + 0.4s). whileHover-in по-прежнему 0.3s.
                        onAnimationComplete: () => setSceneEntered(true),
                        transition: sceneEntered
                          ? { duration: 0.35, ease: EASE }
                          : { duration: narrow ? 0.85 : 1.0, delay: 0.4, ease: EASE },
                      }
                    : {})}
                >
                <div className="efs__scene-frame">
                  <Image
                    src="/media/c67/founder-scene-v4.webp"
                    alt="Дмитрий Нилов у накрытого банкетного стола — сервировка, зелень и свечи перед праздником"
                    fill
                    /* F9 (волна-A): 20vw при 1920 DPR2 просил w=828 против
                       достаточных 640 (слот карточки ~270px). Мобайл: 46vw
                       покрывает слот карточки (46% ширины media) с запасом. */
                    sizes="(max-width: 1023px) 46vw, 270px"
                    className="efs__scene-img"
                  />
                </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* — — ПРАВАЯ: хроника одних рук — — */}
          <div className="efs__body">
            <motion.span
              key={`eyebrow-${on}`}
              className="ea-eyebrow efs__eyebrow"
              {...fadeUp(0)}
            >
              Основатель · Шеф-повар
            </motion.span>

            <motion.h2
              key={`h2-${on}`}
              id="ea-founder-story-headline"
              className="efs__h2 kinetic-h2"
              {...fadeUp(0.08)}
            >
              Всё начинается с <i>рук.</i>
            </motion.h2>

            {/* Красный hairline 64×2 — EA signature. */}
            <motion.span
              key={`rule-${on}`}
              className="ea-divider-red efs__divider"
              aria-hidden="true"
              {...fadeUp(0.16)}
            />

            {/* Три минимальные главы — тезисно, воздух, stagger 100ms. */}
            <div className="efs__chapters">
              {CHAPTERS.map((chapter, i) => (
                <motion.div
                  key={`ch-${i}-${on}`}
                  className="efs__chapter"
                  {...fadeUp(0.22 + i * 0.1)}
                >
                  <h3 className="efs__chapter-label">{chapter.label}</h3>
                  <p className="efs__chapter-text">{chapter.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Строка count-up: 19 / 2 400+ / 120 000+, hairline-делители,
                tabular-nums. CX3: подпись года рендерится в CountUp —
                плюрализуется по кадрам отсчёта. */}
            <motion.div key={`stats-${on}`} className="efs__stats" {...fadeUp(0.4)}>
              {STATS.map((stat) => (
                <div key={stat.label} className="efs__stat">
                  <CountUp
                    to={stat.value}
                    suffix={stat.suffix}
                    label={stat.label}
                    plural={stat.plural}
                    labelTail={stat.labelTail}
                    reduce={reduce}
                  />
                </div>
              ))}
            </motion.div>

            {/* Подпись «чернильным письмом»: clip слева→направо 900ms после
                глав; под ней caps-роль. */}
            <div ref={signRef} className="efs__sign-block">
              {/* C76: личная печать шефа — BrandBadge над подписью, золотом,
                  наклон +4° (в противоход рукописному −2°): как hanko-печать
                  под росчерком. fadeUp — framer (transform на обёртке),
                  CSS-наклон — на внутреннем svg (не конфликтуют). */}
              <motion.div className="efs__seal" {...fadeUp(0.48)}>
                <BrandBadge className="efs__seal-badge" badgeStrokeWidth={0.5} />
              </motion.div>
              <motion.div
                key={`sign-${on}`}
                className="efs__sign-clip"
                {...(settled
                  ? {
                      initial: { clipPath: "inset(0% 100% 0% 0%)" },
                      animate: signInView
                        ? { clipPath: "inset(0% 0% 0% 0%)" }
                        : undefined,
                      transition: { duration: 0.9, delay: 0.15, ease: EASE },
                    }
                  : {})}
              >
                <span className="efs__sign">Дмитрий Нилов</span>
              </motion.div>
              {/* Роль живёт в eyebrow («Основатель · Шеф-повар») — в подписи
                  классическая форма: имя+бренд+город (дубль роли снят). */}
              <motion.p key={`role-${on}`} className="efs__sign-role" {...fadeUp(0.4)}>
                nilov catering · Санкт-Петербург
              </motion.p>
            </div>

            {/* CTA — ea-text-link + SVG-стрелка (канон), scrollToMenu с
                lenis-фоллбеком (§33). <a href="#menu"> вместо button:
                без JS работает нативный якорь, с JS — preventDefault +
                плавный ретаргет-скролл (правка волны-1). */}
            <motion.div key={`cta-${on}`} className="efs__cta" {...fadeUp(0.45)}>
              <a
                href="#menu"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToMenu();
                }}
                className="ea-text-link"
              >
                Смотреть меню
                <svg
                  className="ea-text-link__arrow"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M4 12h14M14 6l6 6-6 6" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CSS-only зерно поверх всей сцены (opacity 0.055, без JS) — FX10a. */}
      <div className="efs__grain" aria-hidden="true" />
    </section>
  );
}

export default EaFounderStory;
