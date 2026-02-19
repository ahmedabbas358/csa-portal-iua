FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Strip any stray Windows carriage-returns from the Prisma schema
RUN sed -i 's/\r$//' server/prisma/schema.prisma

# Set DATABASE_URL for build-time Prisma operations
ENV DATABASE_URL="file:/app/data/csa.db"
RUN mkdir -p /app/data

RUN npx prisma generate --schema=server/prisma/schema.prisma
RUN npx prisma db push --schema=server/prisma/schema.prisma --skip-generate

RUN npm run build

EXPOSE 3001

CMD ["npx", "tsx", "server/src/index.ts"]
