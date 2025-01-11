import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface SoundsSettingsProps {
    onSettingsChange: (settings: {
        notificationSound?: string,
        volume?: number,
    }) => void;
    initialSettings: {
        notificationSound?: string,
        volume?: number,
    }
}

const SoundsSettings: React.FC<SoundsSettingsProps> = ({ onSettingsChange, initialSettings }) => {
    const [notificationSound, setNotificationSound] = useState<string>(initialSettings?.notificationSound || "default");
    const [volume, setVolume] = useState<number>(initialSettings?.volume || 50);

    const handleSoundChange = (value: string) => {
        setNotificationSound(value);
        onSettingsChange({
            notificationSound: value
        })
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value);
        onSettingsChange({
            volume: value
        })
    }

    return (
        <div className="py-4 px-4">
            <div className="mb-4 flex flex-col gap-y-2">
                <Label htmlFor="notificationSound" className="text-sm text-gray-300 font-medium">Notification Sound</Label>
                 <Select onValueChange={handleSoundChange} defaultValue={notificationSound} >
                   <SelectTrigger className="bg-gray-700 text-white  rounded-md focus:outline-none focus:ring-1">
                        <SelectValue placeholder="Select sound" />
                     </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                         <SelectItem value="default" className="hover:bg-gray-700">Default</SelectItem>
                        <SelectItem value="bell" className="hover:bg-gray-700">Bell</SelectItem>
                       <SelectItem value="chime" className="hover:bg-gray-700">Chime</SelectItem>
                        <SelectItem value="alarm" className="hover:bg-gray-700">Alarm</SelectItem>
                     </SelectContent>
                 </Select>
            </div>
            <div className="flex flex-col gap-y-2">
                <Label htmlFor="volume" className="text-sm text-gray-300 font-medium">Volume</Label>
               <div className="flex items-center gap-x-4">
                  <Slider
                        defaultValue={[volume]}
                        max={100}
                       step={1}
                    onValueChange={(value) => handleVolumeChange(value[0])}
                     />
                 <span className="text-sm text-gray-300 font-medium">{volume}</span>
               </div>
            </div>
        </div>
    );
};

export default SoundsSettings;