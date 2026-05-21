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
    },
    sodium: {
      total: 800,
      totalGrams: 2.0,
      perHour: 400,
      perHourGrams: 1.0,
      recommendation: 'Moderate sodium: 400mg/hour (~1.0g salt). Use electrolyte tablets or add salt to food.',
      includeRecommendation: true,
    },
    water: {
      total: 1200,
      perHour: 600,
      recommendation: '600ml/hour. Monitor urine color as hydration indicator.',
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
    expect(screen.getByText(/1.0g salt/)).toBeInTheDocument();
    expect(screen.getByText(/600ml\/hour/)).toBeInTheDocument();
  });

  it('should display weather adjustment when present', () => {
    const resultWithWeather: FuelingResult = {
      ...mockResult,
      weatherAdjustment: {
        factor: 1.5,
        reason: 'high temperature (>30°C), very high humidity (>80%)',
      },
    };

    render(<ResultDisplay result={resultWithWeather} />);

    expect(screen.getByText(/Weather Adjustment Applied/i)).toBeInTheDocument();
    expect(screen.getByText(/1.50x factor/i)).toBeInTheDocument();
    expect(screen.getByText(/high temperature/i)).toBeInTheDocument();
  });

  it('should not display weather adjustment when absent', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.queryByText(/Weather Adjustment Applied/i)).not.toBeInTheDocument();
  });

  it('should display disclaimer', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.getByText(/Note:/i)).toBeInTheDocument();
    expect(screen.getByText(/individual needs vary/i)).toBeInTheDocument();
  });

  it('should hide recommendations when includeRecommendation is false', () => {
    const shortSessionResult: FuelingResult = {
      carbs: {
        total: 0,
        perHour: 0,
        recommendation: 'Water sufficient for sessions under 60 minutes.',
        includeRecommendation: false,
      },
      sodium: {
        total: 0,
        totalGrams: 0,
        perHour: 0,
        perHourGrams: 0,
        recommendation: 'Sodium not needed for sessions under 60 minutes.',
        includeRecommendation: false,
      },
      water: {
        total: 375,
        perHour: 500,
        recommendation: 'Focus on hydration: 375ml total. Drink to thirst.',
      },
    };

    render(<ResultDisplay result={shortSessionResult} />);

    // Carbs and sodium recommendations should be hidden
    expect(screen.queryByText(/Water sufficient for sessions under 60 minutes/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sodium not needed for sessions under 60 minutes/)).not.toBeInTheDocument();
    // Water recommendation should still be visible
    expect(screen.getByText(/Focus on hydration/)).toBeInTheDocument();
  });
});
