import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface GeneralSettingsProps {
    onSettingsChange: (settings: {
        autoStartBreaks?: boolean;
        showNotifications?: boolean;
    }) => void;
    initialSettings: {
        autoStartBreaks?: boolean;
        showNotifications?: boolean;
    }
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ onSettingsChange, initialSettings }) => {
    const [autoStartBreaks, setAutoStartBreaks] = useState(initialSettings?.autoStartBreaks || false);
    const [showNotifications, setShowNotifications] = useState<boolean>(initialSettings?.showNotifications || true);

    const handleAutoStartChange = (value: boolean) => {
        setAutoStartBreaks(value);
        onSettingsChange({
            autoStartBreaks: value
        })
    };

    const handleShowNotificationsChange = (value: boolean) => {
        setShowNotifications(value);
        onSettingsChange({
            showNotifications: value
        })
    }

    return (
        <div className="py-4 px-4 flex flex-col gap-y-3">
            <div className="flex items-center justify-between">
                 <Label htmlFor="autoStartBreaks" className="text-sm text-gray-300 font-medium">Auto-Start Breaks</Label>
                <Switch id="autoStartBreaks" checked={autoStartBreaks} onCheckedChange={handleAutoStartChange} />
            </div>
            <div className="flex items-center justify-between">
                 <Label htmlFor="showNotifications" className="text-sm text-gray-300 font-medium">Show Notifications</Label>
                <Switch id="showNotifications" checked={showNotifications} onCheckedChange={handleShowNotificationsChange} />
            </div>
        </div>
    );
};

export default GeneralSettings;