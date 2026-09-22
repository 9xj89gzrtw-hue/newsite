import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for shared PHP hosting (SpaceWeb/cweb.ru).
  // Live Node server + API routes are NOT available on this shared host
  // (Apache mod_proxy to a local port is blocked), so we prerender to HTML.
  output: "export",
  reactStrictMode: true,
  // FIX-4 [F15, W1-D]: убрать рекламный X-Powered-By: Next.js из ответов.
  poweredByHeader: false,
  devIndicators: false,
  images: {
    // No server-side image optimization on static export — emit original
    // (next/image still handles sizing/blur via client). WebP only.
    unoptimized: true,
    formats: ["image/webp"],
    qualities: [75, 82],
    remotePatterns: [
      { protocol: "https", hostname: "sfile.chatglm.cn" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "z-cdn.chatglm.cn" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "gsap"],
    // Persist Turbo filesystem cache so next/font/google font CSS and
    // woff2 files are cached between CI builds, preventing "queries have
    // exactly one entry" failures when fonts.googleapis.com is slow/unreachable.
    turbopackFileSystemCacheForBuild: true,
  },
  // Vanity URLs (/calculator, /menu, /events, /contacts) become in-page
  // anchors — handled client-side by VanityUrlScroll; no server rewrites needed
  // for a static export.
};

export default nextConfig;
