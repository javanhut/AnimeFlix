const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class VideoCacheService {
  constructor(cacheDir = './video-cache') {
    this.cacheDir = cacheDir;
    this.cacheIndex = new Map();
    this.maxCacheSize = 10 * 1024 * 1024 * 1024; // 10GB
    this.currentCacheSize = 0;
    this.initCache();
  }

  async initCache() {
    // Ensure cache directory exists
    await fs.ensureDir(this.cacheDir);
    
    // Load cache index
    const indexPath = path.join(this.cacheDir, 'cache-index.json');
    if (await fs.pathExists(indexPath)) {
      try {
        const indexData = await fs.readJson(indexPath);
        this.cacheIndex = new Map(indexData.entries);
        this.currentCacheSize = indexData.totalSize || 0;
        console.log(`📦 Video cache initialized: ${this.cacheIndex.size} entries, ${(this.currentCacheSize / 1024 / 1024).toFixed(2)}MB`);
      } catch (error) {
        console.error('Error loading cache index:', error);
        this.cacheIndex = new Map();
      }
    }
  }

  async saveCacheIndex() {
    const indexPath = path.join(this.cacheDir, 'cache-index.json');
    await fs.writeJson(indexPath, {
      entries: Array.from(this.cacheIndex.entries()),
      totalSize: this.currentCacheSize,
      lastUpdated: new Date().toISOString()
    });
  }

  getCacheKey(videoId, type = 'full') {
    return `${videoId}_${type}`;
  }

  getCachePath(cacheKey) {
    return path.join(this.cacheDir, `${cacheKey}.cache`);
  }

  async isCached(videoId, type = 'full') {
    const cacheKey = this.getCacheKey(videoId, type);
    if (!this.cacheIndex.has(cacheKey)) {
      return false;
    }
    
    // Check if file actually exists
    const cachePath = this.getCachePath(cacheKey);
    const exists = await fs.pathExists(cachePath);
    
    if (!exists) {
      // Clean up orphaned index entry
      this.cacheIndex.delete(cacheKey);
      await this.saveCacheIndex();
      return false;
    }
    
    // Update last accessed time
    const entry = this.cacheIndex.get(cacheKey);
    entry.lastAccessed = Date.now();
    await this.saveCacheIndex();
    
    return true;
  }

  async getCachedVideo(videoId, type = 'full') {
    const cacheKey = this.getCacheKey(videoId, type);
    const cachePath = this.getCachePath(cacheKey);
    
    if (await this.isCached(videoId, type)) {
      console.log(`🎯 Cache hit for video ${videoId}`);
      
      // Update access count
      const entry = this.cacheIndex.get(cacheKey);
      entry.accessCount = (entry.accessCount || 0) + 1;
      entry.lastAccessed = Date.now();
      await this.saveCacheIndex();
      
      return await fs.readFile(cachePath);
    }
    
    console.log(`❌ Cache miss for video ${videoId}`);
    return null;
  }

  async cacheVideo(videoId, videoData, metadata = {}) {
    const cacheKey = this.getCacheKey(videoId, metadata.type || 'full');
    const cachePath = this.getCachePath(cacheKey);
    const fileSize = videoData.length;
    
    // Check if we need to free up space
    if (this.currentCacheSize + fileSize > this.maxCacheSize) {
      await this.evictLRU(fileSize);
    }
    
    // Write to cache
    await fs.writeFile(cachePath, videoData);
    
    // Update cache index
    this.cacheIndex.set(cacheKey, {
      videoId,
      fileSize,
      mimeType: metadata.mimeType || 'video/mp4',
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      metadata: metadata
    });
    
    this.currentCacheSize += fileSize;
    await this.saveCacheIndex();
    
    console.log(`✅ Cached video ${videoId} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
  }

  async evictLRU(requiredSpace) {
    console.log(`🧹 Evicting cache to free ${(requiredSpace / 1024 / 1024).toFixed(2)}MB`);
    
    // Sort entries by last accessed time (oldest first)
    const entries = Array.from(this.cacheIndex.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    let freedSpace = 0;
    const toDelete = [];
    
    for (const [key, entry] of entries) {
      if (freedSpace >= requiredSpace) break;
      
      toDelete.push(key);
      freedSpace += entry.fileSize;
    }
    
    // Delete the files and update index
    for (const key of toDelete) {
      const entry = this.cacheIndex.get(key);
      const cachePath = this.getCachePath(key);
      
      try {
        await fs.remove(cachePath);
        this.currentCacheSize -= entry.fileSize;
        this.cacheIndex.delete(key);
        console.log(`🗑️ Evicted ${key} from cache`);
      } catch (error) {
        console.error(`Error evicting ${key}:`, error);
      }
    }
    
    await this.saveCacheIndex();
  }

  async getCacheStats() {
    const stats = {
      totalEntries: this.cacheIndex.size,
      totalSize: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      utilizationPercent: (this.currentCacheSize / this.maxCacheSize) * 100,
      entries: []
    };
    
    for (const [key, entry] of this.cacheIndex.entries()) {
      stats.entries.push({
        key,
        videoId: entry.videoId,
        fileSize: entry.fileSize,
        accessCount: entry.accessCount,
        lastAccessed: new Date(entry.lastAccessed).toISOString(),
        age: Date.now() - entry.createdAt
      });
    }
    
    // Sort by access count (most accessed first)
    stats.entries.sort((a, b) => b.accessCount - a.accessCount);
    
    return stats;
  }

  async clearCache() {
    console.log('🧹 Clearing entire video cache...');
    
    // Remove all cached files
    for (const key of this.cacheIndex.keys()) {
      const cachePath = this.getCachePath(key);
      try {
        await fs.remove(cachePath);
      } catch (error) {
        console.error(`Error removing ${key}:`, error);
      }
    }
    
    // Reset cache state
    this.cacheIndex.clear();
    this.currentCacheSize = 0;
    await this.saveCacheIndex();
    
    console.log('✅ Video cache cleared');
  }

  // Preload popular videos based on access patterns
  async preloadPopularVideos(videoStorageService, limit = 5) {
    console.log('📥 Preloading popular videos...');
    
    // Get most accessed videos from cache stats
    const stats = await this.getCacheStats();
    const popularVideos = stats.entries
      .slice(0, limit)
      .map(entry => entry.videoId);
    
    // Also get recently accessed videos from database
    try {
      const recentVideos = await videoStorageService.getRecentlyAccessedVideos(limit);
      
      for (const video of recentVideos) {
        if (!await this.isCached(video.id)) {
          console.log(`📥 Preloading video ${video.id}...`);
          const videoData = await videoStorageService.getVideoData(video.id);
          if (videoData) {
            await this.cacheVideo(video.id, videoData, {
              mimeType: video.mime_type,
              preloaded: true
            });
          }
        }
      }
    } catch (error) {
      console.error('Error preloading videos:', error);
    }
  }
}

module.exports = VideoCacheService;