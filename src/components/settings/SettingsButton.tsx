// components/SettingsButton.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface SettingsButtonProps {
  onClick: () => void;
  icon: IconDefinition;
  isActive: boolean;
  additionalClasses?: string;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick, icon, isActive, additionalClasses }) => {
  return (
      <DropdownMenuItem
          onSelect={onClick}
          className='focus:bg-gray-100 data-[disabled]:opacity-50'
      >
          <Button
              variant="ghost"
              className={`w-full justify-center text-gray-800  ${isActive ? '' : 'opacity-50'} ${additionalClasses || ''}`}
          >
               <FontAwesomeIcon icon={icon} size="lg"  className="mr-2"/>
          </Button>
      </DropdownMenuItem>

  );
};

export default SettingsButton;