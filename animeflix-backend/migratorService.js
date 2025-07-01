const fs = require('fs-extra');
const path = require('path');
const toml = require('toml');
const tomlify = require('tomlify-j0.4');
const sharp = require('sharp');

class MigratorService {
  constructor(contentPath) {
    this.contentPath = contentPath;
  }

  async browseDirectory(dirPath) {
    try {
      // Security: Ensure the path is absolute and normalize it
      const normalizedPath = path.resolve(path.normalize(dirPath));
      
      // Check if directory exists and is accessible
      try {
        await fs.access(normalizedPath, fs.constants.R_OK);
      } catch (accessError) {
        throw new Error(`Cannot access directory: ${normalizedPath}. Permission denied or directory does not exist.`);
      }
      
      const items = await fs.readdir(normalizedPath, { withFileTypes: true });
      
      const directories = [];
      const files = [];
      
      for (const item of items) {
        try {
          if (item.isDirectory() && !item.name.startsWith('.')) {
            // Check if we can access this subdirectory
            const subDirPath = path.join(normalizedPath, item.name);
            try {
              await fs.access(subDirPath, fs.constants.R_OK);
              directories.push(item.name);
            } catch {
              // Skip directories we can't access
              continue;
            }
          } else if (item.isFile()) {
            const ext = path.extname(item.name).toLowerCase();
            const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v'];
            
            const filePath = path.join(normalizedPath, item.name);
            const stats = await fs.stat(filePath);
            
            files.push({
              name: item.name,
              isVideo: videoExtensions.includes(ext),
              size: stats.size
            });
          }
        } catch (itemError) {
          // Skip items that cause errors
          console.warn(`Skipping item ${item.name}: ${itemError.message}`);
        }
      }
      
      return {
        path: normalizedPath,
        directories: directories.sort(),
        files: files.sort((a, b) => a.name.localeCompare(b.name))
      };
    } catch (error) {
      console.error('Error browsing directory:', error);
      throw new Error(`Failed to browse directory: ${error.message}`);
    }
  }

  async migrateContent(data, imageFiles = {}) {
    const { contentType, contentInfo, sourcePath, files } = data;
    
    try {
      // Create safe folder name from title
      const safeFolderName = contentInfo.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      
      const contentDir = path.join(this.contentPath, safeFolderName);
      
      // Create content directory
      await fs.ensureDir(contentDir);
      
      // Process and save images
      const imagePaths = await this.processImages(imageFiles, contentDir, safeFolderName);
      
      if (contentType === 'movie') {
        // Handle movie migration
        await this.migrateMovie(contentInfo, sourcePath, files, contentDir, imagePaths);
      } else {
        // Handle series migration
        await this.migrateSeries(contentInfo, sourcePath, files, contentDir, imagePaths);
      }
      
      return { success: true, message: `Successfully migrated ${contentInfo.title}` };
    } catch (error) {
      console.error('Migration error:', error);
      throw new Error(`Migration failed: ${error.message}`);
    }
  }

