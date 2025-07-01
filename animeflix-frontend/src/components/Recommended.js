import React, { useState, useEffect } from 'react';
import EpisodeModal from './EpisodeModal';
import './Recommended.css';

const Recommended = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Placeholder for recommendation engine
    // For now, we'll show some sample content
    setTimeout(() => {
      const placeholderContent = [
        {
          id: 'demo_1',
          title: 'Based on Your Viewing History',
          description: 'Content tailored to your preferences',
          items: []
        },
        {
          id: 'demo_2', 
          title: 'Similar to What You Watched',
          description: 'Discover content similar to your recent watches',
          items: []
        },
        {
          id: 'demo_3',
          title: 'Popular in Your Genre',
          description: 'Trending content in genres you love',
          items: []
        },
        {
          id: 'demo_4',
          title: 'Continue Watching',
          description: 'Pick up where you left off',
          items: []
        }
      ];
      
      setContent(placeholderContent);
      setLoading(false);
    }, 1000);
  }, []);

  const handleContentClick = (item) => {
    setSelectedContent(item);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="recommended-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Analyzing your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommended-container">
      <div className="recommended-header">
        <h1>Recommended For You</h1>
        <p>Personalized content based on your viewing history and preferences</p>
      </div>

      <div className="recommendation-sections">
        {content.map((section) => (
          <div key={section.id} className="recommendation-section">
            <div className="section-header">
              <h2 className="section-title">{section.title}</h2>
              <p className="section-description">{section.description}</p>
            </div>
            
            <div className="recommendation-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <h3>Coming Soon</h3>
                <p>Our recommendation engine is being developed to provide you with personalized content suggestions based on your viewing history and preferences.</p>
                <div className="placeholder-features">
                  <div className="feature">
                    <i className="fas fa-eye"></i>
                    <span>Watch History Analysis</span>
                  </div>
                  <div className="feature">
                    <i className="fas fa-heart"></i>
                    <span>Preference Learning</span>
                  </div>
                  <div className="feature">
                    <i className="fas fa-chart-line"></i>
                    <span>Trending Integration</span>
                  </div>
                </div>
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

export default Recommended;