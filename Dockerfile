# syntax=docker/dockerfile:1
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
ENV PORT=3000 NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "start"]
