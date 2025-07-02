#!/bin/bash

# AnimeFlix Frontend Rebuild Script
# This script forces a complete rebuild of the frontend container with updated code

echo "🔄 AnimeFlix Frontend Rebuild Script"
echo "======================================="

# Stop the current frontend container
echo "⏹️  Stopping frontend container..."
podman stop animeflix-frontend 2>/dev/null || echo "Container was not running"

# Remove the existing frontend container
echo "🗑️  Removing existing frontend container..."
podman rm animeflix-frontend 2>/dev/null || echo "Container was already removed"

# Remove the frontend image to force rebuild
echo "🗑️  Removing frontend image to force rebuild..."
podman rmi animeflix-frontend 2>/dev/null || echo "Image was already removed"

# Rebuild and start the frontend container
echo "🔨 Rebuilding frontend container..."
podman-compose up -d --build frontend

# Wait a moment for the container to start
echo "⏳ Waiting for container to start..."
sleep 5

# Check if the container is running
echo "✅ Checking container status..."
if podman ps --format "table {{.Names}}\t{{.Status}}" | grep -q "animeflix-frontend"; then
    echo "✅ Frontend container is running!"
    echo "🌐 Frontend should be available at: http://localhost:3050"
    echo "📋 Check the browser to see the new auto-fullscreen settings!"
else
    echo "❌ Frontend container failed to start. Checking logs..."
    podman logs animeflix-frontend
fi

echo ""
echo "🎬 Auto-fullscreen features added:"
echo "   - Settings > General > Auto-Fullscreen toggle"
echo "   - Enhanced fullscreen settings panel"
echo "   - Smart permission handling"
echo "   - Works with manual play and auto-next"
echo ""
echo "✨ Test it by going to Settings and enabling Auto-Fullscreen!"