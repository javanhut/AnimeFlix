import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ShowDetails.css';
import { getContentById, contentDatabase } from '../data/contentDatabase';

const ShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showData, setShowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isInList, setIsInList] = useState(false);


  useEffect(() => {
    // Simulate API call
    const fetchShowData = async () => {
      setLoading(true);
      try {
        // Use the content database
        setTimeout(() => {
          const content = getContentById(id);
          if (content) {
            // Convert to the format expected by the component
            const showData = {
              ...content,
              // Generate seasons and episodes data for series
              seasons: content.type === 'series' ? generateSeasonsData(content) : [],
              cast: generateCastData(content),
              relatedShows: generateRelatedShows(content)
            };
            setShowData(showData);
          } else {
            setShowData(null);
          }
          setLoading(false);
        }, 300);

        // For production API, replace the above with:
        // const response = await fetch(`${process.env.REACT_APP_API_URL}/api/shows/${id}`);
        // const data = await response.json();
        // setShowData(data);
        // setLoading(false);
      } catch (error) {
        console.error('Error fetching show data:', error);
        setLoading(false);
      }
    };

    fetchShowData();
  }, [id]);

  // Helper function to generate seasons data
  const generateSeasonsData = (content) => {
    if (content.type !== 'series') return [];
    
    const seasons = [];
    const seasonsCount = content.seasons || 1;
    const totalEpisodes = content.episodes || 12;
    const episodesPerSeason = Math.ceil(totalEpisodes / seasonsCount);
    
    for (let i = 1; i <= seasonsCount; i++) {
      const episodeCount = i === seasonsCount ? 
        totalEpisodes - (episodesPerSeason * (i - 1)) : 
        episodesPerSeason;
      
      seasons.push({
        number: i,
        title: `Season ${i}`,
        year: content.year + (i - 1),
        episodes: episodeCount,
        episodeList: Array.from({length: episodeCount}, (_, j) => ({
          id: `s${i}e${j+1}`,
          number: j + 1,
          title: `Episode ${j + 1}`,
          description: `Episode ${j + 1} of ${content.title}`,
          duration: content.duration,
          thumbnail: content.thumbnail,
          airDate: new Date(content.year + (i - 1), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
        }))
      });
    }
    
    return seasons;
  };

  // Helper function to generate cast data
  const generateCastData = (content) => {
    const castDatabase = {
      'demon-slayer': [
        { name: "Tanjiro Kamado", actor: "Natsuki Hanae" },
        { name: "Nezuko Kamado", actor: "Satomi Sato" },
        { name: "Zenitsu Agatsuma", actor: "Hiro Shimono" },
        { name: "Inosuke Hashibira", actor: "Matsuoka Yoshitsugu" }
      ],
      'attack-on-titan': [
        { name: "Eren Yeager", actor: "Romi Park" },
        { name: "Mikasa Ackerman", actor: "Marina Inoue" },
        { name: "Armin Arlert", actor: "Inoue Marina" }
      ],
      'jujutsu-kaisen': [
        { name: "Yuji Itadori", actor: "Junya Enoki" },
        { name: "Megumi Fushiguro", actor: "Yuma Uchida" },
        { name: "Nobara Kugisaki", actor: "Asami Seto" },
        { name: "Satoru Gojo", actor: "Yuichi Nakamura" }
      ]
    };
    
    return castDatabase[content.id] || [];
  };

  // Helper function to generate related shows
  const generateRelatedShows = (content) => {
    try {
      const allContent = Object.values(contentDatabase);
      
      // Find shows with similar genres
      return allContent
        .filter(item => 
          item.id !== content.id && 
          item.genres && content.genres &&
          item.genres.some(genre => content.genres.includes(genre))
        )
        .slice(0, 4)
        .map(item => ({
          id: item.id,
          title: item.title,
          poster: item.poster
        }));
    } catch (error) {
      console.error('Error generating related shows:', error);
      return [];
    }
  };

  useEffect(() => {
    // Check if show is in user's list
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    setIsInList(myList.some(item => item.id === id));
  }, [id]);

  const handleListToggle = () => {
    const myList = JSON.parse(localStorage.getItem('myList') || '[]');
    if (isInList) {
      const updatedList = myList.filter(item => item.id !== id);
      localStorage.setItem('myList', JSON.stringify(updatedList));
      setIsInList(false);
    } else {
      const showForList = {
        id: showData.id,
        title: showData.title,
        poster: showData.poster,
        year: showData.year,
        genre: showData.genres
      };
      const updatedList = [...myList, showForList];
      localStorage.setItem('myList', JSON.stringify(updatedList));
      setIsInList(true);
    }
  };

  const handleEpisodeClick = (episode) => {
    // Create proper video data structure with language sources
    const episodeWithSources = {
      ...episode,
      videoSources: {
        sub: `https://example.com/videos/${id}/sub/${episode.id}.mp4`,
        dub: `https://example.com/videos/${id}/dub/${episode.id}.mp4`
      },
      hasSubtitles: true,
      hasDub: true,
      defaultLanguage: 'sub'
    };

    navigate(`/watch/${id}/${episode.id}`, {
      state: {
        episode: episodeWithSources,
        content: showData,
        autoPlay: true
      }
    });
  };

  if (loading) {
    return (
      <div className="show-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading show details...</p>
      </div>
    );
  }

  if (!showData) {
    return (
      <div className="show-details-error">
        <h2>Show not found</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Return Home
        </button>
      </div>
    );
  }

  const currentSeason = showData.seasons && showData.seasons.length > 0 
    ? showData.seasons.find(s => s.number === selectedSeason) || showData.seasons[0]
    : null;

  return (
    <div className="show-details">
      {/* Hero Banner */}
      <div className="show-hero" style={{backgroundImage: `url(${showData.banner})`}}>
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="show-poster">
              <img src={showData.poster} alt={showData.title} />
            </div>
            <div className="show-info">
              <h1 className="show-title">{showData.title}</h1>
              {showData.originalTitle && showData.originalTitle !== showData.title && (
                <p className="original-title">{showData.originalTitle}</p>
              )}
              <div className="show-meta">
                <span className="year">{showData.year}</span>
                <span className="rating">{showData.rating}</span>
                <span className="duration">{showData.duration}</span>
                <span className="imdb-rating">
                  <i className="fas fa-star"></i> {showData.imdbRating}
                </span>
              </div>
              <div className="show-genres">
                {showData.genres.map(genre => (
                  <span key={genre} className="genre-tag">{genre}</span>
                ))}
              </div>
              <p className="show-description">{showData.description}</p>
              <div className="show-actions">
                <button 
                  className="btn btn-play"
                  onClick={() => {
                    if (showData.type === 'series' && showData.seasons && showData.seasons[0]?.episodeList?.[0]) {
                      // Navigate to first episode
                      handleEpisodeClick(showData.seasons[0].episodeList[0]);
                    } else if (showData.type === 'movie') {
                      // Navigate to movie
                      const movieWithSources = {
                        id: showData.id,
                        title: showData.title,
                        description: showData.description,
                        duration: showData.duration,
                        videoSources: {
                          sub: `https://example.com/videos/${id}/sub/movie.mp4`,
                          dub: `https://example.com/videos/${id}/dub/movie.mp4`
                        },
                        hasSubtitles: true,
                        hasDub: showData.id !== 'spirited-away' && showData.id !== 'princess-mononoke',
                        defaultLanguage: 'sub'
                      };
                      
                      navigate(`/watch/${id}`, {
                        state: {
                          episode: movieWithSources,
                          content: showData,
                          autoPlay: true
                        }
                      });
                    }
                  }}
                >
                  <i className="fas fa-play"></i>
                  Watch Now
                </button>
                <button 
                  className={`btn btn-list ${isInList ? 'in-list' : ''}`}
                  onClick={handleListToggle}
                >
                  <i className={`fas ${isInList ? 'fa-check' : 'fa-plus'}`}></i>
                  {isInList ? 'In List' : 'Add to List'}
                </button>
                <button className="btn btn-trailer">
                  <i className="fas fa-play"></i>
                  Trailer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="show-content">
        {/* Episodes Section - Only show for series with episodes */}
        {showData.type === 'series' && showData.seasons && showData.seasons.length > 0 && (
          <section className="episodes-section">
            <div className="section-header">
              <h2>Episodes</h2>
              {showData.seasons.length > 1 && (
                <div className="season-selector">
                  {showData.seasons.map(season => (
                    <button
                      key={season.number}
                      className={`season-btn ${selectedSeason === season.number ? 'active' : ''}`}
                      onClick={() => setSelectedSeason(season.number)}
                    >
                      {season.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {currentSeason && currentSeason.episodeList && (
              <div className="episodes-grid">
                {currentSeason.episodeList.map(episode => (
                  <div 
                    key={episode.id} 
                    className="episode-card"
                    onClick={() => handleEpisodeClick(episode)}
                  >
                    <div className="episode-thumbnail">
                      <img src={episode.thumbnail} alt={episode.title} />
                      <div className="episode-overlay">
                        <i className="fas fa-play"></i>
                      </div>
                      <span className="episode-duration">{episode.duration}</span>
                    </div>
                    <div className="episode-info">
                      <div className="episode-header">
                        <span className="episode-number">{episode.number}</span>
                        <h3 className="episode-title">{episode.title}</h3>
                      </div>
                      <p className="episode-description">{episode.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Details Section */}
        <section className="details-section">
          <h2>About {showData.title}</h2>
          <p className="long-description">{showData.longDescription}</p>
          
          <div className="details-grid">
            <div className="detail-item">
              <h4>Status</h4>
              <p>{showData.status}</p>
            </div>
            <div className="detail-item">
              <h4>Studio</h4>
              <p>{showData.studio}</p>
            </div>
            <div className="detail-item">
              <h4>Source</h4>
              <p>{showData.source}</p>
            </div>
            <div className="detail-item">
              <h4>{showData.type === 'series' ? 'Seasons' : 'Runtime'}</h4>
              <p>{showData.type === 'series' ? (showData.seasons ? showData.seasons.length : 1) : showData.duration}</p>
            </div>
          </div>

          {showData.cast && showData.cast.length > 0 && (
            <div className="cast-section">
              <h3>Voice Cast</h3>
              <div className="cast-list">
                {showData.cast.map((member, index) => (
                  <div key={index} className="cast-member">
                    <span className="character-name">{member.name}</span>
                    <span className="actor-name">{member.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Related Shows */}
        {showData.relatedShows && showData.relatedShows.length > 0 && (
          <section className="related-section">
            <h2>More Like This</h2>
            <div className="related-grid">
              {showData.relatedShows.map(show => (
                <div 
                  key={show.id} 
                  className="related-card"
                  onClick={() => navigate(`/show/${show.id}`)}
                >
                  <img src={show.poster} alt={show.title} />
                  <h3>{show.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ShowDetails;