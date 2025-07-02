const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'animeflix_user',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'animeflix',
      password: process.env.DB_PASSWORD || 'animeflix_password',
      port: process.env.DB_PORT || 5432,
    });

    // Test the connection
    this.pool.connect((err, client, release) => {
      if (err) {
        console.error('Error connecting to the database:', err);
      } else {
        console.log('✅ Connected to PostgreSQL database');
        release();
      }
    });
  }

  // Get all series with their categories and episodes
  async getAllContent() {
    // First get all series
    const seriesQuery = `
      SELECT DISTINCT
        s.*,
        array_agg(DISTINCT c.name) as category_names,
        (
          SELECT COUNT(*)::int 
          FROM episodes e 
          WHERE e.series_id = s.id
        ) as episode_count
      FROM series s
      LEFT JOIN series_categories sc ON s.id = sc.series_id
      LEFT JOIN categories c ON sc.category_id = c.id
      GROUP BY s.id
      ORDER BY s.featured DESC, s.year DESC
    `;

    // Get all episodes for all series
    const episodesQuery = `
      SELECT e.*,
        sea.title as season_title
      FROM episodes e
      JOIN seasons sea ON e.season_id = sea.id
      ORDER BY e.series_id, e.season_number, e.episode_number
    `;

    try {
      const [seriesResult, episodesResult] = await Promise.all([
        this.pool.query(seriesQuery),
        this.pool.query(episodesQuery)
      ]);

      // Group episodes by series
      const episodesBySeries = {};
      episodesResult.rows.forEach(episode => {
        if (!episodesBySeries[episode.series_id]) {
          episodesBySeries[episode.series_id] = {};
        }
        const seasonNum = episode.season_number;
        if (!episodesBySeries[episode.series_id][seasonNum]) {
          episodesBySeries[episode.series_id][seasonNum] = [];
        }
        episodesBySeries[episode.series_id][seasonNum].push(this.formatEpisode(episode));
      });

      return this.formatContentResponse(seriesResult.rows, episodesBySeries);
    } catch (error) {
      console.error('Error fetching all content:', error);
      throw error;
    }
  }

  // Get series by ID with all episodes
  async getSeriesById(seriesId) {
    const seriesQuery = `
      SELECT s.*,
        array_agg(DISTINCT c.name) as category_names
      FROM series s
      LEFT JOIN series_categories sc ON s.id = sc.series_id
      LEFT JOIN categories c ON sc.category_id = c.id
      WHERE s.id = $1
      GROUP BY s.id
    `;

    const episodesQuery = `
      SELECT e.*,
        s.season_number,
        s.title as season_title
      FROM episodes e
      JOIN seasons s ON e.season_id = s.id
      WHERE e.series_id = $1
      ORDER BY e.season_number, e.episode_number
    `;

    try {
      const [seriesResult, episodesResult] = await Promise.all([
        this.pool.query(seriesQuery, [seriesId]),
        this.pool.query(episodesQuery, [seriesId])
      ]);

      if (seriesResult.rows.length === 0) {
        return null;
      }

      const series = seriesResult.rows[0];
      const episodes = episodesResult.rows;

      // Organize episodes by season
      const seasons = {};
      episodes.forEach(episode => {
        const seasonNum = episode.season_number;
        if (!seasons[seasonNum]) {
          seasons[seasonNum] = [];
        }
        seasons[seasonNum].push(this.formatEpisode(episode));
      });

      return {
        ...this.formatSeries(series),
        seasons
      };
    } catch (error) {
      console.error('Error fetching series by ID:', error);
      throw error;
    }
  }

  // Get specific episode with series data
  async getEpisodeById(seriesId, episodeId) {
    const query = `
      SELECT 
        e.*,
        s.id as series_id,
        s.title as series_title,
        s.description as series_description,
        s.poster_url as series_poster,
        s.banner_url as series_banner,
        s.backdrop_url as series_backdrop,
        s.genres as series_genres,
        s.year as series_year,
        s.rating as series_rating,
        s.studio as series_studio,
        s.status as series_status,
        s.content_type as series_type,
        s.episode_duration as series_episode_duration,
        sea.title as season_title
      FROM episodes e
      JOIN series s ON e.series_id = s.id
      JOIN seasons sea ON e.season_id = sea.id
      WHERE e.series_id = $1 AND e.id = $2
    `;

    try {
      const result = await this.pool.query(query, [seriesId, episodeId]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      return {
        episode: this.formatEpisode(row),
        content: this.formatSeries(row, 'series_')
      };
    } catch (error) {
      console.error('Error fetching episode by ID:', error);
      throw error;
    }
  }

  // Get video sources for an episode
  async getVideoSources(episodeId) {
    const query = `
      SELECT *
      FROM video_sources
      WHERE episode_id = $1 AND is_active = true
      ORDER BY quality DESC, source_type
    `;

    try {
      const result = await this.pool.query(query, [episodeId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching video sources:', error);
      throw error;
    }
  }

  // Format series data
  formatSeries(row, prefix = '') {
    return {
      id: row[`${prefix}id`] || row.id,
      title: row[`${prefix}title`] || row.title,
      originalTitle: row[`${prefix}original_title`] || row.original_title,
      description: row[`${prefix}description`] || row.description,
      longDescription: row[`${prefix}long_description`] || row.long_description,
      year: row[`${prefix}year`] || row.year,
      rating: row[`${prefix}rating`] || row.rating,
      studio: row[`${prefix}studio`] || row.studio,
      status: row[`${prefix}status`] || row.status,
      type: row[`${prefix}content_type`] || row.content_type,
      genres: row[`${prefix}genres`] || row.genres || [],
      totalEpisodes: row[`${prefix}total_episodes`] || row.total_episodes || 0,
      totalSeasons: row[`${prefix}total_seasons`] || row.total_seasons || 0,
      episodeDuration: row[`${prefix}episode_duration`] || row.episode_duration,
      imdbRating: row[`${prefix}imdb_rating`] || row.imdb_rating,
      malId: row[`${prefix}mal_id`] || row.mal_id,
      imdbId: row[`${prefix}imdb_id`] || row.imdb_id,
      poster: row[`${prefix}poster_url`] || row.poster_url,
      banner: row[`${prefix}banner_url`] || row.banner_url,
      backdrop: row[`${prefix}backdrop_url`] || row.backdrop_url,
      thumbnail: row[`${prefix}thumbnail_url`] || row.thumbnail_url,
      trailer: row[`${prefix}trailer_url`] || row.trailer_url,
      featured: row[`${prefix}featured`] || row.featured || false,
      categories: row.category_names || [],
      episodes: row.episode_count || 0
    };
  }

  // Format episode data
  formatEpisode(row) {
    // Build video URLs from database video file IDs
    const videoSources = {};
    let primaryVideoUrl = null;
    
    if (row.video_file_id_sub) {
      videoSources.sub = `/api/stream/video/${row.video_file_id_sub}`;
      primaryVideoUrl = videoSources.sub;
    }
    if (row.video_file_id_dub) {
      videoSources.dub = `/api/stream/video/${row.video_file_id_dub}`;
      if (!primaryVideoUrl) primaryVideoUrl = videoSources.dub;
    }
    
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      synopsis: row.synopsis,
      duration: row.duration,
      season: row.season_number,
      episode: row.episode_number,
      airDate: row.air_date,
      thumbnail: row.thumbnail_url,
      
      // Video URLs - use streaming endpoints for database-stored videos
      videoUrl: primaryVideoUrl,
      videoSources: Object.keys(videoSources).length > 0 ? videoSources : {
        sub: row.video_url_sub,
        dub: row.video_url_dub
      },
      
      // Metadata
      director: row.director,
      writer: row.writer,
      rating: row.rating,
      voteCount: row.vote_count,
      
      // Flags
      hasSubtitles: row.has_subtitles || !!row.video_file_id_sub,
      hasDub: row.has_dub || !!row.video_file_id_dub,
      defaultLanguage: row.default_language || 'sub'
    };
  }

  // Format the complete content response for the API
  formatContentResponse(rows, episodesBySeries = {}) {
    const result = {
      featured: null,
      categories: {
        trending: [],
        action: [],
        drama: [],
        romance: [],
        comedy: [],
        sci_fi: [],
        horror: [],
        movies: []
      }
    };

    rows.forEach(row => {
      const series = this.formatSeries(row);
      
      // Add episodes/seasons to series
      if (episodesBySeries[series.id]) {
        series.seasons = episodesBySeries[series.id];
      }
      
      // Set featured content
      if (series.featured && !result.featured) {
        result.featured = series;
      }

      // Add to appropriate categories
      if (row.category_names) {
        row.category_names.forEach(categoryName => {
          if (result.categories[categoryName]) {
            result.categories[categoryName].push(series);
          }
        });
      }
    });

    return result;
  }

  // Close database connection
  async close() {
    await this.pool.end();
  }
}

module.exports = DatabaseService;