import { FuelingResult } from '../lib/calculator';

interface ResultDisplayProps {
  result: FuelingResult;
}

const ResultDisplay = ({ result }: ResultDisplayProps) => {
  return (
    <div className="result-section">
      <h2>Your Fueling Plan</h2>

      {result.weatherAdjustment && (
        <div className="weather-notice">
          <strong>Weather Adjustment Applied:</strong> {result.weatherAdjustment.factor.toFixed(2)}x
          factor - {result.weatherAdjustment.reason}
        </div>
      )}

      <div className="result-grid">
        <div className="result-card carbs">
          <div className="result-icon">🍞</div>
          <h3>Carbohydrates</h3>
          <div className="result-values">
            <div className="result-total">
              <span className="value">{result.carbs.total}</span>
              <span className="unit">g total</span>
            </div>
            <div className="result-per-hour">
              <span className="value">{result.carbs.perHour}</span>
              <span className="unit">g/hour</span>
            </div>
          </div>
          {result.carbs.includeRecommendation && (
            <p className="result-recommendation">{result.carbs.recommendation}</p>
          )}
        </div>

        <div className="result-card sodium">
          <div className="result-icon">🧂</div>
          <h3>Sodium</h3>
          <div className="result-values">
            <div className="result-total">
              <span className="value">{result.sodium.total}</span>
              <span className="unit">mg total ({result.sodium.totalGrams}g salt)</span>
            </div>
            <div className="result-per-hour">
              <span className="value">{result.sodium.perHour}</span>
              <span className="unit">mg/hour ({result.sodium.perHourGrams}g salt)</span>
            </div>
          </div>
          {result.sodium.includeRecommendation && (
            <p className="result-recommendation">{result.sodium.recommendation}</p>
          )}
        </div>

        <div className="result-card water">
          <div className="result-icon">💧</div>
          <h3>Water</h3>
          <div className="result-values">
            <div className="result-total">
              <span className="value">{result.water.total}</span>
              <span className="unit">ml total</span>
            </div>
            <div className="result-per-hour">
              <span className="value">{result.water.perHour}</span>
              <span className="unit">ml/hour</span>
            </div>
          </div>
          <p className="result-recommendation">{result.water.recommendation}</p>
        </div>
      </div>

      <div className="result-footer">
        <p className="disclaimer">
          <strong>Note:</strong> These recommendations are based on general sports nutrition
          guidelines. Individual needs vary based on sweat rate, body weight, and other factors.
          Always practice your fueling strategy in training before race day.
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;
