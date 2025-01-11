import React, { useState } from "react";
import { Label } from "@/components/ui/label";


interface BackgroundSettingsProps {
    onSettingsChange: (settings: {
        backgroundColor?: string;
    }) => void;
    initialSettings: {
        backgroundColor?: string
    }
}

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({ onSettingsChange, initialSettings }) => {
    const [backgroundColor, setBackgroundColor] = useState<string>(initialSettings?.backgroundColor || '#333333');

    const handleBackgroundColorChange = (value: string) => {
        setBackgroundColor(value);
        onSettingsChange({
            backgroundColor: value
        });

    }

    return (
        <div className="py-4 px-4">
            <div className="mb-4 flex items-center gap-4">
                 <Label htmlFor="backgroundColor" className="text-sm text-gray-300 font-medium">Background Color</Label>
                <div className="flex items-center gap-x-2">
                    <input
                        type="color"
                        id="backgroundColor"
                        value={backgroundColor}
                        onChange={(e) => handleBackgroundColorChange(e.target.value)}
                        className="h-10 w-10 rounded-md border-gray-700 cursor-pointer bg-gray-700 focus:outline-none focus:ring-1"
                    />
                    <span className="text-sm text-gray-300 font-medium">{backgroundColor}</span>
                 </div>
            </div>
        </div>
    );
};

export default BackgroundSettings;