import React from 'react';
import './VideoPreview.css';
import video from './video.jpg'


const VideoPreview = () => {

  return (
   <div className='video-container'>
      <a href="https://www.instagram.com/p/C8Cij8wCXsV/" target="_blank" rel="noopener noreferrer">
      <img src={video} alt="Öncü Spor Kulübü Video" />
      </a>
   </div>
  );
};

export default VideoPreview;