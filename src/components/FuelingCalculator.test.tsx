import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FuelingCalculator from './FuelingCalculator';
import * as calculator from '../lib/calculator';

// Mock the calculator functions
vi.mock('../lib/calculator', () => ({
  calculateFuelingNeeds: vi.fn(),
}));

describe('FuelingCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the calculator with initial state', () => {
    render(<FuelingCalculator />);

    expect(screen.getByText('Endurance Fueling Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/Training Duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Training Intensity/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate Fueling Needs/i })).toBeInTheDocument();
  });

  it('should update duration when input changes', async () => {
    const user = userEvent.setup();
    render(<FuelingCalculator />);

    const durationInput = screen.getByLabelText(/Training Duration/i);
    await user.clear(durationInput);
    await user.type(durationInput, '90');

    expect(durationInput).toHaveValue(90);
  });

  it('should update intensity when select changes', async () => {
    const user = userEvent.setup();
    render(<FuelingCalculator />);

    const intensitySelect = screen.getByLabelText(/Training Intensity/i);
    await user.selectOptions(intensitySelect, 'high');

    expect(intensitySelect).toHaveValue('high');
  });

  it('should show weather inputs when weather toggle is enabled', async () => {
    const user = userEvent.setup();
    render(<FuelingCalculator />);

    const weatherToggle = screen.getByLabelText(/Enable weather-based adjustments/i);
    await user.click(weatherToggle);

    expect(screen.getByLabelText(/Location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Use demo mode/i)).toBeInTheDocument();
  });

  it('should show API key input when demo mode is disabled', async () => {
    const user = userEvent.setup();
    render(<FuelingCalculator />);

    const weatherToggle = screen.getByLabelText(/Enable weather-based adjustments/i);
    await user.click(weatherToggle);

    const demoToggle = screen.getByLabelText(/Use demo mode/i);
    await user.click(demoToggle);

    expect(screen.getByLabelText(/OpenWeatherMap API Key/i)).toBeInTheDocument();
  });

  it('should calculate and display results', async () => {
    const mockResult = {
      carbs: {
        total: 90,
        perHour: 45,
        recommendation: 'Test recommendation',
      },
      sodium: {
        total: 800,
        perHour: 400,
        recommendation: 'Test recommendation',
      },
      water: {
        total: 1200,
        perHour: 600,
        recommendation: 'Test recommendation',
      },
    };

    vi.mocked(calculator.calculateFuelingNeeds).mockReturnValue(mockResult);

    const user = userEvent.setup();
    render(<FuelingCalculator />);

    const calculateButton = screen.getByRole('button', { name: /Calculate Fueling Needs/i });
    await user.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Your Fueling Plan')).toBeInTheDocument();
      expect(screen.getByText('90')).toBeInTheDocument(); // carbs total
    });
  });

  it('should work with demo mode weather data', async () => {
    const user = userEvent.setup();
    render(<FuelingCalculator />);

    const weatherToggle = screen.getByLabelText(/Enable weather-based adjustments/i);
    await user.click(weatherToggle);

    const locationInput = screen.getByLabelText(/Location/i);
    await user.type(locationInput, 'Singapore');

    const calculateButton = screen.getByRole('button', { name: /Calculate Fueling Needs/i });
    await user.click(calculateButton);

    await waitFor(() => {
      expect(screen.getByText('Your Fueling Plan')).toBeInTheDocument();
    });
  });
});
