import React, { useState, useEffect } from 'react';
import './ContentEditor.css';

const ContentEditor = () => {
  const [existingContent, setExistingContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContent, setSelectedContent] = useState(null);
  const [editMode, setEditMode] = useState('details'); // 'details', 'episodes', 'images'
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newEpisodes, setNewEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState(null);

  useEffect(() => {
    fetchExistingContent();
  }, []);

  const fetchExistingContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/videos`);
      if (!response.ok) throw new Error('Failed to fetch content');
      
      const data = await response.json();
      
      // Extract all content from categories
      const allContent = [];
      if (data.categories) {
        Object.values(data.categories).forEach(categoryItems => {
          allContent.push(...categoryItems);
        });
      }
      if (data.featured) {
        allContent.push(data.featured);
      }
      
      setExistingContent(allContent);
      setFilteredContent(allContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      setMessage('Error loading existing content: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filter content based on search query
    if (searchQuery.trim() === '') {
      setFilteredContent(existingContent);
    } else {
      const filtered = existingContent.filter(content =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (content.genres && content.genres.some(genre => 
          genre.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
        content.year.toString().includes(searchQuery)
      );
      setFilteredContent(filtered);
    }
  }, [searchQuery, existingContent]);

  const handleContentSelect = (content) => {
    setSelectedContent(content);
    setEditMode('details');
    setMessage('');
    setThumbnailPreview(content.thumbnail);
    setBackdropPreview(content.backdrop);
  };

  const handleImageUpload = (file, type) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'thumbnail') {
          setThumbnailFile(file);
          setThumbnailPreview(e.target.result);
        } else if (type === 'backdrop') {
          setBackdropFile(file);
          setBackdropPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setMessage('Please select a valid image file');
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedContent) return;

    setIsSaving(true);
    setMessage('Saving changes...');

    try {
      const formData = new FormData();
      formData.append('contentId', selectedContent.id);
      formData.append('contentData', JSON.stringify(selectedContent));
      
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      if (backdropFile) formData.append('backdrop', backdropFile);
      if (newEpisodes.length > 0) formData.append('newEpisodes', JSON.stringify(newEpisodes));

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/update-content`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to update content');
      
      const result = await response.json();
      setMessage('Content updated successfully!');
      
      // Refresh content list
      await fetchExistingContent();
      
      // Reset image files
      setThumbnailFile(null);
      setBackdropFile(null);
      setNewEpisodes([]);
      
    } catch (error) {
      console.error('Error updating content:', error);
      setMessage('Failed to update content: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addNewEpisode = () => {
    const newEpisode = {
      id: `temp_${Date.now()}`,
      season: selectedSeason,
      episode: (newEpisodes.filter(ep => ep.season === selectedSeason).length + 1),
      title: '',
      description: '',
      videoFile: null
    };
    setNewEpisodes([...newEpisodes, newEpisode]);
  };

  const updateEpisode = (episodeId, field, value) => {
    setNewEpisodes(prev => 
      prev.map(ep => ep.id === episodeId ? { ...ep, [field]: value } : ep)
    );
  };

  const removeEpisode = (episodeId) => {
    setNewEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
  };

  const handleEpisodeVideoUpload = (episodeId, file) => {
    if (file && file.type.startsWith('video/')) {
      setNewEpisodes(prev => 
        prev.map(ep => ep.id === episodeId ? { ...ep, videoFile: file } : ep)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="content-editor">
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading existing content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content-editor">
      <div className="editor-header">
        <h2>Content Editor</h2>
        <div className="search-section">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search content by title, genre, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="clear-search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <div className="search-results-count">
            {filteredContent.length} of {existingContent.length} items
          </div>
        </div>
      </div>
      
      <div className="editor-layout">
        <div className="content-list">
          <div className="content-grid">
            {filteredContent.map(content => (
              <div
                key={content.id}
                className={`content-card ${selectedContent?.id === content.id ? 'selected' : ''}`}
                onClick={() => handleContentSelect(content)}
              >
                <div className="card-thumbnail">
                  <img src={content.thumbnail} alt={content.title} />
                  <div className="card-overlay">
                    <i className="fas fa-edit"></i>
                  </div>
                </div>
                <div className="card-info">
                  <h4>{content.title}</h4>
                  <p>{content.year} • {content.type || 'Series'}</p>
                  {content.episodes && <span>{content.episodes} episodes</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedContent && (
          <div className="editor-panel">
            <div className="editor-tabs">
              <button
                className={`tab ${editMode === 'details' ? 'active' : ''}`}
                onClick={() => setEditMode('details')}
              >
                <i className="fas fa-info-circle"></i>
                Details
              </button>
              <button
                className={`tab ${editMode === 'images' ? 'active' : ''}`}
                onClick={() => setEditMode('images')}
              >
                <i className="fas fa-image"></i>
                Images
              </button>
              <button
                className={`tab ${editMode === 'episodes' ? 'active' : ''}`}
                onClick={() => setEditMode('episodes')}
              >
                <i className="fas fa-play-circle"></i>
                Episodes
              </button>
            </div>

            <div className="editor-content">
              {editMode === 'details' && (
                <div className="details-editor">
                  <h3>Edit Details</h3>
                  
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={selectedContent.title}
                      onChange={(e) => setSelectedContent(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={selectedContent.description}
                      onChange={(e) => setSelectedContent(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Year</label>
                      <input
                        type="text"
                        value={selectedContent.year}
                        onChange={(e) => setSelectedContent(prev => ({ ...prev, year: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Rating</label>
                      <input
                        type="text"
                        value={selectedContent.rating}
                        onChange={(e) => setSelectedContent(prev => ({ ...prev, rating: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Genres</label>
                    <input
                      type="text"
                      value={Array.isArray(selectedContent.genres) ? selectedContent.genres.join(', ') : ''}
                      onChange={(e) => setSelectedContent(prev => ({ 
                        ...prev, 
                        genres: e.target.value.split(',').map(g => g.trim()).filter(g => g)
                      }))}
                      placeholder="Action, Adventure, Sci-Fi"
                    />
                  </div>
                </div>
              )}

              {editMode === 'images' && (
                <div className="images-editor">
                  <h3>Update Images</h3>
                  
                  <div className="image-upload-section">
                    <div className="image-upload-group">
                      <label>Poster/Thumbnail</label>
                      <div className="image-upload-area">
                        {thumbnailPreview ? (
                          <div className="image-preview">
                            <img src={thumbnailPreview} alt="Thumbnail preview" />
                            <button
                              type="button"
                              onClick={() => {
                                setThumbnailFile(null);
                                setThumbnailPreview(selectedContent.thumbnail);
                              }}
                              className="remove-image-btn"
                            >
                              <i className="fas fa-undo"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <i className="fas fa-image"></i>
                            <p>Click to upload new poster</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'thumbnail')}
                          className="file-input"
                        />
                      </div>
                    </div>

                    <div className="image-upload-group">
                      <label>Backdrop</label>
                      <div className="image-upload-area">
                        {backdropPreview ? (
                          <div className="image-preview backdrop">
                            <img src={backdropPreview} alt="Backdrop preview" />
                            <button
                              type="button"
                              onClick={() => {
                                setBackdropFile(null);
                                setBackdropPreview(selectedContent.backdrop);
                              }}
                              className="remove-image-btn"
                            >
                              <i className="fas fa-undo"></i>
                            </button>
                          </div>
                        ) : (
                          <div className="upload-placeholder backdrop">
                            <i className="fas fa-image"></i>
                            <p>Click to upload new backdrop</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'backdrop')}
                          className="file-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {editMode === 'episodes' && (
                <div className="episodes-editor">
                  <h3>Add Episodes/Seasons</h3>
                  
                  <div className="season-controls">
                    <div className="form-group">
                      <label>Season</label>
                      <select
                        value={selectedSeason}
                        onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                      >
                        {[...Array(10)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>Season {i + 1}</option>
                        ))}
                      </select>
                    </div>
                    
                    <button onClick={addNewEpisode} className="add-episode-btn">
                      <i className="fas fa-plus"></i>
                      Add Episode
                    </button>
                  </div>

                  <div className="new-episodes">
                    {newEpisodes.filter(ep => ep.season === selectedSeason).map(episode => (
                      <div key={episode.id} className="episode-editor">
                        <div className="episode-header">
                          <span>S{episode.season}E{episode.episode}</span>
                          <button
                            onClick={() => removeEpisode(episode.id)}
                            className="remove-btn"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        
                        <div className="episode-form">
                          <input
                            type="text"
                            placeholder="Episode title"
                            value={episode.title}
                            onChange={(e) => updateEpisode(episode.id, 'title', e.target.value)}
                          />
                          
                          <textarea
                            placeholder="Episode description"
                            value={episode.description}
                            onChange={(e) => updateEpisode(episode.id, 'description', e.target.value)}
                            rows={2}
                          />
                          
                          <div className="video-upload">
                            <label>Video File</label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => handleEpisodeVideoUpload(episode.id, e.target.files[0])}
                            />
                            {episode.videoFile && (
                              <span className="file-selected">
                                <i className="fas fa-check"></i> {episode.videoFile.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {message && (
              <div className={`message ${message.includes('Success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            <div className="editor-actions">
              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="save-btn"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentEditor;