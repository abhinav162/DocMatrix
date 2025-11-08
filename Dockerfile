# builder
FROM node:20-alpine AS builder
WORKDIR /app

# ✅ Install required build dependencies
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# runtime
# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY frontend ./frontend

EXPOSE 4000
CMD ["node", "dist/index.js"]

