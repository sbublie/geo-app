'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface Map3DControlsProps {
  onResetView: () => void;
  disabled?: boolean;
}

export default function Map3DControls({ 
  onResetView, 
  disabled = false 
}: Map3DControlsProps) {
  return (
    <button
      onClick={onResetView}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 bg-white/90 text-gray-700 hover:bg-white/95 border border-gray-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'
      }`}
      title="Reset View (Remove 3D & Rotation)"
    >
      <RotateCcw size={16} />
      Reset View
    </button>
  );
}