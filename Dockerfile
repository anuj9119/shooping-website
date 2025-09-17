# 1️⃣ Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm install

# Copy rest of the code
COPY . .

# Pass API URL as a build argument (so NEXT_PUBLIC_API_URL works)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js app
RUN npm run build

# 2️⃣ Production Image (smaller)
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only required files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose and start
EXPOSE 3000
CMD ["npm", "start"]
