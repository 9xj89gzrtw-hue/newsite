import type { Metadata } from "next";
import { SITE_CONFIG, LEGAL_INFO, CONTACTS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Публичная оферта",
  description:
    "Условия оказания кейтеринговых услуг: стоимость, порядок оплаты, расторжение договора. Interfood Catering, Санкт-Петербург.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/offer" },
  openGraph: {
    title: "Публичная оферта — Interfood Catering",
    description: "Условия оказания кейтеринговых услуг: стоимость, порядок оплаты.",
    type: "website",
    url: "/offer",
  },
  twitter: {
    card: "summary",
    title: "Публичная оферта — Interfood Catering",
    description: "Условия оказания кейтеринговых услуг: стоимость, порядок оплаты.",
  },
};

export default function OfferPage() {
  // Hardcoded revision date — 152-ФЗ requires a stable, traceable document version.
  // Update this constant only when the document content actually changes.
  const updated = "1 сентября 2025 г.";
  return (
    <main className="min-h-screen bg-cream pt-32 pb-20">
      <article className="mx-auto max-w-3xl px-5 md:px-8">
        <header className="mb-12">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">
            Документ
          </span>
          <h1 className="mt-4 font-display text-3xl text-ink break-words hyphens-auto md:text-5xl">
            Публичная оферта
          </h1>
          <p className="mt-3 font-mono text-sm text-ink-soft">
            Редакция от {updated} · {SITE_CONFIG.brandNameFull}
          </p>
        </header>

        <div className="prose-legal space-y-8 text-ink-soft">
          <Section title="1. Предмет оферты">
            <p>
              {LEGAL_INFO.legalForm} {LEGAL_INFO.legalName} (далее —
              «Исполнитель») предлагает любому физическому или юридическому лицу
              (далее — «Заказчик») заключить договор на оказание кейтеринговых
              услуг (далее — «Услуги») на условиях, изложенных в настоящей
              Публичной оферте.
            </p>
            <p>
              Акцепт настоящей оферты осуществляется путём направления заявки
              через форму на сайте, по телефону или WhatsApp.
            </p>
          </Section>

          <Section title="2. Перечень услуг">
            <p>Исполнитель оказывает следующие услуги:</p>
            <ul>
              <li>Организация фуршетов, банкетов, кофе-брейков;</li>
              <li>Доставка закусок и обедов в офис;</li>
              <li>Выездное барбекю;</li>
              <li>Аренда оборудования, мебели, посуды, текстиля;</li>
              <li>Оформление зала, флористика;</li>
              <li>Торты на заказ, пирамиды из шампанского;</li>
              <li>Шоколадные фонтаны, выездная регистрация;</li>
              <li>Выездной ресторан с обслуживанием официантами.</li>
            </ul>
          </Section>

          <Section title="3. Стоимость и порядок расчётов">
            <p>
              Стоимость услуг определяется на основании выбранного формата
              мероприятия, количества гостей и дополнительных услуг.
              Предварительная оценка доступна через интерактивный калькулятор на
              сайте и носит информационный характер.
            </p>
            <p>
              Окончательная стоимость фиксируется в договоре (или счёте) после
              консультации. Оплата производится в рублях (RUB) в следующем порядке:
            </p>
            <ul>
              <li>Предоплата 30% — при подтверждении заказа;</li>
              <li>Окончательный расчёт — не позднее 3 дней до мероприятия;</li>
              <li>Возврат предоплаты — в соответствии со ст. 32 Закона «О защите прав потребителей».</li>
            </ul>
          </Section>

          <Section title="4. Права и обязанности Сторон">
            <p><strong>Исполнитель обязан:</strong></p>
            <ul>
              <li>Оказать услуги качественно и в срок;</li>
              <li>Соблюдать санитарно-эпидемиологические требования (СанПиН);</li>
              <li>Обеспечить наличие необходимых разрешений и сертификаций;</li>
              <li>Сохранять конфиденциальность информации Заказчика (152-ФЗ).</li>
            </ul>
            <p><strong>Заказчик обязан:</strong></p>
            <ul>
              <li>Предоставить достоверную информацию о мероприятии;</li>
              <li>Обеспечить доступ на площадку в согласованные сроки;</li>
              <li>Произвести оплату в установленные сроки.</li>
            </ul>
          </Section>

          <Section title="5. Срок оказания услуг">
            <p>
              Срок оказания услуг определяется датой мероприятия, указанной в
              заявке/договоре. Подготовка услуг начинается с момента получения
              предоплаты.
            </p>
          </Section>

          <Section title="6. Расторжение договора">
            <p>
              В соответствии со ст. 32 Закона РФ «О защите прав потребителей»
              потребитель вправе отказаться от исполнения договора в любое время
              при условии оплаты исполнителю фактически понесённых расходов.
            </p>
            <p>
              При расторжении договора более чем за 14 дней до мероприятия
              Исполнитель возвращает предоплату за вычетом фактически
              понесённых расходов (не более 10%). При расторжении менее чем за
              14 дней до мероприятия предоплата не возвращается (возмещаются
              только фактически понесённые расходы, подтверждённые документально).
            </p>
          </Section>

          <Section title="7. Ответственность">
            <p>
              Исполнитель несёт ответственность за качество оказанных услуг в
              соответствии с Законом РФ «О защите прав потребителей». Спорные
              вопросы решаются путём переговоров, при недостижении согласия —
              в судебном порядке по месту нахождения Исполнителя.
            </p>
          </Section>

          <Section title="8. Реквизиты Исполнителя">
            <ul>
              <li><strong>Исполнитель:</strong> {LEGAL_INFO.legalForm} {LEGAL_INFO.legalName}</li>
              <li><strong>ИНН:</strong> {LEGAL_INFO.inn}</li>
              <li><strong>ОГРН/ОГРНИП:</strong> {LEGAL_INFO.ogrn}</li>
              <li><strong>Адрес:</strong> {LEGAL_INFO.legalAddress}</li>
              <li><strong>Телефон:</strong> {CONTACTS.phone}</li>
              <li><strong>Email:</strong> {LEGAL_INFO.legalEmail}</li>
            </ul>
          </Section>
        </div>

        <footer className="mt-16 border-t border-ink/10 pt-8">
          <a href="/#contact" className="text-bordeaux hover:underline inline-flex min-h-[44px] items-center py-2 font-medium">
            ← Вернуться на сайт
          </a>
        </footer>
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
