"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { TottReveal } from "./tott-reveal";
import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import {
  VelocitySkew,
  useVelocitySkewDeg,
} from "@/components/motion/velocity-skew";
import { useMounted } from "@/hooks/use-mounted";

/**
 * TottParallaxBand — Talk of the Town (talkofthetownatlanta.com) parallax
 * quote band (Cycle 30, rebuilt Cycle 62). Their homepage uses 16× CSS-parallax
 * sections (`background-attachment: fixed`) — full-bleed photo backgrounds that
 * stay glued to the viewport while the dark band window slides over them.
 *
 * ══ CYCLE 62 — WHY THE EFFECT DIED AND HOW IT COMES BACK ══
 *
 * Cycle 34 wrapped the photo stack in `ClipPathReveal`, whose inner motion.div
 * carries a permanent inline `will-change: transform` (plus scale/y entrance
 * transforms). Per css-transforms-1 §3 + css-will-change-1, ANY ancestor with
 * `will-change: transform` / transform / filter becomes a containing block for
 * fixed-position painting — `background-attachment: fixed` silently degrades
 * to `scroll` and the "photo doesn't move" effect dies. The old comment claimed
 * "the parallax keeps playing inside the clipped container" — wrong: measured
 * 98.26% pixel drift across a 220px scroll (research/c62/parallax-verify.mjs).
 *
 * The rebuild keeps the CSS-native fixed attachment (the exact TOTT/Avada
 * motion) by giving the photo layer a CLEAN ancestor chain — no transformed
 * element between `.tott-parallax` and `<html>`:
 *
 *   section (plain) → div.absolute (plain) → .tott-parallax (fixed bg)
 *
 * The Cycle-34 entrance reveal is reproduced WITHOUT touching the photo's
 * ancestors: a sibling cover panel (bg-black, z above photo+frame, below
 * content) animates its OWN clip-path `inset(0% 0% 0% 0%)` →
 * `inset(100% 0% 0% 0%)` — a top→bottom wipe that exposes the band exactly
 * like the old reveal. clip-path on a SIBLING cannot create a containing
 * block for the photo layer, so the parallax survives the animation and
 * composes with it (photo already viewport-glued as the cover wipes away).
 *
 * Touch / reduced-motion: the CSS falls back to `background-attachment:
 * scroll` (globals.css media queries). On coarse pointers the layer gains a
 * subtle JS drift (useScroll ±7% on a 118%-tall layer) — real parallax life
 * on mobile instead of a static image. On fine pointers NO transform ever
 * touches the layer (would kill the fixed attachment again).
 *
 * Composition:
 *   - `.tott-parallax` bg: /media/c62/nilov-olive-trees-1920.webp
 *     (Cycle 62: single optimized asset — the old build downloaded the raw
 *     657KB JPG for the CSS layer AND a next/image webp copy hidden beneath;
 *     new webp q75 512KB replaces both, new folder+filename = cache-bust per
 *     AGENTS.md §28).
 *   - Layered burgundy/ink gradient overlays (so the cream text reads).
 *   - Centered stack: script accent "приятного аппетита" (Marck Script),
 *     char-split headline "Еда — это ритуал." (SplitTextReveal, sondaven
 *     per-char reveal), supporting line + olive-divider eyebrow.
 *   - 5px cream border frame (their SR7 decorative border shape).
 *   - `data-theme-flip="cream"` resets the espresso theme on entry.
 *
 * Cycle 71 WOW graft («живой материал»): контентный стек (z-10) обёрнут
 * VelocitySkew — при быстрой прокрутке вся цитата-полоса чуть «запинается»
 * (skewY, кламп ±4°/±3°) и упруго возвращается. Фото-слой НА ДЕСКТОПЕ не
 * тронут (любой transform в цепочке предков убил бы background-attachment:
 * fixed — §34, гравля C62): скос фото вплетён в УЖЕ существующий drift-
 * transform и включён только на coarse (там fixed-attachment выключен
 * CSS-фоллбэком, y±7% + skewY — один составной transform того же элемента).
 *
 * @see docs/talkofthetown-MINED-EXTRACTION.md (parallax sections)
 * @see research/c62/parallax-verify.mjs (proof harness — must report
 *      attachment:fixed, 0 breaker ancestors, best shift = 0px with
 *      row-correlation err ≪ ±1px err)
 */

const BAND_BG = "/media/c62/nilov-olive-trees-1920.webp";
/* C71-P1 / K8-MAJOR (Task 3): 828w-вариант для coarse/narrow — 114KB
   (sharp q80, public/media/c62/nilov-olive-trees-828.webp) вместо
   513KB 1920w, который мобильные экраны (390px) скачивали целиком. */
