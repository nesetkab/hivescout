FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Create data dir before build so db.ts can init during SSR
RUN mkdir -p /data
ENV DATABASE_PATH=/data/hivescout.db

RUN npx svelte-kit sync && npm run build

ENV PORT=3000
ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["node", "build"]
