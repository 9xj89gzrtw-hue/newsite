import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: ["*.space-z.ai", "*.chatglm.cn", "*.z.ai"],
  images: {
    formats: ["image/avif", "image/webp"],
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
      { source: "/events", destination: "/#events" },
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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.instagram.com https://instagram.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://sfile.chatglm.cn https://images.unsplash.com https://z-cdn.chatglm.cn https://*.cdninstagram.com https://*.fbcdn.net https://www.instagram.com",
              "frame-src 'self' https://yandex.ru https://www.yandex.ru https://www.instagram.com https://instagram.com",
              "connect-src 'self' https://api.telegram.org https://wa.me https://wa.me/*",
              "media-src 'self' https://*.cdninstagram.com https://*.fbcdn.net https://www.instagram.com data: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
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
