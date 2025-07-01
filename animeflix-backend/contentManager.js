const fs = require('fs-extra');
const path = require('path');
const toml = require('toml');

class ContentManager {
  constructor(contentDir = './content') {
    this.contentDir = contentDir;
  }

  // Get sample video URL for testing
  getSampleVideoUrl(episodeNumber) {
    const sampleVideos = [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
    ];
    
    return sampleVideos[(episodeNumber - 1) % sampleVideos.length];
  }

  // Parse episode filename to extract information
  parseEpisodeFilename(filename) {
    // Pattern: season_1_episode_1_episodename.mp4
    // Or: movie_title.mp4
    const episodePattern = /^season_(\d+)_episode_(\d+)_(.+)\.(mp4|mkv|avi)$/i;
    const moviePattern = /^(.+)\.(mp4|mkv|avi)$/i;

    const episodeMatch = filename.match(episodePattern);
    if (episodeMatch) {
      return {
        type: 'episode',
        season: parseInt(episodeMatch[1]),
        episode: parseInt(episodeMatch[2]),
        title: episodeMatch[3].replace(/_/g, ' '),
        extension: episodeMatch[4]
      };
    }

    const movieMatch = filename.match(moviePattern);
    if (movieMatch) {
      return {
        type: 'movie',
        title: movieMatch[1].replace(/_/g, ' '),
        extension: movieMatch[2]
      };
    }

    return null;
  }

