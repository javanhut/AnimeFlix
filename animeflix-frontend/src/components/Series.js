import React, { useState, useEffect } from 'react';
import EpisodeModal from './EpisodeModal';
import './Series.css';

const Series = () => {
  const [series, setSeries] = useState([]);
  const [genreSeries, setGenreSeries] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/videos`)
      .then(response => response.json())
      .then(data => {
        // Extract all series content from all categories
        const allSeries = [];
        
        // Check featured content
        if (data.featured && (data.featured.type === 'series' || data.featured.episodes > 1)) {
          allSeries.push(data.featured);
        }
        
        // Check all categories for series content
        if (data.categories) {
          Object.values(data.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              categoryItems.forEach(item => {
                // Include if it's explicitly a series or has multiple episodes
                if (item.type === 'series' || item.episodes > 1 || item.seasons) {
                  // Avoid duplicates
                  if (!allSeries.some(existing => existing.id === item.id)) {
                    allSeries.push(item);
                  }
                }
              });
            }
          });
        }
        
        setSeries(allSeries);
        
        // Group series by genre
        const groupedByGenre = {};
        
        allSeries.forEach(show => {
          if (show.genres && show.genres.length > 0) {
            show.genres.forEach(genre => {
              if (!groupedByGenre[genre]) {
                groupedByGenre[genre] = [];
              }
              groupedByGenre[genre].push(show);
            });
          }
        });
        
        setGenreSeries(groupedByGenre);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching series:', error);
        setLoading(false);
      });
  }, []);

  const handleContentClick = (item) => {
    setSelectedContent(item);
    setShowModal(true);
  };

  const scrollGenreCarousel = (genre, direction) => {
    const container = document.getElementById(`series-${genre.replace(/\s+/g, '-').toLowerCase()}`);
    const scrollAmount = 300;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  if (loading) {
    return (
      <div className="series-container">
        <div className="loading-screen">Loading series...</div>
      </div>
    );
  }

  return (
    <div className="series-container">
      <div className="series-header">
        <h1>Series</h1>
        <p>Binge-watch your favorite shows</p>
      </div>

      <div className="genre-sections">
        {Object.entries(genreSeries).map(([genre, seriesList]) => (
          <div key={genre} className="genre-section">
            <div className="genre-header">
              <h2 className="genre-title">{genre}</h2>
              <div className="genre-carousel-controls">
                <button 
                  className="carousel-btn left"
                  onClick={() => scrollGenreCarousel(genre, 'left')}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button 
                  className="carousel-btn right"
                  onClick={() => scrollGenreCarousel(genre, 'right')}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
            
            <div className="genre-carousel">
              <div 
                className="genre-content-slider" 
                id={`series-${genre.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {seriesList.map(show => (
                  <div 
                    key={show.id} 
                    className="series-card"
                    onClick={() => handleContentClick(show)}
                  >
                    <div className="card-image">
                      <img src={show.thumbnail} alt={show.title} />
                      <div className="card-overlay">
                        <div className="play-button">
                          <i className="fas fa-play"></i>
                        </div>
                        <div className="card-info-overlay">
                          <h3>{show.title}</h3>
                          <div className="card-meta">
                            <span>{show.year}</span>
                            <span>{show.episodes} episodes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <EpisodeModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        content={selectedContent}
      />
    </div>
  );
};

export default Series;