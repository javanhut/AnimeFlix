#!/bin/bash

# AnimeFlix Build Script for Podman
set -e

echo "🚀 Building AnimeFlix with Podman..."

# Check if podman-compose is available
if ! command -v podman-compose &> /dev/null; then
    echo "❌ podman-compose is not installed. Installing via pip..."
    pip3 install podman-compose
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ./animeflix-backend/temp
mkdir -p ./animeflix-backend/logs
mkdir -p ./animeflix-backend/video-cache

# Make sure we're in the right directory
cd "$(dirname "$0")/.."

# Build the containers
echo "🔨 Building backend container..."
podman build -t animeflix-backend:latest -f ./animeflix-backend/Containerfile ./animeflix-backend

echo "🔨 Building frontend container..."
podman build -t animeflix-frontend:latest -f ./animeflix-frontend/Containerfile ./animeflix-frontend

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Run './scripts/deploy.sh' to start the application"
echo "   2. Or run 'podman-compose up -d' to start all services"
echo "   3. Access the application at http://localhost:3050"
echo ""
echo "🔧 Available commands:"
echo "   - View logs: podman-compose logs -f"
echo "   - Stop services: podman-compose down"
echo "   - Rebuild: ./scripts/build.sh"