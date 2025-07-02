# AnimeFlix Containerized Deployment

This guide covers deploying AnimeFlix using Podman with persistent volumes for optimal video loading performance.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   PostgreSQL    │
│   (React/Nginx) │◄──►│   (Node.js)     │◄──►│   Database      │
│   Port: 3050    │    │   Port: 3051    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
          ┌─────────────────┐    │    ┌─────────────────┐
          │   MinIO         │    │    │   Redis         │
          │   (S3 Storage)  │◄───┼───►│   (Cache)       │
          │   Port: 9000    │    │    │   Port: 6379    │
          └─────────────────┘    │    └─────────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │           Persistent Volumes              │
          │  • video_storage (videos)                 │
          │  • video_cache (cache)                    │
          │  • content_data (metadata)                │
          │  • postgres_data (database)               │
          │  • minio_data (object storage)            │
          └───────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Podman installed
- podman-compose installed (`pip3 install podman-compose`)
- At least 4GB free disk space
- Ports 3050, 3051, 5432, 6379, 9000, 9001 available

### 1. Deploy the Application

```bash
# Build and deploy everything
./scripts/deploy.sh

# Or step by step:
./scripts/build.sh   # Build containers
./scripts/deploy.sh  # Start services
```

### 2. Access the Application

- **Frontend**: http://localhost:3050
- **Backend API**: http://localhost:3051
- **MinIO Console**: http://localhost:9001
  - Username: `animeflix_admin`
  - Password: `animeflix_secret`

## 📁 Persistent Storage

All video files and data are stored in persistent volumes:

### Volume Mapping

| Volume | Purpose | Container Path | Description |
|--------|---------|----------------|-------------|
| `animeflix_video_storage` | Video files | `/app/videos` | Main video storage |
| `animeflix_video_cache` | Cache | `/app/video-cache` | Performance cache |
| `animeflix_content_data` | Content metadata | `/app/content` | Series/episode info |
| `animeflix_postgres_data` | Database | `/var/lib/postgresql/data` | PostgreSQL data |
| `animeflix_minio_data` | Object storage | `/data` | MinIO storage |

### Benefits of This Approach

✅ **Fast Loading**: Files served directly from filesystem  
✅ **Persistent**: Data survives container restarts  
✅ **Scalable**: Easy to add more storage  
✅ **Backup-friendly**: Standard volume backup procedures  
✅ **Performance**: No database overhead for video streaming  

## 🛠️ Management Commands

Use the management script for common operations:

```bash
# Show all available commands
./scripts/manage.sh help

# Check service status
./scripts/manage.sh status

# View logs
./scripts/manage.sh logs
./scripts/manage.sh logs backend

# Import videos from a directory
./scripts/manage.sh import /path/to/your/videos

# Check storage statistics
./scripts/manage.sh stats

# Backup all data
./scripts/manage.sh backup

# Restore from backup
./scripts/manage.sh restore ./backups/20240101_120000

# Clean up everything
./scripts/manage.sh clean
```

## 📤 Adding Content

### Method 1: Web Upload

1. Use the web interface to upload videos
2. Files are automatically stored in the persistent volume
3. Metadata is generated and cached

### Method 2: Directory Import

```bash
# Import all videos from a directory
./scripts/manage.sh import /path/to/videos

# Or via API
curl -X POST http://localhost:3051/api/fs/import \
     -H "Content-Type: application/json" \
     -d '{"sourceDir": "/path/to/videos"}'
```

### Method 3: Volume Mount

1. Copy videos directly to the volume:
```bash
# Find the volume location
podman volume inspect animeflix_video_storage

# Copy files (adjust path as needed)
sudo cp /your/videos/* /var/lib/containers/storage/volumes/animeflix_video_storage/_data/
```

2. Restart the backend to detect new files:
```bash
podman-compose restart backend
```

## 🔧 Configuration

### Environment Variables

Customize deployment by setting environment variables:

```bash
# In podman-compose.yml, modify the backend environment:
environment:
  NODE_ENV: production
  VIDEO_STORAGE_PATH: /app/videos
  CACHE_PATH: /app/video-cache
  DB_HOST: postgres
  # Add custom variables here
```

### Performance Tuning

Edit `animeflix-backend/config/performance.js` before building:

```javascript
module.exports = {
  cache: {
    maxSize: 20 * 1024 * 1024 * 1024, // 20GB cache
    preloadCount: 10,                  // Preload 10 videos
  },
  // ... other settings
};
```

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:3051/api/health

# Frontend health
curl http://localhost:3050/health

# Storage stats
curl http://localhost:3051/api/fs/stats
```

### Log Monitoring

```bash
# All services
./scripts/manage.sh logs

# Specific service
./scripts/manage.sh logs backend
./scripts/manage.sh logs frontend
./scripts/manage.sh logs postgres
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Stop services
./scripts/stop.sh

# Rebuild with latest changes
./scripts/build.sh

# Deploy updated version
./scripts/deploy.sh
```

### Backup Strategy

```bash
# Create automated backup
./scripts/manage.sh backup

# Schedule daily backups (add to crontab)
0 2 * * * /path/to/AnimeFlix/scripts/manage.sh backup
```

### Cleanup Old Data

```bash
# Remove videos older than 30 days with low access count
curl -X POST http://localhost:3051/api/fs/cleanup \
     -H "Content-Type: application/json" \
     -d '{"daysOld": 30}'
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**:
   ```bash
   # Check what's using the ports
   sudo netstat -tulpn | grep :3050
   sudo netstat -tulpn | grep :3051
   ```

2. **Volume permissions**:
   ```bash
   # Check volume permissions
   podman volume inspect animeflix_video_storage
   ```

3. **Container won't start**:
   ```bash
   # Check logs
   ./scripts/manage.sh logs backend
   
   # Check container status
   podman ps -a
   ```

### Performance Issues

1. **Slow video loading**:
   - Check cache utilization: `./scripts/manage.sh stats`
   - Increase cache size in performance config
   - Ensure sufficient disk I/O

2. **High memory usage**:
   - Monitor with: `podman stats`
   - Reduce cache size
   - Limit concurrent streams

## 🔐 Security

### Production Recommendations

1. **Change default passwords** in `podman-compose.yml`
2. **Use environment files** for secrets
3. **Set up reverse proxy** (nginx/traefik) for HTTPS
4. **Configure firewall** to restrict access
5. **Regular backups** and updates

### Network Security

```bash
# Create custom network with better isolation
podman network create animeflix-secure --subnet 172.20.0.0/16

# Modify podman-compose.yml to use the custom network
```

## 📚 API Documentation

### Video Management

- `GET /api/fs/videos` - List all videos
- `GET /api/fs/stats` - Storage statistics
- `POST /api/fs/import` - Import videos from directory
- `POST /api/fs/cleanup` - Clean up old videos
- `GET /api/stream/fs/:videoId` - Stream video

### Cache Management

- `GET /api/cache/stats` - Cache statistics
- `POST /api/cache/preload` - Preload popular videos
- `POST /api/cache/clear` - Clear cache

This containerized setup provides enterprise-grade video streaming with excellent performance and easy management!