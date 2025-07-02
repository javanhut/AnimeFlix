import React, { useState, useEffect } from 'react';
import fullscreenManager from '../utils/fullscreenManager';

const FullscreenSettings = () => {
  const [currentPermission, setCurrentPermission] = useState(null);
  const [autoFullscreenEnabled, setAutoFullscreenEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('animeflix_fullscreen_permission');
    setCurrentPermission(stored);
    
    const autoFullscreen = fullscreenManager.getAutoFullscreenSetting();
    setAutoFullscreenEnabled(autoFullscreen);
  }, []);

  const handleResetPermission = () => {
    fullscreenManager.resetPermission();
    setCurrentPermission(null);
  };

  const handleAutoFullscreenToggle = (enabled) => {
    fullscreenManager.setAutoFullscreenSetting(enabled);
    setAutoFullscreenEnabled(enabled);
    
    // If disabling, also reset permission
    if (!enabled) {
      fullscreenManager.resetPermission();
      setCurrentPermission(null);
    }
  };

  const getPermissionText = () => {
    switch (currentPermission) {
      case 'granted':
        return 'Permission granted - Videos will auto-fullscreen';
      case 'denied':
        return 'Permission denied - Auto-fullscreen blocked';
      default:
        return 'Permission will be requested on first play';
    }
  };

  const getPermissionIcon = () => {
    switch (currentPermission) {
      case 'granted':
        return '✅';
      case 'denied':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div style={{
      padding: '20px',
      background: '#1a1a1a',
      borderRadius: '8px',
      margin: '10px 0',
      color: 'white'
    }}>
      <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🎬 Auto-Fullscreen Settings
      </h3>
      
      {/* Auto-Fullscreen Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        padding: '15px',
        background: '#2a2a2a',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontWeight: '600', marginBottom: '5px' }}>
            Enable Auto-Fullscreen
          </div>
          <div style={{ color: '#ccc', fontSize: '14px' }}>
            Automatically enter fullscreen when playing videos
          </div>
        </div>
        <label style={{
          position: 'relative',
          display: 'inline-block',
          width: '60px',
          height: '34px'
        }}>
          <input
            type="checkbox"
            checked={autoFullscreenEnabled}
            onChange={(e) => handleAutoFullscreenToggle(e.target.checked)}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: autoFullscreenEnabled ? '#e50914' : '#4a4a4a',
            transition: '0.4s',
            borderRadius: '34px'
          }}>
            <span style={{
              position: 'absolute',
              content: '',
              height: '26px',
              width: '26px',
              left: autoFullscreenEnabled ? '30px' : '4px',
              bottom: '4px',
              backgroundColor: 'white',
              transition: '0.4s',
              borderRadius: '50%'
            }}></span>
          </span>
        </label>
      </div>

      {/* Status Display */}
      {autoFullscreenEnabled && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '15px',
          padding: '12px',
          background: currentPermission === 'granted' ? '#1a4a1a' : currentPermission === 'denied' ? '#4a1a1a' : '#4a4a1a',
          borderRadius: '6px'
        }}>
          <span style={{ fontSize: '20px' }}>{getPermissionIcon()}</span>
          <span>{getPermissionText()}</span>
        </div>
      )}
      
      <p style={{
        margin: '0 0 15px 0',
        color: '#ccc',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        When auto-fullscreen is enabled, videos will automatically enter fullscreen mode when you click play.
        Auto-next episodes will also maintain fullscreen mode seamlessly.
        {autoFullscreenEnabled && !currentPermission && 
          ' A permission dialog will appear the first time you play a video.'
        }
      </p>
      
      {autoFullscreenEnabled && currentPermission && (
        <button
          onClick={handleResetPermission}
          style={{
            background: '#e50914',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '10px'
          }}
          onMouseEnter={(e) => e.target.style.background = '#f40612'}
          onMouseLeave={(e) => e.target.style.background = '#e50914'}
        >
          Reset Permission
        </button>
      )}
      
      {autoFullscreenEnabled && currentPermission && (
        <p style={{
          margin: '0',
          color: '#888',
          fontSize: '12px'
        }}>
          Resetting will test auto-fullscreen permission again the next time you play a video.
        </p>
      )}
    </div>
  );
};

export default FullscreenSettings;