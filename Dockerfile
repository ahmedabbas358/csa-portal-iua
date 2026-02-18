# Use Node.js 20
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies (only production and dev needed for build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=server/prisma/schema.prisma

# Build the frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start the server (which serves frontend too)
CMD ["npm", "start"]
