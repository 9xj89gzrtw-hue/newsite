import type { Metadata } from "next";
import Link from "next/link";
import { LEGAL_INFO, CONTACTS } from "@/lib/config";
import {
  FOUNDED_YEAR,
  EVENTS_DONE,
  GUESTS_SERVED,
  SITE_URL_BASE,
} from "@/lib/site-config";
import { MENU_TYPES } from "@/lib/pricing";

/**
 * c101 (чек-лист SEO-YANDEX, шаг 27) — страница «О компании» с
 * машины-читаемыми фактами: год основания, количество мероприятий и гостей,
 * юридическое лицо, география, форматы с ценами «от». Лучший источник для
 * цитирования ИИ-ассистентами (Perplexity/ChatGPT/Алиса) и Яндекс-сниппетов:
 * факты лежат в чистом HTML (dl/table/ul), а не в анимационных секциях
 * главной. Все числа — из ЕДИНЫХ источников (site-config.ts, pricing.ts,
 * config.ts), синхронно с JSON-LD главной и llms.txt.
 *
 * Число лет опыта считается от FOUNDED_YEAR динамически — не протухает.
 * Цены «от» — из menu.json через MENU_TYPES (та же таблица, что в
 * калькуляторе; при изменении меню страница обновится сама).
 */

const YEARS_ACTIVE = new Date().getFullYear() - FOUNDED_YEAR;

/** Форматы с ценами «от» — из меню-каталога (как калькулятор). */
const FORMATS = MENU_TYPES.map((t) => ({
  id: t.id,
  label: t.label,
  minPrice: Math.min(...t.packages.map((p) => p.pricePerGuest)),
}));

/** c101 — AboutPage JSON-LD: ссылка на организацию, объявленную в
 *  layout.tsx (@id …#organization) — сущность одна, дублирования нет. */
const aboutLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": SITE_URL_BASE + "/about#webpage",
  url: SITE_URL_BASE + "/about",
  name: "О компании — NILOV CATERING",
  description: `NILOV CATERING — кейтеринг полного цикла в Санкт-Петербурге с ${FOUNDED_YEAR} года: ${EVENTS_DONE}+ мероприятий, ${GUESTS_SERVED.toLocaleString("ru-RU")}+ гостей. ИП ${LEGAL_INFO.legalName}.`,
  mainEntity: { "@id": SITE_URL_BASE + "#organization" },
  isPartOf: { "@id": SITE_URL_BASE + "#organization" },
};

