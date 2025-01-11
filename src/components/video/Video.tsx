import React, { useEffect, useRef } from 'react';

interface VideoProps {
    stream: MediaStream;
    myId: string;
    isLocal?: boolean;
}

const Video: React.FC<VideoProps> = ({ stream, myId, isLocal }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div style={{flex: 1, maxWidth: '300px', }}>
          <h3>{isLocal ? "Me" : "User "+ myId}</h3>
          <video ref={videoRef} autoPlay muted={isLocal} playsInline style={{width:'100%', aspectRatio:16/9}}/>

        </div>
    );
};

export default Video;