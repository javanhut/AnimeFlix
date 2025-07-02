#!/bin/bash

# AnimeFlix Management Script
set -e

show_help() {
    echo "🎬 AnimeFlix Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     - Build all containers"
    echo "  deploy    - Deploy the application"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  logs      - Show logs for all services"
    echo "  status    - Show service status"
    echo "  clean     - Clean up containers and images"
    echo "  shell     - Open shell in backend container"
    echo "  import    - Import videos from a directory"
    echo "  stats     - Show filesystem storage stats"
    echo "  backup    - Backup volumes"
    echo "  restore   - Restore volumes"
    echo "  help      - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 logs backend"
    echo "  $0 import /path/to/videos"
}

# Make sure we're in the right directory
cd "$(dirname "$0")/.."

case "${1:-help}" in
    build)
        ./scripts/build.sh
        ;;
    deploy)
        ./scripts/deploy.sh
        ;;
    stop)
        ./scripts/stop.sh
        ;;
    restart)
        echo "🔄 Restarting AnimeFlix..."
        podman-compose restart
        echo "✅ Services restarted!"
        ;;
    logs)
        if [ -n "$2" ]; then
            podman-compose logs -f "$2"
        else
            podman-compose logs -f
        fi
        ;;
    status)
        echo "📊 Service Status:"
        podman-compose ps
        echo ""
        echo "🏥 Health Checks:"
        curl -s http://localhost:3051/api/health 2>/dev/null || echo "❌ Backend: Not responding"
        curl -s http://localhost:3050/health 2>/dev/null || echo "❌ Frontend: Not responding"
        ;;
    clean)
        echo "🧹 Cleaning up containers and images..."
        podman-compose down -v
        podman image rm animeflix-backend:latest animeflix-frontend:latest 2>/dev/null || true
        podman system prune -f
        echo "✅ Cleanup completed!"
        ;;
    shell)
        echo "🐚 Opening shell in backend container..."
        podman exec -it animeflix-backend /bin/sh
        ;;
    import)
        if [ -z "$2" ]; then
            echo "❌ Error: Please specify a directory to import from"
            echo "Usage: $0 import /path/to/videos"
            exit 1
        fi
        echo "📥 Importing videos from: $2"
        curl -X POST http://localhost:3051/api/fs/import \
             -H "Content-Type: application/json" \
             -d "{\"sourceDir\": \"$2\"}" || echo "❌ Import failed. Is the backend running?"
        ;;
    stats)
        echo "📊 Filesystem Storage Stats:"
        curl -s http://localhost:3051/api/fs/stats | jq 2>/dev/null || curl -s http://localhost:3051/api/fs/stats
        echo ""
        echo "💾 Cache Stats:"
        curl -s http://localhost:3051/api/cache/stats | jq 2>/dev/null || curl -s http://localhost:3051/api/cache/stats
        ;;
    backup)
        BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        echo "💾 Backing up volumes to: $BACKUP_DIR"
        
        # Backup each volume
        for volume in animeflix_video_storage animeflix_content_data animeflix_postgres_data; do
            echo "📦 Backing up $volume..."
            podman run --rm -v "$volume:/source:ro" -v "$(pwd)/$BACKUP_DIR:/backup" \
                   alpine tar czf "/backup/${volume}.tar.gz" -C /source .
        done
        
        echo "✅ Backup completed: $BACKUP_DIR"
        ;;
    restore)
        if [ -z "$2" ]; then
            echo "❌ Error: Please specify backup directory"
            echo "Usage: $0 restore ./backups/20240101_120000"
            exit 1
        fi
        echo "♻️ Restoring from: $2"
        
        # Stop services first
        podman-compose down
        
        # Restore each volume
        for archive in "$2"/*.tar.gz; do
            volume=$(basename "$archive" .tar.gz)
            echo "📦 Restoring $volume..."
            podman run --rm -v "$volume:/target" -v "$(pwd)/$2:/backup:ro" \
                   alpine sh -c "cd /target && tar xzf /backup/$(basename "$archive")"
        done
        
        echo "✅ Restore completed!"
        echo "🚀 Starting services..."
        podman-compose up -d
        ;;
    help|*)
        show_help
        ;;
esac