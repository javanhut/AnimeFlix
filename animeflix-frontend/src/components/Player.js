import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './Player.css';

const Player = forwardRef(({ video, onVideoEnd, autoPlay = false }, ref) => {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('sub');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [skipFeedback, setSkipFeedback] = useState({ show: false, direction: '', amount: 0 });
  const [isPiPSupported, setIsPiPSupported] = useState(false);
  const [isPiPActive, setIsPiPActive] = useState(false);

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    playAndFullscreen: () => {
      setIsPlaying(true);
      if (playerContainerRef.current && !isFullScreen) {
        if (playerContainerRef.current.requestFullscreen) {
          playerContainerRef.current.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if (playerContainerRef.current.mozRequestFullScreen) {
          playerContainerRef.current.mozRequestFullScreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if (playerContainerRef.current.webkitRequestFullscreen) {
          playerContainerRef.current.webkitRequestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if (playerContainerRef.current.msRequestFullscreen) {
          playerContainerRef.current.msRequestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        }
      }
    }
  }));

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(error => {
          console.error("Error attempting to play video:", error);
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, video]);

  // Initialize language preference from video data or user preference
  useEffect(() => {
    if (video) {
      // Get user's saved language preference
      const savedLanguage = localStorage.getItem('preferredLanguage');
      
      if (video.videoSources) {
        // Use video's default language if available, otherwise use saved preference
        const defaultLang = video.defaultLanguage || savedLanguage || 'sub';
        
        // Check if the preferred language is available for this video
        if (video.videoSources[defaultLang]) {
          setCurrentLanguage(defaultLang);
        } else {
          // Fallback to sub if preferred language isn't available
          setCurrentLanguage('sub');
        }
      } else {
        // Legacy video format - use current videoUrl
        setCurrentLanguage('sub');
      }
    }
  }, [video]);

  // Handle language switching
  const switchLanguage = (language) => {
    if (!video.videoSources || !video.videoSources[language]) {
      console.log('Cannot switch language - no video sources or language not available');
      return;
    }
    
    const wasPlaying = isPlaying;
    const currentTimeStamp = videoRef.current ? videoRef.current.currentTime : 0;
    
    setCurrentLanguage(language);
    setShowLanguageMenu(false);
    
    // Save user preference
    localStorage.setItem('preferredLanguage', language);
    
    // Update video source and maintain playback position
    if (videoRef.current) {
      const newSource = video.videoSources[language];
      setIsBuffering(true);
      
      videoRef.current.src = newSource;
      videoRef.current.load();
      
      const handleCanPlay = () => {
        videoRef.current.currentTime = currentTimeStamp;
        if (wasPlaying) {
          videoRef.current.play().then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          }).catch(() => {
            setIsPlaying(false);
            setIsBuffering(false);
          });
        } else {
          setIsBuffering(false);
        }
        videoRef.current.removeEventListener('canplay', handleCanPlay);
      };
      
      videoRef.current.addEventListener('canplay', handleCanPlay);
    }
  };

  // Get available languages for this video
  const getAvailableLanguages = () => {
    if (!video) {
      return [{ key: 'sub', label: 'Japanese (Sub)' }, { key: 'dub', label: 'English (Dub)' }];
    }
    
    if (!video.videoSources) {
      return [{ key: 'sub', label: 'Japanese (Sub)' }];
    }
    
    const languages = [];
    if (video.videoSources.sub) languages.push({ key: 'sub', label: 'Japanese (Sub)' });
    if (video.videoSources.dub) languages.push({ key: 'dub', label: 'English (Dub)' });
    
    return languages;
  };

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      setIsPlaying(true);
    }
  }, [autoPlay, video]);

  // Check Picture-in-Picture support
  useEffect(() => {
    if (videoRef.current && 'pictureInPictureEnabled' in document) {
      setIsPiPSupported(true);
      
      const handlePiPEnter = () => setIsPiPActive(true);
      const handlePiPLeave = () => setIsPiPActive(false);
      
      videoRef.current.addEventListener('enterpictureinpicture', handlePiPEnter);
      videoRef.current.addEventListener('leavepictureinpicture', handlePiPLeave);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('enterpictureinpicture', handlePiPEnter);
          videoRef.current.removeEventListener('leavepictureinpicture', handlePiPLeave);
        }
      };
    }
  }, [video]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (onVideoEnd) onVideoEnd();
    };
    const handleError = (e) => {
      setHasError(true);
      setIsBuffering(false);
      setIsPlaying(false);
      
      // More specific error messages
      const errorCode = e.target?.error?.code;
      let errorMsg = 'Unable to load video. Please try again later.';
      
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          errorMsg = 'Video loading was aborted.';
          break;
        case 2: // MEDIA_ERR_NETWORK
          errorMsg = 'Network error occurred while loading video.';
          break;
        case 3: // MEDIA_ERR_DECODE
          errorMsg = 'Video format not supported or corrupted.';
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          errorMsg = 'Video source not supported or not found.';
          break;
        default:
          errorMsg = 'Unable to load video. Please try again later.';
      }
      
      setErrorMessage(errorMsg);
    };
    const handleLoadStart = () => {
      setHasError(false);
      setErrorMessage('');
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [onVideoEnd]);

  useEffect(() => {
    let timeout;
    const resetControlsTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      if (playerContainerRef.current) {
        playerContainerRef.current.style.cursor = 'default';
      }
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
          if (playerContainerRef.current) {
            playerContainerRef.current.style.cursor = 'none';
          }
        }
      }, 3000);
    };

    const handleMouseMove = () => resetControlsTimeout();
    const handleMouseLeave = () => {
      if (isPlaying) {
        setShowControls(false);
        if (playerContainerRef.current) {
          playerContainerRef.current.style.cursor = 'none';
        }
      }
    };

    const container = playerContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    resetControlsTimeout();

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const keyPressHandler = (e) => {
      // Only handle keys when player is focused or video is playing
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return; // Don't interfere with form inputs
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullScreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'Escape':
          e.preventDefault();
          if (showLanguageMenu) {
            setShowLanguageMenu(false);
          } else if (isPiPActive) {
            togglePictureInPicture();
          } else if (isFullScreen) {
            toggleFullScreen();
          }
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          if (isPiPSupported) {
            togglePictureInPicture();
          }
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percent = parseInt(e.key) * 10;
          seekToPercent(percent);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', keyPressHandler);
    return () => document.removeEventListener('keydown', keyPressHandler);
  }, [showLanguageMenu, isFullScreen, isPiPActive, isPiPSupported]);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageMenu && !event.target.closest('.language-container')) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageMenu]);

  if (!video) {
    return <div>Loading...</div>;
  }

  const togglePlay = () => {
    const wasPlaying = isPlaying;
    setIsPlaying(!isPlaying);
    
    // Enter fullscreen when user starts playing for the first time
    if (!wasPlaying && !isFullScreen && playerContainerRef.current) {
      setTimeout(() => {
        if (playerContainerRef.current.requestFullscreen) {
          playerContainerRef.current.requestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if (playerContainerRef.current.mozRequestFullScreen) {
          playerContainerRef.current.mozRequestFullScreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if (playerContainerRef.current.webkitRequestFullscreen) {
          playerContainerRef.current.webkitRequestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        } else if (playerContainerRef.current.msRequestFullscreen) {
          playerContainerRef.current.msRequestFullscreen().catch(err => {
            console.log('Fullscreen request failed:', err);
          });
        }
      }, 100);
    }
  };

  const seek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
      
      // Show skip feedback
      setSkipFeedback({
        show: true,
        direction: seconds > 0 ? 'forward' : 'backward',
        amount: Math.abs(seconds)
      });
      
      // Hide feedback after animation
      setTimeout(() => {
        setSkipFeedback({ show: false, direction: '', amount: 0 });
      }, 1000);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setSkipFeedback({
        show: true,
        direction: 'restart',
        amount: 0
      });
      
      // Hide feedback after animation
      setTimeout(() => {
        setSkipFeedback({ show: false, direction: '', amount: 0 });
      }, 1000);
    }
  };

  const seekToPercent = (percent) => {
    if (videoRef.current && duration) {
      videoRef.current.currentTime = (percent / 100) * duration;
    }
  };

  const adjustVolume = (delta) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      videoRef.current.volume = newVolume;
    }
  };

  const handleProgressClick = (e) => {
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      } else if (playerContainerRef.current.mozRequestFullScreen) { /* Firefox */
        playerContainerRef.current.mozRequestFullScreen();
      } else if (playerContainerRef.current.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        playerContainerRef.current.webkitRequestFullscreen();
      } else if (playerContainerRef.current.msRequestFullscreen) { /* IE/Edge */
        playerContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
    }
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current || !isPiPSupported) return;
    
    try {
      if (isPiPActive) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  };

  return (
    <div className={`player-container ${isFullScreen ? 'fullscreen' : ''}`} ref={playerContainerRef}>
      <video
        ref={videoRef}
        className="video-player"
        src={video.videoSources ? video.videoSources[currentLanguage] : video.videoUrl}
        onClick={togglePlay}
      />
      
      {isBuffering && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
      {hasError && (
        <div className="error-overlay">
          <div className="error-content">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Video Error</h3>
            <p>{errorMessage}</p>
            <button 
              className="retry-btn" 
              onClick={() => {
                setHasError(false);
                setErrorMessage('');
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      <div className={`player-controls ${showControls ? 'visible' : 'hidden'}`}>
        <div className="progress-container">
          <div className="progress-bar" ref={progressRef} onClick={handleProgressClick}>
            <div 
              className="progress-filled" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="controls-bottom">
          <div className="controls-left">
            <button className="control-btn" onClick={togglePlay}>
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
            </button>
            
            <button className="control-btn" onClick={() => seek(-10)}>
              <i className="fas fa-backward"></i>
              <span className="seek-text">10</span>
            </button>
            
            <button className="control-btn" onClick={() => seek(10)}>
              <i className="fas fa-forward"></i>
              <span className="seek-text">10</span>
            </button>
            
            <button className="control-btn" onClick={restartVideo} title="Restart from beginning">
              <i className="fas fa-redo"></i>
            </button>
            
            <div className="volume-container">
              <button className="control-btn" onClick={toggleMute}>
                <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up'}`}></i>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                ref={volumeRef}
              />
            </div>
            
            <div className="time-display">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="controls-right">
            {/* Language Switcher - Force show for testing */}
            {video && (
              <div className="language-container">
                <button 
                  className="control-btn language-btn"
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  title="Switch Language"
                >
                  <i className="fas fa-language"></i>
                  <span className="language-text">
                    {currentLanguage === 'sub' ? 'SUB' : 'DUB'}
                  </span>
                </button>
                
                {showLanguageMenu && (
                  <div className="language-menu">
                    {getAvailableLanguages().map(lang => (
                      <button
                        key={lang.key}
                        className={`language-option ${currentLanguage === lang.key ? 'active' : ''}`}
                        onClick={() => switchLanguage(lang.key)}
                      >
                        <i className={`fas ${lang.key === 'sub' ? 'fa-closed-captioning' : 'fa-microphone'}`}></i>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isPiPSupported && (
              <button 
                className="control-btn" 
                onClick={togglePictureInPicture}
                title={isPiPActive ? 'Exit Picture-in-Picture' : 'Picture-in-Picture'}
              >
                <i className={`fas ${isPiPActive ? 'fa-window-restore' : 'fa-clone'}`}></i>
              </button>
            )}
            
            <button className="control-btn" onClick={toggleFullScreen}>
              <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Skip Feedback */}
      {skipFeedback.show && (
        <div className={`skip-feedback ${skipFeedback.direction}`}>
          <i className={`fas ${
            skipFeedback.direction === 'forward' ? 'fa-forward' : 
            skipFeedback.direction === 'backward' ? 'fa-backward' : 
            'fa-redo'
          }`}></i>
          <span>
            {skipFeedback.direction === 'restart' ? 'Restart' : `${skipFeedback.amount}s`}
          </span>
        </div>
      )}

      <div className="center-controls">
        <button className="center-play-btn" onClick={togglePlay} style={{ display: isPlaying ? 'none' : 'flex' }}>
          <i className="fas fa-play"></i>
        </button>
        
        {/* Double-click areas for seeking */}
        <div className="seek-area seek-backward" onClick={() => seek(-10)}>
          <div className="seek-indicator">
            <i className="fas fa-backward"></i>
            <span>10s</span>
          </div>
        </div>
        
        <div className="seek-area seek-forward" onClick={() => seek(10)}>
          <div className="seek-indicator">
            <i className="fas fa-forward"></i>
            <span>10s</span>
          </div>
        </div>
      </div>
    </div>
  );
});

Player.displayName = 'Player';

export default Player;
