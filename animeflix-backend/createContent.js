#!/usr/bin/env node
/**
 * Content Creation Helper for AnimeFlix
 * 
 * Usage:
 * node createContent.js series "Attack on Titan" --id=attack_on_titan --year=2013
 * node createContent.js movie "Spirited Away" --id=spirited_away --year=2001
 */

const fs = require('fs-extra');
const path = require('path');

function generateSeriesTemplate(title, options = {}) {
  return `# ${title} Series Configuration
id = "${options.id || title.toLowerCase().replace(/\\s+/g, '_')}"
title = "${title}"
description = "${options.description || `${title} description goes here.`}"
year = ${options.year || new Date().getFullYear()}
rating = "${options.rating || 'TV-14'}"
episode_duration = "${options.duration || '24 min'}"
featured = ${options.featured || false}

# Genres for categorization
genres = ${JSON.stringify(options.genres || ['Action', 'Drama'])}

# Visual assets
thumbnail = "${options.thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop'}"
backdrop = "${options.backdrop || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop'}"
episode_thumbnail = "${options.episode_thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=169&fit=crop'}"

# Release information
studio = "${options.studio || 'Studio Name'}"
status = "${options.status || 'Ongoing'}"
total_episodes = ${options.total_episodes || 12}
total_seasons = ${options.total_seasons || 1}

[cast]
main_characters = ${JSON.stringify(options.characters || ['Character 1', 'Character 2'])}

[production]
director = "${options.director || 'Director Name'}"
writer = "${options.writer || 'Writer Name'}"
music = "${options.music || 'Composer Name'}"

# Season-specific information
[[seasons]]
number = 1
title = "${title}"
year = ${options.year || new Date().getFullYear()}
episodes = ${options.season1_episodes || 12}
description = "Season 1 description"
`;
}

function generateMovieTemplate(title, options = {}) {
  return `# ${title} Movie Configuration
id = "${options.id || title.toLowerCase().replace(/\\s+/g, '_')}"
title = "${title}"
description = "${options.description || `${title} description goes here.`}"
year = ${options.year || new Date().getFullYear()}
rating = "${options.rating || 'PG-13'}"
duration = "${options.duration || '120 min'}"
featured = ${options.featured || false}

# Genres for categorization
genres = ${JSON.stringify(options.genres || ['Drama', 'Adventure'])}

# Visual assets
thumbnail = "${options.thumbnail || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop'}"
backdrop = "${options.backdrop || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop'}"

# Production information
studio = "${options.studio || 'Studio Name'}"
director = "${options.director || 'Director Name'}"
writer = "${options.writer || 'Writer Name'}"
music = "${options.music || 'Composer Name'}"

[cast]
main_characters = ${JSON.stringify(options.characters || ['Character 1', 'Character 2'])}

[technical]
format = "${options.format || '2D Animation'}"
aspect_ratio = "${options.aspect_ratio || '16:9'}"
sound = "${options.sound || 'Dolby Digital'}"
`;
}

function generateEpisodeTemplate(episodeNumber, title, options = {}) {
  return `# Episode ${episodeNumber}
title = "${title}"
description = "${options.description || `Episode ${episodeNumber} description.`}"
air_date = "${options.air_date || new Date().toISOString().split('T')[0]}"
duration = "${options.duration || '24 min'}"

# Episode-specific metadata
synopsis = "${options.synopsis || 'Episode synopsis goes here.'}"

# Production notes
director = "${options.director || 'Episode Director'}"
writer = "${options.writer || 'Episode Writer'}"

# Viewer ratings
rating = ${options.rating || 8.0}
total_votes = ${options.total_votes || 1000}
`;
}

async function createContent(type, title, options = {}) {
  const contentDir = './content';
  const id = options.id || title.toLowerCase().replace(/\\s+/g, '_');
  const itemPath = path.join(contentDir, id);

  await fs.ensureDir(itemPath);

  if (type === 'series') {
    // Create series_details.toml
    const seriesConfig = generateSeriesTemplate(title, options);
    await fs.writeFile(path.join(itemPath, 'series_details.toml'), seriesConfig);

    // Create season directories
    const numSeasons = options.total_seasons || 1;
    for (let s = 1; s <= numSeasons; s++) {
      const seasonDir = path.join(itemPath, `season_${s}`);
      await fs.ensureDir(seasonDir);

      // Create sample episodes
      const episodesInSeason = options[`season${s}_episodes`] || 3;
      for (let e = 1; e <= episodesInSeason; e++) {
        const episodeFile = `season_${s}_episode_${e}_episode_${e}.mp4`;
        const episodePath = path.join(seasonDir, episodeFile);
        await fs.writeFile(episodePath, `# Sample episode file for ${title} S${s}E${e}`);

        // Create episode config
        const episodeConfig = generateEpisodeTemplate(e, `Episode ${e}`, {
          description: `${title} Season ${s} Episode ${e}`,
          ...options
        });
        await fs.writeFile(path.join(seasonDir, `episode_${e}.toml`), episodeConfig);
      }
    }

    console.log(`✅ Created series: ${title}`);
    console.log(`📁 Directory: ${itemPath}`);
    console.log(`📺 Seasons: ${numSeasons}`);

  } else if (type === 'movie') {
    // Create movie_details.toml
    const movieConfig = generateMovieTemplate(title, options);
    await fs.writeFile(path.join(itemPath, 'movie_details.toml'), movieConfig);

    // Create movie file
    const movieFile = `${id}.mp4`;
    const moviePath = path.join(itemPath, movieFile);
    await fs.writeFile(moviePath, `# Sample movie file for ${title}`);

    console.log(`✅ Created movie: ${title}`);
    console.log(`📁 Directory: ${itemPath}`);
    console.log(`🎬 File: ${movieFile}`);
  }

  console.log(`\\n🔄 Run 'curl -X POST http://localhost:3001/api/rescan' to refresh content`);
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const type = args[0]; // 'series' or 'movie'
  const title = args[1];

  if (!type || !title) {
    console.log('Usage: node createContent.js <series|movie> "Title" [options]');
    console.log('');
    console.log('Examples:');
    console.log('  node createContent.js series "My Hero Academia" --id=my_hero_academia --year=2016');
    console.log('  node createContent.js movie "Your Name" --id=your_name --year=2016');
    process.exit(1);
  }

  // Parse options
  const options = {};
  args.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (value === 'true') options[key] = true;
      else if (value === 'false') options[key] = false;
      else if (!isNaN(value)) options[key] = parseInt(value);
      else options[key] = value;
    }
  });

  createContent(type, title, options).catch(console.error);
}

module.exports = { createContent, generateSeriesTemplate, generateMovieTemplate };