'use client';

import React from 'react';
import { Mountain, MountainSnow } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <Button
      onClick={onToggle}
      disabled={disabled}
      variant={isTerrainEnabled ? "default" : "outline"}
      size="sm"
      className={`flex items-center gap-2 ${
        isTerrainEnabled
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
      title={isTerrainEnabled ? 'Disable Terrain' : 'Enable Terrain'}
    >
      {isTerrainEnabled ? (
        <MountainSnow size={16} />
      ) : (
        <Mountain size={16} />
      )}
      Terrain
    </Button>
  );
}