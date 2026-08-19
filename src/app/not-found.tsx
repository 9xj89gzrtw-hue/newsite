import Link from "next/link";
import { Phone, Home, UtensilsCrossed } from "lucide-react";
import { CONTACTS } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-20 text-center">
      <div className="mx-auto max-w-md">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-bordeaux">
          Ошибка 404
        </span>
        <h1 className="mt-4 font-display text-6xl text-ink md:text-7xl">
          404
        </h1>
        <h2 className="mt-4 font-display text-2xl text-ink md:text-3xl">
          Страница не найдена
        </h2>
        <p className="mt-4 text-base text-ink/60">
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
