# SEO Optimizer Skill

> SEO-оптимизация сайта кейтеринговой компании для максимальной видимости в поисковой выдаче (Яндекс, Google).

## Когда использовать

- При создании/изменении страниц и секций
- При работе с metadata, structured data, sitemap
- При оптимизации контента под поисковые запросы
- Перед деплоем — финальный SEO-audit

## Core Strategy

### Целевые запросы (кейтеринг, СПб)

**Высокочастотные:**
- кейтеринг санкт-петербург
- организация банкета спб
- catering services saint petersburg
- выездное ресторанное обслуживание
- свадебный банкет под ключ

**Среднечастотные:**
- корпоративный банкет на заказ
- фуршет на мероприятие спб
- кейтеринг на день рождения
- меню для событий заказать
- обслуживание конференций

**Niche / Long-tail:**
- премиальный кейтеринг спб цены
- банкеты на корабле санкт-петербург
- кейтеринг для свадьбы 100 человек
- организация праздничного ужина

### Metadata Template

```tsx
// app/page.tsx или layout.tsx
export const metadata: Metadata = {
  title: 'Премиальный кейтеринг в Санкт-Петербурге | Банкеты от 2450 ₽/чел',
  description: 'Организация банкетов, фуршетов и свадеб в СПб. 16+ лет опыта, 2400+ мероприятий. Индивидуальные меню, сервис «под ключ». Рассчитайте стоимость онлайн!',
  keywords: [
    'кейтеринг спб', 'банкет на заказ', 'организация праздника',
    'catering saint petersburg', 'свадебный банкет', 'корпоративный фуршет'
  ],
  openGraph: {
    title: 'Кейтеринг премиум-класса | Санкт-Петербург',
    description: 'Банкеты, фуршеты, свадебное обслуживание. От 2450 ₽/чел.',
    url: 'https://example.com',
    siteName: 'Название компании',
    images: [{ url: '/media/hero-premium.png', width: 1344, height: 768 }],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Премиальный кейтеринг СПб',
    description: 'Банкеты, фуршеты, свадьты. 16+ лет опыта.',
    image: '/media/hero-premium.png',
  },
  alternates: {
    canonical: 'https://example.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large' },
  },
};
```

### Structured Data (JSON-LD)

```tsx
// LocalBusiness schema
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'FoodEstablishment',
  name: 'Название компании',
  description: 'Премиальный кейтеринг в Санкт-Петербурге. Банкеты, фуршеты, свадебное обслуживание.',
  url: 'https://example.com',
  telephone: '+7(812)919-59-11',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Санкт-Петербург',
    addressCountry: 'RU',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 59.9343,
    longitude: 30.3351,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '20:00' },
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '10:00', closes: '18:00' },
  ],
  priceRange: '₽₽₽',
  servesCuisine: ['Russian', 'European', 'Asian'],
  hasMenu: '/offer',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127',
  },
};

// Service schema для типов услуг
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Организация банковского банкета',
  provider: { '@type': 'LocalBusiness', name: 'Название компании' },
  description: 'Полная организация банкетного обслуживания для корпоративных мероприятий...',
  areaServed: { '@type': 'City', name: 'Санкт-Петербург' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Услуги кейтеринга',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Банкетное меню' }, priceCurrency: 'RUB', price: '2450' },
      // ... другие услуги
    ],
  },
};

// FAQ schema
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Минимальное количество гостей для заказа?',
      acceptedAnswer: { '@type': 'Answer', text: 'Мы принимаем заказы от 10 персон для фуршетов и от 20 персон для банкетов.' },
    },
    // ... другие FAQ
  ],
};
```

### Sitemap Generation

```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://example.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/offer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
```

### Robots.txt

```tsx
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/private/'],
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

## Content Optimization

### H1-H6 Structure

```
H1: Премиальный кейтеринг в Санкт-Петербурге (один на странице)
├── H2: Наши услуги
│   ├── H3: Банкетное обслуживание
│   ├── H3: Фуршет на мероприятие
│   └── H3: Свадебный банкет
├── H2: Меню
├── H2: Галерея наших мероприятий
├── H2: Отзывы клиентов
├── H2: Калькулятор стоимости
└── H2: Контакты
```

### Internal Linking

```tsx
// Внутренняя перелинковка для SEO
<Link href="/offer#banquet">Подробнее о банкетном меню →</Link>
<Link href="/#calculator">Рассчитать стоимость банка</Link>
<Link href="/#events">Посмотреть фото наших мероприятий</Link>
```

### Image Optimization

```tsx
<SmartImage
  src="/media/banquet-1.jpg"
  alt="Корпоративный банкет на 150 гостей в белом декоре с цветочными композициями"
  width={1344}
  height={768}
  // SEO важные атрибуты
/>
```

- `alt` должен содержать ключевые слова естественным образом
- Имя файла: `banket-sankt-peterburg.jpg` (не `IMG_1234.jpg`)
- Lazy loading для изображений ниже fold

## Technical SEO Checklist

### Core Web Vitals
- [ ] LCP < 2.5s (hero image optimized, preload)
- [ ] FID/INP < 100ms (JS не блокирует основной поток)
- [ ] CLS < 0.1 (explicit dimensions on images, font-display: swap)

### Mobile-First
- [ ] Responsive design (mobile viewport приоритетен)
- [ ] Touch-friendly (44px min targets)
- [ ] No horizontal scroll
- [ ] Readable font sizes (16px base)

### Crawlability
- [ ] robots.txt разрешает индексацию
- [ ] Sitemap.xml актуален
- [ ] Canonical URLs на всех страницах
- [ ] No broken internal links
- [ ] Status code 200 на всех важных страницах

### Performance
- [ ] Preload critical resources (fonts, hero image)
- [ ] Minified CSS/JS
- [ ] Optimized images (WebP/AVIF, responsive)
- [ ] Server response time < 200ms

## Local SEO (СПб фокус)

### Yandex Business / Google My Business

Интеграция данных:
- Название, адрес, телефон совпадают везде
- Категория: "Кейтеринговая служба" / "Catering service"
- Фото мероприятий (минимум 10)
- Отзывы с ответами

### Geo-keywords в контенте

Естественное использование:
- "кейтеринг **в Санкт-Петербурге**"
- "обслуживание мероприятий **в СПб и ЛО**"
- "доставка **по Санкт-Петербургу**"

## Monitoring & Analytics

### Key Metrics to Track
- Organic traffic (Google Analytics / Yandex Metrica)
- Positions for target queries (Yandex Webmaster / Google Search Console)
- Click-through rate (CTR) из SERP
- Pages indexed vs submitted
- Core Web Vitals scores

### Tools
- **Google Search Console** — индексация, ошибки, Core Web Vitals
- **Yandex.Webmaster** — индексация в Яндексе, регионы
- **Lighthouse** — технический аудит
- **Screaming Frog** — сканирование сайта

## Project-Specific Notes

Для кейтеринг-сайта:
1. **Локальный SEO приоритет** — конкуренция в СПб высокая
2. **Визуальный контент** — изображения оптимизировать для Google Images
3. **Мобильный трафик** — >60% будет с мобильных
4. **Сезонность** — пик запросов перед майскими, новогодними, свадебным сезоном
5. **Конкурентный анализ** — отслеживать top-10 по целевым запросам

## References

- [Google Search Central](https://developers.google.com/search/docs)
- [Yandex Webmaster Help](https://yandex.ru/support/webmaster/)
- [Schema.org Documentation](https://schema.org/)
[MOZ Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)
