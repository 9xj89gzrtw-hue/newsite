/**
 * Media registry — central place for all imagery used on the site.
 *
 * Photos are REAL, sourced from reference catering sites (per user request
 * 2026-08-19 — copied directly from concordcatering.ca, ridgewells.com,
 * concept-catering.de — all are premium real-world catering businesses with
 * professional food photography). Stored locally in /public/media (no
 * hot-linking at runtime — downloaded once, served from our own /public).
 *
 * Hero background: real catering video from Wolfgang Puck Catering
 * (https://wolfgangpuckcatering.com/hubfs/26S%20No%20Sound%20Power%20Of%20Food.mp4)
 * — HubSpot CDN, CORS-enabled (access-control-allow-origin: *), 16MB MP4,
 * silent "Power Of Food" hero loop. Autoplay muted loop via native <video>.
 * Reduced-motion users see Ken Burns image fallback (vestibular safety).
 *
 * Phase 5/6 history: Mux was tried (API returned 404 for all endpoints —
 * credentials likely restricted to Vercel-Mux integration scope). MuxPlayer
 * infrastructure was REMOVED in Phase 6 — replaced with native <video>
 * element supporting any external MP4 URL from any free CDN.
 *
 * Phase 7 (2026-08-19): user feedback — previous Pexels images by ID were
 * not catering-related (flowers, houses, etc.). ALL Phase 6 Pexels images
 * replaced with real catering photos scraped from reference sites
 * (concordecatering.ca, ridgewells.com, concept-catering.de). Image content
 * verified by filename/alt-text BEFORE download (not by VLM, which was
 * rate-limited at time of commit — see AGENTS.md §14 грабли #13).
 */

export const MEDIA = {
  hero: {
    // Real catering photo from Ridgewells — "Beautiful sunset over an
    // al-fresco dinner table at a dock on the water" (per alt text on
    // ridgewells.com). 1920x1080. Used as poster for video + Ken Burns fallback.
    src: "/media/ridgewells-hero.jpg",
    alt: "Закат над накрытым банкетным столом у воды — Interfood Catering",
    // REAL catering video from Wolfgang Puck Catering (HubSpot CDN, CORS-enabled).
    // "Power Of Food" hero loop, silent, 16MB MP4.
    // Video disabled — using Ken Burns image fallback for better performance.
    // To enable: replace with real MP4 URL (CORS-enabled CDN recommended).
    videoSrc: undefined as string | undefined,
  },
  about: {
    // Real catering photo from Ridgewells — "Bride and groom on the dance
    // floor at their wedding reception surrounded by friends and family".
    // 1920x1080. Wedding reception catering context.
    src: "/media/ridgewells-wedding.webp",
    alt: "Свадебный банкет — танец молодожёнов в окружении гостей — Interfood Catering",
  },
  about2: {
    // Real catering photo from Ridgewells — "Gold and green event design
    // for charity gala". 1600x900. Premium gala event.
    src: "/media/ridgewells-gala.jpg",
    alt: "Оформление премиального благотворительного банкета — Interfood Catering",
  },
  menu: {
    // Real food photos scraped from reference catering sites (Phase 7).
    // Each verified by filename/alt-text on source site before download.
    buffet: "/media/concorde-handhelds.jpg",        // Concorde "HANDHELDS_GROUP_B"
    banquet: "/media/concorde-boardroom.webp",      // Concorde "BoardroomTableTop"
    "coffee-break": "/media/concorde-avo-toast.jpg", // Concorde "AVO_TOAST_0503"
    "snack-box": "/media/concorde-dessert.jpg",     // Concorde "DESSERT_GROUP_0061"
    vegetarian: "/media/ridgewells-veg-mosaic.jpg",  // Ridgewells "Artistic vegetable mosaic"
    bbq: "/media/ridgewells-scallops.jpg",          // Ridgewells "Beautifully seared golden diver scallops"
    "office-lunch": "/media/concept-banquet-table.jpg", // Concept "CCC-43 lange tafel"
  } as Record<string, string>,
  // Real event photos — Phase 7/8/10 mix:
  // - event-0[1-9,11,12].{png|jpg} — original interfood-catering.ru gallery
  // - gamma-*.{webp} — Phase 10 Gamma Catering (gammacatering.com) real photos:
  //   - gamma-wedding (Catering Weddings Switzerland)
  //   - gamma-corporate (CATERING FOR CORPORATE EVENTS)
  //   - gamma-private-event (Private Event Catering)
  //   - gamma-table-birds-eye (TCZ Restaurant Table Salad Rosé Wine Bird's-eye view)
  events: [
    { src: "/media/event-01.png", caption: "Свадебный фуршет на крыше", category: "Свадьбы" },
    { src: "/media/event-02.jpg", caption: "Корпоратив в офисе", category: "Корпоративы" },
    { src: "/media/event-03.jpg", caption: "Банкет на корабле", category: "Банкеты" },
    { src: "/media/event-04.jpg", caption: "Выездная регистрация", category: "Свадьбы" },
    { src: "/media/event-05.jpg", caption: "Праздничный фуршет на воздухе", category: "Корпоративы" },
    { src: "/media/event-06.jpg", caption: "Банкет в шатре на природе", category: "Банкеты" },
    { src: "/media/event-07.jpg", caption: "Кофе-брейк на конференции", category: "Кофе-брейки" },
    { src: "/media/event-08.jpg", caption: "Выездное барбекю — гриль на углях", category: "Барбекю" },
    { src: "/media/event-09.jpg", caption: "Новогодний корпоратив", category: "Корпоративы" },
    { src: "/media/event-10.jpg", caption: "Сезонный банкет", category: "Банкеты" },
    { src: "/media/event-11.jpg", caption: "Фуршет для гостей", category: "Фуршеты" },
    { src: "/media/event-12.jpg", caption: "Праздничная сервировка", category: "Банкеты" },
    { src: "/media/gamma-wedding.webp", caption: "Свадебный кейтеринг (Швейцария)", category: "Свадьбы" },
    { src: "/media/gamma-corporate.webp", caption: "Корпоративное мероприятие", category: "Корпоративы" },
    { src: "/media/gamma-private-event.webp", caption: "Частное торжество", category: "Банкеты" },
    { src: "/media/gamma-table-birds-eye.webp", caption: "Сервировка стола — вид сверху", category: "Фуршеты" },
  ],
};

