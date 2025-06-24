'use client';

import React from 'react';

const MAP_STYLES = [
  {
    id: 'streets',
    label: 'Streets',
    style: 'mapbox://styles/mapbox/streets-v12',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    style: 'mapbox://styles/mapbox/satellite-v9',
  },
  {
    id: 'light',
    label: 'Light',
    style: 'mapbox://styles/mapbox/light-v11',
  },
  {
    id: 'dark',
    label: 'Dark',
    style: 'mapbox://styles/mapbox/dark-v11',
  },
  {
    id: 'outdoors',
    label: 'Outdoors',
    style: 'mapbox://styles/mapbox/outdoors-v12',
  },
  {
    id: 'monochrome',
    label: 'Mono',
    style: 'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g', // High contrast monochrome
  },
  {
    id: 'pencil',
    label: 'Pencil',
    style: 'mapbox://styles/mapbox/cj44mfrt20f082snokim4ungi', // Hand-drawn pencil style
  }
  
];

interface MapStyleSwitcherProps {
  currentStyle: string;
  onChange: (style: string) => void;
}

export default function MapStyleSwitcher({ currentStyle, onChange }: MapStyleSwitcherProps) {
  // Make it scrollable horizontally for many styles
  return (
    <div className="bg-white/90 rounded-lg shadow p-2 flex gap-2 overflow-x-auto max-w-lg">
      {MAP_STYLES.map((s) => (
        <button
          key={s.id}
          className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
            currentStyle === s.style 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => onChange(s.style)}
          type="button"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}