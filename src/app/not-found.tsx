import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Home, UtensilsCrossed } from "lucide-react";
import { CONTACTS } from "@/lib/config";

/* Task 1-b (cycle-71): собственный OG для 404 — раньше страница наследовала
 * og:title/og:description/og:url главной (портят превью в соцсетях при
 * переходе по битой ссылке). Next 16: not-found.tsx поддерживает export
 * metadata (title/description уже работали) — openGraph/twitter тоже
 * рендерятся, проверено curl-ом /nonexistent в верификации Task 1-b.
 * canonical = "/" (консолидация веса на главную; сама 404 — noindex). */
export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Запрашиваемая страница не существует. Вернитесь на главную или свяжитесь с nilov catering.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Страница не найдена | nilov catering",
    description: "Запрашиваемая страница не существует. Вернитесь на главную или свяжитесь с nilov catering.",
    type: "website",
    url: "/",
    locale: "ru_RU",
    siteName: "nilov catering",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "nilov catering — кейтеринг Санкт-Петербурга" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Страница не найдена | nilov catering",
    description: "Запрашиваемая страница не существует. Вернитесь на главную или свяжитесь с nilov catering.",
    images: ["/og-image.jpg"],
  },
};

export default function NotFound() {
  /* F4 / K1 MINOR (cycle-71): светлая 404 вне тёмного бренда → рестайл в
   * тёмную бренд-страницу: espresso-фон #0A0908, кремовый текст, золотые
   * акценты #C9A227 (контрасты посчитаны: gold на espresso = 8.22:1,
   * cream = 18.32:1, cream/75 = 10.29:1 — всё ≥4.5 AA), ghost-404 —
   * золотой контур (декоративный, aria-hidden). Кнопки: «На главную» —
   * золотая заливка с espresso-текстом (8.22:1), «Смотреть меню»/телефон —
   * outline-gold с кремовым текстом. Metadata-экспорт НЕ тронут (Task 1-b,
   * свежие OG/noindex/canonical — см. докстринг выше). */
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0908] px-5 py-20 text-center">
      <div className="mx-auto max-w-md">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#C9A227]">
          Ошибка 404
        </span>
        <p
          className="mt-4 font-display text-7xl font-bold md:text-8xl"
          aria-hidden="true"
          style={{
            color: "rgba(201, 162, 39, 0.14)",
            WebkitTextStroke: "1.5px rgba(201, 162, 39, 0.55)",
          }}
        >
          404
        </p>
        <h1 className="mt-2 font-display text-2xl text-cream md:text-3xl">
          Страница не найдена
        </h1>
        <p className="mt-4 text-base text-cream/75">
          Возможно, страница была перемещена или удалена. Вернитесь на главную
          или свяжитесь с нами — поможем организовать ваше мероприятие.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[#C9A227] px-7 py-3 text-sm font-medium text-[#0A0908] transition-colors hover:bg-[#B08D22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
          >
            <Home className="size-4" />
            На главную
          </Link>
          <Link
            href="/#menu"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#C9A227] bg-transparent px-7 py-3 text-sm font-medium text-cream transition-colors hover:border-[#E5C76B] hover:bg-[#C9A227]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
          >
            <UtensilsCrossed className="size-4" />
            Смотреть меню
          </Link>
          <a
            href={CONTACTS.phoneHref}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#C9A227] bg-transparent px-7 py-3 text-sm font-medium text-cream transition-colors hover:border-[#E5C76B] hover:bg-[#C9A227]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
          >
            <Phone className="size-4" />
            {CONTACTS.phone}
          </a>
        </div>
      </div>
    </main>
  );
}
