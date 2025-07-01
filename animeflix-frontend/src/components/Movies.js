import React, { useState, useEffect } from 'react';
import EpisodeModal from './EpisodeModal';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [genreMovies, setGenreMovies] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/videos`)
      .then(response => response.json())
      .then(data => {
        // Extract all movie content from all categories
        const allMovies = [];
        
        // Check featured content
        if (data.featured && (data.featured.type === 'movie' || data.featured.episodes === 1)) {
          allMovies.push(data.featured);
        }
        
        // Check all categories for movie content
        if (data.categories) {
          Object.values(data.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              categoryItems.forEach(item => {
                // Include if it's explicitly a movie or has only 1 episode
                if (item.type === 'movie' || (item.episodes === 1 && !item.seasons)) {
                  // Avoid duplicates
                  if (!allMovies.some(existing => existing.id === item.id)) {
                    allMovies.push(item);
                  }
                }
              });
            }
          });
        }
        
        setMovies(allMovies);
        
        // Group movies by genre
        const groupedByGenre = {};
        
        allMovies.forEach(movie => {
          if (movie.genres && movie.genres.length > 0) {
            movie.genres.forEach(genre => {
              if (!groupedByGenre[genre]) {
                groupedByGenre[genre] = [];
              }
              groupedByGenre[genre].push(movie);
            });
          }
        });
        
        setGenreMovies(groupedByGenre);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching movies:', error);
        setLoading(false);
      });
  }, []);

  const handleContentClick = (item) => {
    setSelectedContent(item);
    setShowModal(true);
  };

  const scrollGenreCarousel = (genre, direction) => {
    const container = document.getElementById(`movies-${genre.replace(/\s+/g, '-').toLowerCase()}`);
    const scrollAmount = 300;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  if (loading) {
    return (
      <div className="movies-container">
        <div className="loading-screen">Loading movies...</div>
      </div>
    );
  }

  return (
    <div className="movies-container">
      <div className="movies-header">
        <h1>Movies</h1>
        <p>Discover your next favorite film</p>
      </div>

      <div className="genre-sections">
        {Object.entries(genreMovies).map(([genre, movieList]) => (
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
                id={`movies-${genre.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {movieList.map(movie => (
                  <div 
                    key={movie.id} 
                    className="movie-card"
                    onClick={() => handleContentClick(movie)}
                  >
                    <div className="card-image">
                      <img src={movie.thumbnail} alt={movie.title} />
                      <div className="card-overlay">
                        <div className="play-button">
                          <i className="fas fa-play"></i>
                        </div>
                        <div className="card-info-overlay">
                          <h3>{movie.title}</h3>
                          <div className="card-meta">
                            <span>{movie.year}</span>
                            <span>{movie.rating}</span>
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

export default Movies;