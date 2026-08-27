"use client";

/**
 * StageServices — Cycle 44. «Сцена» (The Stage).
 * ---------------------------------------------------------------------------
 *
 * REDESIGN RATIONALE: the user rejected Cycle 43 («не awwwards уровень на
 * август 2026, устаревшее и не стильное»). Trend research C44-A (live Aug
 * 2026 SOTD/SOTM data: Cipher, Oimachi, LIKOVA, Revelatio, Lama Lama, TFTL,
 * Iventions, By-Kin) confirmed why — cursor-follow card = commoditized
 * 2021–23 pattern (Webflow/Elementor tutorials since 2025), dotted leaders =
 * awwwards.com's OWN site chrome (zero Aug-2026 winners use it), Inter Tight
 * = the default-look font, #F8F8F8 = the cool sterile gray no current
 * light-mode winner uses.
 *
 * THE AUG-2026 RECIPE (per research §5), implemented here:
 *   1. ONE authored motif derived from the subject — «spotlight/stage»
 *      (precedent: Iventions, an events company, SOTD): warm eggshell stage,
 *      a soft spotlight that follows the cursor across the whole section,
 *      spotlit hover states, «Семь сцен для вашего события» headline.
 *   2. Kinetic variable-font Cyrillic display type — Unbounded wght 200–900
 *      (Polkadot's open font, full Cyrillic) with ANIMATED weight axis on
 *      hover (THE named 2026 type trend — Mat Voyce SOTD); Golos Text
 *      (Russian-designed neo-grotesk) for body/UI/meta. No Inter anywhere.
 *   3. Shader-grade preview media — the cursor-follow card is UPGRADED to
 *      an OGL flowmap liquid-displacement transition (research C44-C, PoC
 *      verified): velocity-driven distortion + A→B displacement swap between
 *      service photos + idle liquid wobble. Fallback <img> for reduced
 *      motion / no WebGL / context loss.
 *   4. Two-color warm stage + animated film grain (3–5%, steps() jitter) —
 *      the 2026 "living surface". Ink #161412 / stage #F4F0E8 / one accent
 *      (#FA5D29 kept for brand continuity).
 *   5. Scroll-choreographed clip-path row reveals + scroll-velocity skew on
 *      the mega-title (velocity response is current baseline-plus).
 *   6. Odometer digit-roll counters (Revelatio pattern) for the stats strip.
 *   7. 60fps discipline (single fullscreen triangle, DPR≤2, render-skip when
 *      closed/offscreen) + full reduced-motion parity + keyboard-docked
 *      preview — kept from Cycle 43 (juror-scored criteria now).
 *
 * Content structure (validated by C44-A research): 7 primary scenes with
 * price anchoring + 6 secondary «Ещё услуги» + marquee teaser + magnetic CTA.
 *
 * Self-contained: scoped CSS in ./stage-services.css (`sv-st__*` classes).
 * Swaps AwServices in page.tsx (both kept on disk per repo convention).
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Unbounded, Golos_Text } from "next/font/google";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { Flowmap, Mesh, Program, Renderer, Texture, Triangle, Vec2 } from "ogl";

import { SmartImage } from "@/components/media/smart-image";
import { useMounted } from "@/hooks/use-mounted";

import "./stage-services.css";

/** Unbounded — variable wght 200–900, full Cyrillic (display/kinetic type). */
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--sv-unb",
  display: "swap",
});

/** Golos Text — Russian-designed variable 400–900 (body/UI/meta). */
const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--sv-golos",
  display: "swap",
});

/** House ease. */
const EASE_HOUSE = [0.22, 1, 0.36, 1] as const;
/** Float OPEN — Dennis's expo-out (kept: asymmetric enter/exit is current). */
const EASE_OPEN = [0.34, 1, 0.64, 1] as const;
/** Float CLOSE. */
const EASE_CLOSE = [0.36, 0, 0.66, 0] as const;