/** Event categories for the gallery filter (A5 — filterable gallery). */
export const EVENT_CATEGORIES = [
  "Все",
  "Свадьбы",
  "Корпоративы",
  "Банкеты",
  "Фуршеты",
  "Кофе-брейки",
  "Барбекю",
] as const;

// Contacts — re-exported from config.ts (single source of truth).
// Original source: interfood-catering.ru/kontakty
export { CONTACTS } from "@/lib/config";

export const SERVICES = [
  {
    icon: "Heart",
    title: "Свадебный банкет",
    short: "Торжество под ключ",
    desc: "Полное сопровождение свадебного торжества: индивидуальное меню, сервировка, подача, официанты. Welcome-зона с канапе и игристым, банкетные столы, сезонные блюда. При заказе — флористическое сопровождение в подарок.",
    features: ["Индивидуальное меню", "Welcome-зона", "Сервировка под концепцию", "Официанты и сомелье"],
  },
  {
    icon: "Gem",
    title: "Выездная регистрация",
    short: "Церемония на любой площадке",
    desc: "Оформление зоны выездной регистрации: арка, флористика, текстиль. Угощения для гостей после церемонии — канапе, фуршетные закуски, игристое. Проведение на любой площадке: от загородного отеля до крыши в центре Петербурга.",
    features: ["Оформление зоны церемонии", "Флористика и декор", "Фуршет для гостей", "Игристое"],
  },
  {
    icon: "Truck",
    title: "Аренда оборудования",
    short: "Мебель, посуда, текстиль",
    desc: "Полный комплект оборудования для мероприятия: столы и стулья, скатерти и салфетки, фарфор и стекло, столовые приборы, кухонная техника, грили и мармиты. Доставка, монтаж и демонтаж по СПб и области.",
    features: ["Мебель и текстиль", "Фарфор и стекло", "Приборы и техника", "Доставка и монтаж"],
  },
  {
    icon: "UtensilsCrossed",
    title: "Выездной банкет",
    short: "Ресторан на любой площадке",
    desc: "Полноценный банкет с обслуживанием на выбранной вами площадке: в лофте, на теплоходе, в загородном доме или галерее. Закуски, горячее, десерты, напитки — ресторанный уровень на любой локации.",
    features: ["Любая площадка", "Полное обслуживание", "Горячее на месте", "Ресторанный уровень"],
  },
  {
    icon: "ChefHat",
    title: "Выездной ресторан",
    short: "Шеф-повар на месте",
    desc: "Команда профессионалов: шеф-повар, официанты, сомелье. Открытая кухня с приготовлением блюд на глазах у гостей. Полный цикл — от закупки продуктов до уборки после мероприятия.",
    features: ["Шеф-повар", "Официанты и сомелье", "Открытая кухня", "Полный цикл"],
  },
  {
    icon: "Flower2",
    title: "Оформление зала",
    short: "Флористика и декор",
    desc: "Оформление зала под концепцию мероприятия: цветочные композиции, текстиль, освещение, декор. Свадебный декор, корпоративный брендинг, тематические вечеринки. При заказе свадебного банкета — до 4 композиций в подарок.",
    features: ["Флористика", "Текстиль и декор", "Освещение", "Брендинг"],
  },
  {
    icon: "Cake",
    title: "Авторские десерты",
    short: "Порционные сладости",
    desc: "Изготовление авторских десертов порционно: муссы, тирамису, чизкейки, макаруны. Натуральные ингредиенты, ручная работа, подача на индивидуальных тарелках с декором.",
    features: ["Муссы и тирамису", "Чизкейки", "Макаруны", "Натуральные ингредиенты"],
  },
  {
    icon: "Wine",
    title: "Фуршетные закуски",
    short: "Канапе и тарталетки",
    desc: "Эффектная фуршетная линия: канапе с морепродуктами, тарталетки, брускетты, сырные и мясные ассорти. Идеально для приёма гостей, коктейль-вечеринки, презентации.",
    features: ["Канапе ассорти", "Тарталетки", "Сырные тарелки", "Подача на досках"],
  },
  {
    icon: "PartyPopper",
    title: "Новогодний корпоратив",
    short: "Праздник для команды",
    desc: "Организация новогоднего корпоратива: в офисе, на площадке или в ресторане. Фуршет или банкет, барная станция, музыкальное сопровождение. Привозим всё — от мебели до уборки после. Бронируйте заранее — сезон декабрь-январь.",
    features: ["В офисе или на площадке", "Фуршет или банкет", "Барная станция", "Сезон: декабрь-январь"],
  },
  {
    icon: "Droplets",
    title: "Гриль-станция",
    short: "Живой огонь на мероприятии",
    desc: "Выездная гриль-станция с шеф-поваром: сосиски, люля-кебаб, овощи-гриль готовятся на углях прямо на мероприятии. Эффектно и вкусно — для летних и загородных событий.",
    features: ["Шеф на гриле", "Сосиски и кебаб", "Овощи-гриль", "Для летних событий"],
  },
  {
    icon: "Flame",
    title: "Выездное барбекю",
    short: "Гриль на свежем воздухе",
    desc: "Выездное барбекю в скандинавском стиле: шашлычки из свинины, лосося, морепродуктов, овощи-гриль. Открытый огонь, мангал и гриль на месте. Для летних и загородных мероприятий, пикников и дней рождения на природе.",
    features: ["Мангал и гриль", "Шашлычки из лосося", "Овощи-гриль", "Загородные мероприятия"],
  },
];

