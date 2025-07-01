import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import ProfileModal from './ProfileModal';
import { searchContent } from '../data/contentDatabase';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face');
  const location = useLocation();
  const isWatchPage = location.pathname.startsWith('/watch/');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    if (!isWatchPage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isWatchPage]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        try {
          // Use the comprehensive search function
          const results = searchContent(searchQuery);
          
          // Format results for display and limit to 8 results
          const formattedResults = results.slice(0, 8).map(content => ({
            id: content.id,
            title: content.title,
            year: content.year,
            genre: content.genres,
            thumbnail: content.thumbnail,
            type: content.type
          }));

          setSearchResults(formattedResults);

          // For production API, replace the above with:
          // const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/search?q=${encodeURIComponent(searchQuery)}`);
          // const data = await response.json();
          // setSearchResults(data.results.slice(0, 8));
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      }, 200);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail.avatar) {
        setUserAvatar(event.detail.avatar);
      }
    };

    // Load saved avatar on mount
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      if (profile.avatar) {
        setUserAvatar(profile.avatar);
      }
    }

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className={`netflix-navbar ${isScrolled || isWatchPage ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            AnimeFlix
          </Link>
          
          <ul className="navbar-menu">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/trending" className="nav-link">Trending</Link></li>
            <li><Link to="/new-this-season" className="nav-link">New This Season</Link></li>
            <li><Link to="/genres" className="nav-link">Genres</Link></li>
            <li><Link to="/movies" className="nav-link">Movies</Link></li>
            <li><Link to="/series" className="nav-link">Series</Link></li>
            <li><Link to="/recommended" className="nav-link">Recommended For You</Link></li>
            <li><Link to="/my-list" className="nav-link">My List</Link></li>
          </ul>
        </div>
        
        <div className="navbar-right">
          <div className="search-container">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className={`search-input-container ${showSearch ? 'active' : ''}`}>
                <button type="button" onClick={() => setShowSearch(!showSearch)} className="search-icon">
                  <i className="fas fa-search"></i>
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                  placeholder="Search titles..."
                  className="search-input"
                />
              </div>
            </form>
            
            {searchResults.length > 0 && showSearch && (
              <div className="search-dropdown">
                {searchResults.map(result => (
                  <Link
                    key={result.id}
                    to={`/show/${result.id}`}
                    className="search-result"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                  >
                    <img src={result.thumbnail} alt={result.title} className="result-thumbnail" />
                    <div className="result-info">
                      <h4>{result.title}</h4>
                      <p>{result.year} • {result.genre?.join(', ')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <div className="navbar-profile">
            <div className="profile-dropdown">
              <img 
                src={userAvatar} 
                alt="Profile" 
                className="profile-avatar"
                onClick={() => setShowProfileModal(true)}
              />
              <div className="dropdown-content">
                <a href="#" onClick={(e) => { e.preventDefault(); setShowProfileModal(true); }}>Profile</a>
                <Link to="/settings">Settings</Link>
                <Link to="/logout">Sign Out</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </nav>
  );
};

export default Navbar;