import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import './Player.css';
import fullscreenManager from '../utils/fullscreenManager';
// import videoPrefetchManager from '../utils/videoPrefetch'; // TODO: Implement prefetching

const Player = forwardRef(({ video, onVideoEnd, autoPlay = false, mutedAutoPlay = true }, ref) => {
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
  const [showMutedNotice, setShowMutedNotice] = useState(false);
  const [userManuallyExitedFullscreen, setUserManuallyExitedFullscreen] = useState(false);
  const [wasFullscreenBeforeTransition, setWasFullscreenBeforeTransition] = useState(false);

  useImperativeHandle(ref, () => ({
    // Expose any methods that need to be called from the parent component
  }));

  // Calculate the final video URL
  const finalVideoUrl = React.useMemo(() => {
    if (!video) return '';
    
    // Handle new video format with multiple sources
    if (video.videoSources && video.videoSources[currentLanguage]) {
      const url = video.videoSources[currentLanguage];
      return url.startsWith('http') ? url : `http://localhost:3051${url}`;
    }
    
    // Handle legacy video format
    if (video.videoUrl) {
      // If it's already a full HTTP URL, use it directly
      if (video.videoUrl.startsWith('http')) {
        return video.videoUrl;
      }
      // Otherwise, prepend the local server URL
      return `http://localhost:3051${video.videoUrl}`;
    }
    
    return '';
  }, [video, currentLanguage]);

  // Handle video source changes and autoplay
  useEffect(() => {
    if (videoRef.current && finalVideoUrl) {
      console.log('🔄 Setting video source:', finalVideoUrl);
      console.log('🔄 AutoPlay prop value:', autoPlay);
      
      // Remember fullscreen state before transition for auto-next
      if (autoPlay && isFullScreen) {
        setWasFullscreenBeforeTransition(true);
        console.log('📝 Remembering fullscreen state for auto-next transition');
      }
      
      // Reset manual exit flag for new video
      if (!autoPlay) {
        // Only reset if this is a manually selected video (not auto-next)
        setUserManuallyExitedFullscreen(false);
        setWasFullscreenBeforeTransition(false);
      }
      
      videoRef.current.src = finalVideoUrl;
      videoRef.current.load(); // Reload the video element with new source
      
      // Trigger autoplay if enabled
      if (autoPlay) {
        console.log('🎬 Triggering autoplay for new video source');
        // Wait for video to be ready then start playing
        const handleCanPlay = async () => {
          console.log('✅ Video ready for autoplay');
          
          // For autoplay (auto-next), show fullscreen prompt if it was active before transition
          if (!isFullScreen && !userManuallyExitedFullscreen && (wasFullscreenBeforeTransition || fullscreenManager.getAutoFullscreenSetting())) {
            console.log('🔄 Auto-next episode detected - showing fullscreen prompt');
            if (fullscreenManager.shouldPromptForAutoNext()) {
              const promptShown = fullscreenManager.showAutoNextFullscreenPrompt(playerContainerRef.current);
              if (promptShown) {
                console.log('✅ Fullscreen prompt shown for auto-next episode');
                setWasFullscreenBeforeTransition(false); // Reset flag
              }
            }
          }
          
          setIsPlaying(true); // This will trigger the play useEffect
          videoRef.current.removeEventListener('canplay', handleCanPlay);
        };
        videoRef.current.addEventListener('canplay', handleCanPlay);
      }
    }
  }, [finalVideoUrl, autoPlay]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        // Log the video URL for debugging
        console.log('▶️ Attempting to play video:', videoRef.current.src);
        console.log('🎬 AutoPlay enabled:', autoPlay);
        console.log('🔇 Muted AutoPlay enabled:', mutedAutoPlay);
        
        const playPromise = videoRef.current.play();
        
        // For autoplay, we don't have user gesture so no fullscreen attempt
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('✅ Video play successful');
          }).catch(error => {
            if (error.name === 'NotAllowedError' && (autoPlay || mutedAutoPlay)) {
              // Try playing muted as browsers allow muted autoplay
              console.log('🔇 Trying muted autoplay due to browser policy');
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => {
                // Show a message that video is muted
                console.log('✅ Video playing muted due to browser autoplay policy');
                setShowMutedNotice(true);
                setTimeout(() => setShowMutedNotice(false), 3000);
              }).catch(e => {
                console.error('❌ Error attempting to play video muted:', e);
                setIsPlaying(false);
              });
            } else if (error.name === 'NotSupportedError') {
              console.error('❌ Video format not supported or URL is invalid:', videoRef.current.src);
              console.error('❌ Full error:', error);
              setHasError(true);
              setErrorMessage('This video format is not supported by your browser or the file cannot be found.');
              setIsPlaying(false);
            } else {
              console.error('❌ Error attempting to play video:', error);
              setIsPlaying(false);
            }
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, autoPlay, mutedAutoPlay]);

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
      const isCurrentlyFullscreen = document.fullscreenElement != null;
      const wasFullscreen = isFullScreen;
      setIsFullScreen(isCurrentlyFullscreen);
      
      // If fullscreen was lost and we should restore it (during auto-next)
      if (wasFullscreen && !isCurrentlyFullscreen) {
        if (wasFullscreenBeforeTransition && !userManuallyExitedFullscreen) {
          // This is likely a browser-induced exit during video transition
          console.log('🔄 Fullscreen lost during transition - will restore');
          setTimeout(async () => {
            if (!fullscreenManager.isCurrentlyFullscreen() && fullscreenManager.shouldPromptForAutoNext()) {
              console.log('⚡ Showing fullscreen prompt after transition');
              fullscreenManager.showAutoNextFullscreenPrompt(playerContainerRef.current);
            }
          }, 100);
        } else if (isPlaying) {
          // User manually exited - remember this choice
          console.log('🔄 User manually exited fullscreen - remembering choice for this session');
          setUserManuallyExitedFullscreen(true);
        }
      }
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
  }, [isPlaying, isFullScreen, wasFullscreenBeforeTransition, userManuallyExitedFullscreen]);

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

  // Debug logging - check what we're actually getting
  console.log('🎬 Player received video object:', video);
  console.log('🎥 Final URL that will be used:', finalVideoUrl);
  
  if (!finalVideoUrl) {
    console.error('❌ No video URL found! Video object:', video);
  }

  const togglePlay = async () => {
    if (!isPlaying) {
      try {
        // Start video and try auto-fullscreen in same user gesture
        const playPromise = videoRef.current.play();
        
        // Try auto-fullscreen if enabled and not already in fullscreen
        if (!isFullScreen) {
          const autoFullscreenSuccess = await fullscreenManager.tryAutoFullscreen(playerContainerRef.current, true);
          if (autoFullscreenSuccess) {
            console.log('✅ Auto-fullscreen activated with user permission');
          } else {
            console.log('ℹ️ Auto-fullscreen not activated (disabled, denied, or cancelled)');
          }
        }
        
        // Wait for video to actually start
        await playPromise;
        setIsPlaying(true);
        
      } catch (error) {
        console.error("Error attempting to play video:", error);
        // Handle cases where autoplay is denied
        if (error.name === 'NotAllowedError') {
          // Try playing muted as browsers allow muted autoplay
          try {
            videoRef.current.muted = true;
            setIsMuted(true);
            await videoRef.current.play();
            setIsPlaying(true);
            setShowMutedNotice(true);
            setTimeout(() => setShowMutedNotice(false), 3000);
          } catch (mutedError) {
            console.error("Error playing video even when muted:", mutedError);
          }
        }
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
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

  const toggleFullScreen = async () => {
    // Use the simplified toggle method
    const success = await fullscreenManager.toggleFullscreen(playerContainerRef.current);
    if (!success && !isFullScreen) {
      console.log('Fullscreen request was not successful');
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
        crossOrigin="anonymous"
        preload="auto"
        src={finalVideoUrl}
        onClick={togglePlay}
        onError={(e) => {
          console.error('❌ Video element error:', e);
          console.error('❌ Video error code:', e.target?.error?.code);
          console.error('❌ Video error message:', e.target?.error?.message);
          console.error('❌ Video src at time of error:', e.target?.src);
        }}
        onLoadStart={() => console.log('✅ Video load started')}
        onCanPlay={() => console.log('✅ Video can play')}
        onProgress={(e) => {
          // Monitor buffering progress
          if (videoRef.current && videoRef.current.buffered.length > 0) {
            const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
            const duration = videoRef.current.duration;
            if (duration > 0) {
              const bufferedPercent = (bufferedEnd / duration) * 100;
              console.log(`📊 Buffered: ${bufferedPercent.toFixed(1)}%`);
            }
          }
        }}
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
      
      {/* Muted Notice */}
      {showMutedNotice && (
        <div className="muted-notice">
          <i className="fas fa-volume-mute"></i>
          <span>Playing muted - Click unmute button to enable sound</span>
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
