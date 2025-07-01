import React from 'react';
import Player from './Player';

const TestPlayer = () => {
  const testVideo = {
    id: 'test-video',
    title: 'Test Episode 1',
    description: 'Testing sub/dub switching functionality',
    duration: '24min',
    videoSources: {
      sub: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Working test video
      dub: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'  // Different test video to show switching
    },
    hasSubtitles: true,
    hasDub: true,
    defaultLanguage: 'sub'
  };

  const handleVideoEnd = () => {
    console.log('Video ended');
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#000' }}>
      <Player 
        video={testVideo}
        onVideoEnd={handleVideoEnd}
        autoPlay={false}
      />
    </div>
  );
};

export default TestPlayer;