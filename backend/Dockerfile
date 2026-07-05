FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc --noEmit

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY data ../data
RUN chown -R app:app /app
USER app
EXPOSE 3001
ENV NODE_ENV=production
CMD ["npx", "tsx", "src/server.ts"]