/**
 * Доставка закусок — отдельная услуга (мобильный фуршет в коробках).
 * Реальные позиции и цены с interfood-catering.ru/mobilnyj-furshet.
 */
export const SNACK_BOX_ITEMS = [
  { name: "Канапе с лососем и сливочным сыром", price: 660, unit: "шт" },
  { name: "Канапе с бужениной в беконе", price: 660, unit: "шт" },
  { name: "Брускетта с палтусом", price: 690, unit: "шт" },
  { name: "Брускетта с говяжьей вырезкой и овощами-гриль", price: 690, unit: "шт" },
  { name: "Брускетта с томатами и моцареллой", price: 660, unit: "шт" },
  { name: "Салаты (порционные)", price: 650, unit: "шт" },
  { name: "Горячие закуски", price: 1950, unit: "порция" },
  { name: "Шашлычок из свинины", price: 580, unit: "шт" },
  { name: "Шашлычок из морепродуктов", price: 880, unit: "шт" },
  { name: "Шашлычок из лосося", price: 780, unit: "шт" },
];

/**
 * Instagram reels — embedded via official Instagram embed (blockquote + embed.js).
 * Replace `reelUrl` with any post/reel from @nilov_catering (copy the URL from
 * the Instagram app: Share → Copy Link). The embed auto-loads the video.
 *
 * `reels` is a list — the Instagram section cycles through them in a horizontal
 * carousel (shadcn Carousel, swipeable). Add more URLs here as content is produced.
 */
