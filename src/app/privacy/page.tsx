import type { Metadata } from "next";
import { SITE_CONFIG, LEGAL_INFO, CONTACTS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Как мы собираем, храним и защищаем ваши персональные данные в соответствии с 152-ФЗ. nilov catering, СПб.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Политика конфиденциальности — nilov catering",
    description: "Как мы защищаем ваши персональные данные в соответствии с 152-ФЗ.",
    type: "website",
    url: "/privacy",
    locale: "ru_RU",
    siteName: "nilov catering",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "nilov catering — выездной кейтеринг в Санкт-Петербурге" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Политика конфиденциальности — nilov catering",
    description: "Как мы защищаем ваши персональные данные в соответствии с 152-ФЗ.",
    images: ["/og-image.jpg"],
  },
};

export default function PrivacyPage() {
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
            Политика конфиденциальности
          </h1>
          <p className="mt-3 font-mono text-sm text-ink-soft">
            Редакция от {updated} · {SITE_CONFIG.brandNameFull}
          </p>
        </header>

        <div className="prose-legal space-y-8 text-ink-soft">
          <Section title="1. Общие положения">
            <p>
              Настоящая Политика обработки персональных данных составлена в
              соответствии с требованиями Федерального закона от 27.07.2006
              № 152-ФЗ «О персональных данных» и определяет порядок обработки
              персональных данных и меры по обеспечению безопасности
              персональных данных, предпринимаемые {LEGAL_INFO.legalForm}{" "}
              {LEGAL_INFO.legalName} (далее — «Оператор»).
            </p>
            <p>
              Оператор ставит своей важнейшей целью и условием осуществления
              своей деятельности соблюдение прав и свобод человека и гражданина
              при обработке его персональных данных, в том числе защиты прав на
              неприкосновенность частной жизни, личную и семейную тайну.
            </p>
          </Section>

          <Section title="2. Состав персональных данных">
            <p>Оператор обрабатывает следующие персональные данные:</p>
            <ul>
              <li>Фамилия, имя, отчество (при добровольном указании);</li>
              <li>Контактный телефон;</li>
              <li>Адрес электронной почты (при добровольном указании);</li>
              <li>Тип мероприятия, количество гостей, желаемая дата;</li>
              <li>
                Технические данные: IP-адрес, информация о браузере (User-Agent),
                информация о согласии с датой и временем.
              </li>
            </ul>
          </Section>

          <Section title="3. Цели обработки">
            <p>Персональные данные обрабатываются в целях:</p>
            <ul>
              <li>Обработки заявок на кейтеринговое обслуживание;</li>
              <li>Связи с клиентом для уточнения деталей мероприятия;</li>
              <li>Формирования коммерческого предложения;</li>
              <li>Заключения и исполнения договора на оказание услуг;</li>
              <li>Информирования о новых услугах (только с отдельного согласия).</li>
            </ul>
          </Section>

          <Section title="4. Правовое основание обработки">
            <p>
              Правовым основанием обработки персональных данных является
              согласие субъекта персональных данных на обработку его
              персональных данных, выраженное путём проставления отметки в
              соответствующем поле при отправке формы заявки на сайте.
            </p>
            <p>
              Обработка персональных данных также осуществляется на основании
              ст. 6 ФЗ № 152-ФЗ (исполнение договора, заключаемого путём
              совершения конклюдентных действий).
            </p>
          </Section>

          <Section title="5. Срок обработки">
            <p>
              Персональные данные обрабатываются в течение срока, необходимого
              для достижения целей обработки, но не более 3 (трёх) лет с момента
              последнего взаимодействия. По истечении указанного срока
              персональные данные подлежат уничтожению.
            </p>
          </Section>

          <Section title="6. Меры безопасности">
            <p>
              Оператор принимает необходимые правовые, организационные и
              технические меры для защиты персональных данных от неправомерного
              доступа, уничтожения, изменения, блокирования, копирования и
              распространения.
            </p>
            <p>
              Данные хранятся на серверах, расположенных на территории
              Российской Федерации, в соответствии с требованиями 152-ФЗ
              (ст. 18 ч. 5).
            </p>
          </Section>

          <Section title="7. Cookies и аналитика">
            <p>
              Сайт может использовать cookies для корректной работы. Файлы
              cookie, не являющиеся технически необходимыми (в том числе
              аналитические, в т.ч. Яндекс.Метрика), загружаются только после
              получения вашего согласия через баннер согласия.
            </p>
            <p>
              Вы можете отключить cookies в настройках вашего браузера, однако
              это может повлиять на работоспособность некоторых функций сайта.
            </p>
          </Section>

          <Section title="8. Права субъекта персональных данных">
            <p>Субъект персональных данных имеет право на:</p>
            <ul>
              <li>Доступ к своим персональным данным;</li>
              <li>Уточнение, блокирование или уничтожение персональных данных;</li>
              <li>Отзыв согласия на обработку персональных данных;</li>
              <li>Обращение в Роскомнадзор (rkn.gov.ru) при нарушении прав.</li>
            </ul>
            <p>
              Для реализации прав направьте обращение на{" "}
              <a href={`mailto:${LEGAL_INFO.legalEmail}`} className="text-bordeaux underline">
                {LEGAL_INFO.legalEmail}
              </a>{" "}
              или по телефону {CONTACTS.phone}.
            </p>
          </Section>

          <Section title="9. Контактные данные Оператора">
            <ul>
              <li><strong>Оператор:</strong> {LEGAL_INFO.legalForm} {LEGAL_INFO.legalName}</li>
              <li><strong>ИНН:</strong> {LEGAL_INFO.inn}</li>
              <li><strong>ОГРН/ОГРНИП:</strong> {LEGAL_INFO.ogrn}</li>
              <li><strong>Адрес:</strong> {LEGAL_INFO.legalAddress}</li>
              <li><strong>Email:</strong> {LEGAL_INFO.legalEmail}</li>
              <li><strong>Телефон:</strong> {CONTACTS.phone}</li>
              <li><strong>Лицо, ответственное за обработку:</strong> {LEGAL_INFO.dataOfficer}</li>
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
