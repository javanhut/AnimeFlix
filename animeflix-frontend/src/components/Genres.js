import React, { useState, useEffect } from 'react';
import EpisodeModal from './EpisodeModal';
import './Genres.css';

// Comprehensive anime genre system
const ANIME_GENRES = {
  "Main Genres": [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", 
    "Romance", "Sci-Fi", "Slice of Life", "Thriller", "Supernatural"
  ],
  "Demographic": [
    "Shounen", "Shoujo", "Seinen", "Josei", "Kodomomuke"
  ],
  "Setting & Time": [
    "Historical", "Modern", "Future", "Post-Apocalyptic", "Medieval", 
    "School", "Workplace", "Military", "Space", "Cyberpunk", "Steampunk"
  ],
  "Themes": [
    "Mecha", "Magic", "Martial Arts", "Sports", "Music", "Cooking", 
    "Gaming", "Idol", "Otaku Culture", "Parody", "Ecchi", "Harem", "Reverse Harem"
  ],
  "Mood & Style": [
    "Dark", "Psychological", "Philosophical", "Emotional", "Lighthearted", 
    "Mature", "Gore", "Violence", "Mind Games", "Tragedy", "Wholesome"
  ],
  "Story Structure": [
    "Tournament", "Battle Royale", "Quest", "Coming of Age", "Revenge", 
    "Survival", "Time Travel", "Parallel Worlds", "Isekai", "Reincarnation"
  ],
  "Art & Animation": [
    "CGI", "Traditional 2D", "Mixed Media", "Experimental", "High Budget", 
    "Indie", "Classic Animation"
  ]
};

