# Combined Frontend + Backend Docker Image
# Multi-stage build for production

# Stage 1: Build Frontend
FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files for better layer caching
COPY frontend/package*.json ./
RUN npm ci

# Copy only necessary build files
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./
COPY frontend/index.html ./
COPY frontend/src ./src
COPY frontend/public ./public

RUN npm run build

# Stage 2: Build Backend
FROM node:24-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files for better layer caching
COPY backend/package*.json ./
RUN npm ci

# Copy only source files needed for build
COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build

# Stage 3: Production Image
FROM node:24-alpine

WORKDIR /app

# Copy package files first
COPY --from=backend-builder /app/backend/package*.json ./

# Install only production dependencies and clean cache
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend built files
COPY --from=backend-builder /app/backend/dist ./dist

# Copy frontend built files to be served by backend
COPY --from=frontend-builder /app/frontend/dist ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 4000

# Use node directly instead of npm for faster startup (avoids npm overhead)
CMD ["node", "dist/server.js"]
