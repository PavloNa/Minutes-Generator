#!/bin/bash
set -e

# Frontend
echo "Building frontend..."
git -C /home/pavlo/Hosting-Projects/Minutes-Generator fetch --all
git -C /home/pavlo/Hosting-Projects/Minutes-Generator pull
docker run --rm -v /home/pavlo/Hosting-Projects/Minutes-Generator:/app -w /app node:20-alpine sh -c "npm install && npm run build"

# Backend
echo "Building backend..."
docker-compose -f /home/pavlo/Hosting-Projects/Minutes-Generator/docker-compose.yml down
docker-compose -f /home/pavlo/Hosting-Projects/Minutes-Generator/docker-compose.yml build backend
docker-compose -f /home/pavlo/Hosting-Projects/Minutes-Generator/docker-compose.yml up -d

echo "Deployment complete."