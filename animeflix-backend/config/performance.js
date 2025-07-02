// Performance configuration for AnimeFlix backend

module.exports = {
  // Video streaming configuration
  streaming: {
    // Buffer size for video chunks (in bytes)
    chunkSize: 1024 * 1024, // 1MB chunks
    
    // Enable range request support
    enableRangeRequests: true,
    
    // Maximum concurrent streams per IP
    maxConcurrentStreams: 3,
    
    // Stream timeout (in milliseconds)
    streamTimeout: 300000, // 5 minutes
  },

  // Caching configuration
  cache: {
    // Enable video file caching
    enabled: true,
    
    // Maximum cache size (in bytes)
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
    
    // Cache TTL (in seconds)
    ttl: 86400, // 24 hours
    
    // Number of videos to preload on startup
    preloadCount: 5,
    
    // Enable aggressive prefetching
    aggressivePrefetch: true,
    
    // Cache directory
    directory: './video-cache',
  },

  // Database optimization
  database: {
    // Connection pool size
    poolSize: 20,
    
    // Enable query result caching
    enableQueryCache: true,
    
    // Query cache TTL (in seconds)  
    queryCacheTTL: 300, // 5 minutes
    
    // Batch size for bulk operations
    batchSize: 100,
  },

  // CDN configuration (for future use)
  cdn: {
    // Enable CDN integration
    enabled: false,
    
    // CDN provider (cloudflare, aws, etc.)
    provider: null,
    
    // CDN URLs
    urls: [],
    
    // Enable CDN fallback
    fallbackEnabled: true,
  },

  // Compression settings
  compression: {
    // Enable response compression
    enabled: true,
    
    // Compression level (1-9)
    level: 6,
    
    // Minimum size to compress (in bytes)
    threshold: 1024, // 1KB
    
    // Excluded content types
    exclude: ['video/mp4', 'video/webm', 'video/ogg'],
  },

  // Rate limiting
  rateLimit: {
    // Enable rate limiting
    enabled: true,
    
    // Window duration (in milliseconds)
    windowMs: 60000, // 1 minute
    
    // Maximum requests per window
    maxRequests: 100,
    
    // Skip rate limiting for successful requests
    skipSuccessfulRequests: true,
    
    // Custom limits for specific endpoints
    endpoints: {
      '/api/stream/video/:fileId': {
        windowMs: 60000,
        maxRequests: 20,
      },
      '/api/videos': {
        windowMs: 60000,
        maxRequests: 50,
      },
    },
  },

  // Monitoring and metrics
  monitoring: {
    // Enable performance monitoring
    enabled: true,
    
    // Log slow requests (threshold in ms)
    slowRequestThreshold: 1000,
    
    // Enable memory usage tracking
    trackMemoryUsage: true,
    
    // Memory usage warning threshold (in MB)
    memoryWarningThreshold: 1024, // 1GB
  },

  // Video optimization settings
  videoOptimization: {
    // Enable adaptive bitrate streaming (future feature)
    adaptiveBitrate: false,
    
    // Default video quality
    defaultQuality: '1080p',
    
    // Available quality levels
    qualityLevels: ['480p', '720p', '1080p'],
    
    // Enable video transcoding (future feature)
    transcoding: false,
    
    // Preferred video codecs
    preferredCodecs: ['h264', 'vp9'],
  },

  // Security settings
  security: {
    // Enable CORS
    cors: {
      enabled: true,
      origins: ['http://localhost:3050'],
      credentials: true,
    },
    
    // Enable helmet security headers
    helmet: true,
    
    // Enable request sanitization
    sanitization: true,
    
    // Maximum upload size (in bytes)
    maxUploadSize: 100 * 1024 * 1024, // 100MB
  },
};