const BAND_BG_COARSE = "/media/c62/nilov-olive-trees-828.webp";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* C83 (Impl-E, Task 4) — reading-highlight лейда: слова подписи полосы
   подсвечиваются по мере прокрутки (opacity 0.25→1 scrub, stagger по
   словам — паттерн «reading highlight» GSAP Vault). H2 уже занят
   SplitTextReveal (chars, once) — highlight уходит на лейд, как
   предписывает план. Текст — один источник: из него сплит и sr-only-твин. */
const BAND_LEDE =
  "Не меню, не список калорий, не логистика. Ритуал, в котором каждая деталь — от первого ножа до последнего бокала — служит одному: моменту, который гости запомнят на всю жизнь.";
const BAND_LEDE_WORDS = BAND_LEDE.split(" ");
/** Полоса чтения на прогрессе прохождения секции: первое слово
 *  загорается на 0.10, последнее — на 0.60 (рамп 0.12 на слово —
 *  слова завершают подсветку к ~0.72, пока центрированный текст ещё
 *  уверенно на экране). ManifestoWord-подобные окна (manifesto.tsx). */
const WORD_START = 0.1;
const WORD_SPAN = 0.5;
const WORD_RAMP = 0.12;

/* c83-F1 (критик-P1 NIT): изоморфный layout-effect. Прямой useLayoutEffect
   в SSR-рендере клиента ругается ворнингом React («does nothing on the
   server» — сыпался в серверную консоль). На сервере берём useEffect
   (SSR-строгий no-op), на клиенте — useLayoutEffect: прыжок спринга к
   текущему прогрессу обязан случиться до первой краски (см. эффект ниже,
   паттерн cep-process.tsx wave-1 D). Порядок эффектов не критичен — это
   разовый замер после layout, не хореография. */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function TottParallaxBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  /** Reveal cover: wipes away when the band enters (sibling — photo's
   * ancestor chain stays clean). Skipped entirely under reduced motion. */
  const coverInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [coverDone, setCoverDone] = useState(false);

  /** Coarse-pointer drift — mobile gets a real (JS) parallax because the CSS
   * fixed attachment is disabled there anyway (globals.css fallback). Fine
   * pointers never receive a transform (fixed attachment must survive). */
  const [isCoarse, setIsCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setIsCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* ═══ C71-P1 (K8 MAJOR, Task 3): выбор разрешения фонового webp ═══
   *
   * Трейдофф (задокументирован по ТЗ): сервер не знает ни pointer, ни ширину
   * экрана. Замер ДО-фикса подтвердил: Chromium скачивает inline CSS-фон
   * В МОМЕНТ РАЗБОРА HTML, а не «при подходе к вьюпорту» (nilov-olive-trees-
   * 1920.webp 513KB стартовал на t=1415ms при скролле 0px — секция на
   * ~8500px). Поэтому «SSR-1920 + подмена на 828 при монте» НЕ сработала бы:
   * к моменту гидрации 513KB уже в полёте. Решение — инверсия дефолта:
   *
   *   SSR рендерит 828w (BAND_BG_COARSE) — худший кейс трансфера закрыт
   *   по умолчанию (телефоны = главный K8-сценарий, −399KB на мобиле);
   *   fine-pointer + широкий экран поднимает до 1920w ПРЯМО НА МОНТЕ
   *   (эффект ниже) — секция ниже фолда на ~8500px, гидрация на 0px,
   *   запас до первого просмотра огромен, подмена без заметного моргания.
   *
   * Цена компромисса: десктоп скачивает ОБА файла (828 при разборе + 1920
   * после монт-апгрейда, ~+114KB к прежнему одиночному 513KB) — сознательный
   * размен «мобильный −399KB / десктоп +114KB». Альтернатива «пустой SSR-фон
   * + URL только с монта» дешевле на десктопе, но оставляет no-JS без фона
   * вовсе — отвергнута. isCoarse-гейт трансформа (drift) не тронут — фон
   * выбирается независимо от reduce (статичному фото тоже нужен правильный
   * вес). */
  const [bgHiRes, setBgHiRes] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (min-width: 828px)",
    );
    const update = () => setBgHiRes(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const bandBg = bgHiRes ? BAND_BG : BAND_BG_COARSE;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const driftRaw = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);
  const drift = useSpring(driftRaw, { stiffness: 90, damping: 26, mass: 0.4 });

  /* C83 (Impl-E, Task 4): reading-highlight — тот же прогресс прохождения
   * секции, отдельный спринг (drift — строковый MV, не переиспользуется).
   * Слова — useTransform-срезы (ManifestoWord-паттерн: чистые MotionValue,
   * ноль ре-рендеров при скролле). iOS-безопасно: MotionValue, фото-слой и
   * его fixed-attachment не затронуты (слова — в контентном стеке z-10). */
  const readProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 26,
    mass: 0.4,
  });
  const wordsMounted = useMounted();
  /* C62 hydration-safety: MotionValue-стили слов цепляются только после
   * монта — SSR и reduce рендерят слова с полной opacity (статика), первая
   * клиент-отрисовка совпадает с SSR; пост-мон-флип — легален. */
  const wordsActive = wordsMounted && !reduce;

  const interactedRef = useRef(false);
  /* SSR-flash fix (cep-process wave-1 D): на перезагрузке, уже заскролленной
   * в полосу, спринг не должен разгоняться с 0 — прыжок к текущему прогрессу
   * в layout-effect, после коммита стилей, до первой анимированной краски.
   * c83-F1: useIsoLayoutEffect (см. выше) — без SSR-ворнинга. */
  useIsoLayoutEffect(() => {
    if (wordsActive) readProgress.jump(scrollYProgress.get());
  }, [wordsActive, readProgress, scrollYProgress]);

  /* Passive-restoration re-anchor (cep-process wave-2 A): браузер может
   * восстановить позицию скролла ПОСЛЕ гидрации — до первого реального
   * взаимодействия каждый window-scroll считается пассивным восстановлением,
   * и спринг прыгает к живому прогрессу (иначе слова «прочерчиваются» на
   * стоячей странице). После первого взаимодействия — обычный плавный scrub. */
  useEffect(() => {
    const mark = () => {
      interactedRef.current = true;
    };
    const reanchor = () => {
      if (!interactedRef.current) readProgress.jump(scrollYProgress.get());
    };
    const opts = { passive: true } as const;
    window.addEventListener("pointerdown", mark, opts);
    window.addEventListener("wheel", mark, opts);
    window.addEventListener("touchstart", mark, opts);
    window.addEventListener("keydown", mark, opts);
    window.addEventListener("scroll", reanchor, opts);
    return () => {
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchstart", mark);
      window.removeEventListener("keydown", mark);
      window.removeEventListener("scroll", reanchor);
    };
  }, [readProgress, scrollYProgress]);

  const driftActive = isCoarse && !reduce;

  /** C71: velocity-skew фото-слоя — ТОЛЬКО на coarse (driftActive), тем же
   * transform-узлом, что и drift; десктоп остаётся чистым (fixed §34).
   * F3-рекомендация: enabled-гейт закрыл пустой rAF-трафик цепочки
   * velocity→spring на десктопе, где результат не прикреплён к стилям. */
  const photoSkew = useVelocitySkewDeg(4, 3, { enabled: driftActive });

  return (
    <section
      ref={sectionRef}
      data-header-theme="dark"
      data-theme-flip="cream"
      aria-label="Еда как ритуал"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-black py-24"
    >
      {/*
        Parallax background — CSS background-attachment: fixed (TOTT's Avada
        pattern). C62 REBUILD: the photo layer sits inside a PLAIN absolute
        wrapper — its ancestor chain (section → main → body → html) contains
        no transform / filter / will-change, so the fixed attachment actually
        attaches to the viewport. On touch the layer is oversized (118%) and
        drifts ±7% with scroll (JS parallax); on desktop it is exactly
        inset-0 with zero transforms.
      */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className={
            driftActive
              ? "tott-parallax absolute -top-[9%] left-0 right-0 h-[118%]"
              : "tott-parallax absolute inset-0"
          }
          style={
            driftActive
              ? { backgroundImage: `url('${bandBg}')`, y: drift, skewY: photoSkew }
              : { backgroundImage: `url('${bandBg}')` }
          }
          aria-hidden="true"
        >
          {/* No next/image here — the CSS layer IS the visual (single
              optimized webp download, C62; 828w/1920w-выбор — C71-P1 Task 3,
              см. комментарий к bandBg выше). The parallax motion comes from
              background-attachment: fixed on .tott-parallax (desktop) or
              the drift transform (touch only). */}
        </motion.div>
      </div>

      {/* Burgundy-ink gradient overlays — deepen edges so cream text reads.
          C62 (seal-critic note): on narrow screens the busier photo made the
          body copy harder to read — mobile gets a heavier veil (max-md). */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-b from-black/70 via-black/45 to-black/75 max-md:from-black/80 max-md:via-black/60 max-md:to-black/85"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,rgba(139,31,28,0.25)_0%,rgba(0,0,0,0.55)_100%)]"
        aria-hidden="true"
      />

      {/* 5px cream border frame — their SR7 decorative border shape. */}
      <span className="tott-border-frame tott-border-frame--cream z-[3]" aria-hidden="true" />

      {/*
        Reveal cover (C62): sibling wipe panel — animates its own clip-path
        top→bottom; never wraps the photo layer, so the fixed attachment is
        unaffected.

        HYDRATION-SAFE (C62, per blind-QA finding): the panel is ALWAYS in
        the DOM — useReducedMotion() is false during SSR and true on a
        reduce-client first render, so conditional cover rendering produced
        a hydration mismatch (React regenerated the whole tree + a black
        flash). Now: reduce hides the panel via the CSS media query
        (.tott-band-cover → display:none, pre-paint, zero flash) while the
        ANIMATION stays JS-gated. Post-animation unmount (coverDone) is a
        legal post-hydration update.
      */}
      {!coverDone && (
        <motion.div
          aria-hidden="true"
          className="tott-band-cover pointer-events-none absolute inset-0 z-[4] bg-black"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={
            coverInView && !reduce
              ? { clipPath: "inset(100% 0% 0% 0%)" }
              : undefined
          }
          transition={{ duration: 1.2, ease: EASE }}
          onAnimationComplete={() => setCoverDone(true)}
        />
      )}

      {/* Centered content. Soft inherited text-shadow (C62 seal note) lifts
          the olive script + body copy off the busy foliage without touching
          the TOTT palette. C71: стек обёрнут VelocitySkew (сиблинг фото-слоя,
          не предок — цепочка предков фото чиста, §34) — «живой материал»
          на быстрой прокрутке. */}
      <VelocitySkew className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.5),0_0_2px_rgba(0,0,0,0.35)]">
        <TottReveal
          variant="fade-left"
          as="p"
          className="tott-script mb-4 text-tott-olive"
          text={undefined}
        >
          <span style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>приятного аппетита</span>
        </TottReveal>

        {/* Char-split headline — sondaven.com split-line per-char reveal.
            RU text in Playfair (Cyrillic-safe serif fallback). Same delay
            (0.15s) so the headline lifts in after the script accent settles. */}
        <SplitTextReveal
          as="h2"
          mode="chars"
          stagger={0.03}
          delay={0.15}
          /* C71 (K1-MINOR): заголовок полосы наследовал 16px контейнера —
             слом иерархии H2. Крупный кинематографичный кегль, clamp по
             вьюпортам (K2: на 390px не должен рвать строку — проверено
             переносом по словам, не посимвольно). */
          className="font-serif text-white text-3xl sm:text-4xl md:text-5xl leading-tight"
        >
          Еда — это ритуал.
        </SplitTextReveal>

        <TottReveal
          variant="fade-right"
          as="p"
          className="tott-body mt-6 mx-auto max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
          text={undefined}
        >
          {/* C83 (Impl-E, Task 4): reading-highlight — доступный текст в
              sr-only-твине (81-F3 SplitTextReveal-паттерн), видимые слова —
              aria-hidden; каждое слово — срез прогресса прохождения секции
              (scrub-подсветка 0.25→1, stagger). TottReveal fade-right входа
              НЕ тронут (композитится по opacity). Reduce/pre-mount — слова
              со статичной полной opacity. */}
          <span className="sr-only">{BAND_LEDE}</span>
          <span aria-hidden="true">
            {BAND_LEDE_WORDS.map((word, i) => (
              <BandWord
                key={i}
                word={word}
                index={i}
                total={BAND_LEDE_WORDS.length}
                progress={readProgress}
                active={wordsActive}
              />
            ))}
          </span>
        </TottReveal>

        <TottReveal
          variant="fade-left"
          as="p"
          className="tott-eyebrow mt-10 justify-center text-white/70"
          text={undefined}
        >
          <span style={{ color: "var(--tott-olive)" }}>nilov catering · с 2007 года</span>
        </TottReveal>
      </VelocitySkew>
    </section>
  );
}

/**
 * BandWord — одно слово лейды: подсвечивается 0.25→1 на собственном срезе
 * прогресса прохождения полосы (ManifestoWord-паттерн: per-word
 * useTransform → чистые MotionValue, ноль ре-рендеров при scrub).
 * active=false (SSR / pre-mount / reduced-motion) — статичная полная
 * opacity (reveal.tsx:32-35 swap-паттерн). Инлайн-слова со «внутренним»
 * пробелом — перенос строк работает нативно, без inline-block-обёрток.
 */
function BandWord({
  word,
  index,
  total,
  progress,
  active,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const start = WORD_START + (index / (total - 1)) * WORD_SPAN;
  const opacity = useTransform(
    progress,
    [start, start + WORD_RAMP],
    [0.25, 1],
  );
  return (
    <motion.span style={active ? { opacity } : { opacity: 1 }}>
      {word}{" "}
    </motion.span>
  );
}

export default TottParallaxBand;
