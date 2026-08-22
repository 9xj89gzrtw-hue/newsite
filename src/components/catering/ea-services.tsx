"use client";

/**
 * EaServices — Cycle 35. Filterable category grid of 18 catering services.
 *
 * REPLACES `EaServiceTabs` (5-tab pattern, Cycle 29). The 5-tab pattern does
 * not scale to 18 services — a filterable card grid is the modern Awwwards /
 * sondaven.com approach: category chips at top, responsive card grid below,
 * motion layout animation on filter change.
 *
 * Categories (5): corporate(5) · private(4) · buffet(4) · special(2) · logistics(3)
 *
 * Each card: lucide line icon + title + tagline (always visible); on hover
 * (desktop) / tap (mobile) the description + features list reveals.
 *
 * Accessibility:
 *  - Section aria-labelledby (H2 id).
 *  - Category chips: `<button role="radio">` inside `role="radiogroup"` (single-select).
 *  - Cards: `<article>` with a toggle `<button aria-expanded>` for the features panel.
 *  - 44px touch targets on chips + toggle buttons.
 *  - Honors `prefers-reduced-motion` (no filter animation, no hover-reveal transition).
 *
 * Motion (RULES §5 — transform/opacity only):
 *  - Filter change: `AnimatePresence mode="popLayout"` + `layout` — cards
 *    scale+fade out (filtered) / in (shown). transform/opacity only.
 *  - Card hover: features panel opacity + translateY (transform).
 *  - Headline: `SplitTextReveal` (word stagger).
 *  - Cards on enter: `ClipPathReveal`-style alternating opacity+scale (reuses
 *    the reliable transform-only reveal pattern from Cycle 34).
 *
 * Palette: --ea-cream section bg, --ea-ink text, --gold accent on icons + chips,
 *   --ea-red on the italic H2 fragment. Same EA utility classes as the rest
 *   of the editorial layer.
 *
 * Self-contained: scoped CSS in `./ea-services.css`. No edits to globals.css.
 */

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Coffee,
  HeartHandshake,
  Presentation,
  MonitorPlay,
  Heart,
  PackageOpen,
  Cookie,
  Flame,
  Soup,
  Leaf,
  MoonStar,
  UtensilsCrossed,
  ChefHat,
  Sparkles,
  CakeSlice,
  Wine,
  PartyPopper,
  Droplets,
  ChevronDown,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

import { SplitTextReveal } from "@/components/motion/split-text-reveal";
import { Magnetic } from "@/components/motion/magnetic";

import "./ea-services.css";

const EASE = [0.22, 1, 0.36, 1] as const;

type CategoryId = "corporate" | "private" | "buffet" | "special" | "logistics" | "all";

interface ServiceItem {
  id: string;
  title: string;
  category: Exclude<CategoryId, "all">;
  tagline: string;
  description: string;
  features: string[];
  minOrder?: string;
  icon: LucideIcon;
}

/**
 * 18 services. Content rethought in modern premium tone
 * (source: interfood-catering.ru + premium catering industry craft).
 * See docs/SERVICES-CONTENT.md for the full content spec.
 */
