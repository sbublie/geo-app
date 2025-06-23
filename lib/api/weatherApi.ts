import WeatherData from "@/types/WeatherData";

  export const getWindDirectionText = (degrees: number) => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

export default async function fetchWeatherData(lat: number, lng: number, setWeatherData: React.Dispatch<React.SetStateAction<WeatherData | null>>, setWeatherLoading: React.Dispatch<React.SetStateAction<boolean>>): Promise<void> {
  setWeatherLoading(true);
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10ms,wind_direction_10m,relative_humidity_2m,surface_pressure`
    );
    const data = await response.json();
    
    setWeatherData({
      temperature: data.current.temperature_2m,
      //description: data.current.weather[0].description,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.surface_pressure,
      //icon: data.current.weather[0].icon
    });
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    setWeatherData(null);
  } finally {
    setWeatherLoading(false);
  }
};