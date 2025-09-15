FROM node:18-alpine

WORKDIR /app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Run in production mode
EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]

