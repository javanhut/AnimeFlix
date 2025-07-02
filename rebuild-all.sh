#!/bin/bash

# AnimeFlix Complete Rebuild Script
# This script rebuilds all containers with updated code

echo "🔄 AnimeFlix Complete Rebuild Script"
echo "===================================="

# Check if user wants to rebuild everything or just frontend
read -p "Rebuild all containers (y) or just frontend (n)? [y/N]: " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔨 Rebuilding ALL containers..."
    
    # Stop all containers
    echo "⏹️  Stopping all containers..."
    podman-compose down
    
    # Remove all images to force rebuild
    echo "🗑️  Removing all images..."
    podman rmi animeflix-frontend animeflix-backend 2>/dev/null || echo "Some images were already removed"
    
    # Rebuild everything
    echo "🔨 Rebuilding all containers..."
    podman-compose up -d --build
    
else
    echo "🔨 Rebuilding FRONTEND only..."
    
    # Stop the frontend container
    echo "⏹️  Stopping frontend container..."
    podman stop animeflix-frontend 2>/dev/null || echo "Container was not running"
    
    # Remove the existing frontend container
    echo "🗑️  Removing existing frontend container..."
    podman rm animeflix-frontend 2>/dev/null || echo "Container was already removed"
    
    # Remove the frontend image to force rebuild
    echo "🗑️  Removing frontend image..."
    podman rmi animeflix-frontend 2>/dev/null || echo "Image was already removed"
    
    # Rebuild and start the frontend container
    echo "🔨 Rebuilding frontend container..."
    podman-compose up -d --build frontend
fi

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "✅ Checking service status..."
echo ""
podman-compose ps

echo ""
echo "🌐 Services should be available at:"
echo "   Frontend: http://localhost:3050"
echo "   Backend:  http://localhost:3051"
echo ""
echo "🎬 New auto-fullscreen features:"
echo "   1. Go to Settings (gear icon in top right)"
echo "   2. Enable 'Auto-Fullscreen' in General tab"
echo "   3. Play any video - it will ask for fullscreen permission"
echo "   4. Once granted, all future videos auto-fullscreen!"
echo ""
echo "✨ Features:"
echo "   - Manual play button → auto-fullscreen"
echo "   - Auto-next episode → auto-fullscreen"
echo "   - Settings toggle to enable/disable"
echo "   - Smart permission handling"