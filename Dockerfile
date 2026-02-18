FROM node:20-slim
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate --schema=./server/prisma/schema.prisma
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
