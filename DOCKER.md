# Docker Deployment Guide

## Single Container Architecture

The application runs as a **single Docker container** that serves both the frontend and backend.

### How It Works

- **Frontend**: Built as static files and served by the Node.js backend
- **Backend**: Express server that serves the API at `/api/*` and frontend at all other routes
- **Port**: Single port `4000` for both frontend and backend

## Quick Start

### Build and Run

```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run

# View logs
npm run docker:logs

# Stop the container
npm run docker:stop
```

The app will be available at `http://localhost:4000`

### Development (Local)

For development with hot-reload, run locally (no Docker):

```bash
npm run dev
```

- Frontend: `http://localhost:5173` (with hot reload)
- Backend API: `http://localhost:4000`

## Docker Commands

```bash
# Build the production image
npm run docker:build
# or: docker build -t science-fair-registration .

# Run the container
npm run docker:run
# or: docker run -d -p 4000:4000 --env-file .env --name science-fair science-fair-registration

# View logs
npm run docker:logs
# or: docker logs -f science-fair

# Stop and remove container
npm run docker:stop
# or: docker stop science-fair && docker rm science-fair

# Rebuild and restart
npm run docker:stop
npm run docker:build
npm run docker:run
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=your-base64-encoded-key

# Optional
RECAPTCHA_SECRET=
```

## Production Deployment

### Direct Docker Run

```bash
# 1. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 2. Build
docker build -t science-fair-registration .

# 3. Run
docker run -d \
  -p 4000:4000 \
  --env-file .env \
  --name science-fair \
  science-fair-registration

# 4. Check logs
docker logs -f science-fair
```

### Cloud Deployment

The single container can be deployed to:

- **AWS ECS/Fargate**: Upload to ECR and create ECS service
- **Google Cloud Run**: Push to GCR and deploy
- **Azure Container Instances**: Push to ACR and deploy
- **DigitalOcean App Platform**: Connect to GitHub repo
- **Railway/Render**: One-click deploy from GitHub

## Container Details

**Base Image**: `node:24-alpine`

**Build Process**:
1. Stage 1: Build frontend React app
2. Stage 2: Build backend TypeScript
3. Stage 3: Combine both in production image

**Size**: ~150-200MB (Alpine-based)

**Security**:
- Runs as non-root user (`nodejs`)
- Minimal attack surface (Alpine)
- No unnecessary dependencies in production

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs science-fair

# Check if it's running
docker ps -a
```

### Port conflicts

If port 4000 is in use:

```bash
# Use a different port (e.g., 8080)
docker run -d -p 8080:4000 --env-file .env --name science-fair science-fair-registration
# Then visit http://localhost:8080
```

### Rebuild after code changes

```bash
npm run docker:stop
npm run docker:build
npm run docker:run
```

### Access container shell

```bash
docker exec -it science-fair sh
```

## Local Development vs Docker

| Feature | Local Dev (`npm run dev`) | Docker (`npm run docker:run`) |
|---------|---------------------------|-------------------------------|
| Setup | Install Node.js locally | Just Docker |
| Frontend Port | 5173 | 4000 |
| Backend Port | 4000 | 4000 |
| Hot Reload | ✅ Yes | ❌ No |
| Static Files | Vite dev server | Served by Node.js |
| Rebuild Time | Instant | ~1-2 minutes |
| Use Case | Development | Testing/Production |
