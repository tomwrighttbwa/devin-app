import { useState } from 'react';
import {
  calculateFuelingNeeds,
  TrainingInput,
  WeatherData,
  FuelingResult,
} from '../lib/calculator';
import { fetchWeather, getMockWeather } from '../lib/weather';
import ResultDisplay from './ResultDisplay';
import WeatherInput from './WeatherInput';

const FuelingCalculator = () => {
  const [duration, setDuration] = useState<number>(60);
  const [intensity, setIntensity] = useState<TrainingInput['intensity']>('moderate');
  const [useWeather, setUseWeather] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<FuelingResult | null>(null);
  const [useMockWeather, setUseMockWeather] = useState<boolean>(true); // For demo purposes

  const handleCalculate = async () => {
    setError('');

    const trainingInput: TrainingInput = {
      duration,
      intensity,
    };

    let weatherData: WeatherData | undefined;

    if (useWeather && location) {
      setLoading(true);
      try {
        if (useMockWeather) {
          weatherData = getMockWeather(location);
        } else {
          // API key is now optional - will use environment variable if not provided
          weatherData = await fetchWeather(location, apiKey || undefined);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    const fuelingResult = calculateFuelingNeeds(trainingInput, weatherData);
    setResult(fuelingResult);
  };

  return (
    <div className="calculator">
      <h1>Endurance Fueling Calculator</h1>
      <p className="subtitle">
        Calculate your carbohydrate, sodium, and water needs based on training duration and
        conditions
      </p>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="duration">Training Duration (minutes)</label>
          <input
            id="duration"
            type="number"
            min="1"
            max="480"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="form-input"
          />
          <p className="form-hint">Typical sessions: 30-180 minutes</p>
        </div>

        <div className="form-group">
          <label htmlFor="intensity">Training Intensity</label>
          <select
            id="intensity"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as TrainingInput['intensity'])}
            className="form-select"
          >
            <option value="low">Low (conversation pace)</option>
            <option value="moderate">Moderate (comfortable hard)</option>
            <option value="high">High (threshold/tempo)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useWeather}
              onChange={(e) => setUseWeather(e.target.checked)}
              className="checkbox"
            />
            <span>Enable weather-based adjustments</span>
          </label>
        </div>

        {useWeather && (
          <WeatherInput
            location={location}
            setLocation={setLocation}
            apiKey={apiKey}
            setApiKey={setApiKey}
            useMockWeather={useMockWeather}
            setUseMockWeather={setUseMockWeather}
          />
        )}

        <button onClick={handleCalculate} disabled={loading} className="calculate-button">
          {loading ? 'Calculating...' : 'Calculate Fueling Needs'}
        </button>

        {error && <div className="error-message">{error}</div>}
      </div>

      {result && <ResultDisplay result={result} />}
    </div>
  );
};

export default FuelingCalculator;
