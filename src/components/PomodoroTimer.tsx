'use client';
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FaCog, FaRedo } from "react-icons/fa";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import useLocalStorage from "@/hook/useLocalStorage";
import SettingsModal from "./settings/Setting";

interface PomodoroTimerProps {
    settings: {
        workDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
    };
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ settings }) => {
    const [persistedSettings, setPersistedSettings] = useLocalStorage('pomodoroSettings', settings);
    const [secondsLeft, setSecondsLeft] = useState<number>(settings.workDuration);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [currentPhase, setCurrentPhase] = useState<"Work" | "Short Break" | "Long Break">("Work");
    const [selectedType, setSelectedType] = useState<"pomodoro" | "short" | "long">("pomodoro");
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [completedRounds, setCompletedRounds] = useState<number>(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
            }
        }
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { workDuration, shortBreakDuration, longBreakDuration } = persistedSettings;

    useEffect(() => {
        if (persistedSettings && isClient) {
            setSecondsLeft(persistedSettings.workDuration);
        }
    }, [persistedSettings, isClient]);


    const handlePhaseChange = useCallback(() => {
        let nextPhase: "Work" | "Short Break" | "Long Break" = "Work";

        if (currentPhase === "Work") {
            setCompletedRounds(prev => prev + 1);
            if (completedRounds > 0 && completedRounds % 4 === 0) {
                nextPhase = "Long Break";
                setSecondsLeft(longBreakDuration);
                setSelectedType('long');

            } else {
                nextPhase = "Short Break";
                setSecondsLeft(shortBreakDuration);
                setSelectedType('short');
            }
        } else {
            nextPhase = "Work";
            setSecondsLeft(workDuration);
            setSelectedType('pomodoro');
        }

        setCurrentPhase(nextPhase);

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            let notificationBody = "";
            if (nextPhase === "Work") {
                notificationBody = "Time to get back to work!";
            } else if (nextPhase === "Short Break") {
                notificationBody = "Short break time!";
            }
            else {
                notificationBody = "Time to take a long break";
            }
            new Notification(nextPhase + ' session End!', { body: notificationBody });
        }
        setIsRunning(true);

    }, [currentPhase, longBreakDuration, shortBreakDuration, workDuration, setSecondsLeft, setSelectedType, setIsRunning, completedRounds]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            interval = setInterval(() => {
                setSecondsLeft((prevSeconds) => {
                    if (prevSeconds <= 0) {
                        clearInterval(interval);
                        handlePhaseChange();
                        return 0;
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, secondsLeft, handlePhaseChange]);

    const handleStartStop = () => {
        setIsRunning((prevState) => !prevState);
    };

    const handleReset = () => {
        setIsRunning(false);
        setSecondsLeft(
            selectedType === "pomodoro"
                ? workDuration
                : selectedType === "short"
                    ? shortBreakDuration
                    : longBreakDuration

        );
        setCurrentPhase(
            selectedType === 'pomodoro'
                ? "Work"
                : selectedType === 'short'
                    ? "Short Break"
                    : "Long Break"
        );
    };

    const handleTypeChange = (type: "pomodoro" | "short" | "long") => {
        setSelectedType(type);
        setIsRunning(false);
        setCurrentPhase(type === "pomodoro" ? "Work" : type === "short" ? "Short Break" : "Long Break");

        setSecondsLeft(
            type === "pomodoro"
                ? workDuration
                : type === "short"
                    ? shortBreakDuration
                    : longBreakDuration
        );
    };

    const formatTime = (timeInSeconds: number): string => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const handleSettingsSave = (updatedSettings: {
        workDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
    }) => {
        setPersistedSettings(updatedSettings);
        setSecondsLeft(
            selectedType === "pomodoro"
                ? updatedSettings.workDuration
                : selectedType === "short"
                    ? updatedSettings.shortBreakDuration
                    : updatedSettings.longBreakDuration
        );
    };
    return (
        isClient ? (
        <div className="flex flex-col items-center p-4 md:p-8 max-w-full md:max-w-md  ">
            <div className="flex justify-center mb-4 md:mb-8 space-x-2 md:space-x-4">
                <Button
                    className={`rounded-full px-3 py-3 md:px-4 md:py-5 text-white text-sm md:text-lg font-bold focus:outline-none border-white border-2 border-solid 
                            ${selectedType === "pomodoro" ? "bg-white text-black hover:bg-white" : "bg-transparent hover:bg-white hover:text-black"}
                        `}
                    onClick={() => handleTypeChange("pomodoro")}
                >
                    pomodoro
                </Button>
                <Button
                    className={`rounded-full px-3 py-3 md:px-4 md:py-5 text-white text-sm md:text-lg focus:outline-none font-bold border-white border-2 border-solid  ${selectedType === "short" ? "bg-white text-black hover:bg-white" : "bg-transparent hover:bg-white hover:text-black"}`}
                    onClick={() => handleTypeChange("short")}
                >
                    short break
                </Button>
                <Button
                    className={`rounded-full px-3 py-3 md:px-4 md:py-5 text-white text-sm md:text-lg focus:outline-none font-bold border-white border-2 border-solid ${selectedType === "long" ? "bg-white text-black hover:bg-white" : "bg-transparent hover:bg-white hover:text-black"}`}
                    onClick={() => handleTypeChange("long")}
                >
                    long break
                </Button>
            </div>
            <div className="text-white text-6xl md:text-9xl font-bold text-center mb-4 md:mb-8">
                {formatTime(secondsLeft)}
            </div>
            <div className="flex items-center justify-between gap-x-4 md:gap-x-8 relative">
                <Button
                    className={`text-black font-bold rounded-full text-lg md:text-xl bg-white hover:bg-transparent w-24 md:w-32 hover:text-white h-10 md:h-12 hover:border-solid hover:border-2 flex items-center justify-center`}
                    onClick={handleStartStop}
                >
                    {isRunning ? "pause" : "start"}
                </Button>
                <button className=" bg-transparent text-gray-300 hover:text-white focus:outline-none" onClick={handleReset}>
                    <FaRedo className="text-2xl md:text-3xl" />
                </button>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                        <button className="text-gray-300 hover:text-white focus:outline-none">
                            <FaCog className="text-2xl md:text-3xl" />
                        </button>
                    </DialogTrigger>
                    <SettingsModal
                        initialSettings={persistedSettings}
                        onSettingsSave={handleSettingsSave}
                        onClose={() => setShowSettings(false)}
                    />
                </Dialog>
            </div>
        </div>
          ): <p>Loading</p>
    );
};

export default PomodoroTimer;