FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx svelte-kit sync && npm run build

ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

# SQLite data persists in /data
RUN mkdir -p /data
ENV DATABASE_PATH=/data/hivescout.db

CMD ["node", "build"]
