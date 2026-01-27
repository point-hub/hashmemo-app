# ---------------------------------------------------------------------------
# stage 1 - builder
# ---------------------------------------------------------------------------
FROM oven/bun:1-slim as builder

# setup default user and working directory
WORKDIR /app

# environment variable
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL $VITE_API_BASE_URL
ARG VITE_API_TIMEOUT
ENV VITE_API_TIMEOUT $VITE_API_TIMEOUT

# install dependencies
COPY --chown=node:node package.json bun.lock ./
RUN bun install --frozen-lockfile

# copy source code
COPY . .

# build app
RUN bun run build

# ---------------------------------------------------------------------------
# stage 2 - runner
# ---------------------------------------------------------------------------
FROM nginx:1.29-alpine as runner

# copy nginx configuration server block file
COPY .nginx/default.conf /etc/nginx/conf.d/default.conf

# copy web files
COPY --from=builder /home/node/app/dist /usr/share/nginx/html
