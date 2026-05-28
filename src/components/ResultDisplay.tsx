import { FuelingResult } from '../lib/calculator';

interface ResultDisplayProps {
  result: FuelingResult;
}

const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'extreme':
        return '#dc2626'; // red
      case 'high':
        return '#f97316'; // orange
      case 'moderate':
        return '#eab308'; // yellow
      default:
        return '#22c55e'; // green
    }
  };

  return (
    <div className="result-section">
      <h2>Your Fueling Plan</h2>

      {result.weatherAssessment && (
        <div
          className="weather-notice"
          style={{
            borderColor: getRiskLevelColor(result.weatherAssessment.riskLevel),
            background: result.weatherAssessment.riskLevel === 'low' ? '#f0fdf4' : undefined,
            color: result.weatherAssessment.riskLevel === 'low' ? '#065f46' : undefined
          }}
        >
          <strong>
            {result.weatherAssessment.riskLevel === 'low' ? '✅' : '⚠️'} Heat Risk:{' '}
          </strong>
          <span style={{ color: getRiskLevelColor(result.weatherAssessment.riskLevel), fontWeight: '600' }}>
            {result.weatherAssessment.riskLevel.toUpperCase()}
          </span>
          {result.weatherAssessment.warnings.length > 0 && (
            <>
              <br />
              <small>Heat Index: {result.weatherAssessment.heatIndex}°C</small>
            </>
          )}
          {result.weatherAssessment.warnings.length > 0 && (
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              {result.weatherAssessment.warnings.map((warning, index) => (
                <li key={index} style={{ fontSize: '14px' }}>
                  {warning}
                </li>
              ))}
            </ul>
          )}
          {result.weatherAssessment.warnings.length === 0 && (
            <small>Current conditions are suitable for exercise.</small>
          )}
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
          <div className="science-notes">
            <small>📚 {result.carbs.scienceNotes}</small>
          </div>
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
          <div className="science-notes">
            <small>📚 {result.sodium.scienceNotes}</small>
          </div>
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
          <div className="science-notes">
            <small>📚 {result.water.scienceNotes}</small>
          </div>
        </div>
      </div>

      <div className="result-footer">
        <p className="disclaimer">
          <strong>⚠️ Important Safety Notice:</strong> These recommendations are based on
          ACSM/ISSN sports nutrition guidelines. Individual nutritional needs vary
          significantly based on sweat rate, sweat sodium concentration, body weight, and
          other factors. For personalized recommendations, consult a sports dietitian or
          consider individual sweat testing. Never exceed 800ml/hour fluid intake due to
          hyponatremia risk.
        </p>
      </div>
    </div>
  );
};

export default ResultDisplay;