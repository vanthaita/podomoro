'use client';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  IconProp } from '@fortawesome/fontawesome-svg-core';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface ToggleButtonProps {
    isVisible: boolean;
    onToggle: () => void;
    icon: IconProp;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isVisible, onToggle, icon }) => {
  return (
      <button
          onClick={onToggle}
          className="p-2 rounded-md bg-gray-700 bg-opacity-50 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
          <FontAwesomeIcon icon={isVisible ? icon : faEyeSlash} size="lg" color="white"/>
      </button>
  );
};

export default ToggleButton;