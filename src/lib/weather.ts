import axios from 'axios';

const OPENWEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const PROXY_URL = import.meta.env.VITE_API_PROXY_URL || '';
const DEFAULT_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

export interface WeatherData {
  temperature: number;
  humidity: number;
  location: string;
}

/**
 * Fetch weather data using multiple strategies in order of preference:
 * 1. Proxy server (production, most secure)
 * 2. Environment variable API key (development)
 * 3. User-provided API key (fallback for testing/demo)
 *
 * @param location - The location to fetch weather for
 * @param userApiKey - Optional user-provided API key as fallback
 */
export async function fetchWeather(location: string, userApiKey?: string): Promise<WeatherData> {
  // Strategy 1: Try proxy server first (most secure for production)
  if (PROXY_URL) {
    try {
      const response = await axios.get(`${PROXY_URL}/api/weather/${encodeURIComponent(location)}`, {
        timeout: 15000,
      });
      return response.data;
    } catch {
      console.warn('Proxy server unavailable, falling back to direct API call');
      // Fall through to next strategy
    }
  }

  // Strategy 2: Use environment variable API key (development)
  const apiKey = userApiKey || DEFAULT_API_KEY;

  if (!apiKey) {
    throw new Error(
      'No API key available. Please contact the administrator to set up the OpenWeatherMap API key, or use demo mode.'
    );
  }

  // Strategy 3: Direct API call with available API key
  try {
    const response = await axios.get(
      `${OPENWEATHER_API_BASE}/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`,
      { timeout: 10000 }
    );

    const { main, name, sys } = response.data;

    return {
      temperature: main.temp,
      humidity: main.humidity,
      location: `${name}, ${sys.country}`,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OpenWeatherMap API key configuration.');
      } else if (error.response?.status === 404) {
        throw new Error('Location not found. Please check the spelling and try again.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Weather service timeout. Please try again.');
      }
    }
    throw new Error('Failed to fetch weather data. Please try again later.');
  }
}

/**
 * Mock weather data for testing and demonstration purposes
 * This provides realistic data without requiring API keys
 */
export function getMockWeather(location: string): WeatherData {
  const mockLocations: Record<string, WeatherData> = {
    singapore: {
      temperature: 32,
      humidity: 85,
      location: 'Singapore, SG',
    },
    london: {
      temperature: 15,
      humidity: 55,
      location: 'London, GB',
    },
    default: {
      temperature: 25,
      humidity: 60,
      location: 'Unknown',
    },
  };

  const lowerLocation = location.toLowerCase();
  if (lowerLocation.includes('singapore')) {
    return mockLocations.singapore;
  } else if (lowerLocation.includes('london')) {
    return mockLocations.london;
  }

  return {
    ...mockLocations.default,
    location: location.charAt(0).toUpperCase() + location.slice(1),
  };
}

/**
 * Check if a proxy server is configured and available
 */
export async function checkProxyServer(): Promise<boolean> {
  if (!PROXY_URL) {
    return false;
  }

  try {
    const response = await axios.get(`${PROXY_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch {
    return false;
  }
}
