#!/bin/bash

# AnimeFlix Stop Script
set -e

echo "🛑 Stopping AnimeFlix services..."

# Make sure we're in the right directory
cd "$(dirname "$0")/.."

# Stop all services
podman-compose down

echo "✅ All services stopped successfully!"
echo ""
echo "📝 Note: Persistent volumes are preserved."
echo "   To remove volumes as well, run: podman-compose down -v"
echo ""
echo "🚀 To start again, run: ./scripts/deploy.sh"