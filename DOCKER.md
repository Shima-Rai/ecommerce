# Docker Deployment Guide

## Quick Start
```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## Services
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API**: http://localhost:3000/api (proxied through frontend)

## Individual Container Commands
```bash
# Backend only
docker build -t backend ./backend
docker run -p 5000:5000 backend

# Frontend only
docker build -t frontend ./frontend
docker run -p 3000:3000 frontend
```

## Docker Hub Commands

### Build Images
```bash
# Build backend
docker build -t shima418/smart-backend:latest ./backend

# Build frontend
docker build -t shima418/smart-frontend:latest ./frontend
```

### Push to Docker Hub
```bash
# Login to Docker Hub
docker login

# Push backend
docker push shima418/smart-backend:latest

# Push frontend
docker push shima418/smart-frontend:latest
```

### Pull from Docker Hub
```bash
# Pull backend
docker pull shima418/smart-backend:latest

# Pull frontend
docker pull shima418/smart-frontend:latest
```

### Run from Docker Hub
```bash
# Run backend
docker run -d --name smart-backend -p 5000:5000 shima418/smart-backend:latest

# Run frontend
docker run -d --name smart-frontend -p 3000:3000 shima418/smart-frontend:latest
```

### Tag Management
```bash
# Tag an image
docker tag backend:latest shima418/smart-backend:v1.0

# Remove local tag
docker rmi shima418/smart-backend:latest

# List all images
docker images
```

## Production Deployment
1. Update environment variables in docker-compose.yml
2. Configure proper nginx settings
3. Set up SSL certificates
4. Use docker-compose.prod.yml for production configs

## Database Persistence
Database files are stored in Docker volume `backend-data` for persistence across container restarts.