const Genres = () => {
  const [allContent, setAllContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState('comprehensive'); // 'content' or 'comprehensive'

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/videos`)
      .then(response => response.json())
      .then(data => {
        // Extract all content from all categories
        const allItems = [];
        const genreSet = new Set();
        
        // Add featured content
        if (data.featured) {
          allItems.push(data.featured);
          if (data.featured.genres) {
            data.featured.genres.forEach(genre => genreSet.add(genre));
          }
        }
        
        // Add content from all categories
        if (data.categories) {
          Object.values(data.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              categoryItems.forEach(item => {
                if (!allItems.some(existing => existing.id === item.id)) {
                  allItems.push(item);
                  if (item.genres) {
                    item.genres.forEach(genre => genreSet.add(genre));
                  }
                }
              });
            }
          });
        }
        
        setAllContent(allItems);
        setFilteredContent(allItems);
        
        // Set available genres based on search mode
        if (searchMode === 'comprehensive') {
          // Use comprehensive anime genre list
          const allGenres = Object.values(ANIME_GENRES).flat();
          setAvailableGenres(allGenres.sort());
        } else {
          // Use only genres from content
          setAvailableGenres(Array.from(genreSet).sort());
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching content:', error);
        setLoading(false);
      });
  }, []);

  // Smart genre matching function
  const matchesGenre = (itemGenres, selectedGenre) => {
    if (!itemGenres || itemGenres.length === 0) return false;
    
    // Direct match
    if (itemGenres.includes(selectedGenre)) return true;
    
    // Smart matching for comprehensive genres
    const itemGenresLower = itemGenres.map(g => g.toLowerCase());
    const selectedLower = selectedGenre.toLowerCase();
    
    // Genre mapping for better matching
    const genreMapping = {
      'shounen': ['action', 'adventure', 'battle', 'fighting'],
      'shoujo': ['romance', 'school', 'drama'],
      'seinen': ['mature', 'psychological', 'adult'],
      'josei': ['romance', 'drama', 'mature'],
      'isekai': ['fantasy', 'adventure', 'magic'],
      'mecha': ['robot', 'sci-fi', 'action'],
      'slice of life': ['daily', 'life', 'school', 'comedy'],
      'ecchi': ['comedy', 'romance', 'harem'],
      'psychological': ['thriller', 'mind', 'dark'],
      'coming of age': ['school', 'drama', 'youth'],
      'supernatural': ['fantasy', 'horror', 'mystery'],
      'cyberpunk': ['sci-fi', 'future', 'technology'],
      'steampunk': ['fantasy', 'historical', 'adventure']
    };
    
    // Check if any item genre matches selected genre or its mappings
    for (const itemGenre of itemGenresLower) {
      if (itemGenre.includes(selectedLower) || selectedLower.includes(itemGenre)) {
        return true;
      }
      
      // Check mappings
      const mappings = genreMapping[selectedLower] || [];
      if (mappings.some(mapping => itemGenre.includes(mapping))) {
        return true;
      }
      
      // Reverse check
      const itemMappings = genreMapping[itemGenre] || [];
      if (itemMappings.some(mapping => selectedLower.includes(mapping))) {
        return true;
      }
    }
    
    return false;
  };

  useEffect(() => {
    if (selectedGenres.length === 0) {
      setFilteredContent(allContent);
    } else {
      const filtered = allContent.filter(item => {
        const itemGenres = item.genres || [];
        
        if (searchMode === 'comprehensive') {
          // Use smart matching for comprehensive mode
          return selectedGenres.every(genre => matchesGenre(itemGenres, genre));
        } else {
          // Use exact matching for content mode
          return selectedGenres.every(genre => itemGenres.includes(genre));
        }
      });
      setFilteredContent(filtered);
    }
  }, [selectedGenres, allContent, searchMode]);

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  const clearAllGenres = () => {
    setSelectedGenres([]);
  };

  const handleContentClick = (item) => {
    setSelectedContent(item);
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading-screen">Loading genres...</div>;
  }

  return (
    <div className="genres-container">
      <div className="genres-header">
        <h1>Browse by Genres</h1>
        <p>Select one or more genres to filter content</p>
      </div>

      {/* Search Mode Toggle */}
      <div className="search-mode-toggle">
        <button 
          className={`mode-btn ${searchMode === 'comprehensive' ? 'active' : ''}`}
          onClick={() => setSearchMode('comprehensive')}
        >
          <i className="fas fa-list-ul"></i>
          Comprehensive Genres
        </button>
        <button 
          className={`mode-btn ${searchMode === 'content' ? 'active' : ''}`}
          onClick={() => setSearchMode('content')}
        >
          <i className="fas fa-filter"></i>
          Available in Library
        </button>
      </div>

      {/* Genre Filter Section */}
      <div className="genre-filters">
        <div className="filter-header">
          <h2>Select Genres</h2>
          {selectedGenres.length > 0 && (
            <button className="clear-filters-btn" onClick={clearAllGenres}>
              Clear All ({selectedGenres.length})
            </button>
          )}
        </div>
        
        {searchMode === 'comprehensive' ? (
          // Categorized genre display
          <div className="genre-categories">
            {Object.entries(ANIME_GENRES).map(([category, genres]) => (
              <div key={category} className="genre-category">
                <h3 className="category-title">{category}</h3>
                <div className="genre-tags">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      className={`genre-filter-tag ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                      {selectedGenres.includes(genre) && <i className="fas fa-check"></i>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Simple genre display
          <div className="genre-tags">
            {availableGenres.map(genre => (
              <button
                key={genre}
                className={`genre-filter-tag ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                onClick={() => toggleGenre(genre)}
              >
                {genre}
                {selectedGenres.includes(genre) && <i className="fas fa-check"></i>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="genre-results">
        <div className="results-header">
          <h2>
            {selectedGenres.length === 0 
              ? `All Content (${filteredContent.length} items)`
              : `Results for ${selectedGenres.join(' + ')} (${filteredContent.length} items)`
            }
          </h2>
        </div>

        {filteredContent.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>No content found</h3>
            <p>Try selecting different genres or clearing your filters</p>
          </div>
        ) : (
          <div className="content-grid">
            {filteredContent.map(item => (
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
                      <div className="card-genres">
                        {(item.genres || []).slice(0, 3).map(genre => (
                          <span key={genre} className="mini-genre-tag">{genre}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <EpisodeModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        content={selectedContent}
      />
    </div>
  );
};

export default Genres;