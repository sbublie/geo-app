'use client';

import { LoadingSpinner } from "@/components/ui/spinner";
import WindArrow from '@/components/ui/wind';
import { useTranslations } from 'next-intl';
import WeatherData from '@/types/weatherData';

interface InfoPanelsProps {
  weatherData: WeatherData | null;
  weatherLoading: boolean;
  locationInfo: { street: string; city: string };
  coordinates: { lng: number; lat: number };
  getWindDirectionText: (degrees: number) => string;
}

export default function InfoPanels({
  weatherData,
  weatherLoading,
  locationInfo,
  coordinates,
  getWindDirectionText
}: InfoPanelsProps) {
  const t = useTranslations();

  return (
    <div className="absolute bottom-14 right-4 flex flex-col gap-4 z-10">
      {/* Weather info display */}
      <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow-lg border min-w-[370px]">
        <div className="text-sm font-semibold text-gray-700 mb-3">{t('weather.title')}</div>
        {weatherLoading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner size={24} />
            <span className="ml-2 text-sm text-gray-600">{t('weather.loading')}</span>
          </div>
        ) : weatherData ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Left side - Main weather info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{weatherData.temperature}°C</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>{t('weather.humidity')}:</strong> {weatherData.humidity}%</div>
                <div><strong>{t('weather.pressure')}:</strong> {weatherData.pressure} hPa</div>
              </div>
            </div>

            {/* Right side - Wind info */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 text-center">{t('weather.wind')}</div>
              <WindArrow direction={weatherData.windDirection} />
              <div className="text-xs text-gray-600 text-center space-y-1">
                <div><strong>{getWindDirectionText(weatherData.windDirection)}</strong></div>
                <div>{weatherData.windSpeed} m/s</div>
                <div>({Math.round(weatherData.windSpeed * 3.6)} km/h)</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 py-4 text-center">
            {t('weather.unavailable')}
          </div>
        )}
      </div>

      {/* Location info display */}
      <div className="bg-white bg-opacity-90 p-3 rounded-lg shadow-lg border min-w-[370px]">
        <div className="text-sm font-semibold text-gray-700 mb-2">{t('location.title')}</div>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>{t('location.street')}:</strong> {locationInfo.street}</div>
          <div><strong>{t('location.city')}:</strong> {locationInfo.city}</div>
          <div className="border-t pt-1 mt-2">
            <div>{t('location.lat')} {coordinates.lat}</div>
            <div>{t('location.lng')} {coordinates.lng}</div>
          </div>
        </div>
      </div>
    </div>
  );
}