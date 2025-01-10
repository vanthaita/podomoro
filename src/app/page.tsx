/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';
import PomodoroTimer from "@/components/PomodoroTimer";
import BackgroundImage from "@/components/BackgroundImage";
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMusic, faVolumeUp, faVolumeMute, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Button } from "@/components/ui/button";
import { FaDivide, FaExpand, FaYoutube } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaSoundcloud } from "react-icons/fa";
import SoundCloudEmbed from "@/components/SoundCloudPlaylistEmbed";
import axios from 'axios';
import { useDrag } from 'react-use-gesture';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { ResizeCallbackData } from 'react-resizable';


interface YoutubeVideo {
    id: string;
    title: string;
    thumbnail: string;
}

interface SoundCloudPlaylist {
    uri: string;
    name: string;
}

const GOOGLE_SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const exampleRecommendedPlaylists: SoundCloudPlaylist[] = [
    {
        uri: "https://soundcloud.com/devnguyxn/hanoiyeuem2",
        name: "Playlist 1",
    },
    {
        uri: "https://soundcloud.com/relaxing-music-production/sets/piano-covers",
        name: "Playlist 2",
    },
    {
        uri: "https://soundcloud.com/knightvibes/sets/calm-study-lofi-hiphop-beats",
        name: "Playlist 3",
    },
    {
        uri: "https://soundcloud.com/game-of-thrones-songs/opening-theme-game-of-thrones",
        name: "Playlist 4",
    },
    {
        uri: "https://soundcloud.com/alesia-arkusha/sets/miss-monique-mimo-weekly",
        name: "Playlist 5",
    },
];

interface ISheetButton {
    sheetOpen: boolean;
    setSheetOpen: (open: boolean) => void;
    icon: React.ReactNode;
    title: string;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    placeholder: string;
    inputName: string;
    recommendedItems: any[];
    onSelectRecommended: (item: string) => void;
    contributeLink: string;
    isYoutube?:boolean
}

