"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import "./ea-founder-story.css";

/**
 * EaFounderStory — Cycle 66 redesign: «Хроника одних рук».
 *
 * Полный редизайн секции #about по концепту из research/c66/FOUNDER-RESEARCH.md
 * (эталоны: La Table de Joakim — основатель = лицо кухни; Dishoom — founding
 * myth «2007, одна печка, Петроградская»; Monarque — vision-подача; GEM —
 * subtle motion; /nk.studio — юбилейная хроника с live-цифрами).
 *
 * ТЁМНАЯ editorial-секция (первая в нише about): тёплый ink #161312, cream
 * текст, зернистость CSS-only (SVG feTurbulence, opacity 0.04) + статичный
 * тёплый bloom. data-header-theme="dark".
 *
 * Структура (desktop ≥1024):
 *   ЛЕВАЯ (46%) — sticky (top 110px) дуэт-фото: портрет 3/4 (вход clip-path
 *   снизу + inner zoom 1.12→1.0) + карточка-сцена 42% внахлёст справа-снизу
 *   (белая рамка 4px, вход clip «шторка» слева→направо + rotate −10°→−5°,
 *   delay 0.4s; hover — lift + выпрямление). Дифференциальный scrub-дрейф
 *   фото по Y (±22px, противофаза) — MotionValues, ноль setState на кадр.
 *   За контентом на всю ширину низа — гигантское outlined «НИЛОВ» (Playfair,
 *   cyrillic ✓, stroke cream 15%) со scrub-дрейфом по X (±40px).
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
 * контраст: cream 15.9:1, muted 6.3:1, мелкий красный #FF6B77 6.4:1,
 * крупный --ea-red 3.9:1 (AA-large); видимый focus-ring на CTA.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/* «35 человек», «2 400+», «120 000+» — из прежнего блока (цикл 28), не
   выдуманы; «19 лет» = 2026 − 2007 (канон владельца: работаем с 2007 года,
   как в hacc-booking V9) — канцелярит «на рынке» снят. «35 человек» живёт
   в тексте главы 3, четвёртая стата прежнего блока не дублируется. */
const STATS = [
  { value: 19, suffix: "", label: "лет в Петербурге" },
  { value: 2400, suffix: "+", label: "событий" },
  { value: 120000, suffix: "+", label: "гостей" },
] as const;

/* Тезисные главы — сжатие прежних трёх абзацев (интонация founding myth). */
const CHAPTERS = [
  {
    label: "2007",
    text: "Одна печка, три повара и кухня на Петроградской стороне. Так начинался Interfood.",
  },
  {
    label: "Философия",
    text: "Лук для супа томится шесть часов. Хлеб встаёт рано утром, когда залы ещё спят. Полуфабрикатов нет — только руки, время и температура.",
  },
  {
    label: "Сегодня",
    // \u00A0 — неразрывные пробелы в «2 400+»/«1 500»: число не рвётся
    // переносом строки (minor-находка волны-1).
    text: "35 человек в команде — и 2\u00A0400+ событий: от камерных свадеб на 20 гостей до приёмов на 1\u00A0500 персон в исторических особняках.",
  },
] as const;

/**
 * CountUp — порт из Cycle 28 (без изменений): финальное значение рендерится
 * сразу (SSR/no-JS/reduce безопасно), при inView once — отсчёт 0→target
 * через Motion `animate()`. 3s-страховка, если IntersectionObserver молчит.
 */
function CountUp({
  to,
  suffix,
  reduce,
}: {
  to: number;
  suffix: string;
  reduce: boolean | null;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(to.toLocaleString("ru-RU"));
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Reduced-motion: финальное значение сразу, без анимации.
    if (reduce) {
      setDisplay(to.toLocaleString("ru-RU"));
      return;
    }
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(count, to, {
      duration: 2.2,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString("ru-RU")),
      onComplete: () => setDisplay(to.toLocaleString("ru-RU")),
    });
    return () => controls.stop();
  }, [inView, to, count, reduce]);

  // Страховка: если IntersectionObserver так и не сработал (редко, но бывает
  // на очень длинных страницах) — показываем настоящее значение через 3s.
  useEffect(() => {
    if (reduce) return;
    const timer = setTimeout(() => setDisplay(to.toLocaleString("ru-RU")), 3000);
    return () => clearTimeout(timer);
  }, [to, reduce]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {display}
      {suffix}
    </span>
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
    window.setTimeout(() => lenis.scrollTo?.(target, { offset: 0, duration: 0.7 }), 650);
    window.setTimeout(() => lenis.scrollTo?.(target, { offset: 0, duration: 0.5 }), 1250);
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

  const sectionRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const signRef = useRef<HTMLDivElement>(null);

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

  // Scrub-дрейф: один useScroll + useTransform-слайсы + useSpring —
  // MotionValues, ноль setState на кадр (§35). Только transform.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const springOpts = { stiffness: 55, damping: 22, mass: 0.6 } as const;
  const wordX = useSpring(useTransform(scrollYProgress, [0, 1], [40, -40]), springOpts);
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
                      animate: portraitInView
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
                        animate: portraitInView ? { scale: 1 } : undefined,
                        transition: { duration: narrow ? 1.15 : 1.4, ease: EASE },
                      }
                    : {})}
                >
                  <div className="efs__portrait-frame">
                    <Image
                      src="/media/c66/founder-portrait-v3.webp"
                      alt="Дмитрий Нилов, основатель Interfood Catering, в фирменном фартуке на банкетной площадке"
                      fill
                      /* 480px = кап .efs__portrait-pos (≥1280) → DPR2 ровно 960
                         device-px (натив источника), бакет 1200 вместо 1920. */
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
                        whileHover: { rotate: 0, y: -6 },
                        transition: { duration: narrow ? 0.85 : 1.0, delay: 0.4, ease: EASE },
                      }
                    : {})}
                >
                <div className="efs__scene-frame">
                  <Image
                    src="/media/c66/founder-scene-v3.webp"
                    alt="Дмитрий Нилов за работой — накрытый банкетный стол: сервировка, зелень и свечи перед праздником"
                    fill
                    sizes="(max-width: 1023px) 46vw, 20vw"
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
              className="efs__h2"
              aria-label="Всё начинается с рук."
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
                tabular-nums. */}
            <motion.div key={`stats-${on}`} className="efs__stats" {...fadeUp(0.4)}>
              {STATS.map((stat) => (
                <div key={stat.label} className="efs__stat">
                  <span className="efs__stat-num">
                    <CountUp to={stat.value} suffix={stat.suffix} reduce={reduce} />
                  </span>
                  <span className="efs__stat-label">{stat.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Подпись «чернильным письмом»: clip слева→направо 900ms после
                глав; под ней caps-роль. */}
            <div ref={signRef} className="efs__sign-block">
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
                Interfood Catering · Санкт-Петербург
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
                aria-label="Смотреть меню — перейти к разделу"
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

      {/* CSS-only зерно поверх всей сцены (opacity 0.04, без JS). */}
      <div className="efs__grain" aria-hidden="true" />
    </section>
  );
}

export default EaFounderStory;
