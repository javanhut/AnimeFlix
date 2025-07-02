const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs-extra');

class VideoStorageService {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'animeflix_user',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'animeflix',
      password: process.env.DB_PASSWORD || 'animeflix_password',
      port: process.env.DB_PORT || 5432,
    });
  }

  // Store video file in database
  async storeVideoFile(filePath, fileName, mimeType = 'video/mp4') {
    try {
      console.log(`📹 Storing video file: ${fileName}`);
      
      // Read the video file
      const fileBuffer = await fs.readFile(filePath);
      const fileSize = fileBuffer.length;
      
      // Generate hash for deduplication
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // Check if file already exists
      const existingFile = await this.getVideoFileByHash(hash);
      if (existingFile) {
        console.log(`📹 File already exists in database: ${fileName}`);
        return existingFile;
      }
      
      // Get video metadata (basic implementation)
      const metadata = await this.extractVideoMetadata(filePath);
      
      // Insert video file into database
      const query = `
        INSERT INTO video_files (
          file_hash, file_name, file_size, mime_type, 
          duration_seconds, resolution, bitrate, codec, file_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, file_hash, file_name, file_size
      `;
      
      const values = [
        hash,
        fileName,
        fileSize,
        mimeType,
        metadata.duration,
        metadata.resolution,
        metadata.bitrate,
        metadata.codec,
        fileBuffer
      ];
      
      const result = await this.pool.query(query, values);
      const videoFile = result.rows[0];
      
      console.log(`✅ Video file stored successfully: ${fileName} (${Math.round(fileSize / 1024 / 1024)}MB)`);
      
      return {
        id: videoFile.id,
        hash: videoFile.file_hash,
        name: videoFile.file_name,
        size: videoFile.file_size,
        streamUrl: `/api/stream/video/${videoFile.id}`
      };
      
    } catch (error) {
      console.error(`❌ Error storing video file ${fileName}:`, error);
      throw error;
    }
  }

  // Get video file by hash (for deduplication)
  async getVideoFileByHash(hash) {
    try {
      const query = `
        SELECT id, file_hash, file_name, file_size
        FROM video_files 
        WHERE file_hash = $1
      `;
      
      const result = await this.pool.query(query, [hash]);
      
      if (result.rows.length > 0) {
        const file = result.rows[0];
        return {
          id: file.id,
          hash: file.file_hash,
          name: file.file_name,
          size: file.file_size,
          streamUrl: `/api/stream/video/${file.id}`
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for existing video file:', error);
      throw error;
    }
  }

  // Stream video file from database
  async streamVideoFile(fileId, range = null) {
    try {
      // Update access statistics
      await this.updateAccessStats(fileId);
      
      const query = `
        SELECT file_data, file_size, mime_type, file_name
        FROM video_files 
        WHERE id = $1
      `;
      
      const result = await this.pool.query(query, [fileId]);
      
      if (result.rows.length === 0) {
        throw new Error('Video file not found');
      }
      
      const { file_data, file_size, mime_type, file_name } = result.rows[0];
      
      if (!range) {
        // Return full file
        return {
          data: file_data,
          size: file_size,
          mimeType: mime_type,
          fileName: file_name,
          headers: {
            'Content-Length': file_size,
            'Content-Type': mime_type,
            'Accept-Ranges': 'bytes'
          }
        };
      }
      
      // Handle range requests for video seeking
      const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
      if (!rangeMatch) {
        throw new Error('Invalid range header');
      }
      
      const start = parseInt(rangeMatch[1]);
      const end = rangeMatch[2] ? parseInt(rangeMatch[2]) : file_size - 1;
      const chunkSize = end - start + 1;
      
      const chunk = file_data.slice(start, end + 1);
      
      return {
        data: chunk,
        size: chunkSize,
        mimeType: mime_type,
        fileName: file_name,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${file_size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': mime_type
        },
        statusCode: 206 // Partial Content
      };
      
    } catch (error) {
      console.error(`Error streaming video file ${fileId}:`, error);
      throw error;
    }
  }

  // Update access statistics
  async updateAccessStats(fileId) {
    try {
      const query = `
        UPDATE video_files 
        SET last_accessed = CURRENT_TIMESTAMP, access_count = access_count + 1
        WHERE id = $1
      `;
      
      await this.pool.query(query, [fileId]);
    } catch (error) {
      console.error('Error updating access stats:', error);
      // Don't throw - this is not critical
    }
  }

  // Link video file to episode
  async linkVideoToEpisode(episodeId, videoFileId, type = 'sub') {
    try {
      console.log(`🔗 Linking video file ${videoFileId} to episode ${episodeId} (${type})`);
      
      const columnMap = {
        'sub': 'video_file_id_sub',
        'dub': 'video_file_id_dub',
        'raw': 'video_file_id_raw'
      };
      
      const column = columnMap[type];
      if (!column) {
        throw new Error(`Invalid video type: ${type}`);
      }
      
      const query = `
        UPDATE episodes 
        SET ${column} = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, title
      `;
      
      const result = await this.pool.query(query, [videoFileId, episodeId]);
      
      if (result.rows.length === 0) {
        throw new Error(`Episode not found: ${episodeId}`);
      }
      
      console.log(`✅ Video linked successfully to episode: ${result.rows[0].title}`);
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error linking video to episode:`, error);
      throw error;
    }
  }

  // Get video statistics
  async getVideoStats() {
    try {
      const query = 'SELECT * FROM get_video_stats()';
      const result = await this.pool.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting video stats:', error);
      throw error;
    }
  }

  // List all video files
  async listVideoFiles(limit = 50, offset = 0) {
    try {
      const query = `
        SELECT 
          id, file_name, file_size, mime_type, duration_seconds,
          resolution, upload_date, access_count, processing_status
        FROM video_files
        ORDER BY upload_date DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await this.pool.query(query, [limit, offset]);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.file_name,
        size: Math.round(row.file_size / 1024 / 1024), // MB
        duration: row.duration_seconds,
        resolution: row.resolution,
        uploadDate: row.upload_date,
        accessCount: row.access_count,
        status: row.processing_status,
        streamUrl: `/api/stream/video/${row.id}`
      }));
    } catch (error) {
      console.error('Error listing video files:', error);
      throw error;
    }
  }

  // Basic video metadata extraction (placeholder - would use ffprobe in production)
  async extractVideoMetadata(filePath) {
    // This is a basic implementation
    // In production, you'd use ffprobe or similar tool
    const stats = await fs.stat(filePath);
    
    return {
      duration: 1440, // 24 minutes in seconds - placeholder
      resolution: '1920x1080', // placeholder
      bitrate: 5000, // placeholder
      codec: 'h264' // placeholder
    };
  }

  // Cleanup unused video files
  async cleanupUnusedFiles() {
    try {
      const query = 'SELECT cleanup_unused_video_files()';
      const result = await this.pool.query(query);
      const deletedCount = result.rows[0].cleanup_unused_video_files;
      
      console.log(`🧹 Cleaned up ${deletedCount} unused video files`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up unused files:', error);
      throw error;
    }
  }

  // Get recently accessed videos for preloading
  async getRecentlyAccessedVideos(limit = 10) {
    try {
      const query = `
        SELECT 
          id, file_name, file_size, mime_type, access_count, last_accessed
        FROM video_files
        WHERE last_accessed IS NOT NULL
        ORDER BY last_accessed DESC
        LIMIT $1
      `;
      
      const result = await this.pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error getting recently accessed videos:', error);
      return [];
    }
  }

  // Get video data by ID (for caching)
  async getVideoData(videoId) {
    try {
      const query = `
        SELECT file_data, mime_type
        FROM video_files 
        WHERE id = $1
      `;
      
      const result = await this.pool.query(query, [videoId]);
      
      if (result.rows.length > 0) {
        return result.rows[0].file_data;
      }
      return null;
    } catch (error) {
      console.error(`Error getting video data for ${videoId}:`, error);
      return null;
    }
  }

  // Close database connection
  async close() {
    await this.pool.end();
  }
}

module.exports = VideoStorageService;