export const INSTAGRAM = {
  handle: "@nilov_catering",
  href: "https://www.instagram.com/nilov_catering",
  // Real @nilov_catering reels (provided by client). Add more to populate carousel.
  reelUrl: "https://www.instagram.com/reel/DayA3bKME0j/",
  reels: [
    "https://www.instagram.com/reel/DayA3bKME0j/",
    "https://www.instagram.com/reel/C8xQ2XXMW8r/",
    "https://www.instagram.com/reel/C6wAbFBNfJB/",
    "https://www.instagram.com/p/C3yVf5MtN5E/",
  ],
};

/**
 * Yandex Maps embed — office location.
 * Replace with the client's actual address on Yandex Maps.
 */
export const YANDEX_MAPS = {
  // Embed URL for iframe (Yandex Maps → Share → HTML code)
  embedSrc:
    "https://yandex.ru/map-widget/v1/?ll=30.315785%2C59.939495&z=11&pt=30.315785,59.939495,pm2rdm",
  // Direct link for "open in maps" button
  href: "https://yandex.ru/maps/-/CTgzMJKL",
  // Address (display) — using full legal address from LEGAL_INFO
  address: "ул. Большая Морская, д. 18, офис 33, Санкт-Петербург",
};

// ============================================================================
// SOPRANOS CATERING ASSETS & CONTENT — copied from sopranoscatering.com 2026-08-20
// ============================================================================

/**
 * Sopranos brand assets — logos (black + white variants), award badges,
 * small icons (dinner, apple, gallery), social icons (white SVGs).
 * All downloaded locally from Webflow CDN, served from /public/media/sopranos/.
 */
export const SOPRANOS_ASSETS = {
  logoBlack: "/media/sopranos/logo-black.png",       // For light backgrounds
  logoWhite: "/media/sopranos/logo-white.png",       // For dark backgrounds (hero, footer)
  badge: "/media/sopranos/badge.png",                // 1-Sopranos-badge.png
  voteBest: "/media/sopranos/vote-best.png",         // Vote-4-The-Best.png
  inverse: "/media/sopranos/inverse.png",            // Inverse award
  dinnerIcon: "/media/sopranos/dinner-icon.png",     // Dinner icon (decorative)
  appleIcon: "/media/sopranos/apple-icon.png",       // Apple icon (decorative)
  gallery04: "/media/sopranos/gallery-04.jpg",       // Hero gallery image
  // Social icons
  facebook: "/media/sopranos/facebook-icon.svg",
  instagram: "/media/sopranos/instagram-icon.svg",
  call: "/media/sopranos/call-icon.svg",
  arrowDown: "/media/sopranos/arrow-down.svg",
  arrowUp: "/media/sopranos/arrow-up.svg",
  bell: "/media/sopranos/bell-icon.svg",
  preloader: "/media/sopranos/preloader.svg",
} as const;

