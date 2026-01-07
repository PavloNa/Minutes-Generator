#!/bin/bash

# Quick start script for Docker deployment
# Usage: ./docker-start.sh

echo "🐳 Starting Meeting Minutes Generator with Docker..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your configuration before continuing."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start services
echo "🔨 Building containers..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "✅ Services started successfully!"
echo ""
echo "📍 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "📊 View logs:"
echo "   All:       docker-compose logs -f"
echo "   Backend:   docker-compose logs -f backend"
echo "   Frontend:  docker-compose logs -f frontend"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
