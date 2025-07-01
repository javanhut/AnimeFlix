import React from 'react';
import { Link } from 'react-router-dom';

const VideoListItem = ({ video }) => {
  return (
    <Link to={`/watch/${video.id}`} className="list-group-item list-group-item-action">
      <div className="video-list media">
        <div className="media-left">
          <img className="media-object" src={video.thumbnail} alt={video.title} />
        </div>
        <div className="media-body">
          <div className="media-heading">{video.title}</div>
        </div>
      </div>
    </Link>
  );
};

export default VideoListItem;
