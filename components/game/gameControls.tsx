'use client';

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useTranslations } from 'next-intl';

interface GameControlsProps {
  appState: 'idle' | 'loading' | 'playing';
  radius: number;
  setRadius: (radius: number) => void;
  onStartGame: () => void;
  onResetGame: () => void;
}

export default function GameControls({
  appState,
  radius,
  setRadius,
  onStartGame,
  onResetGame
}: GameControlsProps) {
  const t = useTranslations();

  if (appState === 'idle') {
    // Wrap both cards in a fragment so they stack in the flex column
    return (
      <>
        <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border max-w-[370px]">
          <div className="text-lg font-semibold text-gray-700 mb-2">{t('app.title')}</div>
          <div className="text-sm text-gray-600">
            {t('app.description')}
          </div>
          <div className="flex items-center justify-center mt-3">
            <Button className="mt-2 bg-green-500 text-white w-full" onClick={onStartGame}>
              {t('game.start')}
            </Button>
          </div>
        </div>
        
      </>
    );
  }

  if (appState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center bg-white bg-opacity-90 p-4 rounded-lg shadow-lg border w-[370px]">
        <div className="text-xl font-semibold text-gray-700 mb-2 text-center">{t('game.loading')}</div>
        <LoadingSpinner size={35} />
      </div>
    );
  }

  if (appState === 'playing') {
    return (
      <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border max-w-[370px]">
        <div className="text-lg font-semibold text-gray-700 mb-2">{t('game.active')}</div>
        <div className="text-sm text-gray-600 mb-3">
          {t('game.instructions')}
        </div>
        <Button
          className="bg-red-500 hover:bg-red-600 text-white w-full"
          onClick={onResetGame}
        >
          {t('game.reset')}
        </Button>
      </div>
    );
  }

  return null;
}