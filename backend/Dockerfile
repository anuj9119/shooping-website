# 1️⃣ Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
ENV NODE_ENV=production
RUN npm install

COPY . .

# 2️⃣ Production Stage (smaller image)
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

EXPOSE 3001
CMD ["npm", "start"]
