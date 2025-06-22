'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';

interface DrawingControlsProps {
  isDrawingMode: boolean;
  currentPolygonLength: number;
  drawnPolygonsCount: number;
  onToggleDrawingMode: () => void;
  onClearAllPolygons: () => void;
}

export default function DrawingControls({
  isDrawingMode,
  currentPolygonLength,
  drawnPolygonsCount,
  onToggleDrawingMode,
  onClearAllPolygons
}: DrawingControlsProps) {
  const t = useTranslations();

  return (
    <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border max-w-[370px]">
      <div className="text-sm font-semibold text-gray-700 mb-2">{t('drawing.title')}</div>
      <div className="text-xs text-gray-600 mb-3">
        {isDrawingMode ? t('drawing.instructions') : t('drawing.instructionsIdle')}
      </div>
      <div className="flex flex-col gap-2">
        <Button
          className={`text-white w-full ${isDrawingMode ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          onClick={onToggleDrawingMode}
        >
          {isDrawingMode ? t('drawing.stopDrawing') : t('drawing.startDrawing')}
        </Button>
        {drawnPolygonsCount > 0 && (
          <Button
            className="bg-gray-500 hover:bg-gray-600 text-white w-full text-xs"
            onClick={onClearAllPolygons}
          >
            {t('drawing.clearAll')} ({drawnPolygonsCount})
          </Button>
        )}
      </div>
      {currentPolygonLength > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          {t('drawing.currentPoints', { count: currentPolygonLength })}
        </div>
      )}
    </div>
  );
}