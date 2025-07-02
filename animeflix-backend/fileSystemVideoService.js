const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);

class FileSystemVideoService {
  constructor() {
    this.videoStoragePath = process.env.VIDEO_STORAGE_PATH || './videos';
    this.metadataPath = path.join(this.videoStoragePath, '.metadata');
    this.initStorage();
  }

  async initStorage() {
    // Ensure storage directories exist
    await fs.ensureDir(this.videoStoragePath);
    await fs.ensureDir(this.metadataPath);
    console.log(`📁 Video storage initialized at: ${this.videoStoragePath}`);
  }

  // Generate a unique filename for video storage
  generateVideoFilename(originalName, hash) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    return `${hash.substring(0, 8)}_${timestamp}${ext}`;
  }

  // Store video file in filesystem
  async storeVideoFile(filePath, originalName, metadata = {}) {
    try {
      console.log(`📹 Storing video file: ${originalName}`);
      
      // Calculate file hash
      const fileBuffer = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // Check if file already exists
      const existingFile = await this.getVideoByHash(hash);
      if (existingFile) {
        console.log(`📹 File already exists: ${originalName}`);
        return existingFile;
      }
      
      // Generate unique filename
      const videoFilename = this.generateVideoFilename(originalName, hash);
      const videoPath = path.join(this.videoStoragePath, videoFilename);
      
      // Copy file to storage
      await fs.copy(filePath, videoPath);
      
      // Get file stats
      const stats = await fs.stat(videoPath);
      
      // Create metadata
      const videoId = crypto.randomUUID();
      const videoMetadata = {
        id: videoId,
        filename: videoFilename,
        originalName: originalName,
        hash: hash,
        size: stats.size,
        mimeType: metadata.mimeType || 'video/mp4',
        uploadDate: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        accessCount: 0,
        metadata: metadata,
        path: videoPath
      };
      
      // Save metadata
      const metadataFile = path.join(this.metadataPath, `${videoId}.json`);
      await fs.writeJson(metadataFile, videoMetadata, { spaces: 2 });
      
      // Also maintain a hash index
      const hashIndexFile = path.join(this.metadataPath, `hash_${hash}.json`);
      await fs.writeJson(hashIndexFile, { videoId, filename: videoFilename });
      
      console.log(`✅ Video stored: ${originalName} -> ${videoFilename} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
      
      return {
        id: videoId,
        filename: videoFilename,
        originalName: originalName,
        size: stats.size,
        streamUrl: `/api/stream/video/${videoId}`,
        directPath: videoPath
      };
      
    } catch (error) {
      console.error(`❌ Error storing video file:`, error);
      throw error;
    }
  }

  // Get video by hash (for deduplication)
  async getVideoByHash(hash) {
    try {
      const hashIndexFile = path.join(this.metadataPath, `hash_${hash}.json`);
      if (await fs.pathExists(hashIndexFile)) {
        const { videoId } = await fs.readJson(hashIndexFile);
        return await this.getVideoById(videoId);
      }
      return null;
    } catch (error) {
      console.error('Error checking for existing video:', error);
      return null;
    }
  }

  // Get video metadata by ID
  async getVideoById(videoId) {
    try {
      const metadataFile = path.join(this.metadataPath, `${videoId}.json`);
      if (await fs.pathExists(metadataFile)) {
        const metadata = await fs.readJson(metadataFile);
        return {
          id: metadata.id,
          filename: metadata.filename,
          originalName: metadata.originalName,
          size: metadata.size,
          streamUrl: `/api/stream/video/${metadata.id}`,
          directPath: metadata.path
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting video ${videoId}:`, error);
      return null;
    }
  }

  // Stream video file with range support
  async streamVideoFile(videoId, range = null) {
    try {
      // Get video metadata
      const metadataFile = path.join(this.metadataPath, `${videoId}.json`);
      if (!await fs.pathExists(metadataFile)) {
        throw new Error('Video not found');
      }
      
      const metadata = await fs.readJson(metadataFile);
      const videoPath = metadata.path;
      
      // Update access statistics
      metadata.lastAccessed = new Date().toISOString();
      metadata.accessCount = (metadata.accessCount || 0) + 1;
      await fs.writeJson(metadataFile, metadata, { spaces: 2 });
      
      // Get file stats
      const stats = await fs.stat(videoPath);
      const fileSize = stats.size;
      
      if (!range) {
        // Return full file stream
        const stream = fs.createReadStream(videoPath);
        return {
          stream: stream,
          headers: {
            'Content-Length': fileSize,
            'Content-Type': metadata.mimeType || 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400',
            'Last-Modified': stats.mtime.toUTCString(),
            'ETag': `"${metadata.hash}"`,
          }
        };
      }
      
      // Handle range requests
      const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
      if (!rangeMatch) {
        throw new Error('Invalid range header');
      }
      
      const start = parseInt(rangeMatch[1]);
      const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : fileSize - 1;
      const chunkSize = end - start + 1;
      
      // Create read stream with range
      const stream = fs.createReadStream(videoPath, { start, end });
      
      return {
        stream: stream,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': metadata.mimeType || 'video/mp4',
          'Cache-Control': 'public, max-age=86400',
          'Last-Modified': stats.mtime.toUTCString(),
          'ETag': `"${metadata.hash}"`,
        },
        statusCode: 206 // Partial Content
      };
      
    } catch (error) {
      console.error(`Error streaming video ${videoId}:`, error);
      throw error;
    }
  }

  // List all videos
  async listVideos(limit = 50, offset = 0) {
    try {
      const metadataFiles = await fs.readdir(this.metadataPath);
      const videoFiles = metadataFiles
        .filter(file => file.endsWith('.json') && !file.startsWith('hash_'))
        .sort((a, b) => b.localeCompare(a)); // Sort by newest first
      
      const videos = [];
      const start = offset;
      const end = Math.min(offset + limit, videoFiles.length);
      
      for (let i = start; i < end; i++) {
        const metadata = await fs.readJson(path.join(this.metadataPath, videoFiles[i]));
        videos.push({
          id: metadata.id,
          filename: metadata.filename,
          originalName: metadata.originalName,
          size: metadata.size,
          uploadDate: metadata.uploadDate,
          accessCount: metadata.accessCount || 0,
          streamUrl: `/api/stream/video/${metadata.id}`
        });
      }
      
      return {
        videos,
        total: videoFiles.length,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error listing videos:', error);
      throw error;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const metadataFiles = await fs.readdir(this.metadataPath);
      const videoCount = metadataFiles.filter(f => f.endsWith('.json') && !f.startsWith('hash_')).length;
      
      let totalSize = 0;
      let totalAccessCount = 0;
      const videoFiles = await fs.readdir(this.videoStoragePath);
      
      for (const file of videoFiles) {
        if (file !== '.metadata') {
          const filePath = path.join(this.videoStoragePath, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }
      
      // Get access statistics
      for (const metaFile of metadataFiles) {
        if (metaFile.endsWith('.json') && !metaFile.startsWith('hash_')) {
          const metadata = await fs.readJson(path.join(this.metadataPath, metaFile));
          totalAccessCount += metadata.accessCount || 0;
        }
      }
      
      return {
        videoCount,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        totalSizeGB: (totalSize / 1024 / 1024 / 1024).toFixed(2),
        totalAccessCount,
        storagePath: this.videoStoragePath
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw error;
    }
  }

  // Clean up old videos (optional maintenance)
  async cleanupOldVideos(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const metadataFiles = await fs.readdir(this.metadataPath);
      let deletedCount = 0;
      let freedSpace = 0;
      
      for (const metaFile of metadataFiles) {
        if (metaFile.endsWith('.json') && !metaFile.startsWith('hash_')) {
          const metadataPath = path.join(this.metadataPath, metaFile);
          const metadata = await fs.readJson(metadataPath);
          
          const lastAccessed = new Date(metadata.lastAccessed || metadata.uploadDate);
          if (lastAccessed < cutoffDate && metadata.accessCount < 5) {
            // Delete video file
            if (await fs.pathExists(metadata.path)) {
              const stats = await fs.stat(metadata.path);
              freedSpace += stats.size;
              await fs.remove(metadata.path);
            }
            
            // Delete metadata
            await fs.remove(metadataPath);
            
            // Delete hash index
            const hashIndexFile = path.join(this.metadataPath, `hash_${metadata.hash}.json`);
            await fs.remove(hashIndexFile);
            
            deletedCount++;
          }
        }
      }
      
      console.log(`🧹 Cleaned up ${deletedCount} old videos, freed ${(freedSpace / 1024 / 1024).toFixed(2)}MB`);
      return { deletedCount, freedSpace };
    } catch (error) {
      console.error('Error cleaning up old videos:', error);
      throw error;
    }
  }

  // Import existing videos from a directory
  async importVideosFromDirectory(sourceDir) {
    try {
      console.log(`📥 Importing videos from: ${sourceDir}`);
      
      if (!await fs.pathExists(sourceDir)) {
        throw new Error(`Source directory does not exist: ${sourceDir}`);
      }
      
      const files = await fs.readdir(sourceDir);
      const videoExtensions = ['.mp4', '.mkv', '.avi', '.webm', '.mov'];
      const videoFiles = files.filter(file => 
        videoExtensions.includes(path.extname(file).toLowerCase())
      );
      
      console.log(`Found ${videoFiles.length} video files to import`);
      
      const imported = [];
      for (const file of videoFiles) {
        const sourcePath = path.join(sourceDir, file);
        try {
          const result = await this.storeVideoFile(sourcePath, file, {
            imported: true,
            importDate: new Date().toISOString()
          });
          imported.push(result);
          console.log(`✅ Imported: ${file}`);
        } catch (error) {
          console.error(`❌ Failed to import ${file}:`, error.message);
        }
      }
      
      return {
        totalFiles: videoFiles.length,
        imported: imported.length,
        files: imported
      };
    } catch (error) {
      console.error('Error importing videos:', error);
      throw error;
    }
  }
}

module.exports = FileSystemVideoService;