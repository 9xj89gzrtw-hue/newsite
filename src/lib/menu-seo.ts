import { MENU_TYPES } from "./pricing";
import { SITE_URL } from "./site-config";

/** Public menu only; package prices are not individual dish prices. */
export function menuStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${SITE_URL}/#catering-menu`,
    name: "Меню NiloV Catering",
    url: `${SITE_URL}/#menu`,
    inLanguage: "ru",
    hasMenuSection: MENU_TYPES.map((type) => ({
      "@type": "MenuSection",
      name: type.label,
      description: type.description,
      hasMenuSection: type.packages.map((pkg, index) => ({
        "@type": "MenuSection",
        "@id": `${SITE_URL}/#menu-${type.id}-${index}`,
        name: pkg.name,
        description: `${pkg.description} Цена за персону: ${pkg.pricePerGuest} руб.`,
        hasMenuItem: pkg.dishes.map((dish) => ({
          "@type": "MenuItem",
          name: dish.name,
          ...(dish.weight ? { description: `Вес порции / объём: ${dish.weight}` } : {}),
        })),
      })),
    })),
  };
}

/** Escape authored text so an admin menu entry cannot terminate a script. */
export function jsonLdText(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
