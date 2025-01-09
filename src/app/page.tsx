/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import PomodoroTimer from "@/components/PomodoroTimer";
import BackgroundImage from "@/components/BackgroundImage";
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMusic, faExpand } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Button } from "@/components/ui/button";
import { FaExpand, FaYoutube } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaSoundcloud } from "react-icons/fa"; // Change import
import { Arrow } from "@radix-ui/react-select";
import SoundCloudEmbed from "@/components/SoundCloudPlaylistEmbed";

export interface YoutubeVideo {
    id: string;
    title: string;
    thumbnail: string;
}

export interface SoundCloudPlaylist { // Change interface
    uri: string;
    name: string;
}


const GOOGLE_SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const exampleRecommendedPlaylists: SoundCloudPlaylist[] = [ // Change type
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

export default function Home() {
    const [timerVisible, setTimerVisible] = useState<boolean>(true);
    const [soundCloudVisible, setSoundCloudVisible] = useState<boolean>(true);
    const [youtubeSheetOpen, setYoutubeSheetOpen] = useState<boolean>(false);
    const [youtubeUrl, setYoutubeUrl] = useState<string>("https://www.youtube.com/watch?v=MYPVQccHhAQ");
    const [recommendedVideos, setRecommendedVideos] = useState<YoutubeVideo[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const [soundCloudSheetOpen, setSoundCloudSheetOpen] = useState<boolean>(false);
    const [soundCloudUrl, setSoundCloudUrl] = useState<string>("https://soundcloud.com/user943297256/sets/1yw05akauori")
    const [recommendedPlaylists, setRecommendedPlaylists] = useState<SoundCloudPlaylist[]>(exampleRecommendedPlaylists); 


    useEffect(() => {
        const fetchVideos = async () => {
            try {
                 const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet1?key=${GOOGLE_API_KEY}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                const rows = data.values;
                if (!rows || rows.length < 2) {
                   console.error("No data found in the Google Sheet.");
                   return;
                }
                const headers = rows[0];
                const idIndex = headers.indexOf('id');
                const titleIndex = headers.indexOf('title');
                const thumbnailIndex = headers.indexOf('thumbnail');


                if (idIndex === -1 || titleIndex === -1 || thumbnailIndex === -1) {
                   console.error("Required columns (id, title, thumbnail) not found in Google Sheet.");
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
        setYoutubeUrl(`https://www.youtube.com/watch?v=${videoId}`)
        setYoutubeSheetOpen(false);
    }

      const handleRecommendedPlaylistSelect = (playlistUri: string) => {
        setSoundCloudUrl(playlistUri);
        setSoundCloudSheetOpen(false);
      }


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

    return (
        <div className="relative h-screen w-screen overflow-hidden" ref={fullscreenRef}>
            <BackgroundImage youtubeUrl={youtubeUrl} />
            <div className="relative h-full w-full flex justify-center items-center">
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
            <div className="absolute bottom-12 left-12">
                {soundCloudVisible && (
                     <SoundCloudEmbed uri={soundCloudUrl} />
                )}
            </div>

            <div className="absolute top-4 right-12 flex gap-x-4">
                 <Sheet open={soundCloudSheetOpen} onOpenChange={setSoundCloudSheetOpen}>  {/* Changed state */}
                    <SheetTrigger asChild>
                        <Button
                            className={` text-white w-12 h-12 rounded-lg flex items-center justify-center  ${soundCloudSheetOpen ? '' : 'opacity-100'}`}
                        >
                             <FaSoundcloud className="text-lg" /> {/* Changed Icon */}
                        </Button>
                    </SheetTrigger>
                    <SheetContent >
                        <SheetHeader>
                            <SheetTitle>Enter SoundCloud Playlist URL</SheetTitle> {/* Changed title */}
                        </SheetHeader>
                        <form onSubmit={handleSoundCloudUrlSubmit}>  {/* Changed handler */}
                            <Input type="text" name="soundCloudUrl" placeholder="https://soundcloud.com/artist/sets/playlist" className="mb-4" /> {/* Changed input placeholder */}
                            <div className="flex justify-end gap-2 mb-6">
                                <SheetClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </SheetClose>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                          {recommendedPlaylists.length > 0 && (
                            <div className="flex flex-col">
                                <p className="font-bold mb-2">Recommended Playlists</p>
                                <ScrollArea className=" h-[550px] rounded-md">
                                    <div className="flex flex-col gap-2 pr-2 flex-1">
                                        {recommendedPlaylists.map(playlist => (
                                            <div key={playlist.uri} className="flex gap-2 items-center cursor-pointer hover:bg-slate-100 p-2 rounded" onClick={() => handleRecommendedPlaylistSelect(playlist.uri)}>
                                                 <span className="text-sm">{playlist.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                        <div className="mt-4 border-t pt-4">
                            <p className="font-medium text-gray-600 mb-2">
                                Contribute a PlayList SoundCloud
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                                If you have a SoundCloud that would be great for PlayList
                                please add it to our google sheet.
                            </p>
                                <a
                                href="https://docs.google.com/spreadsheets/d/10p2CTJUG1ChHWvMTGu5QojnoLdR0orMak8WWnEANttE/edit?usp=sharing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-sm  inline-flex items-center"
                                >
                                Open Google Sheet ↗
                                </a>
                        </div>
                    </SheetContent>
                </Sheet>
                <Sheet open={youtubeSheetOpen} onOpenChange={setYoutubeSheetOpen}>
                    <SheetTrigger asChild>
                        <Button
                            className={` text-white w-12 h-12 rounded-lg flex items-center justify-center  ${youtubeSheetOpen ? '' : 'opacity-100'}`}
                        >
                            <FaYoutube className="text-lg" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent >
                        <SheetHeader>
                            <SheetTitle>Enter Youtube URL</SheetTitle>
                        </SheetHeader>
                        <form onSubmit={handleYoutubeUrlSubmit}>
                            <Input type="text" name="youtubeUrl" placeholder="https://www.youtube.com/watch?v=example" className="mb-4" />
                            <div className="flex justify-end gap-2 mb-6">
                                <SheetClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </SheetClose>
                                <Button type="submit">Save</Button>
                            </div>
                        </form>
                          {recommendedVideos.length > 0 && (
                            <div className="flex flex-col">
                                <p className="font-bold mb-2">Recommended Videos</p>
                                <ScrollArea className=" h-[550px] rounded-md">
                                    <div className="flex flex-col gap-2 pr-2 flex-1">
                                        {recommendedVideos.map(video => (
                                            <div key={video.id} className="flex gap-2 items-center cursor-pointer hover:bg-slate-100 p-2 rounded" onClick={() => handleRecommendedVideoSelect(video.id)}>
                                                <img src={video.thumbnail} alt={video.title} className="w-24 rounded"/>
                                                <span className="text-sm">{video.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                        <div className="mt-4 border-t pt-4">
                            <p className="font-medium text-gray-600 mb-2">
                                Contribute a background video
                            </p>
                            <p className="text-sm text-gray-500 mb-2">
                                If you have a Youtube video that would be great for background
                                please add it to our google sheet.
                            </p>
                                <a
                                href="https://docs.google.com/spreadsheets/d/10p2CTJUG1ChHWvMTGu5QojnoLdR0orMak8WWnEANttE/edit?usp=sharing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-sm  inline-flex items-center"
                                >
                                    Open Google Sheet ↗
                                </a>
                        </div>
                    </SheetContent>
                </Sheet>
                <Button
                    className={` text-white w-12 h-12  rounded-lg flex items-center justify-center  ${timerVisible ? '' : 'opacity-50'}`}
                    onClick={toggleTimer}
                >
                    <FontAwesomeIcon icon={faClock} size="lg" />
                </Button>
                <Button
                    className={`text-white w-12 h-12  rounded-lg flex items-center justify-center ${soundCloudVisible ? '' : 'opacity-50'}`} // Changed state
                    onClick={toggleSoundCloud} 
                >
                    <FontAwesomeIcon icon={faMusic} size="lg" />
                </Button>
            </div>


            <div className="absolute bottom-12 right-12">
                <Button
                    className="text-white w-12 h-12 bg-transparent"
                    onClick={handleFullscreen}
                >
                    <FaExpand className="w-full h-full" />
                </Button>
            </div>
        </div>
    );
}