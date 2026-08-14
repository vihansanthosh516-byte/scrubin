# ScrubIn API — Express server + built client.
#
# Production topology:
#   - Cloudflare Pages serves the static client (npm run build output).
#   - This container serves the API (/api/*) and, for convenience, the same
#     built client on its own origin.
#   - The Python simulation engine runs as a sibling container (docker-compose
#     service "engine"); the API proxies to it via SCRUBIN_CORE_URL.
#
# Build:  docker build -t scrubin-api .
# Run:    see docker-compose.yml for the full two-container stack.

# ── Stage 1: build the client + server bundle ──
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
# vite build → dist/public (client), esbuild → dist/index.js (server)
RUN npm run build

# ── Stage 2: minimal runtime ──
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
# Server bundle uses --packages=external, so node_modules must exist at runtime.
RUN npm ci --omit=dev --legacy-peer-deps
COPY --from=build /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
