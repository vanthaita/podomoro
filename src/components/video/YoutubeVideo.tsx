// components/YoutubeVideo.tsx
import React from 'react';

interface YoutubeVideoProps {
  youtubeUrl: string;
  isMuted: boolean;
}

const YoutubeVideo: React.FC<YoutubeVideoProps> = ({ youtubeUrl, isMuted }) => {
  const videoId = youtubeUrl.split('v=')[1]?.split('&')[0];

  if (!videoId) return null;
  
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`;


  return (
    <div className="absolute inset-0 w-full h-full ">
        <iframe
            width="100%"
            height="100%"
            src={embedUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        ></iframe>
    </div>
  );
};

export default YoutubeVideo;