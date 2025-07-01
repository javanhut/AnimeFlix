import React, { useState, useEffect } from 'react';
import EpisodeModal from './EpisodeModal';
import './NewThisSeason.css';

// Anime season helpers
const ANIME_SEASONS = {
  'Spring': { months: [3, 4, 5], order: 1 },
  'Summer': { months: [6, 7, 8], order: 2 },
  'Fall': { months: [9, 10, 11], order: 3 },
  'Winter': { months: [12, 1, 2], order: 4 }
};

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  for (const [season, data] of Object.entries(ANIME_SEASONS)) {
    if (data.months.includes(month)) {
      return season;
    }
  }
  return 'Spring'; // fallback
};

const getCurrentYear = () => new Date().getFullYear();

const getSeasonFromMonth = (month) => {
  for (const [season, data] of Object.entries(ANIME_SEASONS)) {
    if (data.months.includes(month)) {
      return season;
    }
  }
  return 'Spring';
};

const NewThisSeason = () => {
  const [allContent, setAllContent] = useState([]);
  const [organizedContent, setOrganizedContent] = useState({});
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSeason] = useState(getCurrentSeason());
  const [currentYear] = useState(getCurrentYear());

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/videos`)
      .then(response => response.json())
      .then(data => {
        // Extract all content
        const allItems = [];
        
        // Add featured content
        if (data.featured) {
          allItems.push(data.featured);
        }
        
        // Add content from all categories
        if (data.categories) {
          Object.values(data.categories).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              categoryItems.forEach(item => {
                if (!allItems.some(existing => existing.id === item.id)) {
                  allItems.push(item);
                }
              });
            }
          });
        }

        // Process content and organize by year/season
        const processedContent = allItems.map(item => {
          // Extract year and season from various possible fields
          let year = item.year || item.releaseYear || currentYear;
          let airDate = item.airDate || item.releaseDate;
          let season = item.season;

          // If no season specified, try to derive from airDate or use current
          if (!season && airDate) {
            const date = new Date(airDate);
            const month = date.getMonth() + 1;
            season = getSeasonFromMonth(month);
            year = date.getFullYear();
          } else if (!season) {
            // For content without specific season data, distribute across seasons
            // This is a fallback for when we don't have real season data
            const hashCode = item.id.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            const seasons = Object.keys(ANIME_SEASONS);
            season = seasons[Math.abs(hashCode) % seasons.length];
          }

          return {
            ...item,
            year: parseInt(year),
            season,
            sortKey: `${year}-${ANIME_SEASONS[season]?.order || 1}`
          };
        });

        // Organize content by year and season
        const organized = {};
        const years = new Set();

        processedContent.forEach(item => {
          const { year, season } = item;
          years.add(year);

          if (!organized[year]) {
            organized[year] = {};
          }
          if (!organized[year][season]) {
            organized[year][season] = [];
          }
          organized[year][season].push(item);
        });

        // Sort years in descending order
        const sortedYears = Array.from(years).sort((a, b) => b - a);

        setAllContent(processedContent);
        setOrganizedContent(organized);
        setAvailableYears(sortedYears);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching content:', error);
        setLoading(false);
      });
  }, [currentYear]);

  const handleContentClick = (item) => {
    setSelectedContent(item);
    setShowModal(true);
  };

  const getFilteredContent = () => {
    let filtered = { ...organizedContent };

    // Filter by year
    if (selectedYear !== 'all') {
      filtered = { [selectedYear]: organizedContent[selectedYear] || {} };
    }

    // Filter by season
    if (selectedSeason !== 'all') {
      const newFiltered = {};
      Object.keys(filtered).forEach(year => {
        if (filtered[year][selectedSeason]) {
          newFiltered[year] = { [selectedSeason]: filtered[year][selectedSeason] };
        }
      });
      filtered = newFiltered;
    }

    return filtered;
  };

  const getSortedSeasons = (yearData) => {
    return Object.keys(yearData).sort((a, b) => {
      return (ANIME_SEASONS[a]?.order || 0) - (ANIME_SEASONS[b]?.order || 0);
    });
  };

  const isCurrentSeason = (year, season) => {
    return year === currentYear && season === currentSeason;
  };

  if (loading) {
    return <div className="loading-screen">Loading seasonal anime...</div>;
  }

  const filteredContent = getFilteredContent();

  return (
    <div className="new-season-container">
      <div className="season-header">
        <h1>New This Season</h1>
        <p>Discover the latest anime organized by season and year</p>
        <div className="current-season-badge">
          <i className="fas fa-calendar-alt"></i>
          Current: {currentSeason} {currentYear}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="season-filters">
        <div className="filter-group">
          <label htmlFor="year-filter">
            <i className="fas fa-calendar"></i>
            Year:
          </label>
          <select 
            id="year-filter"
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="season-filter">
            <i className="fas fa-leaf"></i>
            Season:
          </label>
          <select 
            id="season-filter"
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Seasons</option>
            {Object.keys(ANIME_SEASONS).map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {(selectedYear !== 'all' || selectedSeason !== 'all') && (
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setSelectedYear('all');
              setSelectedSeason('all');
            }}
          >
            <i className="fas fa-times"></i>
            Clear Filters
          </button>
        )}
      </div>

      {/* Content by Year and Season */}
      <div className="seasonal-content">
        {Object.keys(filteredContent).length === 0 ? (
          <div className="no-content">
            <i className="fas fa-calendar-times"></i>
            <h3>No content found</h3>
            <p>Try adjusting your filters or check back later for new releases</p>
          </div>
        ) : (
          // Sort years (current year first, then descending)
          Object.keys(filteredContent)
            .sort((a, b) => {
              const yearA = parseInt(a);
              const yearB = parseInt(b);
              if (yearA === currentYear) return -1;
              if (yearB === currentYear) return 1;
              return yearB - yearA;
            })
            .map(year => (
              <div key={year} className="year-section">
                <h2 className="year-title">
                  {year}
                  {parseInt(year) === currentYear && (
                    <span className="current-year-badge">Current</span>
                  )}
                </h2>
                
                {getSortedSeasons(filteredContent[year]).map(season => (
                  <div key={`${year}-${season}`} className="season-section">
                    <h3 className="season-title">
                      <i className={`fas ${
                        season === 'Spring' ? 'fa-seedling' :
                        season === 'Summer' ? 'fa-sun' :
                        season === 'Fall' ? 'fa-leaf' : 'fa-snowflake'
                      }`}></i>
                      {season} {year}
                      {isCurrentSeason(parseInt(year), season) && (
                        <span className="current-season-indicator">● CURRENT</span>
                      )}
                      <span className="content-count">
                        ({filteredContent[year][season].length} {filteredContent[year][season].length === 1 ? 'show' : 'shows'})
                      </span>
                    </h3>
                    
                    <div className="content-grid">
                      {filteredContent[year][season].map(item => (
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
                                <h4>{item.title}</h4>
                                <div className="card-meta">
                                  <span>{item.year}</span>
                                  <span>{item.type === 'movie' || item.episodes === 1 ? item.rating : `${item.episodes} episodes`}</span>
                                </div>
                                <div className="card-season-info">
                                  <span className="season-badge">{season} {year}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
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

export default NewThisSeason;