  // Read and parse TOML configuration file
  async readTomlConfig(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return toml.parse(content);
    } catch (error) {
      console.error(`Error reading TOML file ${filePath}:`, error);
      return null;
    }
  }

  // Scan a series directory for episodes
  async scanSeriesDirectory(seriesPath, seriesConfig) {
    const seasons = {};
    const files = await fs.readdir(seriesPath);

    for (const file of files) {
      const filePath = path.join(seriesPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        // This is a season directory
        const seasonFiles = await fs.readdir(filePath);
        const seasonNumber = parseInt(file.replace(/\D/g, '')) || 1;

        const episodes = [];
        for (const episodeFile of seasonFiles) {
          const episodeInfo = this.parseEpisodeFilename(episodeFile);
          if (episodeInfo && episodeInfo.type === 'episode') {
            const episode = {
              id: `${seriesConfig.id}_s${seasonNumber}_e${episodeInfo.episode}`,
              title: episodeInfo.title,
              description: `${seriesConfig.title} Season ${seasonNumber} Episode ${episodeInfo.episode}`,
              duration: seriesConfig.episode_duration || "24 min",
              season: seasonNumber,
              episode: episodeInfo.episode,
              thumbnail: seriesConfig.episode_thumbnail || seriesConfig.thumbnail,
              videoUrl: this.getSampleVideoUrl(episodeInfo.episode)
            };

            // Check for episode-specific config
            const episodeConfigFile = path.join(filePath, `episode_${episodeInfo.episode}.toml`);
            if (await fs.pathExists(episodeConfigFile)) {
              const episodeConfig = await this.readTomlConfig(episodeConfigFile);
              if (episodeConfig) {
                // Remove any videoUrl from config to prevent override
                delete episodeConfig.videoUrl;
                Object.assign(episode, episodeConfig);
              }
            }

            episodes.push(episode);
          }
        }

        if (episodes.length > 0) {
          episodes.sort((a, b) => a.episode - b.episode);
          seasons[seasonNumber] = episodes;
        }
      } else {
        // Direct episode files in series root
        const episodeInfo = this.parseEpisodeFilename(file);
        if (episodeInfo && episodeInfo.type === 'episode') {
          const seasonNumber = episodeInfo.season;
          if (!seasons[seasonNumber]) {
            seasons[seasonNumber] = [];
          }

          const episode = {
            id: `${seriesConfig.id}_s${seasonNumber}_e${episodeInfo.episode}`,
            title: episodeInfo.title,
            description: `${seriesConfig.title} Season ${seasonNumber} Episode ${episodeInfo.episode}`,
            duration: seriesConfig.episode_duration || "24 min",
            season: seasonNumber,
            episode: episodeInfo.episode,
            thumbnail: seriesConfig.episode_thumbnail || seriesConfig.thumbnail,
            videoUrl: this.getSampleVideoUrl(episodeInfo.episode)
          };

          seasons[seasonNumber].push(episode);
        }
      }
    }

    // Sort episodes within each season
    Object.keys(seasons).forEach(seasonKey => {
      seasons[seasonKey].sort((a, b) => a.episode - b.episode);
    });

    return seasons;
  }

  // Scan content directory and build content database
  async scanContent() {
    try {
      if (!await fs.pathExists(this.contentDir)) {
        console.log('Content directory does not exist, creating...');
        await fs.ensureDir(this.contentDir);
        return { featured: null, categories: {} };
      }

      const content = {
        featured: null,
        categories: {
          trending: [],
          action: [],
          romance: [],
          comedy: [],
          drama: [],
          sci_fi: [],
          horror: [],
          movies: []
        }
      };

      const addedItems = new Set(); // Track which items have been added to prevent duplicates

      const items = await fs.readdir(this.contentDir);

      for (const item of items) {
        const itemPath = path.join(this.contentDir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
          // Look for series_details.toml or movie_details.toml
          const seriesConfigPath = path.join(itemPath, 'series_details.toml');
          const movieConfigPath = path.join(itemPath, 'movie_details.toml');

          let config = null;
          let type = null;

          if (await fs.pathExists(seriesConfigPath)) {
            config = await this.readTomlConfig(seriesConfigPath);
            type = 'series';
          } else if (await fs.pathExists(movieConfigPath)) {
            config = await this.readTomlConfig(movieConfigPath);
            type = 'movie';
          }

          if (config) {
            if (type === 'series') {
              // Scan for episodes
              const seasons = await this.scanSeriesDirectory(itemPath, config);
              
              const series = {
                ...config,
                type: 'series',
                seasons: seasons,
                episodes: Object.values(seasons).reduce((total, eps) => total + eps.length, 0)
              };

              // Add to categories based on genre (avoid duplicates)
              if (config.genres) {
                const addedToCategories = new Set();
                config.genres.forEach(genre => {
                  const categoryKey = genre.toLowerCase().replace(/[\\s&]/g, '_');
                  if (content.categories[categoryKey] && !addedToCategories.has(categoryKey)) {
                    content.categories[categoryKey].push(series);
                    addedToCategories.add(categoryKey);
                  }
                });
                
                // Add to trending if not added to any genre category
                if (addedToCategories.size === 0) {
                  content.categories.trending.push(series);
                }
              } else {
                content.categories.trending.push(series);
              }

              // Set as featured if marked
              if (config.featured) {
                content.featured = series;
              }

            } else if (type === 'movie') {
              // Handle movie
              const movieFiles = await fs.readdir(itemPath);
              const videoFile = movieFiles.find(file => {
                const info = this.parseEpisodeFilename(file);
                return info && (info.type === 'movie' || info.type === 'episode');
              });

              if (videoFile) {
                const movie = {
                  ...config,
                  type: 'movie',
                  episodes: 1,
                  videoUrl: this.getSampleVideoUrl(1)
                };

                content.categories.movies.push(movie);

                // Add to genre categories (avoid duplicates)
                const addedToCategories = new Set();
                if (config.genres) {
                  config.genres.forEach(genre => {
                    const categoryKey = genre.toLowerCase().replace(/[\\s&]/g, '_');
                    if (content.categories[categoryKey] && !addedToCategories.has(categoryKey)) {
                      content.categories[categoryKey].push(movie);
                      addedToCategories.add(categoryKey);
                    }
                  });
                }
                
                // Add to trending if not added to any genre category
                if (addedToCategories.size === 0) {
                  content.categories.trending.push(movie);
                }

                // Set as featured if marked
                if (config.featured) {
                  content.featured = movie;
                }
              }
            }
          }
        }
      }

      return content;
    } catch (error) {
      console.error('Error scanning content:', error);
      return { featured: null, categories: {} };
    }
  }

  // Get specific content by ID
  async getContentById(id) {
    const allContent = await this.scanContent();
    
    if (allContent.featured && allContent.featured.id === id) {
      return allContent.featured;
    }

    for (const categoryKey in allContent.categories) {
      const item = allContent.categories[categoryKey].find(c => c.id === id);
      if (item) {
        return item;
      }
    }

    return null;
  }

  // Get episode by content ID and episode ID
  async getEpisodeById(contentId, episodeId) {
    const content = await this.getContentById(contentId);
    if (!content || !content.seasons) {
      return null;
    }

    for (const seasonKey in content.seasons) {
      const episode = content.seasons[seasonKey].find(ep => ep.id === episodeId);
      if (episode) {
        return { episode, content };
      }
    }

    return null;
  }
}

module.exports = ContentManager;