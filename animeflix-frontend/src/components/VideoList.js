import React from 'react';
import VideoListItem from './VideoListItem';

const VideoList = ({ videos }) => {
  const renderedVideos = videos.map(video => {
    return (
      <VideoListItem
        key={video.id}
        video={video}
      />
    );
  });

  return <ul className="list-group">{renderedVideos}</ul>;
};

export default VideoList;