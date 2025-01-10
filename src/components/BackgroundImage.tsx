/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback, useRef } from "react";

interface BackgroundImageProps {
    youtubeUrl?: string;
    isMuted: boolean;
    onMuteChange: (muted: boolean) => void;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ youtubeUrl, isMuted, onMuteChange }) => {
    const [error, setError] = useState<string | null>(null);
    const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const playerRef = useRef<any>(null); 
     const [isPlayerReady, setIsPlayerReady] = useState(false);

    const extractVideoId = useCallback((url: string): string | null => {
        if (!url) return null;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : null;
    }, []);

    const generateYoutubeEmbedUrl = useCallback((youtubeUrl: string): string | null => {
        const videoId = extractVideoId(youtubeUrl);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?start=60&loop=1&playlist=${videoId}&showinfo=0&controls=0&disablekb=0&fs=0&rel=0&iv_load_policy=3&autoplay=1&mute=1&modestbranding=1&playsinline=1&enablejsapi=1&widgetid=1`;
        }
        return null;
    }, [extractVideoId]);

    useEffect(() => {
        if (!youtubeUrl) {
            setYoutubeEmbedUrl(null);
            playerRef.current = null;
            setIsPlayerReady(false);
            return;
        }

        setIsLoading(true);
        const newEmbedUrl = generateYoutubeEmbedUrl(youtubeUrl);

        if (newEmbedUrl) {
            setYoutubeEmbedUrl(newEmbedUrl);
        } else {
            setError("Invalid Youtube URL");
        }
        setIsLoading(false);
    }, [youtubeUrl, generateYoutubeEmbedUrl]);

    useEffect(() => {
        if (youtubeEmbedUrl) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            (window as any).onYouTubeIframeAPIReady = () => {
                if (youtubeEmbedUrl) {
                    playerRef.current = new (window as any).YT.Player('video-player', {
                        events: {
                            'onReady': onPlayerReady
                        }
                    });
                }
            };
            return () => {
                (window as any).onYouTubeIframeAPIReady = undefined;
            };
        }
    }, [youtubeEmbedUrl]);

    const onPlayerReady = (event: any) => {
          setIsPlayerReady(true);
        if (event.target) {
            if (isMuted) {
                event.target.mute();
            } else {
                event.target.unMute();
            }
        }
    };

    // const toggleMute = () => {
    //      if (playerRef.current && isPlayerReady) {
    //        if(isMuted) {
    //              playerRef.current.unMute();
    //             onMuteChange(false);
    //         } else {
    //              playerRef.current.mute();
    //            onMuteChange(true);
    //        }
    //       }
    // };


      useEffect(() => {
        if (playerRef.current && isPlayerReady) {
            if(isMuted){
                playerRef.current.mute();
            } else {
                playerRef.current.unMute();
            }
        }
    }, [isMuted, playerRef, isPlayerReady]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[-1] bg-black flex justify-center items-center text-white">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-300"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[-1] bg-black flex justify-center items-center text-red-500">
                {error}
            </div>
        );
    }

    let backgroundContent = null;
    if (youtubeEmbedUrl) {
        backgroundContent = (
            <>
                <iframe
                    id="video-player"
                    className="pointer-events-none absolute left-1/2 top-1/2 box-border h-[56.25vw] min-h-full w-screen min-w-full -translate-x-1/2 -translate-y-1/2"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Youtube Background"
                    src={youtubeEmbedUrl}
                />
            </>
        );
    }

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />
            {backgroundContent}
        </div>
    );
};

export default BackgroundImage;