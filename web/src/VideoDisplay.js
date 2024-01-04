import React, { useState } from 'react';

const VideoDisplay = ({ videoUrl }) => {
  return (
    <div>
      <h2>Processed Video</h2>
      <video controls width="640" height="360">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoDisplay;
