import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeather, getMockWeather } from './weather';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('getMockWeather', () => {
  it('should return Singapore weather data', () => {
    const result = getMockWeather('Singapore');
    expect(result.temperature).toBe(32);
    expect(result.humidity).toBe(85);
    expect(result.location).toBe('Singapore, SG');
  });

  it('should show Singapore has higher humidity than London', () => {
    const singapore = getMockWeather('Singapore');
    const london = getMockWeather('London');
    expect(singapore.humidity).toBeGreaterThan(london.humidity); // Singapore should have higher humidity
  });

  it('should return London weather data', () => {
    const result = getMockWeather('London');
    expect(result.temperature).toBe(18);
    expect(result.humidity).toBe(65);
    expect(result.location).toBe('London, GB');
  });

  it('should return default weather data for unknown locations', () => {
    const result = getMockWeather('Paris');
    expect(result.temperature).toBe(25);
    expect(result.humidity).toBe(60);
    expect(result.location).toBe('Paris');
  });

  it('should be case-insensitive', () => {
    const result1 = getMockWeather('singapore');
    const result2 = getMockWeather('SINGAPORE');
    expect(result1.temperature).toBe(result2.temperature);
    expect(result1.humidity).toBe(result2.humidity);
  });
});

describe('fetchWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle 401 error (invalid API key)', async () => {
    const error = {
      response: { status: 401 },
      isAxiosError: true,
    } as unknown as Error;
    axios.isAxiosError = vi.fn(() => true) as unknown as typeof axios.isAxiosError;

    vi.mocked(axios.get).mockRejectedValue(error);

    await expect(fetchWeather('London', 'invalid-key')).rejects.toThrow('Invalid API key');
  });

  it('should handle 404 error (location not found)', async () => {
    const error = {
      response: { status: 404 },
      isAxiosError: true,
    } as unknown as Error;
    axios.isAxiosError = vi.fn(() => true) as unknown as typeof axios.isAxiosError;

    vi.mocked(axios.get).mockRejectedValue(error);

    await expect(fetchWeather('InvalidLocation', 'test-api-key')).rejects.toThrow(
      'Location not found'
    );
  });

  it('should handle timeout errors', async () => {
    const error = {
      code: 'ECONNABORTED',
      isAxiosError: true,
    } as unknown as Error;
    axios.isAxiosError = vi.fn(() => true) as unknown as typeof axios.isAxiosError;

    vi.mocked(axios.get).mockRejectedValue(error);

    await expect(fetchWeather('London', 'test-api-key')).rejects.toThrow('Weather service timeout');
  });

  it('should handle generic errors', async () => {
    axios.isAxiosError = vi.fn(() => false) as unknown as typeof axios.isAxiosError;
    vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

    await expect(fetchWeather('London', 'test-api-key')).rejects.toThrow(
      'Failed to fetch weather data'
    );
  });
});
