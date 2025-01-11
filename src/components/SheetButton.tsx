/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";


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
                <div> 
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
                </div>
            </SheetContent>
        </Sheet>
    );
};
export default SheetButton;