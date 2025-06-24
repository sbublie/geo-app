'use client';

import { LoadingSpinner } from "@/components/ui/spinner";
import WindArrow from '@/components/ui/wind';
import { useTranslations } from 'next-intl';
import WeatherData from '@/types/WeatherData';
import { MapPin, Thermometer } from 'lucide-react';

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
    <div className="absolute bottom-6 right-4 z-10">
      {/* Combined Weather + Location Panel */}
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 p-3 min-w-[300px]">
        

        {/* Location Section */}
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-500" />
          <div className="flex-1 min-w-0 ">
            <div className="text-sm font-medium text-gray-900 truncate mb-1">
              {locationInfo.city}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {locationInfo.street}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-3"></div>

        {/* Weather Section */}
        <div >
          {weatherLoading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size={16} />
              <span className="text-sm text-gray-600">{t('weather.loading')}</span>
            </div>
          ) : weatherData ? (
            <div className="flex items-center justify-between">
              {/* Temperature */}
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-gray-500" />
                <span className="text-lg font-medium text-gray-900">{weatherData.temperature}°C</span>
              </div>
              
              {/* Wind */}
              <div className="flex items-center gap-2">
                <WindArrow direction={weatherData.windDirection} size={48} />
                <div className="text-right">
                  <div className="text-xs text-gray-600">{getWindDirectionText(weatherData.windDirection)}</div>
                  <div className="text-xs font-medium text-gray-800">{weatherData.windSpeed} m/s</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">{t('weather.unavailable')}</div>
          )}
        </div>

      </div>
    </div>
  );
}