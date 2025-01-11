'use client';
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
    initialSettings: {
        workDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
        backgroundColor?: string;
        notificationSound?: string;
        volume?:number;
        autoStartBreaks?: boolean;
        showNotifications?: boolean;
         backgroundUrl?: string;
    };
    onSettingsSave: (settings: {
         workDuration: number;
         shortBreakDuration: number;
         longBreakDuration: number;
         backgroundColor?: string;
         notificationSound?: string;
         volume?:number;
         autoStartBreaks?: boolean;
         showNotifications?: boolean;
        backgroundUrl?: string;
    }) => void;
    onClose: () => void;
}

const TimersSettings: React.FC<{
    initialSettings: {
        workDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
    };
    onSettingsChange: (settings: {
        workDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
    }) => void;
}> = ({ initialSettings, onSettingsChange }) => {
    const [workDuration, setWorkDuration] = useState(initialSettings.workDuration / 60);
    const [shortBreakDuration, setShortBreakDuration] = useState(initialSettings.shortBreakDuration / 60);
    const [longBreakDuration, setLongBreakDuration] = useState(initialSettings.longBreakDuration / 60);

    const handleDurationChange = (type: 'work' | 'short' | 'long', value: number) => {
        switch (type) {
            case "work":
                setWorkDuration(value);
                break;
            case 'short':
                setShortBreakDuration(value)
                break;
            case 'long':
                setLongBreakDuration(value)
                break;
            default:
                break;
        }
        onSettingsChange({
             workDuration: type === 'work' ? value * 60 : workDuration * 60,
             shortBreakDuration: type === 'short' ? value * 60 : shortBreakDuration * 60,
             longBreakDuration: type === 'long' ? value * 60 : longBreakDuration * 60
         })

    }

    return (
        <div className="grid gap-4 py-4 px-4">
            <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="work" className="text-md text-black font-semibold">Work</Label>
                <Input id="work" value={workDuration} type="number" min="1" onChange={(e) => handleDurationChange('work', Number(e.target.value))} className="bg-gray-100 text-black text-sm rounded-md focus:outline-none focus:ring-1" />
               <Label className="text-md text-black font-semibold">minutes</Label>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="short-break" className="text-md text-black font-semibold">Short Break</Label>
                <Input type="number" value={shortBreakDuration} id="short-break" min="1" onChange={(e) => handleDurationChange('short', Number(e.target.value))} className="bg-gray-100 text-black text-sm rounded-md focus:outline-none focus:ring-1" />
               <Label className="text-md text-black font-semibold">minutes</Label>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="long-break" className="text-md text-black font-semibold">Long Break</Label>
                <Input type="number" value={longBreakDuration} id="long-break" min="1" onChange={(e) => handleDurationChange('long', Number(e.target.value))} className="bg-gray-100 text-black text-sm rounded-md focus:outline-none focus:ring-1" />
                <Label className="text-md text-black font-semibold">minutes</Label>
            </div>
        </div>
    );
};

const SettingsModal: React.FC<SettingsModalProps> = ({ initialSettings, onSettingsSave, onClose }) => {
    const [settings, setSettings] = useState(initialSettings);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSettingsChange = (updatedSettings: any) => {
         setSettings((prevSettings) => ({ ...prevSettings, ...updatedSettings}))
    };

    const saveSettings = () => {
        onSettingsSave(settings);
        onClose();
    };

    return (
         <DialogContent className="sm:max-w-[700px] bg-white text-gray-800 p-6 rounded-lg shadow-xl">
            <DialogHeader className="pb-4">
                <DialogTitle className="text-2xl font-bold text-black">Settings</DialogTitle>
                <DialogDescription className="text-zinc-400 text-lg">
                    Customize your Pomodoro timer experience.
                </DialogDescription>
            </DialogHeader>

             <div className="flex">
                 <Tabs className="flex gap-x-4">
                     <TabList className="flex flex-col border-r border-zinc-200 w-36">
                           <Tab className={cn(
                                  "px-4 py-3 cursor-pointer border-b-2 border-transparent hover:border-zinc-300 focus:outline-none active:border-blue-500 text-lg font-semibold text-gray-800",
                                  )}
                                >Timers</Tab>
                           <Tab  className={cn(
                                  "px-4 py-3 cursor-pointer border-b-2 border-transparent hover:border-zinc-300 focus:outline-none active:border-blue-500 text-lg font-semibold text-gray-800",
                                  )}
                                >Background</Tab>
                          <Tab   className={cn(
                                  "px-4 py-3 cursor-pointer border-b-2 border-transparent hover:border-zinc-300 focus:outline-none active:border-blue-500 text-lg font-semibold text-gray-800",
                                  )}
                                >Sounds</Tab>
                           <Tab  className={cn(
                                  "px-4 py-3 cursor-pointer border-b-2 border-transparent hover:border-zinc-300 focus:outline-none active:border-blue-500 text-lg font-semibold text-gray-800",
                                  )}
                               >General</Tab>
                       </TabList>
                       <div className="flex-1 px-6">
                           <TabPanel>
                                <TimersSettings
                                    initialSettings={settings}
                                    onSettingsChange={handleSettingsChange}
                                />
                            </TabPanel>
                            <TabPanel>
                                    <div>Background settings not implemented yet</div>
                            </TabPanel>
                            <TabPanel>
                                    <div>Sounds settings not implemented yet</div>
                            </TabPanel>
                           <TabPanel>
                                <div>General settings not implemented yet</div>
                           </TabPanel>
                       </div>
                   </Tabs>
              </div>

             <div className="flex justify-end mt-8">
                 <Button variant='outline' className="mr-2 text-gray-800 bg-transparent" onClick={onClose}>Cancel</Button>
                 <Button onClick={saveSettings} className="text-white bg-gray-800  hover:bg-gray-900 font-semibold">Save</Button>
            </div>
        </DialogContent>
    );
};

export default SettingsModal;