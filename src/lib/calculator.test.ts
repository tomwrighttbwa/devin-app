import { describe, it, expect } from 'vitest';
import {
  calculateWeatherAdjustment,
  calculateCarbs,
  calculateSodium,
  calculateWater,
  calculateFuelingNeeds,
} from './calculator';
import type { TrainingInput, WeatherData } from './calculator';

describe('calculateWeatherAdjustment', () => {
  it('should return 1.0 factor for normal conditions', () => {
    const result = calculateWeatherAdjustment({ temperature: 20, humidity: 50 });
    expect(result.factor).toBe(1.0);
    expect(result.reason).toBe('normal conditions');
  });

  it('should increase factor for high temperature', () => {
    const result = calculateWeatherAdjustment({ temperature: 32, humidity: 50 });
    expect(result.factor).toBeGreaterThan(1.0);
    expect(result.reason).toContain('high temperature');
  });

  it('should increase factor for high humidity', () => {
    const result = calculateWeatherAdjustment({ temperature: 25, humidity: 90 });
    expect(result.factor).toBeGreaterThan(1.0);
    expect(result.reason).toContain('very high humidity');
  });

  it('should apply combined adjustments for hot and humid', () => {
    const result = calculateWeatherAdjustment({ temperature: 32, humidity: 90 });
    expect(result.factor).toBeGreaterThan(1.4);
    expect(result.reason).toContain('high temperature');
    expect(result.reason).toContain('very high humidity');
  });

  it('should apply moderate humidity adjustment', () => {
    const result = calculateWeatherAdjustment({ temperature: 25, humidity: 70 });
    expect(result.factor).toBeGreaterThan(1.0);
    expect(result.reason).toContain('moderate humidity');
  });

  it('should decrease factor for cold conditions', () => {
    const result = calculateWeatherAdjustment({ temperature: 5, humidity: 50 });
    expect(result.factor).toBeLessThan(1.0);
    expect(result.reason).toContain('cold temperature');
  });

  it('should cap maximum factor at 1.8', () => {
    const result = calculateWeatherAdjustment({ temperature: 40, humidity: 95 });
    expect(result.factor).toBeLessThanOrEqual(1.8);
  });

  it('should cap minimum factor at 0.8', () => {
    const result = calculateWeatherAdjustment({ temperature: 0, humidity: 90 });
    expect(result.factor).toBeGreaterThanOrEqual(0.8);
  });
});

describe('calculateCarbs', () => {
  it('should calculate carbs for low intensity', () => {
    const result = calculateCarbs(60, 'low', 1.0);
    expect(result.perHour).toBe(30);
    expect(result.total).toBe(30);
  });

  it('should calculate carbs for moderate intensity', () => {
    const result = calculateCarbs(60, 'moderate', 1.0);
    expect(result.perHour).toBe(45);
    expect(result.total).toBe(45);
  });

  it('should calculate carbs for high intensity', () => {
    const result = calculateCarbs(60, 'high', 1.0);
    expect(result.perHour).toBe(60);
    expect(result.total).toBe(60);
  });

  it('should calculate total carbs correctly for multi-hour sessions', () => {
    const result = calculateCarbs(120, 'moderate', 1.0);
    expect(result.perHour).toBe(45);
    expect(result.total).toBe(90);
  });

  it('should apply weather adjustment to carbs', () => {
    const result = calculateCarbs(60, 'moderate', 1.5);
    expect(result.perHour).toBeGreaterThan(45);
    expect(result.perHour).toBeLessThan(68); // 45 * 1.5 * 0.3 adjustment
  });

  it('should provide appropriate recommendation for short sessions', () => {
    const result = calculateCarbs(45, 'moderate', 1.0);
    expect(result.recommendation).toContain('under 60 minutes');
  });

  it('should provide appropriate recommendation for long sessions', () => {
    const result = calculateCarbs(180, 'high', 1.0);
    expect(result.recommendation).toContain('60-90g');
  });
});