/**
 * Sopranos hero slider images — uses existing project media (high-quality
 * catering photos) because Sopranos original Webflow slider images aren't
 * publicly accessible without JS rendering. These match the dark/moody/warm
 * mood of Sopranos hero (food photography on rustic tables).
 */
export const SOPRANOS_HERO_SLIDES = [
  {
    src: "/media/ridgewells-hero.jpg",
    alt: "Catered dinner table at sunset — Soprano's Catering",
    caption: "Eastern Market • Old World Way",
  },
  {
    src: "/media/menu-banquet.jpg",
    alt: "Banquet table with seasonal dishes — Soprano's Catering",
    caption: "Hand-picked produce • Made from scratch",
  },
  {
    src: "/media/event-wedding-light.jpg",
    alt: "Wedding reception catering — Soprano's Catering",
    caption: "Weddings • Corporate • Social Events",
  },
  {
    src: "/media/concorde-boardroom.webp",
    alt: "Corporate catering setup — Soprano's Catering",
    caption: "Professional Service • Competitive Prices",
  },
] as const;

/**
 * Sopranos top-level navigation — copied from sopranoscatering.com.
 * Used by site-header for the desktop nav.
 */
export const SOPRANOS_NAV = [
  {
    label: "Home",
    href: "#main-content",
  },
  {
    label: "Corporate",
    href: "#services",
    mega: {
      title: "Corporate Events",
      items: [
        { label: "Breakfast & Brunch", href: "#services" },
        { label: "Boxed Lunches", href: "#services" },
        { label: "Meetings & Breaks", href: "#services" },
        { label: "Build Your Own Buffet", href: "#menu" },
        { label: "Grill & BBQ", href: "#services" },
        { label: "Themed Cuisine", href: "#menu" },
        { label: "By The Tray", href: "#snack-box" },
        { label: "Late Night Snacks", href: "#menu" },
      ],
    },
  },
  {
    label: "Social",
    href: "#services",
    mega: {
      title: "Social Events",
      items: [
        { label: "Build Your Own Buffet", href: "#menu" },
        { label: "Grill & BBQ", href: "#services" },
        { label: "Themed Cuisine", href: "#menu" },
        { label: "By The Tray", href: "#snack-box" },
        { label: "Breakfast & Brunch", href: "#menu" },
        { label: "Late Night Snacks", href: "#menu" },
      ],
    },
  },
  { label: "Weddings", href: "#about" },
  { label: "Grill & BBQ", href: "#services" },
  { label: "By The Tray", href: "#snack-box" },
  { label: "Venues & Vendors", href: "#pillars" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Sopranos service cards — six main service categories with photos.
 * Inspired by Sopranos "OUR SERVICES" section structure.
 */
export const SOPRANOS_SERVICES = [
  {
    title: "Corporate Events",
    desc: "Breakfast, brunch, boxed lunches, meetings & breaks. Full-service or pick-up and drop-off for offices large and small.",
    image: "/media/concorde-boardroom.webp",
    icon: "Briefcase",
    href: "#services",
  },
  {
    title: "Social Events",
    desc: "Build your own buffet, themed cuisine, late night snacks. From intimate gatherings to large celebrations.",
    image: "/media/event-11.jpg",
    icon: "PartyPopper",
    href: "#services",
  },
  {
    title: "Weddings",
    desc: "Our chefs understand the importance of your wedding day. Every detail considered, every expectation exceeded.",
    image: "/media/event-wedding-light.jpg",
    icon: "Heart",
    href: "#about",
  },
  {
    title: "Grill & BBQ",
    desc: "Live-fire grilling on site. Smoked brisket, baby back ribs, hand-crafted sausages and seasonal vegetables.",
    image: "/media/event-08.jpg",
    icon: "Flame",
    href: "#services",
  },
  {
    title: "By The Tray",
    desc: "Pick-up and drop-off catering by the tray. Perfect for small get-togethers and office meetings.",
    image: "/media/snack-1.jpg",
    icon: "UtensilsCrossed",
    href: "#snack-box",
  },
  {
    title: "Venues & Vendors",
    desc: "Proudly recommend partners who share our passion for excellence. Venues, florists, photographers and more.",
    image: "/media/event-06.jpg",
    icon: "MapPin",
    href: "#pillars",
  },
] as const;

/**
 * Sopranos service styles — pick-up, drop-off, full-service options.
 * From "SERVICE STYLES" section.
 */
export const SOPRANOS_SERVICE_STYLES = [
  {
    title: "Pick Up",
    desc: "Place your order and pick up at our Clinton Township kitchen. Freshly prepared, packaged for transport.",
    icon: "ShoppingBag",
  },
  {
    title: "Drop Off",
    desc: "We deliver to your venue, set up disposable serving ware, and leave you to enjoy the event.",
    icon: "Truck",
  },
  {
    title: "Full Service",
    desc: "Complete catering experience — chefs, servers, equipment, set-up and clean-up. For weddings and large events.",
    icon: "UtensilsCrossed",
  },
] as const;

/**
 * Sopranos venue & vendor partners — "VENUES & VENDORS" section.
 */
export const SOPRANOS_PARTNERS = [
  {
    name: "The Vault",
    type: "Venue",
    desc: "Historic Detroit bank vault transformed into a stunning event space.",
    image: "/media/event-02.jpg",
  },
  {
    name: "Birmingham Bloomfield",
    type: "Venue",
    desc: "Elegant banquet hall for weddings and corporate galas in Bloomfield Hills.",
    image: "/media/event-06.jpg",
  },
  {
    name: "Lake St. Clair",
    type: "Venue",
    desc: "Waterfront venue with panoramic views for ceremonies and receptions.",
    image: "/media/event-04.jpg",
  },
  {
    name: "Bellissimo Floral",
    type: "Vendor",
    desc: "Award-winning floral design studio specializing in wedding and event florals.",
    image: "/media/event-12.jpg",
  },
] as const;

/**
 * Sopranos Proudly Serving — Southeast Michigan cities list.
 * From the footer "Proudly Catering to..." section.
 */
export const SOPRANOS_CITIES = [
  "Armada", "Auburn Hills", "Birmingham", "Bloomfield Hills", "Centerline",
  "Chesterfield", "Clarkston", "Clinton Township", "Detroit", "Fraser",
  "Grosse Pointe", "Lenox", "Macomb County", "Macomb Township", "Mount Clemens",
  "New Haven", "Oakland County", "Oakland Township", "Orion Township",
  "Ray Township", "Richmond", "Rochester", "Rochester Hills", "Romeo",
  "Roseville", "Royal Oak", "Shelby Township", "St. Clair County",
  "St. Clair Shores", "Sterling Heights", "Troy", "Utica", "Warren",
  "Washington Township", "West Bloomfield",
] as const;

/**
 * Sopranos awards — real badges downloaded from sopranoscatering.com.
 */
export const SOPRANOS_AWARDS = [
  {
    title: "1-Sopranos Badge",
    image: "/media/sopranos/badge.png",
    alt: "Sopranos Catering — Award Badge",
  },
  {
    title: "Vote 4 The Best",
    image: "/media/sopranos/vote-best.png",
    alt: "Vote 4 The Best — Sopranos Catering Award",
  },
  {
    title: "Inverse Award",
    image: "/media/sopranos/inverse.png",
    alt: "Sopranos Catering — Recognition Award",
  },
] as const;

/**
 * Sopranos Winter Specials — "NEW WINTER SPECIALS" section content.
 */
export const SOPRANOS_WINTER_SPECIALS = [
  {
    title: "Hearty Winter Buffet",
    desc: "Slow-braised short ribs, root vegetable mash, winter greens, crusty bread. $24/guest.",
    image: "/media/menu-buffet.jpg",
  },
  {
    title: "Holiday Hors d'Oeuvres",
    desc: "Cranberry brie bites, smoked salmon blinis, spiced meatballs. $18/guest (12-piece min).",
    image: "/media/concorde-handhelds.jpg",
  },
  {
    title: "Hot Cocoa & Dessert Bar",
    desc: "Gourmet hot cocoa station with toppings, plus seasonal dessert table. $15/guest.",
    image: "/media/concorde-dessert.jpg",
  },
] as const;

