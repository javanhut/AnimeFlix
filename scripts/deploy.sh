#!/bin/bash

# AnimeFlix Deployment Script for Podman
set -e

echo "🚀 Deploying AnimeFlix..."

# Make sure we're in the right directory
cd "$(dirname "$0")/.."

# Check if containers are built
if ! podman image exists animeflix-backend:latest; then
    echo "❌ Backend container not found. Building..."
    ./scripts/build.sh
fi

if ! podman image exists animeflix-frontend:latest; then
    echo "❌ Frontend container not found. Building..."
    ./scripts/build.sh
fi

# Start the services
echo "🔄 Starting services with podman-compose..."
podman-compose up -d

echo "⏳ Waiting for services to be ready..."

# Wait for backend health check
echo "🏥 Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:3051/api/health >/dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend health check failed after 30 attempts"
        podman-compose logs backend
        exit 1
    fi
    echo "⏳ Waiting for backend... (attempt $i/30)"
    sleep 2
done

# Wait for frontend
echo "🌐 Checking frontend..."
for i in {1..30}; do
    if curl -f http://localhost:3050/health >/dev/null 2>&1; then
        echo "✅ Frontend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Frontend health check failed after 30 attempts"
        podman-compose logs frontend
        exit 1
    fi
    echo "⏳ Waiting for frontend... (attempt $i/30)"
    sleep 2
done

echo ""
echo "🎉 AnimeFlix deployed successfully!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend: http://localhost:3050"
echo "   Backend:  http://localhost:3051"
echo "   MinIO:    http://localhost:9001 (admin: animeflix_admin / animeflix_secret)"
echo ""
echo "🗂️ Persistent volumes created:"
echo "   - animeflix_video_storage (videos)"
echo "   - animeflix_video_cache (cache)"
echo "   - animeflix_content_data (content metadata)"
echo "   - animeflix_postgres_data (database)"
echo ""
echo "📋 Useful commands:"
echo "   - View logs: podman-compose logs -f [service]"
echo "   - Stop: podman-compose down"
echo "   - Restart: podman-compose restart [service]"
echo "   - Shell into container: podman exec -it animeflix-backend /bin/sh"
echo ""
echo "📊 Check status:"
echo "   - podman-compose ps"
echo "   - curl http://localhost:3051/api/health"
echo "   - curl http://localhost:3051/api/fs/stats"