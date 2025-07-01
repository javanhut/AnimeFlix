import React, { useState, useEffect } from 'react';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    displayName: '',
    bio: '',
    favoriteGenres: [],
    avatar: '',
    watchingPreferences: {
      autoPlay: true,
      skipIntros: false,
      subtitleLanguage: 'English',
      audioLanguage: 'Japanese',
      videoQuality: 'Auto'
    },
    profileSettings: {
      profileVisibility: 'public',
      showWatchHistory: true,
      showMyList: true,
      allowRecommendations: true
    },
    stats: {
      totalWatched: 0,
      hoursWatched: 0,
      favoriteGenre: '',
      joinDate: new Date().toISOString().split('T')[0]
    }
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarOptions] = useState([
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b86d1d0b?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face',
    'https://i.pravatar.cc/80?img=1',
    'https://i.pravatar.cc/80?img=2',
    'https://i.pravatar.cc/80?img=3',
    'https://i.pravatar.cc/80?img=4',
    'https://i.pravatar.cc/80?img=5',
    'https://i.pravatar.cc/80?img=6'
  ]);

  const availableGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
    'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller', 'Supernatural',
    'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Mecha', 'Sports', 'Music'
  ];

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    } else {
      // Set default values for new user
      setProfileData(prev => ({
        ...prev,
        username: 'anime_fan_' + Math.floor(Math.random() * 1000),
        displayName: 'Anime Fan',
        avatar: avatarOptions[0],
        stats: {
          ...prev.stats,
          joinDate: new Date().toISOString().split('T')[0]
        }
      }));
    }
  }, [avatarOptions]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setIsEditing(false);
    
    // Trigger a custom event to update navbar avatar
    window.dispatchEvent(new CustomEvent('profileUpdated', { 
      detail: { avatar: profileData.avatar } 
    }));
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (category, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const toggleGenre = (genre) => {
    setProfileData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleAvatarSelect = (avatarUrl) => {
    handleInputChange('avatar', avatarUrl);
  };

  const handleClose = () => {
    setIsEditing(false);
    setActiveTab('profile');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={handleClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="profile-modal-header">
          <div className="profile-avatar-section">
            <div className="avatar-display">
              <img 
                src={profileData.avatar || avatarOptions[0]} 
                alt="Profile Avatar"
                className="profile-avatar-large"
              />
              {isEditing && (
                <button className="change-avatar-btn">
                  <i className="fas fa-camera"></i>
                </button>
              )}
            </div>
            <div className="profile-basic-info">
              <h2>{profileData.displayName || 'Anime Fan'}</h2>
              <p className="username">@{profileData.username}</p>
              <p className="join-date">Member since {new Date(profileData.stats.joinDate).getFullYear()}</p>
            </div>
          </div>
          
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn btn-save" onClick={saveProfile}>
                  <i className="fas fa-save"></i>
                  Save
                </button>
                <button className="btn btn-cancel" onClick={() => setIsEditing(false)}>
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-edit" onClick={() => setIsEditing(true)}>
                <i className="fas fa-edit"></i>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i>
            Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <i className="fas fa-cog"></i>
            Settings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <i className="fas fa-shield-alt"></i>
            Privacy
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-info-tab">
              {/* Avatar Selection */}
              {isEditing && (
                <div className="section">
                  <h4>Choose Avatar</h4>
                  <div className="avatar-grid">
                    {avatarOptions.map((avatar, index) => (
                      <div 
                        key={index}
                        className={`avatar-option ${profileData.avatar === avatar ? 'selected' : ''}`}
                        onClick={() => handleAvatarSelect(avatar)}
                      >
                        <img src={avatar} alt={`Avatar ${index + 1}`} />
                        {profileData.avatar === avatar && (
                          <div className="avatar-selected-indicator">
                            <i className="fas fa-check"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Display Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        placeholder="Your display name"
                      />
                    ) : (
                      <p>{profileData.displayName || 'Not set'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Your username"
                      />
                    ) : (
                      <p>@{profileData.username}</p>
                    )}
                  </div>
                  <div className="form-group full-width">
                    <label>Bio</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows="2"
                      />
                    ) : (
                      <p>{profileData.bio || 'No bio set'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Favorite Genres */}
              <div className="section">
                <h4>Favorite Genres</h4>
                <div className="genres-container">
                  {availableGenres.slice(0, 12).map(genre => (
                    <button
                      key={genre}
                      className={`genre-tag ${profileData.favoriteGenres.includes(genre) ? 'selected' : ''} ${!isEditing ? 'readonly' : ''}`}
                      onClick={() => isEditing && toggleGenre(genre)}
                      disabled={!isEditing}
                    >
                      {genre}
                      {profileData.favoriteGenres.includes(genre) && <i className="fas fa-heart"></i>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="preferences-tab">
              <div className="section">
                <h4>Watching Preferences</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Subtitle Language</label>
                    <select
                      value={profileData.watchingPreferences.subtitleLanguage}
                      onChange={(e) => handleNestedChange('watchingPreferences', 'subtitleLanguage', e.target.value)}
                      disabled={!isEditing}
                    >
                      <option value="English">English</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Audio Language</label>
                    <select
                      value={profileData.watchingPreferences.audioLanguage}
                      onChange={(e) => handleNestedChange('watchingPreferences', 'audioLanguage', e.target.value)}
                      disabled={!isEditing}
                    >
                      <option value="Japanese">Japanese (Original)</option>
                      <option value="English">English (Dub)</option>
                    </select>
                  </div>
                </div>
                
                <div className="toggle-options">
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={profileData.watchingPreferences.autoPlay}
                        onChange={(e) => handleNestedChange('watchingPreferences', 'autoPlay', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <span className="toggle-slider"></span>
                      Auto-play next episode
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={profileData.watchingPreferences.skipIntros}
                        onChange={(e) => handleNestedChange('watchingPreferences', 'skipIntros', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <span className="toggle-slider"></span>
                      Skip intro sequences
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="privacy-tab">
              <div className="section">
                <h4>Privacy Settings</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Profile Visibility</label>
                    <select
                      value={profileData.profileSettings.profileVisibility}
                      onChange={(e) => handleNestedChange('profileSettings', 'profileVisibility', e.target.value)}
                      disabled={!isEditing}
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>
                
                <div className="toggle-options">
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={profileData.profileSettings.showWatchHistory}
                        onChange={(e) => handleNestedChange('profileSettings', 'showWatchHistory', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <span className="toggle-slider"></span>
                      Show watch history
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={profileData.profileSettings.allowRecommendations}
                        onChange={(e) => handleNestedChange('profileSettings', 'allowRecommendations', e.target.checked)}
                        disabled={!isEditing}
                      />
                      <span className="toggle-slider"></span>
                      Allow recommendations
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;