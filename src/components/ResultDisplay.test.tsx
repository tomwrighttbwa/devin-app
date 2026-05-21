import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultDisplay from './ResultDisplay';
import type { FuelingResult } from '../lib/calculator';

describe('ResultDisplay', () => {
  const mockResult: FuelingResult = {
    carbs: {
      total: 90,
      perHour: 45,
      recommendation: 'Consume 30-45g of carbs per hour',
    },
    sodium: {
      total: 800,
      perHour: 400,
      recommendation: 'Moderate sodium needs',
    },
    water: {
      total: 1200,
      perHour: 600,
      recommendation: 'Aim for 500-700ml per hour',
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
    expect(screen.getByText('1200')).toBeInTheDocument(); // water total
    expect(screen.getByText('600')).toBeInTheDocument(); // water per hour
  });

  it('should display recommendations', () => {
    render(<ResultDisplay result={mockResult} />);

    expect(screen.getByText('Consume 30-45g of carbs per hour')).toBeInTheDocument();
    expect(screen.getByText('Moderate sodium needs')).toBeInTheDocument();
    expect(screen.getByText('Aim for 500-700ml per hour')).toBeInTheDocument();
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
});
