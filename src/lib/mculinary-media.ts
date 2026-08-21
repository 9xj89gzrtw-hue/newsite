/**
 * mculinary.com media registry — Cycle 25.
 *
 * All assets sourced from mculinary.com (premium Arizona catering), downloaded
 * into /public/media/mculinary/. Used by the Mcu* components for the
 * mculinary.com replication layer (navy + cream + gold editorial catering).
 *
 * Stored locally — no hot-linking at runtime. Videos: hero MP4 (5.16MB) is
 * served from /public for dev/preview (production should use Mux per AGENTS.md
 * §5.3, but local file is fine for now per user "видео мероприятий пока скопируй").
 */

const BASE = "/media/mculinary";

/** Hero video — full-bleed autoplay muted loop (mculinary "Catering / Choreography"). */
export const MCU_HERO_VIDEO = `${BASE}/mculinary-hero.mp4`;

/** Hero poster fallback (real catering photo, 2000×1334). */
export const MCU_HERO_POSTER = `${BASE}/2024-1125-MCulinary-Specials-0485.jpg`;

/** Photo filmstrip — 18 event photos, variable aspect ratios (landscape + portrait). */
export interface PhotoSlide {
  src: string;
  alt: string;
  /** target width in px for the filmstrip slide (mculinary variable-width pattern) */
  width: number;
}

export const MCU_PHOTO_SLIDES: PhotoSlide[] = [
  // Variable widths tuned so 3-4 slides are visible at 1440px viewport
  // (portrait 340 / landscape 460 / wide 520). Creates the filmstrip rhythm.
  {
    src: `${BASE}/2024-1125-MCulinary-Specials-0828-scaled.jpg`,
    alt: "Премиальный банкет — сервировка стола — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/DSC_0040-scaled.jpg`,
    alt: "Фуршет на крупном корпоративном событии — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/257-GoDaddy2023-206747-scaled.jpg`,
    alt: "Официант сервирует стол для банкета — Interfood Catering",
    width: 340,
  },
  {
    src: `${BASE}/2024-1125-MCulinary-Specials-0636-scaled.jpg`,
    alt: "Дегустация блюд шеф-поваром — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/2024-1125-MCulinary-Specials-0481.jpg`,
    alt: "Авторская подача блюда — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/219-GoDaddy2019-03863-scaled.jpg`,
    alt: "Свадебный банкет под открытым небом — Interfood Catering",
    width: 520,
  },
  {
    src: `${BASE}/2024-1125-MCulinary-Specials-0317-1200x800-5b2df79-e1733935022645.jpg`,
    alt: "Широкоформатная подача банкета — Interfood Catering",
    width: 520,
  },
  {
    src: `${BASE}/Tasting-19-scaled.jpg`,
    alt: "Дегустационный сет — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/253-GoDaddy2023-206737-scaled.jpg`,
    alt: "Праздничный фуршет — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/2024-1125-MCulinary-Specials-0457-scaled.jpg`,
    alt: "Сезонное меню — Interfood Catering",
    width: 340,
  },
  {
    src: `${BASE}/256-GoDaddy2019-03950-scaled.jpg`,
    alt: "Банкет на корпоративном мероприятии — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/Tasting-18-scaled.jpg`,
    alt: "Дегустация авторской кухни — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/DSC_0847-scaled.jpg`,
    alt: "Сервировка фуршетного стола — Interfood Catering",
    width: 340,
  },
  {
    src: `${BASE}/Tasting-15-scaled.jpg`,
    alt: "Десертная подача — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/57503196_2359979034032538_3157273932948570112_n-2.jpg`,
    alt: "Свадебный фуршет на природе — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/Tasting-10-scaled.jpg`,
    alt: "Дегустационное меню шеф-повара — Interfood Catering",
    width: 460,
  },
  {
    src: `${BASE}/DSC_0057-scaled.jpg`,
    alt: "Частный приём в загородном доме — Interfood Catering",
    width: 520,
  },
  {
    src: `${BASE}/2024-1125-MCulinary-Specials-0112-scaled.jpg`,
    alt: "Праздничный банкет — Interfood Catering",
    width: 460,
  },
];

/** Services carousel — 7 service cards (780×520 each). */
export interface ServiceCard {
  src: string;
  title: string;
  subtitle: string;
  href: string;
}

