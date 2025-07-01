import React, { useState, useEffect } from 'react';
import EpisodeModal from './EpisodeModal';
import './Trending.css';

const Trending = () => {
  const [trendingData, setTrendingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    // Placeholder for trending analytics
    // For now, we'll show sample data
    setTimeout(() => {
      const placeholderData = {
        today: {
          title: "Trending Today",
          description: "Most watched content in the last 24 hours",
          items: []
        },
        week: {
          title: "This Week",
          description: "Popular content from the past 7 days",
          items: []
        },
        month: {
          title: "This Month",
          description: "Top performing content this month",
          items: []
        },
        allTime: {
          title: "All Time Popular",
          description: "Most popular content on AnimeFlix",
          items: []
        }
      };
      
      setTrendingData(placeholderData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleContentClick = (item) => {
    setSelectedContent(item);
    setShowModal(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="trending-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Analyzing trending data...</p>
        </div>
      </div>
    );
  }

  const currentData = trendingData[activeTab];

  return (
    <div className="trending-container">
      <div className="trending-header">
        <h1>Trending</h1>
        <p>Discover what's popular on AnimeFlix</p>
      </div>

      <div className="trending-tabs">
        <button 
          className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => handleTabChange('today')}
        >
          <i className="fas fa-fire"></i>
          Today
        </button>
        <button 
          className={`tab-button ${activeTab === 'week' ? 'active' : ''}`}
          onClick={() => handleTabChange('week')}
        >
          <i className="fas fa-chart-line"></i>
          This Week
        </button>
        <button 
          className={`tab-button ${activeTab === 'month' ? 'active' : ''}`}
          onClick={() => handleTabChange('month')}
        >
          <i className="fas fa-calendar-alt"></i>
          This Month
        </button>
        <button 
          className={`tab-button ${activeTab === 'allTime' ? 'active' : ''}`}
          onClick={() => handleTabChange('allTime')}
        >
          <i className="fas fa-trophy"></i>
          All Time
        </button>
      </div>

      <div className="trending-content">
        <div className="trending-section">
          <div className="section-header">
            <h2 className="section-title">{currentData?.title}</h2>
            <p className="section-description">{currentData?.description}</p>
          </div>
          
          <div className="trending-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>Analytics Dashboard Coming Soon</h3>
              <p>We're building comprehensive trending analytics to show you the most popular content across different time periods.</p>
              
              <div className="analytics-preview">
                <div className="metric-card">
                  <div className="metric-icon">
                    <i className="fas fa-eye"></i>
                  </div>
                  <div className="metric-info">
                    <h4>View Analytics</h4>
                    <p>Track content popularity by views</p>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="metric-info">
                    <h4>Watch Time</h4>
                    <p>Analyze total viewing duration</p>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="metric-info">
                    <h4>User Engagement</h4>
                    <p>Monitor user interaction metrics</p>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="metric-info">
                    <h4>Ratings</h4>
                    <p>Track content ratings and feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EpisodeModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        content={selectedContent}
      />
    </div>
  );
};

export default Trending;