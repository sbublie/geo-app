'use client';

import React from 'react';
import { Mountain, MountainSnow } from 'lucide-react';

interface TerrainToggleProps {
  isTerrainEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export default function TerrainToggle({ 
  isTerrainEnabled, 
  onToggle, 
  disabled = false 
}: TerrainToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
        isTerrainEnabled
          ? 'bg-green-600 text-white shadow-md'
          : 'bg-white/90 text-gray-700 hover:bg-white/95 border border-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
      title={isTerrainEnabled ? 'Disable Terrain' : 'Enable Terrain'}
    >
      {isTerrainEnabled ? (
        <MountainSnow size={16} />
      ) : (
        <Mountain size={16} />
      )}
      Terrain
    </button>
  );
}