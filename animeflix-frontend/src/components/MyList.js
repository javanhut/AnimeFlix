import React, { useState, useEffect } from 'react';
import EpisodeModal from './EpisodeModal';
import './MyList.css';

const MyList = () => {
  const [myList, setMyList] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedList = localStorage.getItem('myList');
    if (savedList) {
      setMyList(JSON.parse(savedList));
    }
  }, []);

  const handleContentClick = (item) => {
    setSelectedContent(item);
    setShowModal(true);
  };

  const removeFromList = (contentId) => {
    const updatedList = myList.filter(item => item.id !== contentId);
    setMyList(updatedList);
    localStorage.setItem('myList', JSON.stringify(updatedList));
  };

  if (myList.length === 0) {
    return (
      <div className="mylist-container">
        <div className="mylist-header">
          <h1>My List</h1>
        </div>
        <div className="empty-list">
          <i className="fas fa-list"></i>
          <h2>Your list is empty</h2>
          <p>Add shows and movies to your list to watch them later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mylist-container">
      <div className="mylist-header">
        <h1>My List</h1>
        <p>{myList.length} {myList.length === 1 ? 'item' : 'items'}</p>
      </div>
      
      <div className="mylist-grid">
        {myList.map(item => (
          <div key={item.id} className="mylist-card">
            <div className="card-image" onClick={() => handleContentClick(item)}>
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
            <div className="card-actions">
              <button 
                className="remove-btn"
                onClick={() => removeFromList(item.id)}
                title="Remove from My List"
              >
                <i className="fas fa-times"></i>
              </button>
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

export default MyList;