export const MCU_SERVICES: ServiceCard[] = [
  {
    src: `${BASE}/offthegreen_16-copy.jpg`,
    title: "Спортивные и масштабные события",
    subtitle: "Кейтеринг на стадионах и аренах",
    href: "#calculator",
  },
  {
    src: `${BASE}/IMG_9275.jpg`,
    title: "Свадебный кейтеринг",
    subtitle: "Авторская подача и оформление",
    href: "#calculator",
  },
  {
    src: `${BASE}/Buisness_Dining-1.jpg`,
    title: "Корпоративный банкет",
    subtitle: "Деловые ужины и приёмы",
    href: "#calculator",
  },
  {
    src: `${BASE}/Ridgeline-Truck-Side-View-4.jpg`,
    title: "Выездной кейтеринг",
    subtitle: "Мобильные точки питания",
    href: "#calculator",
  },
  {
    src: `${BASE}/esop-2.webp`,
    title: "Офисное питание",
    subtitle: "Ежедневные обеды для команд",
    href: "#calculator",
  },
  {
    src: `${BASE}/2024-0324-MCulinary-Nibblers12430.jpg`,
    title: "Доставка снек-боксов",
    subtitle: "Фуршетные наборы на выезд",
    href: "#calculator",
  },
  {
    src: `${BASE}/041-Kosher-74104992-1.jpg`,
    title: "Кошерный и диетический",
    subtitle: "Меню под пищевые ограничения",
    href: "#calculator",
  },
];

/** Venues — 3 square cards (600×600). */
export interface VenueCard {
  src: string;
  title: string;
  subtitle: string;
}

export const MCU_VENUES: VenueCard[] = [
  {
    src: `${BASE}/EQINCKX3-copy.jpg`,
    title: "Конференц-площадки",
    subtitle: "Кейтеринг в конференц-залах",
  },
  {
    src: `${BASE}/Cardinals-NFL-Party-9.jpg`,
    title: "Спортивные арены",
    subtitle: "Масштабные события на стадионах",
  },
  {
    src: `${BASE}/14-DesignMode-74103244.jpg`,
    title: "Лофты и галереи",
    subtitle: "Авторские пространства под событие",
  },
];

/**
 * Video events carousel — autoplay-muted-loop video cards.
 * mculinary has only ONE video (hero). The user explicitly wants an "events
 * video gallery" that auto-moves. We re-use the hero MP4 across multiple slides
 * (each slide starts at a different time offset via #t=fragment) so the gallery
 * looks populated. User said: "видео мероприятий пока скопируй, потом я вставлю
 * свои туда" — copy for now, replace with own later.
 */
export interface VideoSlide {
  src: string;
  poster: string;
  caption: string;
  /** media fragment start second — different visual per slide */
  start: number;
}

export const MCU_VIDEO_SLIDES: VideoSlide[] = [
  {
    src: MCU_HERO_VIDEO,
    poster: `${BASE}/2024-1125-MCulinary-Specials-0481.jpg`,
    caption: "Шоурил кейтеринга",
    start: 0,
  },
  {
    src: MCU_HERO_VIDEO,
    poster: `${BASE}/Tasting-19-scaled.jpg`,
    caption: "Дегустация и подача",
    start: 3,
  },
  {
    src: MCU_HERO_VIDEO,
    poster: `${BASE}/219-GoDaddy2019-03863-scaled.jpg`,
    caption: "Банкет на масштабе",
    start: 6,
  },
  {
    src: MCU_HERO_VIDEO,
    poster: `${BASE}/257-GoDaddy2023-206747-scaled.jpg`,
    caption: "Свадебный фуршет",
    start: 9,
  },
  {
    src: MCU_HERO_VIDEO,
    poster: `${BASE}/DSC_0040-scaled.jpg`,
    caption: "Сервировка столов",
    start: 12,
  },
];

/** Instagram feed grid (22 webp tiles, 320×varies). */
export const MCU_INSTAGRAM_TILES: string[] = [
  "757909205_18608062102054741_5894220244353856489_nlow.webp",
  "758400627_18605749105054741_4377163937084542249_nlow.webp",
  "759232504_1052613730580260_7987774303006906037_nlow.webp",
  "759751726_18605775547054741_8412664849707355826_nlow.webp",
  "762107985_18606369019054741_6263146532000413513_nlow.webp",
  "763089408_18607715527054741_6864845550164766250_nlow.webp",
  "763762700_18608131276054741_5724827865005875160_nlow.webp",
  "764719427_18607403968054741_6868648639852147878_nlow.webp",
  "765007825_18608431246054741_8251318104860614543_nlow.webp",
  "768604050_18610326997054741_1716090259677380061_nlow.webp",
  "769375318_18608692804054741_5513180595569298025_nlow.webp",
  "772020677_18610021009054741_5398610960512302974_nlow.webp",
].map((f) => `${BASE}/${f}`);
