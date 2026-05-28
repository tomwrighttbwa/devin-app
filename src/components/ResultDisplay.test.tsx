import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultDisplay from './ResultDisplay';
import type { FuelingResult } from '../lib/calculator';

describe('ResultDisplay', () => {
  const mockResult: FuelingResult = {
    carbs: {
      total: 90,
      perHour: 45,
      recommendation: '45g carbs/hour. Mix glucose/fructose sources.',
      includeRecommendation: true,
      scienceNotes: 'ACSM Position Stand: 30-60g/hour for 1-2 hour exercise.',
    },
    sodium: {
      total: 800,
      totalGrams: 2.0,
      perHour: 400,
      perHourGrams: 1.0,
      recommendation: '400mg/hour sodium as starting point. Individual needs vary widely.',
      includeRecommendation: true,
      scienceNotes: 'ACSM: Replace sodium when large sweat losses occur - highly individual.',
    },
    water: {
      total: 1200,
      perHour: 600,
      recommendation: 'Drink to thirst, approximately 600ml/hour maximum.',
      scienceNotes: 'ACSM guidelines: Drink to thirst during exercise.',
    },
    weatherAssessment: {
      heatIndex: 20,
      riskLevel: 'low',
      warnings: [],
    },
  };

  it('should display fueling results', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.getByText('Your Fueling Plan')).toBeInTheDocument();
    expect(screen.getByText('Carbohydrates')).toBeInTheDocument();
    expect(screen.getByText('Sodium')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
  });

  it('should display correct values', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.getByText('90')).toBeInTheDocument(); // carbs total
    expect(screen.getByText('45')).toBeInTheDocument(); // carbs per hour
    expect(screen.getByText('800')).toBeInTheDocument(); // sodium total
    expect(screen.getByText('400')).toBeInTheDocument(); // sodium per hour
    expect(screen.getByText(/2g salt/)).toBeInTheDocument(); // sodium grams total
    expect(screen.getByText(/1g salt/)).toBeInTheDocument(); // sodium grams per hour
    expect(screen.getByText('1200')).toBeInTheDocument(); // water total
    expect(screen.getByText('600')).toBeInTheDocument(); // water per hour
  });

  it('should display recommendations', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.getByText(/45g carbs\/hour/)).toBeInTheDocument();
    expect(screen.getByText(/400mg\/hour/)).toBeInTheDocument();
    expect(screen.getByText(/1g salt/)).toBeInTheDocument();
    expect(screen.getByText(/600ml\/hour/)).toBeInTheDocument();
  });

  it('should display science notes', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.getByText(/ACSM Position Stand/)).toBeInTheDocument();
    expect(screen.getByText(/ACSM: Replace sodium/)).toBeInTheDocument();
    expect(screen.getByText(/ACSM guidelines: Drink to thirst/)).toBeInTheDocument();
  });

  it('should display heat risk assessment when warnings present', () => {
    const resultWithWarnings: FuelingResult = {
      ...mockResult,
      weatherAssessment: {
        heatIndex: 40,
        riskLevel: 'extreme',
        warnings: [
          'EXTREME HEAT DANGER: Risk of heat stroke is high.',
          'Reduce exercise intensity and duration.',
        ],
      },
    };

    render(<ResultDisplay result={resultWithWarnings} />);

    expect(screen.getByText(/Heat Risk Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/EXTREME RISK/i)).toBeInTheDocument();
    expect(screen.getByText(/EXTREME HEAT DANGER/i)).toBeInTheDocument();
    expect(screen.getByText(/Reduce exercise intensity/i)).toBeInTheDocument();
  });

  it('should not display heat risk assessment when no warnings', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.queryByText(/Heat Risk Assessment/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/EXTREME RISK/i)).not.toBeInTheDocument();
  });

  it('should display safety disclaimer', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.getByText(/Important Safety Notice/i)).toBeInTheDocument();
    expect(screen.getByText(/ACSM\/ISSN sports nutrition guidelines/i)).toBeInTheDocument();
    expect(screen.getByText(/hyponatremia risk/i)).toBeInTheDocument();
  });

  it('should hide recommendations when includeRecommendation is false', () => {
    const shortSessionResult: FuelingResult = {
      carbs: {
        total: 0,
        perHour: 0,
        recommendation: 'Water sufficient for sessions under 60 minutes.',
        includeRecommendation: false,
        scienceNotes: 'ACSM guidelines: No carbohydrate needed for sessions under 60 minutes.',
      },
      sodium: {
        total: 0,
        totalGrams: 0,
        perHour: 0,
        perHourGrams: 0,
        recommendation: 'Sodium not needed for sessions under 60 minutes.',
        includeRecommendation: false,
        scienceNotes: 'Research shows sodium replacement unnecessary for short sessions.',
      },
      water: {
        total: 375,
        perHour: 500,
        recommendation: 'Drink to thirst. Pre-hydrate with 400-600ml before exercise.',
        scienceNotes: 'ACSM guidelines: Drink to thirst during exercise.',
      },
      weatherAssessment: {
        heatIndex: 20,
        riskLevel: 'low',
        warnings: [],
      },
    };

    render(<ResultDisplay result={shortSessionResult} />);

    // Carbs and sodium recommendations should be hidden
    expect(screen.queryByText(/Water sufficient for sessions under 60 minutes/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sodium not needed for sessions under 60 minutes/)).not.toBeInTheDocument();
    // Water recommendation should still be visible (using more specific text)
    expect(screen.getByText(/Pre-hydrate with 400-600ml/)).toBeInTheDocument();
  });

  it('should display different risk levels appropriately', () => {
    const highRiskResult: FuelingResult = {
      ...mockResult,
      weatherAssessment: {
        heatIndex: 38,
        riskLevel: 'high',
        warnings: ['HIGH HEAT RISK: Heat cramps possible.'],
      },
    };

    render(<ResultDisplay result={highRiskResult} />);

    expect(screen.getByText(/HIGH RISK/i)).toBeInTheDocument();
    expect(screen.getByText(/HIGH HEAT RISK/i)).toBeInTheDocument();
  });
});