/* ------------------------------------------------------------------ data -- */

type Scene = {
  id: string;
  index: string;
  title: string;
  hook: string;
  price: string;
  guests: string;
  media: string;
  ctaLabel: string;
  ctaHref: string;
};

/** 7 primary scenes — same validated content as Cycle 43. */
const SCENES: Scene[] = [
  {
    id: "furshety",
    index: "01",
    title: "Фуршеты и коктейльные приёмы",
    hook: "Канапе, welcome-коктейли и подача, которая не останавливается ни на минуту.",
    price: "от 1\u00A0600\u00A0₽/гость",
    guests: "от 20 гостей",
    media: "/media/furshet-1.jpg",
    ctaLabel: "Рассчитать фуршет",
    ctaHref: "#calculator",
  },
  {
    id: "bankety",
    index: "02",
    title: "Банкеты",
    hook: "Полная посадка: от аперитива до десерта — официанты, сомелье и тайминг до минуты.",
    price: "от 3\u00A0500\u00A0₽/гость",
    guests: "от 30 гостей",
    media: "/media/gamma/gamma-catering-ballroom-chandelier-banquet.jpg",
    ctaLabel: "Рассчитать банкет",
    ctaHref: "#calculator",
  },
  {
    id: "svadby",
    index: "03",
    title: "Свадьбы",
    hook: "Выездная регистрация, банкет и торт — одна команда отвечает за весь день.",
    price: "от 5\u00A0500\u00A0₽/гость",
    guests: "от 40 гостей",
    media: "/media/event-wedding-light.jpg",
    ctaLabel: "Обсудить свадьбу",
    ctaHref: "#contact",
  },
  {
    id: "korporativ",
    index: "04",
    title: "Корпоративные мероприятия",
    hook: "Конференции, форумы и гала-ужины: кофе-брейки, фуршеты и полный техтайминг.",
    price: "от 2\u00A0500\u00A0₽/гость",
    guests: "от 30 гостей",
    media: "/media/gamma/firmenevent-messe-gala-bankett-gammacatering.jpg",
    ctaLabel: "Запросить смету",
    ctaHref: "#contact",
  },
  {
    id: "kofe-breyki",
    index: "05",
    title: "Кофе-брейки и обеды в офис",
    hook: "Горячее в термоупаковке к 12:00 — каждый день или к вашей дате.",
    /* 650 = office-lunch.perGuest в lib/pricing.ts — низшая цена пары
       «кофе-брейки + обеды»; 450 в прейскуранте не существует (C59/W6) */
    price: "от 650\u00A0₽/гость",
    guests: "от 15 гостей",
    media: "/media/menu-coffee-break.jpg",
    ctaLabel: "Заказать кофе-брейк",
    ctaHref: "#calculator",
  },
  {
    id: "barbekyu",
    index: "06",
    title: "Барбекю и гриль-станции",
    hook: "Рибай и овощи с мангала — живой огонь и ароматы, которые собирают гостей.",
    price: "от 2\u00A0000\u00A0₽/гость",
    guests: "от 20 гостей",
    media: "/media/talkofthetown/talkofthetown-section-paella-station.jpg",
    ctaLabel: "Рассчитать барбекю",
    ctaHref: "#calculator",
  },
  {
    id: "bar",
    index: "07",
    title: "Выездной бар",
    hook: "Коктейли, моктейли и винная подача: бармены, лёд, бокалы и настроение.",
    price: "от 900\u00A0₽/гость",
    guests: "от 25 гостей",
    media: "/media/gamma/sommelier-uniform-weinservice-gammacatering.jpg",
    ctaLabel: "Обсудить бар",
    ctaHref: "#contact",
  },
];

type ExtraService = {
  id: string;
  title: string;
  hook: string;
  media: string;
};

