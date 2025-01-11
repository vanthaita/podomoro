'use client';
import React from 'react';
import { SoundCloud } from './SoundCloud';

interface SoundCloudEmbedProps {
  uri: string;
  visual?: boolean;
  small?: boolean;
}

const SoundCloudEmbed: React.FC<SoundCloudEmbedProps> = ({ uri, visual, small }) => {
  return (
        <SoundCloud link={uri} visual={visual} wide={!small} small={small} />
  );
};

export default SoundCloudEmbed;