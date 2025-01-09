'use client'
import React from 'react';
import { SoundCloud } from './SoundCloud';

interface SoundCloudEmbedProps {
  uri: string;
  visual?: boolean;
}

const SoundCloudEmbed: React.FC<SoundCloudEmbedProps> = ({ uri, visual }) => {
  return (
        <SoundCloud wide link={uri} visual={visual} />
  );
};

export default SoundCloudEmbed;