const EXTRAS: ExtraService[] = [
  {
    id: "shou-stancii",
    title: "Шоу-станции шефа",
    hook: "Поке, паста, карвинг и тако: гости смотрят, как рождается блюдо.",
    media: "/media/gamma/showkueche-live-cooking-koeche-gammacatering.jpg",
  },
  {
    id: "gastro-boksy",
    title: "Гастро-боксы и доставка закусок",
    hook: "6–8 видов канапе, упакованных порционно, — к нужному часу.",
    media: "/media/menu-snack-box.jpg",
  },
  {
    id: "vyezdnaya-registraciya",
    title: "Выездная регистрация",
    hook: "Сервировка церемонии бракосочетания: тонкий момент — тонкая работа.",
    media: "/media/gamma/hochzeit-tischdekoration-zitronen-gedeck-gammacatering.jpg",
  },
  {
    id: "torty",
    title: "Торты на заказ",
    hook: "Ярусы, текстуры, сезонные ягоды: торт как архитектура.",
    media: "/media/concorde-dessert.jpg",
  },
  {
    id: "veg-halal",
    title: "Вегетарианское и халяль-меню",
    hook: "Сертифицированные поставки и овощи как главные герои.",
    media: "/media/ridgewells-veg-mosaic.jpg",
  },
  {
    id: "logistika",
    title: "Логистика под ключ",
    hook: "Посуда, мебель, текстиль, декор: привезли — сервировали — забрали.",
    media: "/media/gamma/event-service-tischeindeckung-gala-gammacatering.jpg",
  },
];

/** Stats strip (odometer targets) — 07/13 self-evident, 17 лет & 120 000
 *  гостей are established site facts (AGENTS.md trust data). */
const STATS: { value: string; label: string }[] = [
  { value: "07", label: "сцен под ключ" },
  { value: "13", label: "услуг всего" },
  { value: "17", label: "лет на рынке" },
  { value: "120 000", label: "гостей накормлено" },
];

/* -------------------------------------------------- flowmap webgl engine -- */

const FLOW_VERT = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

/**
 * Flowmap-driven liquid displacement A→B transition (research C44-C §3.2,
 * PoC-verified). Velocity trail bends the "from" image out and the "to"
 * image in; idle wobble keeps the media alive between moves.
 */
const FLOW_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexture0;
  uniform sampler2D uTexture1;
  uniform sampler2D tFlow;
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;

  void main() {
    vec3 flow = texture2D(tFlow, vUv).rgb;

    float idleX = 0.007 * sin(vUv.y * 9.0 + uTime * 0.9);
    float idleY = 0.007 * cos(vUv.x * 8.0 + uTime * 0.7);
    vec2 disp = flow.xy * 0.38 + vec2(idleX, idleY);

    vec2 distorted0 = vUv + disp * uProgress;
    vec2 distorted1 = vUv + disp * (1.0 - uProgress);

    vec4 tex0 = texture2D(uTexture0, distorted0);
    vec4 tex1 = texture2D(uTexture1, distorted1);
    gl_FragColor = mix(tex0, tex1, uProgress);
  }
