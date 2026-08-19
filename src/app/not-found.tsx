import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Home, UtensilsCrossed } from "lucide-react";
import { CONTACTS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Запрашиваемая страница не существует. Вернитесь на главную или свяжитесь с Interfood Catering.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-20 text-center">
      <div className="mx-auto max-w-md">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">
          Ошибка 404
        </span>
        <p className="mt-4 font-display text-7xl font-bold text-ink/30 md:text-8xl" aria-hidden="true">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl text-ink md:text-3xl">
          Страница не найдена
        </h1>
        <p className="mt-4 text-base text-ink/70">
          Возможно, страница была перемещена или удалена. Вернитесь на главную
          или свяжитесь с нами — поможем организовать ваше мероприятие.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-bordeaux px-7 py-3 text-sm font-medium text-cream transition-colors hover:bg-bordeaux/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux"
          >
            <Home className="size-4" />
            На главную
          </Link>
          <Link
            href="/#menu"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-border-line bg-white px-7 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux"
          >
            <UtensilsCrossed className="size-4" />
            Смотреть меню
          </Link>
          <a
            href={CONTACTS.phoneHref}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-border-line bg-white px-7 py-3 text-sm font-medium text-ink transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux"
          >
            <Phone className="size-4" />
            {CONTACTS.phone}
          </a>
        </div>
      </div>
    </main>
  );
}
