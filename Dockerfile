# Dockerfile — hosting-agnostic, works on Timeweb Cloud (Container service),
# any Docker host, or locally. Builds the site and runs Next.js in production.
#
# Build: docker build -t interfood-catering .
# Run:   docker run -p 3000:3000 -e DATABASE_URL=... -e NEXT_PUBLIC_SITE_URL=... interfood-catering

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install bun for faster installs (optional, falls back to npm)
RUN npm install -g bun

# --- Dependencies ---
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || npm install

# --- Builder ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build-time env (Next.js public vars must be present at build)
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_YANDEX_METRIKA
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_YANDEX_METRIKA=$NEXT_PUBLIC_YANDEX_METRIKA
# DATABASE_URL needed for prisma generate + db push (set at runtime instead if you prefer)
RUN bun run build
# Install Playwright chromium browser (for /api/menu-pdf)
RUN bunx playwright install --with-deps chromium

# --- Runner ---
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install Playwright + Chromium system deps (for /api/menu-pdf)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
    libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone build + static + prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Playwright + browser cache (for /api/menu-pdf)
COPY --from=builder /app/node_modules/playwright ./node_modules/playwright
COPY --from=builder /app/node_modules/playwright-core ./node_modules/playwright-core
COPY --from=builder /root/.cache/ms-playwright /home/nextjs/.cache/ms-playwright
ENV PLAYWRIGHT_BROWSERS_PATH=/home/nextjs/.cache/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
