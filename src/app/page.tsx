/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
'use client';
import PomodoroTimer from "@/components/PomodoroTimer";
import BackgroundImage from "@/components/background/BackgroundImage";
import { useState, useEffect, useRef } from 'react';
import { faClock, faMusic, faVolumeUp, faVolumeMute, faVideo, faVideoSlash, faList, faTableList } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Button } from "@/components/ui/button";
import { FaExpand, FaYoutube, FaList, FaListAlt, FaListOl } from "react-icons/fa";
import { FaSoundcloud } from "react-icons/fa";
import SoundCloudEmbed from "@/components/SoundCloud/SoundCloudPlaylistEmbed";
import axios from 'axios';
import 'react-resizable/css/styles.css';
import SheetButton from "@/components/SheetButton";
import SettingsMenu from "@/components/settings/SettingsMenu";
import SettingsButton from "@/components/settings/SettingsButton";
import TodoList from "@/components/TodoList";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useLocalStorage from "@/hook/useLocalStorage";

interface YoutubeVideoType {
    id: string;
    title: string;
    thumbnail: string;
}

interface SoundCloudPlaylist {
    name: string;
    uri: string;
}

const GOOGLE_SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export default function Home() {
    const [timerVisible, setTimerVisible] = useState<boolean>(true);
    const [soundCloudVisible, setSoundCloudVisible] = useState<boolean>(true);
    const [youtubeSheetOpen, setYoutubeSheetOpen] = useState<boolean>(false);
    const [youtubeUrl, setYoutubeUrl] = useState<string>("https://www.youtube.com/watch?v=MYPVQccHhAQ");
    const [recommendedVideos, setRecommendedVideos] = useState<YoutubeVideoType[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const [soundCloudSheetOpen, setSoundCloudSheetOpen] = useState<boolean>(false);
    const [soundCloudUrl, setSoundCloudUrl] = useState<string>("https://soundcloud.com/devnguyxn/hanoiyeuem2");
    const [recommendedPlaylists, setRecommendedPlaylists] = useState<SoundCloudPlaylist[]>([]);
    const [isMuted, setIsMuted] = useState<boolean>(true);
    const [videoCallPosition, setVideoCallPosition] = useState({ x: 40, y: 40 });
    const [videoCallSize, setVideoCallSize] = useState({ width: 300, height: 200 });
    const [isVideo, setIsVideo] = useState<boolean>(true);
    const containerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
    const [loadingVideos, setLoadingVideos] = useState(true);
    const [loadingPlayList, setLoadingPlayList] = useState(true);
    const [todoListVisible, setTodoListVisible] = useState(true);
    const [todoPosition, setTodoPosition] = useState({ x: 0, y: 0 });

    const [userName, setUserName] = useLocalStorage<string>('pomodoroUserName', "Guest")
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [timestamp, setTimestamp] = useState<string>("");
    
    const zIndices = {
        background: 1,
        videoCall: 2,
        todo: 3,
        timer: 4,
        soundCloud: 5,
        buttons: 6
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
    useEffect(() => {
        const fetchPlayLists = async () => {
            setLoadingPlayList(true);
            try {
                const response = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet2?key=${GOOGLE_API_KEY}`);
                const data = await response.data;
                const rows = data.values;
                 if (!rows || rows.length < 2) {
                    return;
                }
                const headers = rows[0];
                const nameIndex = headers.indexOf('Name');
                const urlIndex = headers.indexOf('Url');

                if (nameIndex === -1 || urlIndex === -1) {
                    return;
                }
                const fetchedPlaylists = rows.slice(1).map((row: string[]) => {
                  return {
                      name: row[nameIndex],
                      uri: row[urlIndex],
                  };
                });


                setRecommendedPlaylists(fetchedPlaylists);
            } catch (error) {
                console.error("Error fetching data from Google Sheets:", error);

            } finally {
                setLoadingPlayList(false);
            }
        };
        fetchPlayLists();
    }, []);
     const formatTimestamp = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };
    const getLocalStorageData = () => {
        try {
            const storedData = localStorage.getItem('pomodoro_app_data');
            if (storedData) {
                return JSON.parse(storedData);
            }
            return {
                isRunning: false,
                startTime: 0,
                timestamp: "",
            };
        } catch (error) {
            console.error("Error reading data from local storage", error);
            return {
                isRunning: false,
                startTime: 0,
                timestamp: "",
            };
        }
    };

     const saveLocalStorageData = (data: any) => {
        try {
            localStorage.setItem('pomodoro_app_data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to local storage', error);
        }
    };

    const sendDataToGoogleSheet = async (data: any) => {
        try {
            const sheetData = [
                userName,
                data.timestamp,
                data.totalTime,
                data.focusTime,
                data.shortBreakTime,
                data.longBreakTime,
                youtubeUrl,
                soundCloudUrl
            ];

            await axios.post(
                `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet3:append?valueInputOption=USER_ENTERED`,
                { values: [sheetData] },
                {
                    params: { key: GOOGLE_API_KEY },
                }
            )
            console.log(sheetData);
           await toast(
              "Data saved"
           );
        } catch (error) {
            console.error("Error sending data to Google Sheets:", error);
           await toast(
                "Error"
           );
        }
    };

    const handleStartTimer = () => {
        const now = Date.now();
        const formattedTimestamp = formatTimestamp(new Date(now));
        setStartTime(now);
        setIsRunning(true);
        setTimestamp(formattedTimestamp)
        saveLocalStorageData({
            isRunning: true,
            startTime: now,
            timestamp: formattedTimestamp,
        });
    }

    const handleFinishTimer = async (workDuration: number, shortBreakDuration: number, longBreakDuration: number, actualTime: number) => {

        setIsRunning(false);
        const timeElapsed = actualTime
        const focusTime = workDuration - (actualTime >= workDuration ? 0 : (workDuration - actualTime))
        const shortBreakTime = actualTime > workDuration ? (actualTime > (workDuration+shortBreakDuration) ? shortBreakDuration :  (actualTime - workDuration) ) : 0
        const longBreakTime = actualTime > (workDuration + shortBreakDuration)? actualTime - (workDuration + shortBreakDuration) : 0;

        const dataToSave = {
            timestamp: timestamp,
            totalTime: timeElapsed,
            focusTime: focusTime,
            shortBreakTime: shortBreakTime,
            longBreakTime: longBreakTime,
        };
        await sendDataToGoogleSheet(dataToSave);
        console.log(dataToSave);
        saveLocalStorageData({
            isRunning: false,
            startTime: 0,
            timestamp: "",
        });
        setStartTime(0);
        setTimestamp("");
        
    };

    useEffect(() => {
       const localStorageData = getLocalStorageData();
        setIsRunning(localStorageData.isRunning);
        setStartTime(localStorageData.startTime);
        setTimestamp(localStorageData.timestamp);

       const handleBeforeUnload = async (event: any) => {
             if (isRunning) {
                 const now = Date.now();
                 const timeElapsed = Math.round((now - startTime) / 1000)
                 const localStorageData = getLocalStorageData()
                 const nowTimeStamp = formatTimestamp(new Date(localStorageData.startTime))

                 const dataToSave = {
                    timestamp: nowTimeStamp,
                    totalTime: timeElapsed,
                     focusTime: 0,
                    shortBreakTime: 0,
                    longBreakTime: 0,
                 };
                await sendDataToGoogleSheet(dataToSave);
           }
            saveLocalStorageData({
                isRunning: false,
                startTime: 0,
                timestamp: "",
            });
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isRunning, startTime]);

    const toggleTimer = () => {
        setTimerVisible(!timerVisible);
    };

    const toggleSoundCloud = () => {
        setSoundCloudVisible(!soundCloudVisible);
    };
    const handleVideo = () => {
        setIsVideo(!isVideo);
    };
    const toggleTodoList = () => {
        setTodoListVisible(!todoListVisible);
    }
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




    return (
        <div className="relative h-screen w-screen overflow-hidden" ref={fullscreenRef}>
            <ToastContainer />
            <div style={{ zIndex: zIndices.background }}>
                <BackgroundImage
                    youtubeUrl={youtubeUrl}
                    isMuted={isMuted}
                    onMuteChange={setIsMuted}
                />
            </div>
            {/* {isVideo && (
                <div className="px-8 pt-16 pb-12 w-full h-full relative">
                    <div
                       ref={containerRef}
                       className=" w-full h-full rounded-xl relative"
                       style={{ zIndex: zIndices.videoCall, minWidth: 250, minHeight: 200, }}
                    >
                        <VideoCall
                           containerRef={containerRef}
                           videoCallPosition={videoCallPosition}
                           setVideoCallPosition={setVideoCallPosition}
                           videoCallSize={videoCallSize}
                           setVideoCallSize={setVideoCallSize}
                        />
                   </div>
                </div>
            )} */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ zIndex: zIndices.timer }}>
               {timerVisible && (
                    <PomodoroTimer
                        settings={{
                            workDuration: 25 * 60,
                            shortBreakDuration: 5 * 60,
                            longBreakDuration: 15 * 60,
                        }}
                        onStart={handleStartTimer}
                         onFinish={handleFinishTimer}
                    />
                )}
            </div>
            <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12" style={{ zIndex: zIndices.soundCloud }}>
                {soundCloudVisible && (
                    <SoundCloudEmbed uri={soundCloudUrl} />
                )}
            </div>
                {todoListVisible && (
                <div className="px-8 pt-16 pb-12 w-full h-full relative">
                    <div
                        ref={containerRef}
                        className=" w-full h-full rounded-xl relative"
                        style={{ zIndex: zIndices.todo, minWidth: 250, minHeight: 200, }}
                        >
                        <TodoList
                            todoPosition={todoPosition}
                            setTodoPosition={setTodoPosition}
                            containerRef={containerRef}
                        />
                    </div>
                </div>

                 )}
             <div className="absolute top-4 right-4 md:top-4 md:right-12  flex gap-x-2 md:gap-x-4 z-50" style={{ zIndex: zIndices.buttons }}>
                 {/* <div className="flex items-center space-x-2 md:space-x-4">
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="bg-white text-black rounded p-2 text-sm md:text-base"
                        placeholder="Enter username"
                    />
                </div> */}
                <SettingsMenu>
                    <SettingsButton
                        onClick={toggleTimer}
                        icon={faClock}
                        isActive={timerVisible}
                    />
                    <SettingsButton
                        onClick={toggleSoundCloud}
                        icon={faMusic}
                        isActive={soundCloudVisible}
                    />
                    <SettingsButton
                        onClick={handleMuteToggle}
                        icon={isMuted ? faVolumeMute : faVolumeUp}
                       isActive={true}
                    />
                    <SettingsButton
                       onClick={handleVideo}
                       icon={isVideo ? faVideo : faVideoSlash}
                       isActive={true}
                   />
                    <SettingsButton
                        onClick={toggleTodoList}
                        icon={faTableList}
                        isActive={todoListVisible}
                    />
                </SettingsMenu>
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