const SERVICES: ServiceItem[] = [
  // ── corporate ──────────────────────────────────────────────────────
  {
    id: "coffee-breaks",
    title: "Кофе-брейки",
    category: "corporate",
    tagline: "Три паузы за день конференции — эспрессо, выпечка и минута тишины.",
    description:
      "Свежая выпечка с утра (выпекается за 2 часа до подачи), зерна собственной обжарки, фильтр-кофе и альтернатива. Тихая подача — официанты не отвлекают от повестки.",
    features: [
      "Своя кондитерская — выпечка с утра",
      "Зерна собственной обжарки",
      "3 станции: эспрессо / фильтр / чай",
      "Тайминг по минутам, синхронно с программой",
    ],
    minOrder: "от 15 человек",
    icon: Coffee,
  },
  {
    id: "conferences",
    title: "Конференции",
    category: "corporate",
    tagline: "Кейтеринг, который не отвлекает от повестки.",
    description:
      "Отдельный шеф на площадке, отдельная линия раздачи, отдельная команда официантов. Подача по тайм-листу: приветственный кофе → перерыв → обед → вечерний фуршет — без сбоев.",
    features: [
      "Шеф-координатор на площадке весь день",
      "Тайм-лист синхронизирован с программой",
      "Отдельная зона для спикеров",
      "Брендирование станций под заказчика",
    ],
    minOrder: "от 30 человек",
    icon: Presentation,
  },
  {
    id: "presentations",
    title: "Презентации",
    category: "corporate",
    tagline: "Сервировка, которая работает на ваш продукт.",
    description:
      "Лаконичные мини-закуски на один укус — чтобы руки гостей оставались свободными для бокала и визитки. Подача в «молчаливом» режиме: официанты появляются и уходят незаметно.",
    features: [
      "Мини-закуски на один укус, не пачкают руки",
      "«Молчаливая» подача — без пауз в разговоре",
      "Брендирование канапе под цвет продукта",
      "Игристое на подносе при открытии",
    ],
    minOrder: "от 20 человек",
    icon: MonitorPlay,
  },
  {
    id: "office-lunch",
    title: "Обеды в офис",
    category: "corporate",
    tagline: "Горячее в термоупаковке к 12:00. Без полуфабрикатов.",
    description:
      "От 15 до 500 персон. Свой повар, своя логистика, термоупаковка держит 4 часа. Меню меняется каждую неделю — без повтора, без скучных столовских позиций.",
    features: [
      "Доставка к 12:00, уведомление за 30 минут",
      "Термоупаковка — 4 часа температуры",
      "Меню на 8 недель без повтора",
      "Корпоративный договор с НДС",
    ],
    minOrder: "от 15 порций",
    icon: Soup,
  },
  {
    id: "ny-corporate",
    title: "Новогодний корпоратив",
    category: "corporate",
    tagline: "Ёлка, текстиль, посуда, официанты. Забираем хлопоты — оставляем праздник.",
    description:
      "Меню, которое не повторяет прошлый год. Декор под бренд компании. Финальный аккорд — горячее от шефа на сцене или шоколадный фонтан как точка притяжения.",
    features: [
      "Декор + флористика под бренд",
      "Меню года — без повтора с прошлым сезоном",
      "Бронь с июня, дедлайн 1 декабря",
      "Команда официантов на весь вечер",
    ],
    minOrder: "от 30 человек",
    icon: PartyPopper,
  },

  // ── private ─────────────────────────────────────────────────────────
  {
    id: "private-events",
    title: "Частные мероприятия",
    category: "private",
    tagline: "Камерный формат, где каждое блюдо — разговор шефа с вами.",
    description:
      "День рождения, юбилей, помолвка — 20–80 гостей. Не шаблон из каталога, а авторское меню под повод и сезон. Дегустация за 45 минут в нашей студии перед заказом.",
    features: [
      "Авторское меню под повод",
      "Дегустация в студии на Петроградке",
      "Шеф на площадке весь вечер",
      "Флористика + текстиль в подарок от 50 гостей",
    ],
    minOrder: "от 20 человек",
    icon: HeartHandshake,
  },
  {
    id: "mobile-banquet",
    title: "Выездной банкет",
    category: "private",
    tagline: "Ресторанная подача там, где вам удобно — от особняка до шатра в лесу.",
    description:
      "Полная сервировка: фарфор, стекло, текстиль, свечи. Меню из 5 перемен блюд, подача «рука-в-руку». Логистика под ключ — вы встречаете гостей, остальное наше.",
    features: [
      "Фарфор, стекло, текстиль, свечи — привозим",
      "Меню из 5 перемен блюд",
      "Подача «рука-в-руку» — один официант на 10 гостей",
      "Логистика, дрова, генератор — под ключ",
    ],
    minOrder: "от 30 человек",
    icon: UtensilsCrossed,
  },
  {
    id: "mobile-restaurant",
    title: "Выездной ресторан",
    category: "private",
    tagline: "Открытая кухня: гости видят, как шеф заканчивает блюдо.",
    description:
      "Тепловое оборудование, вытяжка, линия раздачи — всё привозим. Гости наблюдают финал: стейки на огне, паста в сыре, десерт-фламбе. Зрелище + вкус = то, ради чего делают фото.",
    features: [
      "Открытая кухня на площадке",
      "Тепловое оборудование + вытяжка",
      "Линия раздачи и зона шефа",
      "Финальный аккорд на глазах у гостей",
    ],
    minOrder: "от 40 человек",
    icon: ChefHat,
  },
  {
    id: "custom-cakes",
    title: "Торты на заказ",
    category: "private",
    tagline: "Торт как архитектура: ярусы, текстуры, сезонные ягоды.",
    description:
      "Кондитерская на Петроградке. Не «праздничный» — авторский. Ярусы, глазурь с эффектом мрамора, живые ягоды. Эскиз с кондитером за 2 недели до события.",
    features: [
      "Своя кондитерская",
      "Эскиз с кондитером за 2 недели",
      "Сезонные ягоды, без искусственных красителей",
      "Бисквит, мусс, карамель — на выбор",
    ],
    minOrder: "от 1.5 кг",
    icon: CakeSlice,
  },

  // ── buffet ──────────────────────────────────────────────────────────
  {
    id: "snack-delivery",
    title: "Доставка закусок",
    category: "buffet",
    tagline: "Фирменные ланч-боксы: 6–8 видов канапе, упакованных порционно.",
    description:
      "Индивидуальные фирменные ланч-боксы. 6–8 видов мини-закусок, порционно. Привозим к назначенному часу. Для совещаний, пресс-зон, бэкстейджа конференций.",
    features: [
      "Индивидуальные фирменные ланч-боксы",
      "6–8 видов канапе и мини-закусок",
      "Доставка к назначенному часу",
      "Сервировка при необходимости",
    ],
    minOrder: "от 10 боксов",
    icon: Cookie,
  },
  {
    id: "bbq",
    title: "Барбекю",
    category: "buffet",
    tagline: "Гриль на углях. Стеики рибай, овощи с мангала, фирменные маринады.",
    description:
      "Шеф-грильмейстер, оборудование, дрова — всё наше. Стейки рибай и ти-бон, овощи с мангала, фирменные маринады. Открытый огонь как точка притяжения мероприятия.",
    features: [
      "Шеф-грильмейстер на площадке",
      "Стеики рибай, ти-бон, оссо буко",
      "Овощи с мангала + фирменные маринады",
      "Оборудование, дрова, вытяжка — наше",
    ],
    minOrder: "от 25 человек",
    icon: Flame,
  },
  {
    id: "chocolate-fountain",
    title: "Шоколадный фонтан",
    category: "buffet",
    tagline: "Бельгийский кувертюр и 6 видов дипов. Фокус-точка фуршета.",
    description:
      "Плавленный бельгийский кувертюр (молочный / тёмный / белый). 6 видов дипов: клубника, маршмеллоу, безе, банан, ананас, печенье. Фокус-точка любого фуршета — гости подходят сами.",
    features: [
      "Бельгийский кувертюр — 3 вида",
      "6 дипов: клубника, маршмеллоу, безе, банан",
      "Оператор + подсветка фонтана",
      "Брендирование базы под заказчика",
    ],
    minOrder: "от 40 человек",
    icon: Droplets,
  },
  {
    id: "champagne-pyramid",
    title: "Пирамиды из шампанского",
    category: "buffet",
    tagline: "Каскад бокалов, по которому льётся игристое.",
    description:
      "Ритуал, ради которого делают паузу и достают камеры. Каскад из 50–200 бокалов. Шеф наливает верхний — игристое стекает вниз. Аккорд торжества, после которого тост звучит иначе.",
    features: [
      "Каскад из 50–200 бокалов",
      "Игристое на выбор — prosecco / cava / шампанское",
      "Подсветка пирамиды",
      "Шеф-налив в начале тоста",
    ],
    minOrder: "от 50 бокалов",
    icon: Wine,
  },

  // ── special ─────────────────────────────────────────────────────────
  {
    id: "vegetarian",
    title: "Вегетарианское",
    category: "special",
    tagline: "Меню без мяса, но не «без». Овощи как главные герои.",
    description:
      "Фермерские сезонные овощи с авторской подачей. Не «взрослое детское меню» — полноценный гастрономический опыт. Гриль, томлёные, ферментированные — каждый овощ раскрывается.",
    features: [
      "Фермерские сезонные овощи",
      "Гриль, томлёные, ферментированные техники",
      "Авторская подача — овощ как герой",
      "Полный текстурный контраст",
    ],
    minOrder: "от 20 человек",
    icon: Leaf,
  },
  {
    id: "halal",
    title: "Халяль",
    category: "special",
    tagline: "Сертифицированные поставки. Уважение к традиции — без компромиссов по вкусу.",
    description:
      "Сертифицированные халяльные поставки, отдельная линия готовки, меню без алкоголя в соусах. Полноценный гастрономический опыт — без отступлений от традиции.",
    features: [
      "Сертифицированные халяльные поставки",
      "Отдельная линия готовки",
      "Без алкоголя в соусах и маринадах",
      "Полноценное меню, не «усечёнка»",
    ],
    minOrder: "от 20 человек",
    icon: MoonStar,
  },

  // ── logistics ────────────────────────────────────────────────────────
  {
    id: "mobile-registration",
    title: "Выездная регистрация",
    category: "logistics",
    tagline: "Сервировка церемонии бракосочетания. Тонкий момент — тонкая работа.",
    description:
      "Сервировка церемонии: шампанское, мини-закуски, текстиль на стол регистратора. Тонкий момент — тонкая работа. Координатор на площадке, чтобы ничего не отвлекало от «да».",
    features: [
      "Шампанское + мини-закуски для гостей",
      "Текстиль на стол регистратора",
      "Координатор на площадке",
      "Тайминг под момент церемонии",
    ],
    minOrder: "от 15 человек",
    icon: Heart,
  },
  {
    id: "equipment-rental",
    title: "Аренда оборудования",
    category: "logistics",
    tagline: "Посуда, мебель, текстиль, шатры. Привозим — забираем.",
    description:
      "Посуда, мебель, текстиль, тепловое оборудование, шатры, звук, свет. Привозим — забираем. Без логистической головной боли. Каталог 200+ позиций под площадку любого размера.",
    features: [
      "Каталог 200+ позиций",
      "Посуда, мебель, текстиль, шатры",
      "Тепловое оборудование + звук + свет",
      "Доставка, монтаж, демонтаж — под ключ",
    ],
    minOrder: "от 1 позиции",
    icon: PackageOpen,
  },
  {
    id: "hall-decoration",
    title: "Оформление зала",
    category: "logistics",
    tagline: "Флористика, текстиль, свет, декор. При банкете — до 4 композиций в подарок.",
    description:
      "Флористика, текстиль, свет, декор под повод и площадку. При заказе банкета или фуршета — до 4 цветочных композиций вазах на столы гостей в подарок.",
    features: [
      "Флористика + текстиль + свет",
      "Декор под повод и площадку",
      "До 4 композиций в подарок при банкете",
      "Сценография под ключ",
    ],
    minOrder: "от 1 зоны",
    icon: Sparkles,
  },
];

