FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bunx expo export --platform web
EXPOSE 8081
CMD ["bunx", "serve", "dist", "-l", "8081"]