export const metadata: Metadata = {
  /* c126 (22.09.2026): убран дубль бренда в title. Layout-шаблон
   * (layout.tsx:144) добавляет суффикс « | NILOV CATERING», поэтому бренд
   * внутри своего title давал «... | NILOV CATERING | NILOV CATERING» —
   * Яндекс обрезает такие title и теряет ключевые слова. Оставляем только
   * значимую часть; бренд прийдёт из шаблона. */
  title: `Кейтеринг в СПб с ${FOUNDED_YEAR} года — о компании`,
  description: `NILOV CATERING: работаем с ${FOUNDED_YEAR} года — ${EVENTS_DONE}+ мероприятий и ${GUESTS_SERVED.toLocaleString("ru-RU")}+ гостей. ${LEGAL_INFO.legalForm} ${LEGAL_INFO.legalName}. Фуршеты, банкеты, свадьбы, корпоративы в Санкт-Петербурге и ЛО.`,
  robots: { index: true, follow: true },
  alternates: { canonical: "/about" },
  openGraph: {
    title: `О компании — NILOV CATERING, кейтеринг СПб с ${FOUNDED_YEAR} года`,
    description: `${EVENTS_DONE}+ мероприятий, ${GUESTS_SERVED.toLocaleString("ru-RU")}+ гостей, ${YEARS_ACTIVE} года опыта. Форматы, цены «от», реквизиты и контакты.`,
    type: "website",
    url: "/about",
    locale: "ru_RU",
    siteName: "NILOV CATERING",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "NILOV CATERING — выездной кейтеринг в Санкт-Петербурге" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `О компании — NILOV CATERING, кейтеринг СПб с ${FOUNDED_YEAR} года`,
    description: `${EVENTS_DONE}+ мероприятий, ${GUESTS_SERVED.toLocaleString("ru-RU")}+ гостей. Форматы, цены, реквизиты.`,
    images: ["/og-image.jpg"],
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" role="main" tabIndex={-1} className="min-h-screen bg-cream pt-32 pb-20 outline-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }}
      />
      <article className="mx-auto max-w-3xl px-5 md:px-8">
        <header className="mb-12">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">
            NILOV CATERING
          </span>
          <h1 className="mt-4 font-display text-3xl text-ink break-words hyphens-auto md:text-5xl">
            О компании
          </h1>
          <p className="mt-3 font-mono text-sm text-ink-soft">
            Кейтеринг, в котором чувствуют · Санкт-Петербург · с {FOUNDED_YEAR}{" "}
            года
          </p>
        </header>

        <div className="prose-legal space-y-10 text-ink-soft">
          {/* Факты — машины-читаемый dl с точными числами */}
          <section aria-labelledby="about-facts">
            <h2
              id="about-facts"
              className="font-display text-2xl text-ink mb-5"
            >
              Факты
            </h2>
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4 not-prose">
              <div className="rounded-lg border border-black/10 bg-white/60 p-4 text-center">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  Год основания
                </dt>
                <dd className="mt-1 font-display text-3xl text-ink">
                  {FOUNDED_YEAR}
                </dd>
                <p className="mt-1 text-xs text-ink-soft">
                  {YEARS_ACTIVE} года опыта
                </p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white/60 p-4 text-center">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  Мероприятий
                </dt>
                <dd className="mt-1 font-display text-3xl text-ink">
                  {EVENTS_DONE.toLocaleString("ru-RU")}+
                </dd>
                <p className="mt-1 text-xs text-ink-soft">с {FOUNDED_YEAR} года</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white/60 p-4 text-center">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  Гостей
                </dt>
                <dd className="mt-1 font-display text-3xl text-ink">
                  120&nbsp;000+
                </dd>
                <p className="mt-1 text-xs text-ink-soft">накормлено</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white/60 p-4 text-center">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                  География
                </dt>
                <dd className="mt-1 font-display text-xl leading-tight text-ink">
                  СПб&nbsp;+&nbsp;ЛО
                </dd>
                <p className="mt-1 text-xs text-ink-soft">
                  Санкт-Петербург и Ленинградская область
                </p>
              </div>
            </dl>
            <p className="mt-5">
              NILOV CATERING — премиальный кейтеринг полного цикла в
              Санкт-Петербурге. Основатель — Дмитрий Нилов. Мы привозим
              выездной ресторан на вашу площадку: повара, официанты,
              сервировка, посуда и текстиль — «еда как искусство» с{" "}
              {FOUNDED_YEAR} года. Заявки принимаем круглосуточно, заказы — от
              одного гостя.
            </p>
          </section>

          {/* Форматы и цены «от» — таблица из меню-каталога */}
          <section aria-labelledby="about-formats">
            <h2
              id="about-formats"
              className="font-display text-2xl text-ink mb-5"
            >
              Форматы и цены «от»
            </h2>
            <p className="mb-4">
              Шесть форматов меню — от доставки закусок до банкета. Полные
              составы пакетов «Базовый» / «Стандарт» / «Премиум» — в{" "}
              <Link
                href="/#menu"
                className="text-ink underline decoration-gold underline-offset-4"
              >
                каталоге меню
              </Link>{" "}
              и{" "}
              <Link
                href="/#calculator"
                className="text-ink underline decoration-gold underline-offset-4"
              >
                калькуляторе стоимости
              </Link>
              .
            </p>
            <table className="w-full text-left not-prose border-collapse">
              <thead>
                <tr className="border-b border-black/15">
                  <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                    Формат
                  </th>
                  <th className="py-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft text-right">
                    Цена за человека
                  </th>
                </tr>
              </thead>
              <tbody>
                {FORMATS.map((f) => (
                  <tr key={f.id} className="border-b border-black/5">
                    <td className="py-2.5 pr-4 font-semibold text-ink">
                      {f.label}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-ink">
                      от {f.minPrice.toLocaleString("ru-RU")} ₽
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-sm">
              В стоимость входит: еда, доставка в пределах КАД, сервировка,
              посуда и текстиль, повар и официанты на месте, лёгкое цветочное
              сопровождение. Не входит: аренда площадки, алкоголь, музыка,
              расширенная флористика — поможем организовать по запросу.
              Свадьбы, корпоративы, выездной бар, шоу-станции, торты на заказ,
              вегетарианское/веганское/безглютеновое меню и халяль —
              адаптируем под ваш формат.
            </p>
          </section>

          {/* Юридическая информация */}
          <section aria-labelledby="about-legal">
            <h2
              id="about-legal"
              className="font-display text-2xl text-ink mb-5"
            >
              Юридическая информация
            </h2>
            <dl className="not-prose space-y-2">
              <div className="flex flex-wrap gap-x-3">
                <dt className="font-mono text-xs uppercase tracking-widest text-ink-soft min-w-[180px]">
                  Юридическое лицо
                </dt>
                <dd className="text-ink font-semibold">
                  {LEGAL_INFO.legalForm} {LEGAL_INFO.legalName}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="font-mono text-xs uppercase tracking-widest text-ink-soft min-w-[180px]">
                  ОГРНИП / ИНН
                </dt>
                <dd className="text-ink tabular-nums">
                  {LEGAL_INFO.ogrn} · {LEGAL_INFO.inn}
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="font-mono text-xs uppercase tracking-widest text-ink-soft min-w-[180px]">
                  Офис
                </dt>
                <dd className="text-ink">
                  {CONTACTS.address} ·{" "}
                  <a
                    href={CONTACTS.addressHref}
                    className="underline decoration-gold underline-offset-4"
                    rel="noopener noreferrer nofollow"
                    target="_blank"
                  >
                    на карте
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-3">
                <dt className="font-mono text-xs uppercase tracking-widest text-ink-soft min-w-[180px]">
                  Часы работы
                </dt>
                <dd className="text-ink">
                  заявки — круглосуточно; обрабатываем 09:00–21:00
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm">
              Полные реквизиты и условия — в{" "}
              <Link href="/offer" className="underline decoration-gold underline-offset-4">
                публичной оферте
              </Link>
              .
            </p>
          </section>

          {/* Контакты + CTA */}
          <section aria-labelledby="about-contacts">
            <h2
              id="about-contacts"
              className="font-display text-2xl text-ink mb-5"
            >
              Контакты
            </h2>
            <ul className="not-prose space-y-2">
              <li>
                Телефон / WhatsApp / Telegram:{" "}
                <a
                  href={CONTACTS.phoneHref}
                  className="font-semibold text-ink underline decoration-gold underline-offset-4"
                >
                  {CONTACTS.phone}
                </a>
              </li>
              <li>
                Email:{" "}
                <a
                  href={`mailto:${CONTACTS.email}`}
                  className="text-ink underline decoration-gold underline-offset-4"
                >
                  {CONTACTS.email}
                </a>
              </li>
              <li>Офис: {CONTACTS.address}</li>
            </ul>
            <div className="mt-8 rounded-xl bg-ink p-6 not-prose text-center md:p-8">
              <p className="font-display text-xl text-cream">
                Посчитайте смету за 30 секунд
              </p>
              <p className="mt-2 text-sm text-cream/70">
                Формат события, число гостей и дата — калькулятор покажет
                предварительный расчёт с составом меню.
              </p>
              <Link
                href="/#calculator"
                className="mt-5 inline-block rounded-lg bg-gold px-6 py-3 font-semibold text-ink transition-transform hover:scale-[1.02]"
              >
                Открыть калькулятор
              </Link>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