const CATEGORIES: { id: CategoryId; label: string; count: number }[] = [
  { id: "all", label: "Все", count: SERVICES.length },
  { id: "corporate", label: "Корпоратив", count: SERVICES.filter((s) => s.category === "corporate").length },
  { id: "private", label: "Частные", count: SERVICES.filter((s) => s.category === "private").length },
  { id: "buffet", label: "Фуршет", count: SERVICES.filter((s) => s.category === "buffet").length },
  { id: "special", label: "Спецменю", count: SERVICES.filter((s) => s.category === "special").length },
  { id: "logistics", label: "Логистика", count: SERVICES.filter((s) => s.category === "logistics").length },
];

/**
 * ServiceCard — single card in the grid. Toggle reveals features on
 * mobile/touch; hover reveals on desktop (CSS handles hover, JS handles
 * the accessible toggle state).
 */
function ServiceCard({ item, index }: { item: ServiceItem; index: number }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const Icon = item.icon;
  const hintsId = useId();

  // Alternating reveal direction per index (Cycle 34 pattern): gives the grid
  // a rhythm — not every card fades in the same way.
  const dirOffset =
    index % 4 === 0 ? 24 : index % 4 === 1 ? -24 : index % 4 === 2 ? 16 : -16;

  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: dirOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 6) * 0.05, ease: EASE }}
      className="ea-svc-card"
    >
      {/* Icon + title row */}
      <div className="ea-svc-card__head">
        <span className="ea-svc-card__icon" aria-hidden="true">
          <Icon strokeWidth={1.25} />
        </span>
        <h3 className="ea-svc-card__title">{item.title}</h3>
      </div>

      {/* Tagline — always visible */}
      <p className="ea-svc-card__tagline">{item.tagline}</p>

      {/* Toggle button — reveals description + features. Accessible
          (aria-expanded + aria-controls), 44px target via CSS padding. */}
      <button
        type="button"
        className="ea-svc-card__toggle"
        aria-expanded={open}
        aria-controls={hintsId}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{open ? "Скрыть" : "Подробнее"}</span>
        <ChevronDown
          className="ea-svc-card__toggle-icon"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        />
      </button>

      {/* Expandable panel — description + features + CTA */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={hintsId}
            className="ea-svc-card__panel"
            initial={reduce ? false : { opacity: 0, height: 0 }}
            animate={
              reduce
                ? { opacity: 1, height: "auto" }
                : { opacity: 1, height: "auto" }
            }
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="ea-svc-card__desc">{item.description}</p>
            <ul className="ea-svc-card__features">
              {item.features.map((f) => (
                <li key={f}>
                  <span className="ea-svc-card__bullet" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            {item.minOrder && (
              <p className="ea-svc-card__min">Минимум: {item.minOrder}</p>
            )}
            <Magnetic strength={0.2} className="ea-svc-card__magnetic">
              <a href="#contact" className="ea-svc-card__cta">
                Заказать
                <ArrowUpRight className="ea-svc-card__cta-icon" aria-hidden="true" />
              </a>
            </Magnetic>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export function EaServices() {
  const [active, setActive] = useState<CategoryId>("all");
  const reduce = useReducedMotion();
  const headlineId = useId();

  const filtered = useMemo(
    () => (active === "all" ? SERVICES : SERVICES.filter((s) => s.category === active)),
    [active],
  );

  return (
    <section
      id="services"
      aria-labelledby={headlineId}
      className="ea-section ea-section--cream ea-svc"
    >
      <div className="ea-container ea-container--wide">
        {/* Section head */}
        <div className="ea-svc__head">
          <span className="ea-eyebrow">Услуги · 18 направлений</span>
          <SplitTextReveal
            as="h2"
            mode="words"
            className="ea-section-h2 ea-svc__h2"
            duration={0.8}
            stagger={0.06}
          >
            Сделаем всё, что вы придумаете.
          </SplitTextReveal>
          <p className="ea-body ea-svc__lede">
            Кейтеринг полного цикла: от кофе-брейка на 15 человек до выездного
            ресторана на 500 гостей. 18 направлений — выберите нужное или
            соберите своё.
          </p>
        </div>

        {/* Category filter — radiogroup (single-select) */}
        <div
          role="radiogroup"
          aria-label="Фильтр услуг по категориям"
          className="ea-svc__chips"
        >
          {CATEGORIES.map((cat) => {
            const selected = active === cat.id;
            return (
              <button
                key={cat.id}
                role="radio"
                aria-checked={selected}
                type="button"
                onClick={() => setActive(cat.id)}
                className={`ea-svc__chip${selected ? " ea-svc__chip--active" : ""}`}
              >
                <span>{cat.label}</span>
                <span className="ea-svc__chip-count" aria-hidden="true">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards grid — AnimatePresence + layout for filter transition */}
        <motion.div layout={!reduce} className="ea-svc__grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((item, i) => (
              <ServiceCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA — for visitors who scanned all categories */}
        <div className="ea-svc__footer">
          <p className="ea-body ea-svc__footer-text">
            Не нашли нужное? Соберём меню под ваш повод.
          </p>
          <Magnetic strength={0.25}>
            <a href="#contact" className="ea-text-link ea-svc__footer-cta">
              Обсудить мероприятие
              <svg className="ea-text-link__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 12h14M14 6l6 6-6 6" />
              </svg>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

export default EaServices;
