/* eslint-disable @typescript-eslint/no-unused-vars */
// components/settings/SettingsMenu.tsx
import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface SettingsMenuProps {
  children: React.ReactNode;
  triggerElement?: React.ReactNode;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ children, triggerElement }) => {
    return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
                {triggerElement ? (
                 <div>
                     {triggerElement}
                </div>
           ) : (
                <Button
                     className="text-white w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </Button>
            )}
          </DropdownMenuTrigger>
         <DropdownMenuContent  className="bg-white border-gray-200 text-gray-800">
            {children}
          </DropdownMenuContent>
     </DropdownMenu>
    );
};

export default SettingsMenu;