describe('calculateSodium', () => {
  it('should calculate sodium for low intensity', () => {
    const result = calculateSodium(60, 'low', 1.0);
    expect(result.perHour).toBe(300);
    expect(result.total).toBe(300);
  });

  it('should calculate sodium for moderate intensity', () => {
    const result = calculateSodium(60, 'moderate', 1.0);
    expect(result.perHour).toBe(400);
    expect(result.total).toBe(400);
  });

  it('should calculate sodium for high intensity', () => {
    const result = calculateSodium(60, 'high', 1.0);
    expect(result.perHour).toBe(500);
    expect(result.total).toBe(500);
  });

  it('should calculate total sodium correctly for multi-hour sessions', () => {
    const result = calculateSodium(120, 'moderate', 1.0);
    expect(result.perHour).toBe(400);
    expect(result.total).toBe(800);
  });

  it('should apply weather adjustment to sodium', () => {
    const result = calculateSodium(60, 'moderate', 1.5);
    expect(result.perHour).toBe(600); // 400 * 1.5
  });

  it('should provide appropriate recommendation for short sessions', () => {
    const result = calculateSodium(45, 'moderate', 1.0);
    expect(result.recommendation).toContain('under 60 minutes');
  });

  it('should provide appropriate recommendation for high sodium needs', () => {
    const result = calculateSodium(120, 'high', 1.5);
    expect(result.perHour).toBeGreaterThan(600);
    expect(result.recommendation).toContain('High sodium');
  });
});

describe('calculateWater', () => {
  it('should calculate water for low intensity', () => {
    const result = calculateWater(60, 'low', 1.0);
    expect(result.perHour).toBe(400);
    expect(result.total).toBe(400);
  });

  it('should calculate water for moderate intensity', () => {
    const result = calculateWater(60, 'moderate', 1.0);
    expect(result.perHour).toBe(600);
    expect(result.total).toBe(600);
  });

  it('should calculate water for high intensity', () => {
    const result = calculateWater(60, 'high', 1.0);
    expect(result.perHour).toBe(800);
    expect(result.total).toBe(800);
  });

  it('should calculate total water correctly for multi-hour sessions', () => {
    const result = calculateWater(120, 'moderate', 1.0);
    expect(result.perHour).toBe(600);
    expect(result.total).toBe(1200);
  });

  it('should apply weather adjustment to water', () => {
    const result = calculateWater(60, 'moderate', 1.5);
    expect(result.perHour).toBe(900); // 600 * 1.5
  });

  it('should provide appropriate recommendation for short sessions', () => {
    const result = calculateWater(45, 'moderate', 1.0);
    expect(result.recommendation).toContain('Drink to thirst');
  });

  it('should provide appropriate recommendation for high water needs', () => {
    const result = calculateWater(120, 'high', 1.5);
    expect(result.perHour).toBeGreaterThan(1000);
    expect(result.recommendation).toContain('High fluid needs');
  });
});

describe('calculateFuelingNeeds', () => {
  it('should calculate all fueling needs without weather', () => {
    const input: TrainingInput = { duration: 90, intensity: 'moderate' };
    const result = calculateFuelingNeeds(input);

    expect(result.carbs.perHour).toBeGreaterThan(0);
    expect(result.sodium.perHour).toBeGreaterThan(0);
    expect(result.water.perHour).toBeGreaterThan(0);
    expect(result.weatherAdjustment).toBeUndefined();
  });

  it('should calculate all fueling needs with weather', () => {
    const input: TrainingInput = { duration: 90, intensity: 'moderate' };
    const weather: WeatherData = { temperature: 32, humidity: 85 };
    const result = calculateFuelingNeeds(input, weather);

    expect(result.carbs.perHour).toBeGreaterThan(0);
    expect(result.sodium.perHour).toBeGreaterThan(0);
    expect(result.water.perHour).toBeGreaterThan(0);
    expect(result.weatherAdjustment).toBeDefined();
    expect(result.weatherAdjustment!.factor).toBeGreaterThan(1.0);
  });

  it('should return rounded values', () => {
    const input: TrainingInput = { duration: 90, intensity: 'moderate' };
    const result = calculateFuelingNeeds(input);

    expect(result.carbs.total).toBe(Math.round(result.carbs.total));
    expect(result.sodium.total).toBe(Math.round(result.sodium.total));
    expect(result.water.total).toBe(Math.round(result.water.total));
  });

  it('should handle very short sessions', () => {
    const input: TrainingInput = { duration: 30, intensity: 'low' };
    const result = calculateFuelingNeeds(input);

    expect(result.carbs.recommendation).toContain('under 60 minutes');
    expect(result.sodium.recommendation).toContain('under 60 minutes');
    expect(result.water.recommendation).toContain('Drink to thirst');
  });

  it('should handle very long sessions', () => {
    const input: TrainingInput = { duration: 240, intensity: 'high' };
    const weather: WeatherData = { temperature: 32, humidity: 85 };
    const result = calculateFuelingNeeds(input, weather);

    expect(result.carbs.total).toBeGreaterThan(100);
    expect(result.sodium.total).toBeGreaterThan(500);
    expect(result.water.total).toBeGreaterThan(1000);
    expect(result.weatherAdjustment!.factor).toBeGreaterThan(1.0);
  });
});
