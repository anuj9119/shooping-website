# 1️⃣ Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy app code
COPY . .

# Pass API URL as build arg
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js
RUN npm run build

# 2️⃣ Production Stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy required files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start Next.js on 0.0.0.0
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]
