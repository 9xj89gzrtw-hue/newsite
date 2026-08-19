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
    // Direct external MP4 URL — works via native <video> element (Phase 6 pattern).
    videoSrc: "",,
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
    { src: "/media/event-05.jpg", caption: "Мотофестиваль Harley Days", category: "Корпоративы" },
    { src: "/media/event-06.jpg", caption: "Скандинавское барбекю", category: "Барбекю" },
    { src: "/media/event-07.jpg", caption: "Кофе-брейк на конференции", category: "Кофе-брейки" },
    { src: "/media/event-09.jpg", caption: "Новогодний корпоратив", category: "Корпоративы" },
    { src: "/media/event-10.jpg", caption: "Сезонный банкет", category: "Банкеты" },
    { src: "/media/event-11.jpg", caption: "Фуршет для гостей", category: "Фуршеты" },
    { src: "/media/event-12.jpg", caption: "Праздничная сервировка", category: "Банкеты" },
    { src: "/media/gamma-wedding.webp", caption: "Свадебный кейтеринг (Швейцария)", category: "Свадьбы" },
    { src: "/media/gamma-corporate.webp", caption: "Корпоративное мероприятие", category: "Корпоративы" },
    { src: "/media/gamma-private-event.webp", caption: "Частное торжество", category: "Банкеты" },
    { src: "/media/gamma-table-birds-eye.webp", caption: "Сервировка стола — вид сверху", category: "Фуршеты" },
    { src: "/media/event-02.jpg", caption: "Торжественный приём", category: "Банкеты" },
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
    title: "Торты на заказ",
    short: "Авторские десерты",
    desc: "Изготовление тортов и десертов по индивидуальному заказу: свадебные многоярусные, тематические, торты с индивидуальным дизайном. Капкейки, макаруны, пирожные. Натуральные ингредиенты, ручная работа.",
    features: ["Свадебные торты", "Индивидуальный дизайн", "Капкейки и макаруны", "Натуральные ингредиенты"],
  },
  {
    icon: "Wine",
    title: "Пирамиды из шампанского",
    short: "Каскад игристого",
    desc: "Эффектная подача игристого каскадом — пирамида из бокалов с шампанским. Зрелищный момент для торжества: свадьба, юбилей, корпоратив. Подача под музыку и освещение, фуршетные закуски рядом.",
    features: ["Пирамида бокалов", "Подача каскадом", "Игристое премиум", "Зрелищный момент"],
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
    title: "Шоколадный фонтан",
    short: "Фондю-станция",
    desc: "Аренда шоколадного фонтана с ассортиментом фруктов и выпечки: клубника, бананы, ананас, маршмеллоу, профитроли. Белый, молочный или тёмный шоколад. Эффектная станция для детского праздника, свадьбы или корпоратива.",
    features: ["Аренда фонтана", "Фрукты и выпечка", "3 вида шоколада", "Для любого праздника"],
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
  // Address (display)
  address: "Санкт-Петербург",
};