const SheetButton = ({
    sheetOpen,
    setSheetOpen,
    icon,
    title,
    onSubmit,
    placeholder,
    inputName,
    recommendedItems,
    onSelectRecommended,
    contributeLink,
    isYoutube
}: ISheetButton) => {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
                <Button
                    className={` text-white w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center  ${sheetOpen ? '' : 'opacity-100'}`}
                >
                    {icon}
                </Button>
            </SheetTrigger>
            <SheetContent >
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                </SheetHeader>
                <form onSubmit={onSubmit}>
                    <Input type="text" name={inputName} placeholder={placeholder} className="mb-4" />
                    <div className="flex justify-end gap-2 mb-6">
                        <SheetClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </SheetClose>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
                {recommendedItems.length > 0 && (
                    <div className="flex flex-col">
                        <p className="font-bold mb-2">Recommended {isYoutube ? 'Videos' : 'Playlists'}</p>
                        <ScrollArea className=" h-[300px] md:h-[550px] rounded-md">
                            <div className="flex flex-col gap-2 pr-2 flex-1">
                                {recommendedItems.map((item:any) => (
                                    <div key={isYoutube ? item.id : item.uri} className="flex gap-2 items-center cursor-pointer hover:bg-slate-100 p-2 rounded" onClick={() => onSelectRecommended(isYoutube ? item.id : item.uri)}>
                                        {isYoutube &&  <img src={item.thumbnail} alt={item.title} className="w-16 rounded"/>}
                                       <span className="text-sm">{isYoutube ? item.title: item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
                <div className="mt-4 border-t pt-4">
                    <p className="font-medium text-gray-600 mb-2">
                        Contribute a {isYoutube ? 'background video' : 'playlist' }
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                        If you have a {isYoutube ? 'Youtube video' : 'SoundCloud playlist'} that would be great for background
                        please add it to our google sheet.
                    </p>
                    <a
                        href={contributeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm  inline-flex items-center"
                    >
                        Open Google Sheet ↗
                    </a>
                </div>
            </SheetContent>
        </Sheet>
    );
};


export default function Home() {
    const [timerVisible, setTimerVisible] = useState<boolean>(true);
    const [soundCloudVisible, setSoundCloudVisible] = useState<boolean>(true);
    const [youtubeSheetOpen, setYoutubeSheetOpen] = useState<boolean>(false);
    const [youtubeUrl, setYoutubeUrl] = useState<string>("https://www.youtube.com/watch?v=MYPVQccHhAQ");
    const [recommendedVideos, setRecommendedVideos] = useState<YoutubeVideo[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const [soundCloudSheetOpen, setSoundCloudSheetOpen] = useState<boolean>(false);
    const [soundCloudUrl, setSoundCloudUrl] = useState<string>("https://soundcloud.com/user943297256/sets/1yw05akauori");
    const [recommendedPlaylists, setRecommendedPlaylists] = useState<SoundCloudPlaylist[]>(exampleRecommendedPlaylists);
    const [isMuted, setIsMuted] = useState<boolean>(true);
    const [videoCallPosition, setVideoCallPosition] = useState({ x: 40, y: 40 });
    const [videoCallSize, setVideoCallSize] = useState({ width: 300, height: 200 });
    const [isVideo, setIsVideo] = useState<boolean>(true);
    const videoCallRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [loadingVideos, setLoadingVideos] = useState(true);
    const zIndices = {
        background: 1,
        videoCall: 2,
        timer: 3,
        soundCloud: 4,
        buttons: 5,
    };


    useEffect(() => {
        const fetchVideos = async () => {
            setLoadingVideos(true);
            try {
                const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet1?key=${GOOGLE_API_KEY}`);
                const data = await response.data;
                
                const rows = data.values;
                if (!rows || rows.length < 2) {
                   
                    return;
                }
                const headers = rows[0];
                const idIndex = headers.indexOf('id');
                const titleIndex = headers.indexOf('title');
                const thumbnailIndex = headers.indexOf('thumbnail');


                if (idIndex === -1 || titleIndex === -1 || thumbnailIndex === -1) {
                    return;
                }
                const fetchedVideos = rows.slice(1).map((row: string[]) => {
                    return ({
                        id: row[idIndex],
                        title: row[titleIndex],
                        thumbnail: row[thumbnailIndex],
                    })
                });


                setRecommendedVideos(fetchedVideos);
            } catch (error) {
                console.error("Error fetching data from Google Sheets:", error);
               
            } finally {
                setLoadingVideos(false);
            }
        };
        fetchVideos();
    }, []);


    const toggleTimer = () => {
        setTimerVisible(!timerVisible);
    };

    const toggleSoundCloud = () => {
        setSoundCloudVisible(!soundCloudVisible);
    };
    const handleVideo = () => {
        setIsVideo(!isVideo);
    };
    
    const handleYoutubeUrlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const newUrl = form.youtubeUrl.value;
        setYoutubeUrl(newUrl);
        setYoutubeSheetOpen(false);
    };

    const handleSoundCloudUrlSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const newUrl = form.soundCloudUrl.value;
        setSoundCloudUrl(newUrl);
        setSoundCloudSheetOpen(false);
    };

    const handleRecommendedVideoSelect = (videoId: string) => {
        setYoutubeUrl(`https://www.youtube.com/watch?v=${videoId}`);
        setYoutubeSheetOpen(false);
    };

    const handleRecommendedPlaylistSelect = (playlistUri: string) => {
        setSoundCloudUrl(playlistUri);
        setSoundCloudSheetOpen(false);
    };

    const handleFullscreen = () => {
        if (fullscreenRef.current) {
            if (!isFullscreen) {
                if (fullscreenRef.current.requestFullscreen) {
                    fullscreenRef.current.requestFullscreen();
                } else if ((fullscreenRef.current as any).mozRequestFullScreen) {
                    (fullscreenRef.current as any).mozRequestFullScreen();
                } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
                    (fullscreenRef.current as any).webkitRequestFullscreen();
                } else if ((fullscreenRef.current as any).msRequestFullscreen) {
                    (fullscreenRef.current as any).msRequestFullscreen();
                }
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if ((document as any).mozCancelFullScreen) {
                    (document as any).mozCancelFullScreen();
                } else if ((document as any).webkitExitFullscreen) {
                    (document as any).webkitExitFullscreen();
                } else if ((document as any).msExitFullscreen) {
                    (document as any).msExitFullscreen();
                }
                setIsFullscreen(false);
            }
        }
    };


    const handleMuteToggle = () => {
        setIsMuted(!isMuted);
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);


        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);


     const bind = useDrag(({ offset: [x, y] }) => {
        if (!videoCallRef.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const boxRect = videoCallRef.current.getBoundingClientRect();

        const maxX = containerRect.width - boxRect.width;
        const maxY = containerRect.height - boxRect.height;

        setVideoCallPosition({
            x: Math.max(0, Math.min(x, maxX)),
            y: Math.max(0, Math.min(y, maxY)),
        });
    });


    const handleResize = (e: any, data: ResizeCallbackData) => {
        const { size } = data;
         setVideoCallSize(size);
    };


    return (
        <div className="relative h-screen w-screen overflow-hidden" ref={fullscreenRef}>
            <div style={{ zIndex: zIndices.background }}>
                <BackgroundImage
                    youtubeUrl={youtubeUrl}
                    isMuted={isMuted}
                    onMuteChange={setIsMuted}
                />
            </div>
            {isVideo && (
                <div className="px-8 pt-16 pb-12 w-full h-full relative">
                    <div ref={containerRef} className=" w-full h-full rounded-xl relative" style={{ zIndex: zIndices.videoCall}}>
                            <div
                                {...bind()}
                                ref={videoCallRef}
                                style={{
                                    left: videoCallPosition.x,
                                    top: videoCallPosition.y,
                                    width: videoCallSize.width,
                                        height: videoCallSize.height,
                                }}
                                    className="absolute bg-[#36393f] border border-[#202225] rounded-md shadow-lg  overflow-hidden cursor-move flex flex-col items-center justify-center p-4"
                                >
                                    <div className="flex items-center justify-center w-24 h-24 bg-gray-700 rounded-full border-4 border-gray-500">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={2}
                                            stroke="currentColor"
                                            className="w-16 h-16 text-gray-300"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5.121 17.804A7 7 0 0112 10a7 7 0 016.879 7.804M12 10a4 4 0 100-8 4 4 0 000 8z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                        </div>
                </div>
            )}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: zIndices.timer }}>
               {timerVisible && (
                    <PomodoroTimer
                        settings={{
                            workDuration: 25 * 60,
                            shortBreakDuration: 5 * 60,
                            longBreakDuration: 15 * 60,
                        }}
                    />
                )}
            </div>
             <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12" style={{ zIndex: zIndices.soundCloud }}>
                {soundCloudVisible && (
                    <SoundCloudEmbed uri={soundCloudUrl} />
                )}
            </div>
            <div className="absolute top-4 right-4 flex gap-x-2 md:top-4 md:right-12 md:gap-x-4" style={{ zIndex: zIndices.buttons }}>
               <SheetButton
                   sheetOpen={soundCloudSheetOpen}
                   setSheetOpen={setSoundCloudSheetOpen}
                   icon={<FaSoundcloud className="text-lg" />}
                   title="Enter SoundCloud Playlist URL"
                   onSubmit={handleSoundCloudUrlSubmit}
                   placeholder="https://soundcloud.com/artist/sets/playlist"
                   inputName="soundCloudUrl"
                   recommendedItems={recommendedPlaylists}
                   onSelectRecommended={handleRecommendedPlaylistSelect}
                   contributeLink="https://docs.google.com/spreadsheets/d/10p2CTJUG1ChHWvMTGu5QojnoLdR0orMak8WWnEANttE/edit?usp=sharing"
                   isYoutube={false}
                />
                <SheetButton
                   sheetOpen={youtubeSheetOpen}
                   setSheetOpen={setYoutubeSheetOpen}
                   icon={<FaYoutube className="text-lg" />}
                   title="Enter Youtube URL"
                   onSubmit={handleYoutubeUrlSubmit}
                   placeholder="https://www.youtube.com/watch?v=example"
                   inputName="youtubeUrl"
                   recommendedItems={recommendedVideos}
                   onSelectRecommended={handleRecommendedVideoSelect}
                   contributeLink="https://docs.google.com/spreadsheets/d/10p2CTJUG1ChHWvMTGu5QojnoLdR0orMak8WWnEANttE/edit?usp=sharing"
                   isYoutube={true}
                />
                <Button
                    className={` text-white w-10 h-10 md:w-12 md:h-12  rounded-lg flex items-center justify-center  ${timerVisible ? '' : 'opacity-50'}`}
                    onClick={toggleTimer}
                >
                    <FontAwesomeIcon icon={faClock} size="lg" />
                </Button>
                <Button
                    className={`text-white w-10 h-10 md:w-12 md:h-12  rounded-lg flex items-center justify-center ${soundCloudVisible ? '' : 'opacity-50'}`}
                    onClick={toggleSoundCloud}
                >
                    <FontAwesomeIcon icon={faMusic} size="lg" />
                </Button>
                <Button
                   className="text-white w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
                   onClick={handleMuteToggle}
                >
                    <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} size="lg" />
                </Button>
                <Button
                   className="text-white w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
                   onClick={handleVideo}
                >
                    <FontAwesomeIcon icon={isVideo ? faVideo : faVideoSlash} size="lg" />
                </Button>
            </div>
            <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12" style={{ zIndex: zIndices.buttons }}>
                <Button
                    className="text-white w-10 h-10 md:w-12 md:h-12 bg-transparent"
                    onClick={handleFullscreen}
                >
                    <FaExpand className="w-full h-full" />
                </Button>
            </div>
        </div>
    );
}