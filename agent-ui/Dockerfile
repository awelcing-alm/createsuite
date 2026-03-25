FROM node:22-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app

COPY package.json bun.lock ./
COPY server/package.json server/bun.lock ./server/

RUN bun install --frozen-lockfile && \
    bun install --frozen-lockfile --cwd server

COPY . .

RUN bun run build && \
    rm -rf node_modules && bun install --production && \
    rm -rf server/node_modules && bun install --production --cwd server

FROM node:22-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    bash \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://opencode.ai/install | bash

RUN cat <<'EOF' > /usr/local/bin/createsuite-startup-art
#!/usr/bin/env bash
if [[ -n "${CREATESUITE_NO_MOTD:-}" ]]; then
  exit 0
fi
if [[ ! -t 1 ]]; then
  exit 0
fi
printf "\e[38;2;255;173;96m%s\e[0m\n" ".::--==++**x%%%%@@%%%%x**++==--::.  createsuite terminal"
printf "\e[38;2;90;193;230m%s\e[0m\n" "pty online | agent loop active | mesh synced"
printf "\e[2m%s\e[0m\n\n" "startup telemetry: stable"
EOF
RUN chmod +x /usr/local/bin/createsuite-startup-art
RUN printf '%s\n' '[[ -t 1 ]] && /usr/local/bin/createsuite-startup-art' >> /root/.bash_profile

ENV PATH="/root/.opencode/bin:${PATH}"
ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/index.js ./server/index.js
COPY --from=builder /app/server/worker.js ./server/worker.js
COPY --from=builder /app/server/lifecycleManager.js ./server/lifecycleManager.js
COPY --from=builder /app/server/agentSpawner.js ./server/agentSpawner.js
COPY --from=builder /app/server/spriteGenerator.js ./server/spriteGenerator.js

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server/index.js"]
