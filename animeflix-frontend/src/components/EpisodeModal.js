import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EpisodeModal.css';

const EpisodeModal = ({ isOpen, onClose, content }) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [viewMode, setViewMode] = useState('seasons'); // 'seasons' or 'release'
  const [sortedEpisodes, setSortedEpisodes] = useState([]);
  const [watchProgress, setWatchProgress] = useState({});
  const [isInList, setIsInList] = useState(false);
  const navigate = useNavigate();

  // Load watch progress from localStorage
  useEffect(() => {
    if (content) {
      const savedProgress = localStorage.getItem(`watch_progress_${content.id}`);
      if (savedProgress) {
        setWatchProgress(JSON.parse(savedProgress));
      }
    }
  }, [content]);

  // Check if content is in My List
  useEffect(() => {
    if (content) {
      const myList = JSON.parse(localStorage.getItem('myList') || '[]');
      setIsInList(myList.some(item => item.id === content.id));
    }
  }, [content]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (content && content.seasons) {
      if (viewMode === 'seasons') {
        setEpisodes(content.seasons[selectedSeason] || []);
      } else if (viewMode === 'release') {
        // Flatten all episodes and sort by air date or season/episode number
        const allEpisodes = [];
        Object.keys(content.seasons).forEach(seasonKey => {
          content.seasons[seasonKey].forEach(episode => {
            allEpisodes.push({
              ...episode,
              seasonNumber: parseInt(seasonKey)
            });
          });
        });
        
        // Sort by season and episode number (chronological release order)
        allEpisodes.sort((a, b) => {
          if (a.seasonNumber !== b.seasonNumber) {
            return a.seasonNumber - b.seasonNumber;
          }
          return a.episode - b.episode;
        });
        
        setSortedEpisodes(allEpisodes);
        setEpisodes(allEpisodes);
      }
    } else if (content && content.type === 'movie') {
      // For movies, create a single "episode" entry
      const movieEpisode = [{
        id: content.id,
        title: content.title,
        description: content.description,
        thumbnail: content.thumbnail,
        duration: content.duration,
        videoUrl: content.videoUrl
      }];
      setEpisodes(movieEpisode);
    } else {
      setEpisodes([]);
    }
  }, [content, selectedSeason, viewMode]);

  const handleEpisodeSelect = (episode) => {
    // Navigate to player with episode data
    navigate(`/watch/${content.id}/${episode.id}`, {
      state: { episode, content, autoPlay: true }
    });
    onClose();
  };

  const handlePlayFromStart = () => {
    // For movies, handle directly
    if (isMovie) {
      const movieEpisode = {
        id: content.id,
        title: content.title,
        description: content.description,
        thumbnail: content.thumbnail,
        duration: content.duration,
        videoUrl: content.videoUrl
      };
      handleEpisodeSelect(movieEpisode);
      return;
    }

    // For series
    if (episodes.length > 0) {
      // Find the last watched episode or start from the first
      const lastWatchedEpisodeId = hasWatchProgress ? Object.keys(watchProgress).reduce((latest, episodeId) => {
        if (!latest || watchProgress[episodeId].timestamp > watchProgress[latest].timestamp) {
          return episodeId;
        }
        return latest;
      }, null) : null;

      if (lastWatchedEpisodeId && watchProgress[lastWatchedEpisodeId].progress < 0.9) {
        // Resume from last watched episode if not completed
        const resumeEpisode = findEpisodeById(lastWatchedEpisodeId);
        if (resumeEpisode) {
          handleEpisodeSelect(resumeEpisode);
          return;
        }
      }
      
      // Default to first episode
      handleEpisodeSelect(episodes[0]);
    } else if (content && content.seasons) {
      // Fallback: find first episode from seasons
      const firstSeason = Object.keys(content.seasons)[0];
      if (firstSeason && content.seasons[firstSeason].length > 0) {
        handleEpisodeSelect(content.seasons[firstSeason][0]);
      }
    }
  };

  const findEpisodeById = (episodeId) => {
    if (content && content.seasons) {
      for (const seasonKey in content.seasons) {
        const episode = content.seasons[seasonKey].find(ep => ep.id === episodeId);
        if (episode) return episode;
      }
    }
    return null;
  };

  const handleListToggle = () => {
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    
    if (isInList) {
      // Remove from list
      const updatedList = myList.filter(item => item.id !== content.id);
      localStorage.setItem('myList', JSON.stringify(updatedList));
      setIsInList(false);
    } else {
      // Add to list
      const updatedList = [...myList, content];
      localStorage.setItem('myList', JSON.stringify(updatedList));
      setIsInList(true);
    }
  };

  if (!isOpen || !content) return null;

  const isMovie = content.type === 'movie' || content.episodes === 1;
  const totalSeasons = content.seasons ? Object.keys(content.seasons).length : 1;
  
  // Determine if we should show "Resume" or "Play"
  const hasWatchProgress = Object.keys(watchProgress).length > 0;
  const lastWatchedEpisodeId = hasWatchProgress ? Object.keys(watchProgress).reduce((latest, episodeId) => {
    if (!latest || watchProgress[episodeId].timestamp > watchProgress[latest].timestamp) {
      return episodeId;
    }
    return latest;
  }, null) : null;
  const shouldShowResume = hasWatchProgress && lastWatchedEpisodeId && watchProgress[lastWatchedEpisodeId].progress < 0.9;

  console.log('DEBUG - Modal render:', {
    isOpen,
    content: !!content,
    contentTitle: content?.title,
    isMovie,
    episodesLength: episodes.length,
    hasSeasons: !!(content && content.seasons),
    shouldShowResume
  });

  return (
    <div className="episode-modal-overlay" onClick={onClose}>
      <div className="episode-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        {/* Banner Section */}
        <div className="modal-banner">
          <div className="banner-image-container">
            <img 
              src={content.backdrop || content.thumbnail} 
              alt={content.title}
              className="banner-image"
            />
            <div className="banner-top-hover">
              <div className="banner-info">
                <h3>Release Date</h3>
                <p className="release-date">{content.releaseDate || content.year || 'Unknown'}</p>
                <h3>Description</h3>
                <p className="banner-description">{content.description}</p>
              </div>
            </div>
            <div className="banner-bottom-hover">
              <div className="modal-content-info">
                <h1 className="modal-title">{content.title}</h1>
                <div className="modal-meta">
                  <span className="rating">{content.rating}</span>
                  <span className="year">{content.year}</span>
                  <span className="type">{isMovie ? 'Movie' : `${content.episodes} Episodes`}</span>
                </div>
                <p className="modal-description">{content.description}</p>
                <div className="modal-genres">
                  {(content.genres || content.genre || []).map(genre => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-episodes">
          {!isMovie && (
            <div className="episodes-header">
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${viewMode === 'seasons' ? 'active' : ''}`}
                  onClick={() => setViewMode('seasons')}
                >
                  <i className="fas fa-list"></i>
                  By Season
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'release' ? 'active' : ''}`}
                  onClick={() => setViewMode('release')}
                >
                  <i className="fas fa-calendar-alt"></i>
                  Release Order
                </button>
              </div>
              
              <div className="header-controls">
                <button className="btn-play-episodes" onClick={handleListToggle}>
                  <i className={`fas ${isInList ? 'fa-check' : 'fa-plus'}`}></i>
                  <span>{isInList ? 'In My List' : 'Add to List'}</span>
                </button>
                {viewMode === 'seasons' && totalSeasons > 1 && (
                  <div className="season-selector">
                    <label htmlFor="season-select">Season:</label>
                    <select 
                      id="season-select"
                      value={selectedSeason} 
                      onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                      className="season-dropdown"
                    >
                      {Array.from({length: totalSeasons}, (_, i) => (
                        <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                      ))}
                    </select>
                  </div>
                )}
                <button className="btn-play-episodes" onClick={handlePlayFromStart}>
                  <i className="fas fa-play"></i>
                  {shouldShowResume ? 'Resume' : 'Play'}
                </button>
              </div>
            </div>
          )}
          
          <div className="episodes-list">
            <div className="episodes-list-header">
              <h3>
                {isMovie 
                  ? 'Movie Details' 
                  : viewMode === 'seasons' 
                    ? `Season ${selectedSeason} Episodes`
                    : `All Episodes (${content.episodes} total)`
                }
              </h3>
              {isMovie && (
                <button className="btn-play-episodes" onClick={handlePlayFromStart}>
                  <i className="fas fa-play"></i>
                  Play Movie
                </button>
              )}
            </div>
            <div className="episodes-grid">
              {episodes.map((episode, index) => (
                <div 
                  key={episode.id || index} 
                  className="episode-card"
                  onClick={() => handleEpisodeSelect(episode)}
                >
                  <div className="episode-thumbnail">
                    <img 
                      src={episode.thumbnail || content.thumbnail} 
                      alt={episode.title}
                      onError={(e) => {
                        e.target.src = content.thumbnail;
                      }}
                    />
                    <div className="episode-play-overlay">
                      <i className="fas fa-play"></i>
                    </div>
                  </div>
                  
                  <div className="episode-info">
                    <div className="episode-header">
                      <span className="episode-number">
                        {isMovie 
                          ? '' 
                          : viewMode === 'release' 
                            ? `S${episode.seasonNumber}E${episode.episode}` 
                            : `${index + 1}.`
                        }
                      </span>
                      <h4 className="episode-title">{episode.title}</h4>
                      <span className="episode-duration">{episode.duration || content.duration}</span>
                    </div>
                    <p className="episode-description">{episode.description || content.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeModal;