import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
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
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108755-2616b86d1d0b?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop&crop=face',
    'https://i.pravatar.cc/100?img=1',
    'https://i.pravatar.cc/100?img=2',
    'https://i.pravatar.cc/100?img=3',
    'https://i.pravatar.cc/100?img=4',
    'https://i.pravatar.cc/100?img=5',
    'https://i.pravatar.cc/100?img=6'
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

  const saveProfile = () => {
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    setIsEditing(false);
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

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-display">
            <img 
              src={profileData.avatar || avatarOptions[0]} 
              alt="Profile Avatar"
              className="profile-avatar"
            />
            {isEditing && (
              <button className="change-avatar-btn">
                <i className="fas fa-camera"></i>
              </button>
            )}
          </div>
          <div className="profile-basic-info">
            <h1>{profileData.displayName || 'Anime Fan'}</h1>
            <p className="username">@{profileData.username}</p>
            <p className="join-date">Member since {new Date(profileData.stats.joinDate).getFullYear()}</p>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-number">{profileData.stats.totalWatched}</span>
            <span className="stat-label">Shows Watched</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{profileData.stats.hoursWatched}</span>
            <span className="stat-label">Hours Watched</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{profileData.favoriteGenres.length}</span>
            <span className="stat-label">Favorite Genres</span>
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn btn-save" onClick={saveProfile}>
                <i className="fas fa-save"></i>
                Save Changes
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
          Profile Info
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <i className="fas fa-cog"></i>
          Preferences
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
                <h3>Choose Avatar</h3>
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
              <h3>Basic Information</h3>
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
                      placeholder="Tell us about yourself and your anime preferences..."
                      rows="3"
                    />
                  ) : (
                    <p>{profileData.bio || 'No bio set'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Favorite Genres */}
            <div className="section">
              <h3>Favorite Genres</h3>
              <div className="genres-container">
                {availableGenres.map(genre => (
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
              <h3>Watching Preferences</h3>
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
                    <option value="German">German</option>
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
                <div className="form-group">
                  <label>Video Quality</label>
                  <select
                    value={profileData.watchingPreferences.videoQuality}
                    onChange={(e) => handleNestedChange('watchingPreferences', 'videoQuality', e.target.value)}
                    disabled={!isEditing}
                  >
                    <option value="Auto">Auto</option>
                    <option value="1080p">1080p HD</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
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
              <h3>Privacy Settings</h3>
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
                    Show watch history to others
                  </label>
                </div>
                <div className="toggle-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={profileData.profileSettings.showMyList}
                      onChange={(e) => handleNestedChange('profileSettings', 'showMyList', e.target.checked)}
                      disabled={!isEditing}
                    />
                    <span className="toggle-slider"></span>
                    Show My List to others
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
                    Allow personalized recommendations
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;