import React from 'react';
import Player from './Player';

const PlayerTest = () => {
  const testVideo = {
    id: 'test-video-demo',
    title: 'Demo Episode - Language Switcher Test',
    description: 'Testing the complete player with all features including sub/dub switching',
    duration: '10min',
    videoSources: {
      sub: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      dub: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
    },
    hasSubtitles: true,
    hasDub: true,
    defaultLanguage: 'sub'
  };

  const handleVideoEnd = () => {
    console.log('Demo video ended');
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        color: 'white', 
        zIndex: 1001,
        background: 'rgba(0,0,0,0.8)',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>🎬 Complete Player Test</h3>
        <p style={{ margin: '5px 0' }}>✅ Language Switcher (SUB/DUB)</p>
        <p style={{ margin: '5px 0' }}>✅ Play/Pause Controls</p>
        <p style={{ margin: '5px 0' }}>✅ Skip Forward/Back (10s)</p>
        <p style={{ margin: '5px 0' }}>✅ Fullscreen Toggle</p>
        <p style={{ margin: '5px 0' }}>✅ Volume Controls</p>
        <p style={{ margin: '5px 0' }}>✅ Auto-hide Controls</p>
        <p style={{ margin: '5px 0', color: '#10b981' }}>🔤 Click Language Button →</p>
      </div>
      
      <Player 
        video={testVideo}
        onVideoEnd={handleVideoEnd}
        autoPlay={false}
      />
    </div>
  );
};

export default PlayerTest;