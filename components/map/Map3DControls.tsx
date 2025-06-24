'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Map3DControlsProps {
  onResetView: () => void;
  disabled?: boolean;
}

export default function Map3DControls({ 
  onResetView, 
  disabled = false 
}: Map3DControlsProps) {
  return (
    <Button
      onClick={onResetView}
      disabled={disabled}
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-white/90 backdrop-blur-sm"
      title="Reset View (Remove 3D & Rotation)"
    >
      <RotateCcw size={16} />
      Reset View
    </Button>
  );
}