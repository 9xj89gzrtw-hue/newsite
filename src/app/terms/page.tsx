import type { Metadata } from "next";
import { SITE_CONFIG, LEGAL_INFO, CONTACTS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description:
    "Условия использования сайта nilov catering: правила пользования, интеллектуальная собственность, ответственность. nilov catering, Санкт-Петербург.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Пользовательское соглашение — nilov catering",
    description: "Условия использования сайта и кейтеринговых услуг.",
    type: "website",
    url: "/terms",
    locale: "ru_RU",
    siteName: "nilov catering",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "nilov catering — выездной кейтеринг в Санкт-Петербурге" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Пользовательское соглашение — nilov catering",
    description: "Условия использования сайта и кейтеринговых услуг.",
    images: ["/og-image.jpg"],
  },
};

export default function TermsPage() {
  const updated = "1 сентября 2025 г.";
  return (
    <main className="min-h-screen bg-cream pt-32 pb-20">
      <article className="mx-auto max-w-3xl px-5 md:px-8">
        <header className="mb-12">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">
            Документ
          </span>
          <h1 className="mt-4 font-display text-3xl text-ink break-words hyphens-auto md:text-5xl">
            Пользовательское соглашение
          </h1>
          <p className="mt-3 font-mono text-sm text-ink-soft">
            Редакция от {updated} · {SITE_CONFIG.brandNameFull}
          </p>
        </header>

        <div className="prose-legal space-y-8 text-ink-soft">
          <Section title="1. Общие положения">
            <p>
              Настоящее Пользовательское соглашение (далее — «Соглашение»)
              регулирует использование сайта, принадлежащего{" "}
              {LEGAL_INFO.legalForm} {LEGAL_INFO.legalName} (далее —
              «Администрация»). Использование сайта означает полное и
              безоговорочное принятие условий Соглашения.
            </p>
            <p>
              Договор на оказание кейтеринговых услуг заключается на условиях
              Публичной оферты, размещённой в разделе{" "}
              <a href="/offer" className="text-bordeaux underline underline-offset-2">
                «Публичная оферта»
              </a>
              .
            </p>
          </Section>

          <Section title="2. Использование сайта">
            <p>Пользователь обязуется:</p>
            <ul>
              <li>использовать сайт исключительно в личных либо деловых законных целях;</li>
              <li>не размещать заведомо ложную информацию при отправке заявок;</li>
              <li>
                не пытаться получить несанкционированный доступ к управлению
                сайтом и его серверной инфраструктуре;
              </li>
              <li>не использовать автоматические средства массового сбора данных (скрейпинг).</li>
            </ul>
          </Section>

          <Section title="3. Интеллектуальная собственность">
            <p>
              Все материалы сайта — тексты, фотографии, логотипы, видеоролики,
              дизайн элементов интерфейса — являются объектами интеллектуальной
              собственности Администрации и/или её партнёров. Копирование,
              распространение и иное использование допускается только с письменного
              согласия правообладателя.
            </p>
          </Section>

          <Section title="4. Персональные данные">
            <p>
              Обработка персональных данных осуществляется в соответствии с
              Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных
              данных» и Политикой конфиденциальности, размещённой в разделе{" "}
              <a href="/privacy" className="text-bordeaux underline underline-offset-2">
                «Политика конфиденциальности»
              </a>
              . Отправляя заявку, Пользователь даёт согласие на обработку
              персональных данных.
            </p>
          </Section>

          <Section title="5. Ответственность">
            <p>
              Информация на сайте носит справочный характер. Точные условия
              оказания услуг (стоимость, сроки, комплектация) фиксируются в
              договоре после консультации. Администрация не несёт
              ответственности за возможные последствия использования информации,
              размещённой на сайте, без предварительной консультации со
              специалистами.
            </p>
            <p>
              Сайт может содержать ссылки на сторонние ресурсы. Администрация
              не контролирует их содержание и не отвечает за него.
            </p>
          </Section>

          <Section title="6. Заключительные положения">
            <p>
              Администрация вправе изменять условия Соглашения без уведомления
              Пользователей. Действующая редакция размещается на этой странице.
              К Соглашению применяется право Российской Федерации.
            </p>
            <p>
              Контакты для связи: {CONTACTS.phone}, {CONTACTS.email},{" "}
              {LEGAL_INFO.legalAddress}.
            </p>
          </Section>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl text-ink">{title}</h2>
      <div className="space-y-3 leading-relaxed [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}
