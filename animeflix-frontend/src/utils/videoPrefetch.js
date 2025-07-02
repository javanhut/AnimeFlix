// Video prefetch utility to improve loading performance

class VideoPrefetchManager {
  constructor() {
    this.prefetchQueue = new Map();
    this.maxPrefetchSize = 50 * 1024 * 1024; // 50MB max prefetch
    this.currentPrefetchSize = 0;
  }

  // Prefetch video metadata and initial bytes
  async prefetchVideo(url, priority = 'low') {
    if (this.prefetchQueue.has(url)) {
      return; // Already prefetching or prefetched
    }

    console.log(`🔄 Prefetching video: ${url}`);

    try {
      // Create a prefetch request with partial content
      const controller = new AbortController();
      const prefetchData = {
        url,
        priority,
        controller,
        status: 'pending',
        timestamp: Date.now()
      };

      this.prefetchQueue.set(url, prefetchData);

      // Prefetch with range request (first 1MB)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Range': 'bytes=0-1048575' // First 1MB
        },
        signal: controller.signal,
        priority: priority // Use fetch priority hint
      });

      if (response.ok || response.status === 206) {
        const blob = await response.blob();
        prefetchData.status = 'completed';
        prefetchData.size = blob.size;
        this.currentPrefetchSize += blob.size;

        // Create object URL for potential use
        prefetchData.objectUrl = URL.createObjectURL(blob);

        console.log(`✅ Prefetched ${(blob.size / 1024).toFixed(2)}KB from ${url}`);

        // Clean up old prefetches if size limit exceeded
        this.cleanupOldPrefetches();
      } else {
        prefetchData.status = 'failed';
        console.error(`❌ Failed to prefetch ${url}:`, response.status);
      }
    } catch (error) {
      const prefetchData = this.prefetchQueue.get(url);
      if (prefetchData) {
        prefetchData.status = 'failed';
      }
      console.error(`❌ Error prefetching ${url}:`, error);
    }
  }

  // Cancel a prefetch operation
  cancelPrefetch(url) {
    const prefetchData = this.prefetchQueue.get(url);
    if (prefetchData && prefetchData.status === 'pending') {
      prefetchData.controller.abort();
      this.prefetchQueue.delete(url);
      console.log(`🚫 Cancelled prefetch for ${url}`);
    }
  }

  // Clean up old prefetches to stay within size limit
  cleanupOldPrefetches() {
    if (this.currentPrefetchSize <= this.maxPrefetchSize) {
      return;
    }

    // Sort by timestamp (oldest first)
    const entries = Array.from(this.prefetchQueue.entries())
      .filter(([_, data]) => data.status === 'completed')
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    for (const [url, data] of entries) {
      if (this.currentPrefetchSize <= this.maxPrefetchSize * 0.8) {
        break; // Keep 80% capacity
      }

      // Revoke object URL and remove from queue
      if (data.objectUrl) {
        URL.revokeObjectURL(data.objectUrl);
      }
      this.currentPrefetchSize -= data.size || 0;
      this.prefetchQueue.delete(url);
      console.log(`🧹 Cleaned up prefetch for ${url}`);
    }
  }

  // Get prefetch status
  getPrefetchStatus(url) {
    const prefetchData = this.prefetchQueue.get(url);
    return prefetchData ? prefetchData.status : 'not-prefetched';
  }

  // Prefetch adjacent episodes for smooth playback
  async prefetchAdjacentEpisodes(currentEpisode, allEpisodes) {
    if (!currentEpisode || !allEpisodes) return;

    const currentIndex = allEpisodes.findIndex(ep => ep.id === currentEpisode.id);
    if (currentIndex === -1) return;

    // Prefetch next episode with high priority
    if (currentIndex + 1 < allEpisodes.length) {
      const nextEpisode = allEpisodes[currentIndex + 1];
      if (nextEpisode.videoUrl) {
        const nextUrl = nextEpisode.videoUrl.startsWith('http') 
          ? nextEpisode.videoUrl 
          : `http://localhost:3051${nextEpisode.videoUrl}`;
        await this.prefetchVideo(nextUrl, 'high');
      }
    }

    // Prefetch next 2 episodes with low priority
    for (let i = 2; i <= 3; i++) {
      if (currentIndex + i < allEpisodes.length) {
        const futureEpisode = allEpisodes[currentIndex + i];
        if (futureEpisode.videoUrl) {
          const futureUrl = futureEpisode.videoUrl.startsWith('http') 
            ? futureEpisode.videoUrl 
            : `http://localhost:3051${futureEpisode.videoUrl}`;
          await this.prefetchVideo(futureUrl, 'low');
        }
      }
    }
  }

  // Clear all prefetches
  clearAll() {
    for (const [url, data] of this.prefetchQueue.entries()) {
      if (data.controller && data.status === 'pending') {
        data.controller.abort();
      }
      if (data.objectUrl) {
        URL.revokeObjectURL(data.objectUrl);
      }
    }
    this.prefetchQueue.clear();
    this.currentPrefetchSize = 0;
    console.log('🧹 Cleared all prefetches');
  }

  // Get cache statistics
  getStats() {
    const stats = {
      totalPrefetches: this.prefetchQueue.size,
      totalSize: this.currentPrefetchSize,
      maxSize: this.maxPrefetchSize,
      utilizationPercent: (this.currentPrefetchSize / this.maxPrefetchSize) * 100,
      prefetches: []
    };

    for (const [url, data] of this.prefetchQueue.entries()) {
      stats.prefetches.push({
        url,
        status: data.status,
        priority: data.priority,
        size: data.size || 0,
        age: Date.now() - data.timestamp
      });
    }

    return stats;
  }
}

// Create singleton instance
const videoPrefetchManager = new VideoPrefetchManager();

export default videoPrefetchManager;