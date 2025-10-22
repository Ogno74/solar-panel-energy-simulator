// A service to fetch weather forecast data from the Open-Meteo API.
// It's a free, open-source API that does not require an API key.

const API_URL = 'https://api.open-meteo.com/v1/forecast';
const HOURS = [6, 9, 12, 15, 18];

/**
 * Fetches the weather forecast for a given location and date.
 * @param latitude - The latitude of the location.
 * @param longitude - The longitude of the location.
 * @param date - The date for the forecast in YYYY-MM-DD format.
 * @returns A promise that resolves to an array of 5 weather factors for the hours 6, 9, 12, 15, 18.
 */
export const fetchWeatherForecast = async (
  latitude: number,
  longitude: number,
  date: string
): Promise<number[]> => {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    start_date: date,
    end_date: date,
    hourly: 'cloud_cover',
    timezone: 'auto',
  });

  const response = await fetch(`${API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Weather API request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data.hourly || !data.hourly.cloud_cover) {
    throw new Error('Invalid data format received from Weather API');
  }

  const cloudCoverData: number[] = data.hourly.cloud_cover;
  
  const weatherPoints = HOURS.map(hour => {
    // The API returns 24 values, one for each hour from 0 to 23.
    // We access the cloud cover for the specific hour we are interested in.
    const cloudCoverPercent = cloudCoverData[hour];

    // Convert cloud cover percentage (0-100) to our weather factor (1.0 - 0.2)
    // 0% cloud cover (sunny) -> factor 1.0
    // 100% cloud cover (overcast) -> factor 0.2
    // The range is 0.8 (1.0 - 0.2).
    const factor = 1.0 - (cloudCoverPercent / 100) * 0.8;
    
    // Clamp the value just in case of any unexpected API data
    return Math.max(0.2, Math.min(1.0, factor));
  });

  return weatherPoints;
};
