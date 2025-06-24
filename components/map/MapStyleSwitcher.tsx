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
    id: 'satellite-streets',
    label: 'Satellite Streets',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
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
];

interface MapStyleSwitcherProps {
  currentStyle: string;
  onChange: (style: string) => void;
}

export default function MapStyleSwitcher({ currentStyle, onChange }: MapStyleSwitcherProps) {
  return (
    <div className="bg-white/90 rounded shadow p-2 flex gap-2">
      {MAP_STYLES.map((s) => (
        <button
          key={s.id}
          className={`px-2 py-1 rounded text-xs ${currentStyle === s.style ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => onChange(s.style)}
          type="button"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}