`;

type FlowEngine = {
  setPointer: (clientX: number, clientY: number) => void;
  swapTo: (index: number) => void;
  /** Card reopened — replay a liquid entrance burst on the current image. */
  burst: () => void;
};

/**
 * FlowmapPreview — the shader media inside the floating card. Renders a
 * WebGL canvas with the OGL flowmap displacement transition; falls back to
 * a plain crossfading image for reduced-motion / no-WebGL / context-loss.
 * All positioning (cursor-follow, scale in/out) is owned by the parent
 * framer-motion layers — this component paints pixels only.
 */
function FlowmapPreview({
  images,
  activeIndex,
  reduce,
  engineRef,
}: {
  images: string[];
  activeIndex: number | null;
  reduce: boolean;
  engineRef: React.MutableRefObject<FlowEngine | null>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (reduce) return;
    /* capability probe — WebGL2 with a real context */
    try {
      const probe = document.createElement("canvas");
      if (!probe.getContext("webgl2")) {
        setFailed(true);
        return;
      }
    } catch {
      setFailed(true);
      return;
    }

    const host = canvasHostRef.current;
    const wrap = wrapRef.current;
    if (!host || !wrap) return;

    let disposed = false;
    let raf = 0;
    let textures: Texture[] = [];

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      alpha: false,
    });
    const gl = renderer.gl;
    host.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    gl.canvas.addEventListener("webglcontextlost", onLost);

    const flowmap = new Flowmap(gl, { falloff: 0.3, dissipation: 0.94 });
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: FLOW_VERT,
      fragment: FLOW_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 1 },
        uTexture0: { value: null as Texture | null },
        uTexture1: { value: null as Texture | null },
        tFlow: flowmap.uniform,
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    /* size follows the CSS-clamped card via ResizeObserver */
    const resize = () => {
      const w = wrap.clientWidth || 320;
      const h = wrap.clientHeight || 400;
      renderer.setSize(w, h);
      flowmap.aspect = w / h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    /* pointer → flowmap trail (coords come from the parent's mousemove) */
    const mouse = new Vec2(-1);
    const velocity = new Vec2();
    const lastMouse = new Vec2();
    let lastTime = 0;
    let hasNewPointer = false;

    const setPointer = (cx: number, cy: number) => {
      const r = wrap.getBoundingClientRect();
      mouse.set(
        Math.min(1, Math.max(0, (cx - r.left) / Math.max(1, r.width))),
        1 - Math.min(1, Math.max(0, (cy - r.top) / Math.max(1, r.height))),
      );
      if (!lastTime) {
        lastTime = performance.now();
        lastMouse.set(cx, cy);
      }
      const dt = Math.max(14, performance.now() - lastTime);
      velocity.x = (cx - lastMouse.x) / dt;
      velocity.y = (cy - lastMouse.y) / dt;
      lastMouse.set(cx, cy);
      lastTime = performance.now();
      hasNewPointer = true;
    };

    /* cover-crop preload at card resolution × dpr (bounds GPU memory) */
    const maxTexW = 400 * 2;
    const maxTexH = 500 * 2;
    const load = (url: string) =>
      new Promise<Texture>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = maxTexW;
          c.height = maxTexH;
          const ctx = c.getContext("2d");
          if (!ctx) {
            resolve(new Texture(gl, { image: img }));
            return;
          }
          const s = Math.max(maxTexW / img.width, maxTexH / img.height);
          const dw = img.width * s;
          const dh = img.height * s;
          ctx.drawImage(img, (maxTexW - dw) / 2, (maxTexH - dh) / 2, dw, dh);
          resolve(
            new Texture(gl, {
              image: c,
              minFilter: gl.LINEAR,
              magFilter: gl.LINEAR,
            }),
          );
        };
        img.onerror = () => resolve(new Texture(gl));
        img.src = url;
      });

    let current = 0;
    let started = false;
    let visible = false; /* render-skip while the card is fully closed */

    const swapTo = (i: number) => {
      if (!started || i === current) return;
      const p = program.uniforms.uProgress.value as number;
      if (p < 0.5) {
        /* mid-blend: retarget the incoming image, keep the mix running */
        program.uniforms.uTexture1.value = textures[i];
      } else {
        program.uniforms.uTexture0.value = textures[current];
        program.uniforms.uTexture1.value = textures[i];
        program.uniforms.uProgress.value = 0;
      }
      current = i;
    };

    /** Entrance burst: same image in both slots, progress restarts — the
     *  displacement mix replays as a pure liquid ripple reveal. */
    const burst = () => {
      if (!started) return;
      program.uniforms.uTexture0.value = textures[current];
      program.uniforms.uTexture1.value = textures[current];
      program.uniforms.uProgress.value = 0;
    };

    engineRef.current = { setPointer, swapTo, burst };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!started || disposed) return;
      /* skip GPU work while the card is hidden and blends are settled */
      if (!visible && (program.uniforms.uProgress.value as number) >= 1) {
        return;
      }
      const p = program.uniforms.uProgress.value as number;
      if (p < 1) {
        /* expo-out ease toward 1 (~0.65s @60fps — long enough to READ) */
        program.uniforms.uProgress.value = p + (1 - p) * 0.062;
        if (program.uniforms.uProgress.value > 0.995) {
          program.uniforms.uProgress.value = 1;
        }
      }

      if (!hasNewPointer) {
        mouse.set(-1);
        velocity.set(0);
      }
      hasNewPointer = false;
      flowmap.mouse.copy(mouse);
      flowmap.velocity.lerp(velocity, velocity.len() ? 0.5 : 0.1);
      flowmap.update();

      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(frame);

    /* card visibility gate (render-skip) */
    const visObs = new MutationObserver(() => {
      visible = wrap.dataset.open === "true";
    });
    visObs.observe(wrap, { attributes: true, attributeFilter: ["data-open"] });
    visible = wrap.dataset.open === "true";

    Promise.all(images.map(load)).then((tex) => {
      if (disposed) return;
      textures = tex;
      program.uniforms.uTexture0.value = tex[0];
      program.uniforms.uTexture1.value = tex[0];
      started = true;
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      visObs.disconnect();
      gl.canvas.removeEventListener("webglcontextlost", onLost);
      engineRef.current = null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [reduce, images, engineRef]);

  /* row-hover changes drive the shader swap; reopening replays a burst */
  const prevActive = useRef<number | null>(null);
  useEffect(() => {
    if (activeIndex != null) {
      if (prevActive.current === null) engineRef.current?.burst();
      engineRef.current?.swapTo(activeIndex);
    }
    prevActive.current = activeIndex;
  }, [activeIndex, engineRef]);

  if (reduce || failed) {
    /* graceful fallback: stacked crossfading images (C43 behavior) */
    return (
      <div ref={wrapRef} className="sv-st__media">
        {images.map((src, i) => (
          <span key={src} className="sv-st__media-img" data-on={i === activeIndex}>
            <SmartImage src={src} alt="" fill sizes="(min-width: 1024px) 26vw, 0px" />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="sv-st__media" data-open={activeIndex !== null}>
      <div ref={canvasHostRef} className="sv-st__media-gl" aria-hidden="true" />
      {/* noscript/no-GL safety net beneath the canvas */}
      <span className="sv-st__media-img" data-on={activeIndex != null}>
        <SmartImage
          src={images[activeIndex ?? 0]}
          alt=""
          fill
          sizes="(min-width: 1024px) 26vw, 0px"
        />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------ odometer ---- */

/**
 * Odometer — digit-column roll counters (Revelatio SOTD pattern). Each digit
 * is a vertical 0–9 strip; on inView the columns translate to their targets
 * with staggered delays. Reduced motion → static text.
 */
function Odometer({ value, play }: { value: string; play: boolean }) {
  const digits = useMemo(() => value.split(""), [value]);
  return (
    <span className="sv-st-odo" aria-hidden="true">
      {digits.map((ch, i) =>
        ch === " " ? (
          <span className="sv-st-odo__gap" key={`g${i}`} />
        ) : (
          <span className="sv-st-odo__digit" key={i}>
            <span
              className="sv-st-odo__col"
              style={{
                transform: play ? `translateY(calc(var(--d) * -1em))` : undefined,
                ["--d" as string]: ch,
                transitionDelay: `${i * 70}ms`,
              }}
            >
              {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ),
      )}
    </span>
  );
}

/* ------------------------------------------------------------- magnetic -- */

function MagneticLink({
  href,
  enabled,
  children,
}: {
  href: string;
  enabled: boolean;
  children: ReactNode;
}) {
  const x = useSpring(0, { stiffness: 180, damping: 14, mass: 0.4 });
  const y = useSpring(0, { stiffness: 180, damping: 14, mass: 0.4 });

  const onMove = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>) => {
      if (!enabled) return;
      const r = e.currentTarget.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      x.set(Math.max(-1, Math.min(1, dx)) * 14);
      y.set(Math.max(-1, Math.min(1, dy)) * 10);
    },
    [enabled, x, y],
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.a
      href={href}
      className="sv-st__cta"
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.a>
  );
}

/* ------------------------------------------------------------- main comp -- */

export function StageServices() {
  const mounted = useMounted();
  const reduceMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const headInView = useInView(headRef, { once: true, margin: "-80px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-60px" });

  /** fine-pointer desktop gate for the float + spotlight */
  const [fineDesktop, setFineDesktop] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const engineRef = useRef<FlowEngine | null>(null);
  const headingId = useId();

  const reduce = Boolean(mounted && reduceMotion);
  const floatEnabled = mounted && fineDesktop && !reduce;
  const magneticEnabled = mounted && !reduce;

  useEffect(() => {
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const widthMq = window.matchMedia("(min-width: 1024px)");
    const update = () => setFineDesktop(widthMq.matches && !coarseMq.matches);
    update();
    coarseMq.addEventListener("change", update);
    widthMq.addEventListener("change", update);
    return () => {
      coarseMq.removeEventListener("change", update);
      widthMq.removeEventListener("change", update);
    };
  }, []);

  /* ---- cursor follow (framer springs) + shader pointer + spotlight ---- */

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 150, damping: 22, mass: 0.6 });
  const vx = useVelocity(sx);
  const skewRaw = useTransform(vx, [-2000, 0, 2000], [-6, 0, 6], { clamp: true });
  const skew = useSpring(skewRaw, { stiffness: 200, damping: 30 });

  /* spotlight CSS vars — rAF-throttled */
  const spotPending = useRef(false);
  const spotLatest = useRef({ x: 0, y: 0 });

  const handleSectionPointer = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (!fineDesktop) return;
      spotLatest.current = { x: e.clientX, y: e.clientY };
      if (spotPending.current) return;
      spotPending.current = true;
      requestAnimationFrame(() => {
        spotPending.current = false;
        const el = sectionRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--sv-mx", `${spotLatest.current.x - r.left}px`);
        el.style.setProperty("--sv-my", `${spotLatest.current.y - r.top}px`);
      });
    },
    [fineDesktop],
  );

  const handleListMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (!floatEnabled) return;
      mx.set(e.clientX);
      my.set(e.clientY);
      engineRef.current?.setPointer(e.clientX, e.clientY);
    },
    [floatEnabled, mx, my],
  );

  const handleRowEnter = useCallback((i: number) => {
    setActive(i);
  }, []);

  const handleListMouseLeave = useCallback(() => {
    setActive(null);
  }, []);

  const handleListBlur = useCallback(
    (e: ReactFocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setActive(null);
      }
    },
    [],
  );

  /** keyboard parity: :focus-visible docks the card at the row's right edge */
  const handleRowFocus = useCallback(
    (e: ReactFocusEvent<HTMLAnchorElement>, i: number) => {
      if (!floatEnabled) return;
      if (!e.currentTarget.matches(":focus-visible")) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const w = cardRef.current?.offsetWidth ?? 340;
      mx.set(Math.max(rect.right - w / 2 - 32, w / 2 + 16));
      my.set(rect.top + rect.height / 2);
      setActive(i);
    },
    [floatEnabled, mx, my],
  );

  /* scroll-velocity skew on the mega-title (subtle, clamped ±1.6°) */
  const { scrollY } = useScroll();
  const scrollVel = useVelocity(scrollY);
  const titleSkewRaw = useTransform(scrollVel, [-2400, 0, 2400], [1.6, 0, -1.6], {
    clamp: true,
  });
  const titleSkew = useSpring(titleSkewRaw, { stiffness: 120, damping: 26 });

  const activeScene = active !== null ? SCENES[active] : null;
  const mediaList = useMemo(() => SCENES.map((s) => s.media), []);

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-labelledby={headingId}
      data-header-theme="light"
      className={`sv-st ${unbounded.variable} ${golos.variable}`}
      onPointerMove={handleSectionPointer}
    >
      {/* ambient spotlight that follows the cursor (authored motif) */}
      <div className="sv-st__spot" aria-hidden="true" />
      {/* static warm glow behind the head — the stage light */}
      <div className="sv-st__glow" aria-hidden="true" />

      <div className="sv-st__container">
        {/* ------------------------------------------------------- head -- */}
        <motion.header
          ref={headRef}
          className="sv-st__head"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE_HOUSE }}
        >
          <p className="sv-st__eyebrow">
            <span className="sv-st__eyebrow-label">Услуги</span>
            <span className="sv-st__eyebrow-count">{SCENES.length}</span>
            <span className="sv-st__eyebrow-note">· семь сцен · один подрядчик</span>
          </p>

          <motion.h2
            id={headingId}
            className="sv-st__title"
            style={reduce ? undefined : { skewY: titleSkew }}
          >
            {"Семь "}
            <span className="sv-st__title-accent">сцен</span>
            {" для вашего события"}
          </motion.h2>

          <p className="sv-st__sub">
            {"От офисного "}
            <span className="sv-st__nowrap">кофе-брейка</span>
            {" до свадьбы на триста гостей — мы выстраиваем сцену под ваш повод: свет, подача, тайминг. Проведите курсором по списку — каждая сцена покажет себя."}
          </p>
        </motion.header>

        {/* --------------------------------------------------- row list -- */}
        <div
          ref={listRef}
          className="sv-st__list"
          data-hover={active !== null ? "true" : "false"}
          onMouseMove={handleListMouseMove}
          onMouseLeave={handleListMouseLeave}
          onBlur={handleListBlur}
        >
          {SCENES.map((svc, i) => (
            <RowReveal key={svc.id} index={i} reduce={reduce}>
              <a
                className="sv-st__row"
                href={svc.ctaHref}
                aria-label={`${svc.title} — ${svc.ctaLabel}`}
                onMouseEnter={() => handleRowEnter(i)}
                onFocus={(e) => handleRowFocus(e, i)}
              >
                <span className="sv-st__row-index">{svc.index}</span>

                <span className="sv-st__row-thumb" aria-hidden="true">
                  <SmartImage
                    src={svc.media}
                    alt=""
                    fill
                    sizes="(max-width: 1023px) 20vw, 0px"
                  />
                </span>

                <span className="sv-st__row-body">
                  <span className="sv-st__row-title">{svc.title}</span>
                  <span className="sv-st__row-hook">{svc.hook}</span>
                </span>

                <span className="sv-st__row-tags">
                  <span className="sv-st__row-price">{svc.price}</span>
                  <span className="sv-st__row-guests">{svc.guests}</span>
                </span>

                <span className="sv-st__row-arrow" aria-hidden="true">
                  <ArrowUpRight strokeWidth={1.75} aria-hidden="true" />
                </span>
              </a>
            </RowReveal>
          ))}
        </div>

        {/* ------------------------------------------- secondary (expand) -- */}
        <div className="sv-st__more-wrap">
          <button
            type="button"
            className="sv-st__more-toggle"
            aria-expanded={expanded}
            aria-controls="sv-services-more"
            onClick={() => setExpanded((v) => !v)}
          >
            <span>
              {expanded ? "Свернуть" : "Ещё услуги"}
              <i className="sv-st__more-count">{EXTRAS.length}</i>
            </span>
            <Plus
              className="sv-st__more-icon"
              data-open={expanded ? "true" : "false"}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                id="sv-services-more"
                className="sv-st__more"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE_HOUSE }}
              >
                <div className="sv-st__more-grid">
                  {EXTRAS.map((s, i) => (
                    <motion.a
                      key={s.id}
                      className="sv-st__more-card"
                      href="#calculator"
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(i * 0.05, 0.25),
                        ease: EASE_HOUSE,
                      }}
                    >
                      <span className="sv-st__more-thumb">
                        <SmartImage
                          src={s.media}
                          alt={s.title}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1023px) 45vw, 30vw"
                        />
                      </span>
                      <span className="sv-st__more-body">
                        <span className="sv-st__more-title">{s.title}</span>
                        <span className="sv-st__more-hook">{s.hook}</span>
                      </span>
                      <ArrowUpRight
                        className="sv-st__more-arrow"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------------------------------------- marquee (2nd tier ad) -- */}
        <div className="sv-st__marquee" aria-hidden="true">
          <div className="sv-st__marquee-track">
            {[0, 1].map((dup) => (
              <div className="sv-st__marquee-seg" key={dup}>
                {EXTRAS.map((s) => (
                  <span className="sv-st__marquee-item" key={s.id}>
                    {s.title}
                    <i className="sv-st__marquee-star">✳</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------- foot -- */}
        <div className="sv-st__foot" ref={statsRef}>
          <div className="sv-st__stats">
            {STATS.map((s) => (
              <div className="sv-st__stat" key={s.label}>
                {reduce ? (
                  <span className="sv-st__stat-value">{s.value}</span>
                ) : (
                  <>
                    <Odometer value={s.value} play={mounted && statsInView} />
                    <span className="sr-only">{s.value}</span>
                  </>
                )}
                <span className="sv-st__stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="sv-st__foot-actions">
            <MagneticLink href="#calculator" enabled={magneticEnabled}>
              {"Получить смету за 30 минут"}
              <ArrowUpRight strokeWidth={1.75} aria-hidden="true" />
            </MagneticLink>
            <a className="sv-st__foot-alt" href="#contact">
              {"или напишите нам"}
            </a>
          </div>
        </div>
      </div>

      {/* ------------------- cursor-following shader float (desktop) ---- */}
      <div className="sv-st__float" aria-hidden="true">
        <motion.div className="sv-st__float-lag" style={{ x: sx, y: sy }}>
          <motion.div
            ref={cardRef}
            className="sv-st__float-card"
            initial={false}
            animate={active !== null ? "open" : "closed"}
            variants={{
              open: {
                scale: 1,
                opacity: 1,
                rotate: 0,
                transition: { duration: 0.4, ease: EASE_OPEN },
              },
              closed: {
                scale: 0,
                opacity: 0,
                rotate: -4,
                transition: {
                  scale: { duration: 0.4, ease: EASE_CLOSE },
                  opacity: { duration: 0.25, ease: "easeOut" },
                  rotate: { duration: 0.4, ease: EASE_CLOSE },
                },
              },
            }}
            style={{ x: "-50%", y: "-56%", skewX: skew }}
          >
            <FlowmapPreview
              images={mediaList}
              activeIndex={active}
              reduce={reduce}
              engineRef={engineRef}
            />

            <div className="sv-st__float-cap">
              <AnimatePresence mode="wait" initial={false}>
                {activeScene && (
                  <motion.span
                    key={activeScene.id}
                    className="sv-st__float-cap-inner"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <span className="sv-st__float-cap-index">
                      {activeScene.index} · {activeScene.guests}
                    </span>
                    <span className="sv-st__float-cap-title">
                      {activeScene.title}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- sub-parts -- */

/** Scroll-reveal wrapper — clip-path wipe + y, staggered, once. */
function RowReveal({
  index,
  reduce,
  children,
}: {
  index: number;
  reduce: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="sv-st__row-reveal"
      initial={reduce ? false : { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" }}
      whileInView={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.65,
        delay: Math.min(index * 0.06, 0.36),
        ease: EASE_HOUSE,
      }}
    >
      {children}
    </motion.div>
  );
}
