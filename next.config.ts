import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // FIX-4 [F15, W1-D]: убрать рекламный X-Powered-By: Next.js из ответов
  // (замер W1-D: заголовок присутствовал). Никакого функционала не несёт.
  poweredByHeader: false,
  // Hide the Next.js dev mode "N issues" indicator badge (Cycle 45 — was
  // showing in spiral screenshots and looked like a browser error).
  devIndicators: false,
  allowedDevOrigins: ["*.space-z.ai", "*.chatglm.cn", "*.z.ai"],
  images: {
    // Cycle 49: webp first — the local sharp AVIF encoder hangs on some
    // large sources (sandbox CPU quirk; Vercel's CDN optimizer is unaffected).
    // WebP is universally supported in 2026, so this is loss-free in prod.
    // Cycle 66: webp ONLY. Локальный sharp/libheif пишет AVIF, который
    // Chromium декодирует в ~45% разрешения (замер: файл 960×1280 avif →
    // img.naturalWidth 426×568 после полного decode(); портрет DPR2 мыл
    // в 2.25×). Webp поддерживается 100% браузеров в 2026 (аргумент C49),
    // Vercel-оптимизатор в проде отдаёт webp без потерь качества.
    formats: ["image/webp"],
    // c83-F2 (U1a D2): cep-instagram-grid рендерит ig-real-*.jpg с
    // quality={82} — не было в списке → 9 dev-варнингов next/image
    // «quality 82 ∉ images.qualities» на каждый рендер сетки. 82 добавлен
    // к дефолтному 75 (в src quality=82 — единственное использование).
    qualities: [75, 82],
    remotePatterns: [
      { protocol: "https", hostname: "sfile.chatglm.cn" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "z-cdn.chatglm.cn" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "gsap"],
  },
  async rewrites() {
    return [
      { source: "/calculator", destination: "/#calculator" },
      { source: "/menu", destination: "/#menu" },
      /* 81-W2F1 (критик G NIT): якоря #events на главной НЕТ — реальный id
         секции видео-карусели. Хэш до сервера не доходит (rewrite
         прозрачен), фактический скролл ведёт vanity-scroll.tsx по
         VANITY_TARGETS["/events"] = "events-video-carousel" — строка здесь
         держит конфиг и цель синхронно. */
      { source: "/events", destination: "/#events-video-carousel" },
      { source: "/contacts", destination: "/#contact" },
      { source: "/contact", destination: "/#contact" },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // 81-F4 [SEC1, W1-c]: Метрика (analytics.ts инжектит
            // https://mc.yandex.ru/metrika/tag.js + бьёт beacon'ы в mc
            // — без этих хостов CSP блокировала счётчик):
            //   a) script-src += https://mc.yandex.ru;
            //   b) connect-src += https://mc.yandex.ru.
            // 81-F4 [SEC4]: жёсткий каркас:
            //   c) frame-ancestors 'none' — запрет фрейминга (XFO
            //      SAMEORIGIN остаётся для старых браузеров, но
            //      frame-ancestors — современный стандарт);
            //   d) upgrade-insecure-requests — http-сабресурсы
            //      апгрейдятся до https (localhost — potentially
            //      trustworthy, dev не задет).
            // 'unsafe-inline'/'unsafe-eval' в script-src ОСТАВЛЕНЫ
            // (dev-нужды React Refresh; полный nonce-CSP через proxy.ts +
            // strict-dynamic — будущий цикл, см. worklog 81-F4).
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://mc.yandex.ru https://www.instagram.com https://instagram.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://sfile.chatglm.cn https://images.unsplash.com https://z-cdn.chatglm.cn https://*.cdninstagram.com https://*.fbcdn.net https://www.instagram.com https://mc.yandex.ru",
              "frame-src 'self' https://yandex.ru https://www.yandex.ru https://www.instagram.com https://instagram.com",
              "connect-src 'self' https://mc.yandex.ru https://api.telegram.org https://wa.me https://wa.me/*",
              "media-src 'self' https://*.cdninstagram.com https://*.fbcdn.net https://www.instagram.com data: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            // 81-F4 [SEC4]: HSTS — 2 года + сабдомены. Браузер применяет
            // только поверх https (http-ответы игнорируют заголовок —
            // dev на :3001 не задет).
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
          {
            // 81-F4 [SEC6-минимум]: COOP — окно изолировано от
            // cross-origin opener'а (обратные ссылки window.opener
            // с чужих окон обрезаются; popup'ы соцсетей не ломаются).
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
