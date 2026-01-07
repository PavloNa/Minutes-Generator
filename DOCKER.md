# 🐳 Docker Deployment Guide

This guide explains how to run the Meeting Minutes Generator using Docker and Docker Compose.

---

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- A MongoDB instance (local or cloud)

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/PavloNa/meeting-minutes-generator.git
cd meeting-minutes-generator
```

### 2. Configure environment variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Configuration
MONGODB_CONNECTION=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DATABASE=minutes_generator

# JWT Authentication
JWT_SECRET=your-secure-secret-key-change-this

# Encryption (Optional - uses JWT secret if not set)
ENCRYPTION_KEY=your-encryption-key
SALT=your-unique-salt-value
```

### 3. Build and run with Docker Compose

```bash
# Build the containers
docker-compose build

# Start the services
docker-compose up
```

Or run in detached mode:

```bash
docker-compose up -d
```

### 4. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs

---

## 🛠️ Docker Compose Services

### Backend Service
- **Container**: `minutes-generator-backend`
- **Port**: 3001
- **Base Image**: Python 3.12 slim
- **Includes**: FastAPI, MongoDB drivers, FFmpeg for audio processing

### Frontend Service
- **Container**: `minutes-generator-frontend`
- **Port**: 3000
- **Base Image**: Node 18 Alpine
- **Includes**: React 19, development server

---

## 📝 Common Commands

### Start services
```bash
docker-compose up
```

### Start services in background
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

### Rebuild containers
```bash
docker-compose build --no-cache
```

### Restart a service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Access container shell
```bash
# Backend
docker exec -it minutes-generator-backend bash

# Frontend
docker exec -it minutes-generator-frontend sh
```

---

## 🔧 Development Mode

The Docker Compose setup is configured for development with hot-reload:

- **Backend**: FastAPI dev mode with auto-reload on code changes
- **Frontend**: React development server with hot module replacement

Both services have volumes mounted to sync your local code with the containers.

---

## 🏗️ Production Deployment

For production, you should:

1. **Use production builds**:

```dockerfile
# Frontend production Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. **Update docker-compose for production**:

```yaml
services:
  backend:
    command: uvicorn backend.main:app --host 0.0.0.0 --port 3001

  frontend:
    build:
      dockerfile: Dockerfile.frontend.prod
```

3. **Use environment-specific .env files**:
   - `.env.development`
   - `.env.production`

4. **Configure reverse proxy** (nginx, Traefik, etc.)

5. **Enable HTTPS** with Let's Encrypt certificates

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

### Port already in use
```bash
# Change ports in docker-compose.yml
services:
  backend:
    ports:
      - "3002:3001"  # Changed from 3001:3001
  frontend:
    ports:
      - "3100:3000"  # Changed from 3000:3000
```

### MongoDB connection issues
- Ensure your MongoDB connection string is correct
- Check if MongoDB allows connections from Docker container IPs
- For MongoDB Atlas, whitelist your IP or use `0.0.0.0/0` (development only)

### Volume permission issues
```bash
# On Linux, you may need to adjust permissions
sudo chown -R $USER:$USER .
```

---

## 🔍 Health Checks

Check if services are running properly:

```bash
# Backend health
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000
```

---

## 📦 Container Sizes

Approximate sizes:
- **Backend**: ~500MB (Python 3.12 + dependencies + FFmpeg)
- **Frontend**: ~350MB (Node 18 + dependencies)

---

## 🧹 Cleanup

Remove all containers and volumes:

```bash
# Stop and remove containers
docker-compose down

# Remove volumes too
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
- [Create React App Docker Guide](https://create-react-app.dev/docs/deployment/)
