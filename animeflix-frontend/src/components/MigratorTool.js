import React, { useState, useEffect } from 'react';
import './MigratorTool.css';

const MigratorTool = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [directories, setDirectories] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [contentType, setContentType] = useState('series');
  const [contentInfo, setContentInfo] = useState({
    title: '',
    description: '',
    year: '',
    rating: '',
    genres: '',
    seasons: {}
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [backdropPreview, setBackdropPreview] = useState(null);

  useEffect(() => {
    // Start with the home directory
    const initializePath = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/get-home-directory`);
        if (response.ok) {
          const data = await response.json();
          setCurrentPath(data.homePath);
        } else {
          // Fallback to root
          setCurrentPath('/');
        }
      } catch (error) {
        console.error('Error getting home directory:', error);
        setCurrentPath('/');
      }
    };
    
    initializePath();
  }, []);

  useEffect(() => {
    if (currentPath) {
      fetchDirectoryContents(currentPath);
    }
  }, [currentPath]);

  const fetchDirectoryContents = async (path) => {
    try {
      setIsLoading(true);
      setMessage('');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/browse-directory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch directory');
      }
      
      const data = await response.json();
      setDirectories(data.directories || []);
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error browsing directory:', error);
      setMessage('Error browsing directory: ' + error.message);
      setDirectories([]);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectoryClick = (dirName) => {
    const newPath = currentPath.endsWith('/') 
      ? `${currentPath}${dirName}`
      : `${currentPath}/${dirName}`;
    setCurrentPath(newPath);
    setSelectedFiles([]);
  };

  const handleBackClick = () => {
    const pathParts = currentPath.split('/').filter(p => p);
    pathParts.pop();
    const newPath = '/' + pathParts.join('/');
    setCurrentPath(newPath || '/');
    setSelectedFiles([]);
  };

  const handleFileSelect = (file) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.name === file.name);
      if (isSelected) {
        return prev.filter(f => f.name !== file.name);
      } else {
        return [...prev, file];
      }
    });
  };

  const detectEpisodeInfo = (filename) => {
    // Try to detect season and episode from filename
    const patterns = [
      /[Ss](\d+)[Ee](\d+)/,  // S01E01
      /(\d+)x(\d+)/,          // 1x01
      /[Ss]eason\s*(\d+)\s*[Ee]pisode\s*(\d+)/i,  // Season 1 Episode 1
      /[Ee]pisode\s*(\d+)/i,  // Episode 1 (assume season 1)
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) {
        if (match.length === 3) {
          return { season: parseInt(match[1]), episode: parseInt(match[2]) };
        } else if (match.length === 2) {
          return { season: 1, episode: parseInt(match[1]) };
        }
      }
    }

    // If no pattern matches, try to extract just a number
    const numberMatch = filename.match(/(\d+)/);
    if (numberMatch) {
      return { season: 1, episode: parseInt(numberMatch[1]) };
    }

    return { season: 1, episode: 1 };
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
      setMessage('Please select a valid image file (PNG, JPG, JPEG, WebP)');
    }
  };

  const removeImage = (type) => {
    if (type === 'thumbnail') {
      setThumbnailFile(null);
      setThumbnailPreview(null);
    } else if (type === 'backdrop') {
      setBackdropFile(null);
      setBackdropPreview(null);
    }
  };

  const organizeFilesIntoSeasons = () => {
    const seasons = {};
    
    selectedFiles.forEach((file, index) => {
      const { season, episode } = detectEpisodeInfo(file.name);
      
      if (!seasons[season]) {
        seasons[season] = [];
      }
      
      seasons[season].push({
        originalFile: file,
        season,
        episode,
        title: `Episode ${episode}`,
        description: '',
        newFilename: `season_${season}_episode_${episode}${file.name.substring(file.name.lastIndexOf('.'))}`
      });
    });

    // Sort episodes within each season
    Object.keys(seasons).forEach(season => {
      seasons[season].sort((a, b) => a.episode - b.episode);
    });

    setContentInfo(prev => ({ ...prev, seasons }));
  };

  const handleMigrate = async () => {
    if (!contentInfo.title) {
      setMessage('Please enter a title for the content');
      return;
    }

    setIsProcessing(true);
    setMessage('Processing migration...');

    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add basic content info
      formData.append('contentType', contentType);
      formData.append('contentInfo', JSON.stringify({
        ...contentInfo,
        genres: contentInfo.genres.split(',').map(g => g.trim()).filter(g => g)
      }));
      formData.append('sourcePath', currentPath);
      formData.append('files', JSON.stringify(selectedFiles));
      
      // Add image files if they exist
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      if (backdropFile) {
        formData.append('backdrop', backdropFile);
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3051'}/api/migrate-content`, {
        method: 'POST',
        body: formData // Don't set Content-Type header - let browser set it for FormData
      });

      if (!response.ok) throw new Error('Migration failed');
      
      const result = await response.json();
      setMessage(`Successfully migrated ${contentInfo.title}!`);
      
      // Reset form
      setSelectedFiles([]);
      setContentInfo({
        title: '',
        description: '',
        year: '',
        rating: '',
        genres: '',
        seasons: {}
      });
      setThumbnailFile(null);
      setBackdropFile(null);
      setThumbnailPreview(null);
      setBackdropPreview(null);
      
      // Refresh directory contents
      fetchDirectoryContents(currentPath);
    } catch (error) {
      console.error('Migration error:', error);
      setMessage('Migration failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="migrator-tool">
      <h2>Content Migrator Tool</h2>
      
      <div className="migrator-controls">
        <div className="content-type-selector">
          <label>
            <input
              type="radio"
              value="series"
              checked={contentType === 'series'}
              onChange={(e) => setContentType(e.target.value)}
            />
            Series
          </label>
          <label>
            <input
              type="radio"
              value="movie"
              checked={contentType === 'movie'}
              onChange={(e) => setContentType(e.target.value)}
            />
            Movie
          </label>
        </div>
      </div>

      <div className="migrator-layout">
        <div className="directory-browser">
          <div className="browser-header">
            <button onClick={handleBackClick} className="back-button">
              <i className="fas fa-arrow-left"></i> Back
            </button>
            <input
              type="text"
              className="path-input"
              value={currentPath}
              onChange={(e) => setCurrentPath(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  fetchDirectoryContents(currentPath);
                }
              }}
              placeholder="Enter directory path"
            />
            <button 
              onClick={() => fetchDirectoryContents(currentPath)} 
              className="go-button"
            >
              Go
            </button>
          </div>
          
          <div className="browser-content">
            {isLoading ? (
              <div className="loading-indicator">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading directory contents...</p>
              </div>
            ) : (
              <>
                <div className="directories-list">
                  {directories.map(dir => (
                    <div
                      key={dir}
                      className="directory-item"
                      onClick={() => handleDirectoryClick(dir)}
                    >
                      <i className="fas fa-folder"></i>
                      {dir}
                    </div>
                  ))}
                </div>
                
                <div className="files-list">
                  {files.filter(file => file.isVideo).map(file => (
                    <div
                      key={file.name}
                      className={`file-item ${selectedFiles.some(f => f.name === file.name) ? 'selected' : ''}`}
                      onClick={() => handleFileSelect(file)}
                    >
                      <i className="fas fa-film"></i>
                      {file.name}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="content-details">
          <h3>Content Details</h3>
          
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={contentInfo.title}
              onChange={(e) => setContentInfo(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={contentInfo.description}
              onChange={(e) => setContentInfo(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year</label>
              <input
                type="text"
                value={contentInfo.year}
                onChange={(e) => setContentInfo(prev => ({ ...prev, year: e.target.value }))}
                placeholder="2024"
              />
            </div>

            <div className="form-group">
              <label>Rating</label>
              <input
                type="text"
                value={contentInfo.rating}
                onChange={(e) => setContentInfo(prev => ({ ...prev, rating: e.target.value }))}
                placeholder="PG-13"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Genres (comma-separated)</label>
            <input
              type="text"
              value={contentInfo.genres}
              onChange={(e) => setContentInfo(prev => ({ ...prev, genres: e.target.value }))}
              placeholder="Action, Adventure, Sci-Fi"
            />
          </div>

          <div className="image-uploads">
            <h4>Images</h4>
            
            <div className="image-upload-section">
              <div className="image-upload-group">
                <label>Poster/Thumbnail</label>
                <div className="image-upload-area">
                  {thumbnailPreview ? (
                    <div className="image-preview">
                      <img src={thumbnailPreview} alt="Thumbnail preview" />
                      <button
                        type="button"
                        onClick={() => removeImage('thumbnail')}
                        className="remove-image-btn"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <i className="fas fa-image"></i>
                      <p>Click to upload poster image</p>
                      <span>(Recommended: 300x450px)</span>
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
                <label>Backdrop (Optional)</label>
                <div className="image-upload-area">
                  {backdropPreview ? (
                    <div className="image-preview backdrop">
                      <img src={backdropPreview} alt="Backdrop preview" />
                      <button
                        type="button"
                        onClick={() => removeImage('backdrop')}
                        className="remove-image-btn"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder backdrop">
                      <i className="fas fa-image"></i>
                      <p>Click to upload backdrop image</p>
                      <span>(Recommended: 1920x1080px)</span>
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

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <h4>Selected Files ({selectedFiles.length})</h4>
              {contentType === 'series' && (
                <button onClick={organizeFilesIntoSeasons} className="organize-button">
                  <i className="fas fa-sort"></i> Auto-organize into seasons
                </button>
              )}
              
              {contentType === 'series' && Object.keys(contentInfo.seasons).length > 0 && (
                <div className="seasons-preview">
                  {Object.entries(contentInfo.seasons).map(([season, episodes]) => (
                    <div key={season} className="season-preview">
                      <h5>Season {season}</h5>
                      {episodes.map(ep => (
                        <div key={ep.episode} className="episode-preview">
                          <span>{ep.originalFile.name}</span>
                          <span className="arrow">→</span>
                          <span className="new-name">{ep.newFilename}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {message && (
            <div className={`message ${message.includes('Success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="action-buttons">
            <button
              onClick={handleMigrate}
              disabled={isProcessing || selectedFiles.length === 0 || !contentInfo.title}
              className="migrate-button"
            >
              {isProcessing ? 'Processing...' : 'Migrate Content'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigratorTool;