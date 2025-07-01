import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Player from './Player';
import './Watch.css';
import { getWatchData } from '../data/contentDatabase';

const Watch = () => {
  const { id, episodeId } = useParams();
  const location = useLocation();
  const [video, setVideo] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const playerRef = useRef(null);
  const progressUpdateInterval = useRef(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        
        // Check if episode data was passed via navigation state
        if (location.state && location.state.episode && location.state.content) {
          const { episode, content, autoPlay: shouldAutoPlay } = location.state;
          setVideo(content);
          setCurrentEpisode(episode);
          setAutoPlay(shouldAutoPlay || true);
          
          // Get related videos
          const allContentResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/videos`);
          const allContent = await allContentResponse.json();
          
          const related = [];
          if (allContent.categories) {
            for (const categoryKey in allContent.categories) {
              const categoryVideos = allContent.categories[categoryKey]
                .filter(v => v.id !== id)
                .slice(0, 3);
              related.push(...categoryVideos);
            }
          }
          setRelatedVideos(related.slice(0, 6));
        } else {
          // Use our content database
          const watchData = getWatchData(id, episodeId);
          
          if (watchData) {
            setVideo(watchData.content);
            setCurrentEpisode(watchData.episode);
            
            // Mock related videos for now
            const mockRelated = [
              {
                id: 'attack-on-titan',
                title: 'Attack on Titan',
                thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=170&fit=crop',
                rating: 'TV-MA',
                year: 2013,
                description: 'Humanity fights for survival against giant humanoid Titans.'
              },
              {
                id: 'jujutsu-kaisen',
                title: 'Jujutsu Kaisen',
                thumbnail: 'https://images.unsplash.com/photo-1621570180008-b9e7c4d2cd35?w=300&h=170&fit=crop',
                rating: 'TV-14',
                year: 2020,
                description: 'A boy becomes cursed after swallowing a demon finger.'
              }
            ];
            setRelatedVideos(mockRelated);
          } else {
            throw new Error('Content not found');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, episodeId, location.state]);

  // Track video progress
  useEffect(() => {
    if (video && currentEpisode) {
      progressUpdateInterval.current = setInterval(() => {
        const videoElement = document.querySelector('video');
        if (videoElement && !videoElement.paused && videoElement.duration > 0) {
          const progress = videoElement.currentTime / videoElement.duration;
          const watchData = {
            progress,
            timestamp: Date.now(),
            duration: videoElement.duration,
            currentTime: videoElement.currentTime
          };
          
          // Save progress to localStorage
          const existingProgress = localStorage.getItem(`watch_progress_${video.id}`);
          const progressData = existingProgress ? JSON.parse(existingProgress) : {};
          progressData[currentEpisode.id] = watchData;
          localStorage.setItem(`watch_progress_${video.id}`, JSON.stringify(progressData));
        }
      }, 10000); // Update every 10 seconds

      return () => {
        if (progressUpdateInterval.current) {
          clearInterval(progressUpdateInterval.current);
        }
      };
    }
  }, [video, currentEpisode]);

  // Auto-fullscreen when autoPlay is true
  useEffect(() => {
    if (autoPlay && currentEpisode) {
      // Wait for player to be ready, then trigger fullscreen
      const checkPlayerReady = () => {
        if (playerRef.current) {
          playerRef.current.playAndFullscreen();
        } else {
          // Try again in a bit
          setTimeout(checkPlayerReady, 100);
        }
      };
      
      // Small delay to ensure player component is mounted
      const timer = setTimeout(checkPlayerReady, 300);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, currentEpisode]);

  const handleVideoEnd = () => {
    // Try to find next episode in the same series
    if (video && video.seasons && currentEpisode) {
      let nextEpisode = null;
      let foundCurrent = false;
      
      // Search through all seasons and episodes
      for (const seasonKey in video.seasons) {
        const episodes = video.seasons[seasonKey];
        for (let i = 0; i < episodes.length; i++) {
          if (foundCurrent) {
            nextEpisode = episodes[i];
            break;
          }
          if (episodes[i].id === currentEpisode.id) {
            foundCurrent = true;
            // Check if there's a next episode in the same season
            if (i + 1 < episodes.length) {
              nextEpisode = episodes[i + 1];
              break;
            }
          }
        }
        if (nextEpisode) break;
      }
      
      if (nextEpisode) {
        setCurrentEpisode(nextEpisode);
        setAutoPlay(true);
        return;
      }
    }
    
    // Fallback to related videos
    if (relatedVideos.length > 0) {
      const nextVideo = relatedVideos[0];
      window.location.href = `/watch/${nextVideo.id}`;
    }
  };

  if (loading) {
    return (
      <div className="watch-loading">
        <div className="loading-spinner"></div>
        <p>Loading video...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="watch-error">
        <h2>Video not found</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  if (!video || !currentEpisode) {
    return (
      <div className="watch-error">
        <h2>Video not available</h2>
        <p>Please select an episode from the series page.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="watch-container">
      <div className="video-section">
        <Player 
          video={currentEpisode} 
          onVideoEnd={handleVideoEnd} 
          autoPlay={autoPlay}
          ref={playerRef} 
        />
      </div>
      
      <div className="watch-content">
        <div className="video-info">
          <div className="video-header">
            <h1 className="video-title">{currentEpisode.title}</h1>
            <h2 className="series-title">{video.title}</h2>
            <div className="video-meta">
              <span className="rating">{video.rating}</span>
              <span className="year">{video.year}</span>
              <span className="duration">{currentEpisode.duration}</span>
              {video.episodes && video.episodes > 1 && (
                <span className="episodes">{video.episodes} Episodes</span>
              )}
            </div>
          </div>
          
          <div className="video-description">
            <p>{currentEpisode.description}</p>
          </div>
          
          <div className="video-genres">
            {video.genre && video.genre.map(genre => (
              <span key={genre} className="genre-tag">{genre}</span>
            ))}
          </div>
        </div>
        
        {relatedVideos.length > 0 && (
          <div className="related-section">
            <h2>More Like This</h2>
            <div className="related-grid">
              {relatedVideos.map(relatedVideo => (
                <Link to={`/watch/${relatedVideo.id}`} key={relatedVideo.id} className="related-card">
                  <img src={relatedVideo.thumbnail} alt={relatedVideo.title} className="related-thumbnail" />
                  <div className="related-info">
                    <h3 className="related-title">{relatedVideo.title}</h3>
                    <div className="related-meta">
                      <span className="rating">{relatedVideo.rating}</span>
                      <span className="year">{relatedVideo.year}</span>
                    </div>
                    <p className="related-description">{relatedVideo.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Watch;