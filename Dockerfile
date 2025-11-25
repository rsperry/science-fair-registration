# Combined Frontend + Backend Docker Image
# Multi-stage build for production

# Stage 1: Build Frontend
FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./
RUN ls -la .
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:24-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

# Stage 3: Production Image
FROM node:24-alpine

WORKDIR /app

# Copy package files first
COPY --from=backend-builder /app/backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

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

CMD ["npm", "start"]
