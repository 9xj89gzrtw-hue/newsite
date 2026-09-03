import * as React from "react";

/**
 * BrandBadge — inline-SVG монограмма бренда: скруглённый квадрат +
 * N-метка «nilov». Вектор-двойник public/logo.svg (пути 1-в-1 из
 * исходника), поэтому:
 *   - масштабируется без растеризации (футер-водяной знак ~1000px);
 *   - красится через currentColor — цвет задаёт контейнер/раздел;
 *   - ноль сетевых запросов (в отличие от /brand/logo-*.png).
 *
 * C76 (сентябрь 2026): единый источник формы логотипа на странице —
 * футер-водяной знак, печать каталога меню, личная печать основателя,
 * водяной знак квитанции успеха. Шапка/прелоадер остаются на PNG
 * (preload-путь /brand/logo-256.png в layout.tsx, §43-дисциплина).
 *
 * Аксессичность: по умолчанию DECORATIVE — aria-hidden="true" (бренд
 * читается текстом в контексте каждого вхождения). Для смыслового
 * вхождения передать role="img" + <title> через проп title.
 *
 * Проп badgeStrokeWidth задан в единицах viewBox (30×30): 0.5 — «как
 * в оригинальном лого» (мелкие печати), 0.18 — тонкий контур для
 * гигантского водяного знака (при 1000px это ~6px — hairline).
 */
export type BrandBadgeProps = Omit<
  React.SVGProps<SVGSVGElement>,
  "children"
> & {
  /** Включить скруглённую рамку-квадрат (default: true). */
  outline?: boolean;
  /** Включить N-метку (default: true). */
  mark?: boolean;
  /** Толщина рамки в единицах viewBox (default: 0.5 — как в лого). */
  badgeStrokeWidth?: number;
  /** a11y-заголовок; при отсутствии — элемент декоративен. */
  title?: string;
};

export function BrandBadge({
  outline = true,
  mark = true,
  badgeStrokeWidth = 0.5,
  title,
  ...svgProps
}: BrandBadgeProps) {
  return (
    <svg
      viewBox="0 0 30 30"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...svgProps}
    >
      {title ? <title>{title}</title> : null}
      {outline ? (
        <path
          d="M24.51,28.51H5.49c-2.21,0-4-1.79-4-4V5.49c0-2.21,1.79-4,4-4h19.03c2.21,0,4,1.79,4,4v19.03C28.51,26.72,26.72,28.51,24.51,28.51z"
          fill="none"
          stroke="currentColor"
          strokeWidth={badgeStrokeWidth}
          strokeLinejoin="round"
        />
      ) : null}
      {mark ? (
        <g fill="currentColor">
          {/* N-метка: пути 1-в-1 из public/logo.svg (класс .st23) */}
          <path d="M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z" />
          <polygon points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1" />
          <path d="M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z" />
        </g>
      ) : null}
    </svg>
  );
}

export default BrandBadge;
