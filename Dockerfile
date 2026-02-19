FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Strip any stray Windows carriage-returns from the Prisma schema
RUN sed -i 's/\r$//' server/prisma/schema.prisma

RUN npx prisma generate --schema=server/prisma/schema.prisma

RUN npm run build

EXPOSE 3001

CMD ["npx", "tsx", "server/src/index.ts"]
