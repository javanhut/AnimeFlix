import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EpisodeModal from './EpisodeModal';
import './Home.css';

const Home = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [genreContent, setGenreContent] = useState({});
  const [heroCarousel, setHeroCarousel] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/videos`)
      .then(response => response.json())
      .then(data => {
        setContent(data);
        
        // Extract all content from all categories
        const allContent = [];
        
        // Check featured content
        if (data.featured) {
          allContent.push(data.featured);
        }
        
        // Check all categories for content
        if (data.categories) {
          Object.values(data.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              categoryItems.forEach(item => {
                if (!allContent.some(existing => existing.id === item.id)) {
                  allContent.push(item);
                }
              });
            }
          });
        }
        
        // Group content by genre
        const groupedByGenre = {};
        
        allContent.forEach(item => {
          if (item.genres && item.genres.length > 0) {
            item.genres.forEach(genre => {
              if (!groupedByGenre[genre]) {
                groupedByGenre[genre] = [];
              }
              groupedByGenre[genre].push(item);
            });
          }
        });
        
        setGenreContent(groupedByGenre);
        
        // Create hero carousel from featured and top content
        const heroItems = [];
        
        // Add featured content first
        if (data.featured) {
          heroItems.push(data.featured);
        }
        
        // Add more items from categories for variety
        if (data.categories) {
          Object.values(data.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              categoryItems.slice(0, 3).forEach(item => {
                if (!heroItems.some(existing => existing.id === item.id)) {
                  heroItems.push(item);
                }
              });
            }
          });
        }
        
        // Limit to 8-10 items for hero carousel
        setHeroCarousel(heroItems.slice(0, 10));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching videos:', error);
        setLoading(false);
      });
  }, []);

  // Auto-cycle hero carousel every 10 seconds
  useEffect(() => {
    if (heroCarousel.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex(prevIndex => 
          prevIndex === heroCarousel.length - 1 ? 0 : prevIndex + 1
        );
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    }
  }, [heroCarousel.length]);


  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!content) {
    return <div className="error-screen">Failed to load content</div>;
  }

  const { featured, categories } = content;

  const handleContentClick = (item) => {
    setSelectedContent(item);
    setShowModal(true);
  };

  const nextHero = () => {
    setCurrentHeroIndex(prevIndex => 
      prevIndex === heroCarousel.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevHero = () => {
    setCurrentHeroIndex(prevIndex => 
      prevIndex === 0 ? heroCarousel.length - 1 : prevIndex - 1
    );
  };

  const goToHero = (index) => {
    setCurrentHeroIndex(index);
  };

  const scrollGenreCarousel = (genre, direction) => {
    const container = document.getElementById(`home-${genre.replace(/\s+/g, '-').toLowerCase()}`);
    const scrollAmount = 300;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  const currentHero = heroCarousel[currentHeroIndex] || featured;

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section" style={{backgroundImage: `url(${currentHero.backdrop || currentHero.thumbnail})`}}>
        <div className="hero-content">
          <div className="hero-info">
            <h1 className="hero-title">{currentHero.title}</h1>
            <div className="hero-meta">
              <span className="rating">{currentHero.rating}</span>
              <span className="year">{currentHero.year}</span>
              <span className="episodes">{currentHero.type === 'movie' || currentHero.episodes === 1 ? 'Movie' : `${currentHero.episodes} Episodes`}</span>
            </div>
            <p className="hero-description">{currentHero.description}</p>
            <div className="hero-genres">
              {(currentHero.genres || currentHero.genre || []).map(genre => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>
            <div className="hero-buttons">
              <button 
                className="btn btn-play"
                onClick={() => handleContentClick(currentHero)}
              >
                <i className="fas fa-play"></i> Play
              </button>
              <button 
                className="btn btn-info"
                onClick={() => handleContentClick(currentHero)}
              >
                <i className="fas fa-info-circle"></i> More Info
              </button>
            </div>
          </div>
        </div>
        <div className="hero-gradient"></div>
        
        {/* Hero Carousel Controls */}
        {heroCarousel.length > 1 && (
          <>
            <button className="hero-nav hero-prev" onClick={prevHero}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="hero-nav hero-next" onClick={nextHero}>
              <i className="fas fa-chevron-right"></i>
            </button>
            <div className="hero-indicators">
              {heroCarousel.map((_, index) => (
                <button
                  key={index}
                  className={`hero-indicator ${index === currentHeroIndex ? 'active' : ''}`}
                  onClick={() => goToHero(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Genre Sections */}
      <div className="genre-sections">
        {Object.entries(genreContent).map(([genre, contentList]) => (
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
                id={`home-${genre.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {contentList.map(item => (
                  <div 
                    key={item.id} 
                    className="content-card"
                    onClick={() => handleContentClick(item)}
                  >
                    <div className="card-image">
                      <img src={item.thumbnail} alt={item.title} />
                      <div className="card-overlay">
                        <div className="play-button">
                          <i className="fas fa-play"></i>
                        </div>
                        <div className="card-info-overlay">
                          <h3>{item.title}</h3>
                          <div className="card-meta">
                            <span>{item.year}</span>
                            <span>{item.type === 'movie' || item.episodes === 1 ? item.rating : `${item.episodes} episodes`}</span>
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

export default Home;