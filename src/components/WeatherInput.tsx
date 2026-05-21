interface WeatherInputProps {
  location: string;
  setLocation: (location: string) => void;
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  useMockWeather: boolean;
  setUseMockWeather: (useMockWeather: boolean) => void;
}

const WeatherInput = ({
  location,
  setLocation,
  apiKey,
  setApiKey,
  useMockWeather,
  setUseMockWeather,
}: WeatherInputProps) => {
  return (
    <div className="weather-section">
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useMockWeather}
            onChange={(e) => setUseMockWeather(e.target.checked)}
            className="checkbox"
          />
          <span>Use demo mode (mock weather data)</span>
        </label>
        <p className="form-hint">Uncheck to use real weather data with OpenWeatherMap API</p>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          placeholder="e.g., Singapore, London, New York"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="form-input"
        />
      </div>

      {!useMockWeather && (
        <div className="form-group">
          <label htmlFor="apiKey">OpenWeatherMap API Key (Optional)</label>
          <input
            id="apiKey"
            type="text"
            placeholder="Optional: Uses environment variable if blank"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="form-input"
          />
          <p className="form-hint">
            Optional - will use environment variable if not provided. Get a free API key at{' '}
            <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">
              openweathermap.org
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherInput;