  async processImages(imageFiles, contentDir, safeFolderName) {
    const imagePaths = {};
    
    try {
      if (imageFiles.thumbnail) {
        const thumbnailPath = path.join(contentDir, 'thumbnail.jpg');
        await sharp(imageFiles.thumbnail.buffer)
          .resize(300, 450, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toFile(thumbnailPath);
        imagePaths.thumbnail = `/content/${safeFolderName}/thumbnail.jpg`;
      }
      
      if (imageFiles.backdrop) {
        const backdropPath = path.join(contentDir, 'backdrop.jpg');
        await sharp(imageFiles.backdrop.buffer)
          .resize(1920, 1080, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toFile(backdropPath);
        imagePaths.backdrop = `/content/${safeFolderName}/backdrop.jpg`;
      }
    } catch (error) {
      console.warn('Error processing images:', error);
      // Continue without images if processing fails
    }
    
    return imagePaths;
  }

  async migrateMovie(contentInfo, sourcePath, files, contentDir, imagePaths) {
    // Copy movie file
    if (files.length > 0) {
      const sourceFile = path.join(sourcePath, files[0].name);
      const ext = path.extname(files[0].name);
      const destFile = path.join(contentDir, `${contentInfo.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}${ext}`);
      
      await fs.copy(sourceFile, destFile);
      
      // Create movie_details.toml
      const movieDetails = {
        id: contentInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        title: contentInfo.title,
        description: contentInfo.description || '',
        year: parseInt(contentInfo.year) || new Date().getFullYear(),
        rating: contentInfo.rating || 'PG',
        duration: '2h 0m', // Default duration
        genres: contentInfo.genres || [],
        thumbnail: imagePaths.thumbnail || `/content/${path.basename(contentDir)}/thumbnail.jpg`,
        backdrop: imagePaths.backdrop || `/content/${path.basename(contentDir)}/backdrop.jpg`,
        videoUrl: `/content/${path.basename(contentDir)}/${path.basename(destFile)}`,
        type: 'movie'
      };
      
      const tomlContent = tomlify.toToml(movieDetails, { space: 2 });
      await fs.writeFile(path.join(contentDir, 'movie_details.toml'), tomlContent);
    }
  }

  async migrateSeries(contentInfo, sourcePath, files, contentDir, imagePaths) {
    // Create series_details.toml
    const seriesDetails = {
      id: contentInfo.title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      title: contentInfo.title,
      description: contentInfo.description || '',
      year: parseInt(contentInfo.year) || new Date().getFullYear(),
      rating: contentInfo.rating || 'TV-14',
      genres: contentInfo.genres || [],
      thumbnail: imagePaths.thumbnail || `/content/${path.basename(contentDir)}/thumbnail.jpg`,
      backdrop: imagePaths.backdrop || `/content/${path.basename(contentDir)}/backdrop.jpg`,
      type: 'series',
      episodes: 0 // Will be updated as we process episodes
    };
    
    // Organize and copy episodes
    let totalEpisodes = 0;
    
    for (const [seasonNum, episodes] of Object.entries(contentInfo.seasons)) {
      const seasonDir = path.join(contentDir, `season_${seasonNum}`);
      await fs.ensureDir(seasonDir);
      
      for (const episodeInfo of episodes) {
        const sourceFile = path.join(sourcePath, episodeInfo.originalFile.name);
        const destFile = path.join(seasonDir, episodeInfo.newFilename);
        
        // Copy the video file
        await fs.copy(sourceFile, destFile);
        
        // Create episode TOML file
        const episodeToml = {
          id: `s${seasonNum}e${episodeInfo.episode}`,
          title: episodeInfo.title || `Episode ${episodeInfo.episode}`,
          description: episodeInfo.description || '',
          episode: episodeInfo.episode,
          season: parseInt(seasonNum),
          duration: '24m', // Default duration
          thumbnail: `/content/${path.basename(contentDir)}/season_${seasonNum}/episode_${episodeInfo.episode}_thumb.jpg`,
          videoUrl: `/content/${path.basename(contentDir)}/season_${seasonNum}/${episodeInfo.newFilename}`
        };
        
        const episodeTomlContent = tomlify.toToml(episodeToml, { space: 2 });
        await fs.writeFile(
          path.join(seasonDir, `episode_${episodeInfo.episode}.toml`),
          episodeTomlContent
        );
        
        totalEpisodes++;
      }
    }
    
    // Update total episodes count
    seriesDetails.episodes = totalEpisodes;
    
    // Write series details
    const seriestomlContent = tomlify.toToml(seriesDetails, { space: 2 });
    await fs.writeFile(path.join(contentDir, 'series_details.toml'), seriestomlContent);
  }

  async updateContent(contentId, contentData, imageFiles = {}, newEpisodes = []) {
    try {
      // Find the content directory
      const contentDirs = await fs.readdir(this.contentPath);
      let contentDir = null;
      
      for (const dir of contentDirs) {
        const dirPath = path.join(this.contentPath, dir);
        const seriesFile = path.join(dirPath, 'series_details.toml');
        const movieFile = path.join(dirPath, 'movie_details.toml');
        
        try {
          if (await fs.pathExists(seriesFile)) {
            const tomlContent = await fs.readFile(seriesFile, 'utf8');
            const details = toml.parse(tomlContent);
            if (details.id === contentId) {
              contentDir = dirPath;
              break;
            }
          } else if (await fs.pathExists(movieFile)) {
            const tomlContent = await fs.readFile(movieFile, 'utf8');
            const details = toml.parse(tomlContent);
            if (details.id === contentId) {
              contentDir = dirPath;
              break;
            }
          }
        } catch (err) {
          continue;
        }
      }
      
      if (!contentDir) {
        throw new Error('Content not found');
      }
      
      const safeFolderName = path.basename(contentDir);
      
      // Process new images if provided
      const imagePaths = await this.processImages(imageFiles, contentDir, safeFolderName);
      
      // Update existing TOML file with new data
      const seriesFile = path.join(contentDir, 'series_details.toml');
      const movieFile = path.join(contentDir, 'movie_details.toml');
      
      if (await fs.pathExists(seriesFile)) {
        // Update series
        const updatedDetails = {
          ...contentData,
          thumbnail: imagePaths.thumbnail || contentData.thumbnail,
          backdrop: imagePaths.backdrop || contentData.backdrop
        };
        
        const tomlContent = tomlify.toToml(updatedDetails, { space: 2 });
        await fs.writeFile(seriesFile, tomlContent);
        
        // Add new episodes if provided
        if (newEpisodes.length > 0) {
          await this.addNewEpisodes(contentDir, newEpisodes, safeFolderName);
        }
      } else if (await fs.pathExists(movieFile)) {
        // Update movie
        const updatedDetails = {
          ...contentData,
          thumbnail: imagePaths.thumbnail || contentData.thumbnail,
          backdrop: imagePaths.backdrop || contentData.backdrop
        };
        
        const tomlContent = tomlify.toToml(updatedDetails, { space: 2 });
        await fs.writeFile(movieFile, tomlContent);
      }
      
      return { success: true, message: 'Content updated successfully' };
    } catch (error) {
      console.error('Update error:', error);
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  async addNewEpisodes(contentDir, newEpisodes, safeFolderName) {
    for (const episode of newEpisodes) {
      if (!episode.videoFile) continue;
      
      const seasonDir = path.join(contentDir, `season_${episode.season}`);
      await fs.ensureDir(seasonDir);
      
      // Save video file
      const ext = path.extname(episode.videoFile.originalname);
      const videoFilename = `season_${episode.season}_episode_${episode.episode}${ext}`;
      const videoPath = path.join(seasonDir, videoFilename);
      
      await fs.writeFile(videoPath, episode.videoFile.buffer);
      
      // Create episode TOML
      const episodeDetails = {
        id: `s${episode.season}e${episode.episode}`,
        title: episode.title || `Episode ${episode.episode}`,
        description: episode.description || '',
        episode: episode.episode,
        season: episode.season,
        duration: '24m',
        thumbnail: `/content/${safeFolderName}/season_${episode.season}/episode_${episode.episode}_thumb.jpg`,
        videoUrl: `/content/${safeFolderName}/season_${episode.season}/${videoFilename}`
      };
      
      const episodeTomlContent = tomlify.toToml(episodeDetails, { space: 2 });
      await fs.writeFile(
        path.join(seasonDir, `episode_${episode.episode}.toml`),
        episodeTomlContent
      );
    }
  }
}

module.exports = MigratorService;