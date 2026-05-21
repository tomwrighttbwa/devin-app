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
  it('should calculate carbs for easy intensity', () => {
    const result = calculateCarbs(60, 'easy', 1.0);
    expect(result.perHour).toBe(27); // 30g * 0.9 intensity modifier
    expect(result.total).toBe(27);
  });

  it('should calculate carbs for endurance intensity', () => {
    const result = calculateCarbs(60, 'endurance', 1.0);
    expect(result.perHour).toBe(30);
    expect(result.total).toBe(30);
  });

  it('should calculate carbs for tempo intensity', () => {
    const result = calculateCarbs(60, 'tempo', 1.0);
    expect(result.perHour).toBe(36); // 30g * 1.2 intensity modifier
    expect(result.total).toBe(36);
  });

  it('should calculate carbs for high intensity', () => {
    const result = calculateCarbs(60, 'high', 1.0);
    expect(result.perHour).toBe(42); // 30g * 1.4 intensity modifier
    expect(result.total).toBe(42);
  });

  it('should return 0 carbs for sessions under 60 minutes', () => {
    const result = calculateCarbs(45, 'endurance', 1.0);
    expect(result.perHour).toBe(0);
    expect(result.total).toBe(0);
    expect(result.includeRecommendation).toBe(false);
  });

  it('should calculate total carbs correctly for multi-hour sessions', () => {
    const result = calculateCarbs(120, 'endurance', 1.0);
    expect(result.perHour).toBe(60); // 60g for 120+ min sessions
    expect(result.total).toBe(120);
  });

  it('should apply weather adjustment to carbs', () => {
    const result = calculateCarbs(60, 'endurance', 1.5);
    expect(result.perHour).toBeGreaterThan(30);
    expect(result.perHour).toBeLessThan(37); // 30g * 1.2 weather adjustment
  });

  it('should provide appropriate recommendation for short sessions', () => {
    const result = calculateCarbs(45, 'endurance', 1.0);
    expect(result.recommendation).toContain('under 60 minutes');
  });

  it('should provide appropriate recommendation for 60-90 min sessions', () => {
    const result = calculateCarbs(75, 'endurance', 1.0);
    expect(result.recommendation).toContain('Start fueling');
  });

  it('should provide appropriate recommendation for long sessions', () => {
    const result = calculateCarbs(150, 'endurance', 1.0);
    expect(result.recommendation).toContain('60');
  });
});

describe('calculateSodium', () => {
  it('should calculate sodium for easy intensity', () => {
    const result = calculateSodium(60, 'easy', 1.0);
    expect(result.perHour).toBe(270); // 300mg * 0.9 intensity modifier
    expect(result.total).toBe(270);
    expect(result.perHourGrams).toBeCloseTo(0.68); // 270mg * 0.0025
  });

  it('should calculate sodium for endurance intensity', () => {
    const result = calculateSodium(60, 'endurance', 1.0);
    expect(result.perHour).toBe(300);
    expect(result.total).toBe(300);
    expect(result.perHourGrams).toBeCloseTo(0.75); // 300mg * 0.0025
  });

  it('should calculate sodium for tempo intensity', () => {
    const result = calculateSodium(60, 'tempo', 1.0);
    expect(result.perHour).toBe(360); // 300mg * 1.2 intensity modifier
    expect(result.total).toBe(360);
    expect(result.perHourGrams).toBeCloseTo(0.9);
  });

  it('should calculate sodium for high intensity', () => {
    const result = calculateSodium(60, 'high', 1.0);
    expect(result.perHour).toBe(420); // 300mg * 1.4 intensity modifier
    expect(result.total).toBe(420);
    expect(result.perHourGrams).toBeCloseTo(1.05);
  });

  it('should return 0 sodium for sessions under 60 minutes', () => {
    const result = calculateSodium(45, 'endurance', 1.0);
    expect(result.perHour).toBe(0);
    expect(result.total).toBe(0);
    expect(result.includeRecommendation).toBe(false);
  });

  it('should calculate total sodium correctly for multi-hour sessions', () => {
    const result = calculateSodium(120, 'endurance', 1.0);
    expect(result.perHour).toBe(500); // 500mg for 120+ min sessions
    expect(result.total).toBe(1000);
    expect(result.totalGrams).toBeCloseTo(2.5);
  });

  it('should apply weather adjustment to sodium', () => {
    const result = calculateSodium(60, 'endurance', 1.5);
    expect(result.perHour).toBe(450); // 300mg * 1.5
    expect(result.perHourGrams).toBeCloseTo(1.13);
  });

  it('should provide appropriate recommendation for short sessions', () => {
    const result = calculateSodium(45, 'endurance', 1.0);
    expect(result.recommendation).toContain('under 60 minutes');
  });

  it('should provide appropriate recommendation for high sodium needs', () => {
    const result = calculateSodium(120, 'high', 1.5);
    expect(result.perHour).toBeGreaterThan(600);
    expect(result.recommendation).toContain('High sodium');
  });

  it('should include gram measurements in recommendations', () => {
    const result = calculateSodium(90, 'endurance', 1.0);
    expect(result.recommendation).toContain('g salt');
  });
});

describe('calculateWater', () => {
  it('should calculate water for short sessions', () => {
    const result = calculateWater(45, 'endurance', 1.0);
    expect(result.perHour).toBe(500); // 500ml base for < 60 min sessions
    expect(result.total).toBe(375); // 500ml * (45/60 hours)
  });

  it('should calculate water for medium sessions', () => {
    const result = calculateWater(90, 'endurance', 1.0);
    expect(result.perHour).toBe(700); // 700ml for 90-120 min sessions
    expect(result.total).toBe(1050);
  });

  it('should calculate water for long sessions', () => {
    const result = calculateWater(120, 'endurance', 1.0);
    expect(result.perHour).toBe(800); // 800ml for 120+ min sessions
    expect(result.total).toBe(1600);
  });

  it('should calculate water for very long sessions', () => {
    const result = calculateWater(180, 'endurance', 1.0);
    expect(result.perHour).toBe(800); // 800ml for 120+ min sessions
    expect(result.total).toBe(2400);
  });

  it('should apply weather adjustment to water', () => {
    const result = calculateWater(60, 'endurance', 1.5);
    expect(result.perHour).toBe(900); // 600ml * 1.5 (60 min uses 600ml base due to intensity modifier)
  });

  it('should focus on hydration for short sessions', () => {
    const result = calculateWater(45, 'endurance', 1.0);
    expect(result.recommendation).toContain('Focus on hydration');
  });

  it('should provide appropriate recommendation for high water needs', () => {
    const result = calculateWater(120, 'high', 1.5);
    expect(result.perHour).toBeGreaterThan(1000);
    expect(result.recommendation).toContain('High fluid needs');
  });
});

describe('calculateFuelingNeeds', () => {
  it('should calculate all fueling needs without weather', () => {
    const input: TrainingInput = { duration: 90, intensity: 'endurance' };
    const result = calculateFuelingNeeds(input);

    expect(result.carbs.perHour).toBe(45); // 45g for 90-120 min sessions
    expect(result.sodium.perHour).toBe(400); // 400mg for 90-120 min sessions
    expect(result.water.perHour).toBe(700); // 700ml for 90-120 min sessions
    expect(result.weatherAdjustment).toBeUndefined();
    expect(result.carbs.includeRecommendation).toBe(true);
    expect(result.sodium.includeRecommendation).toBe(true);
  });

  it('should calculate all fueling needs with weather', () => {
    const input: TrainingInput = { duration: 90, intensity: 'endurance' };
    const weather: WeatherData = { temperature: 32, humidity: 85 };
    const result = calculateFuelingNeeds(input, weather);

    expect(result.carbs.perHour).toBeGreaterThan(0);
    expect(result.sodium.perHour).toBeGreaterThan(0);
    expect(result.water.perHour).toBeGreaterThan(0);
    expect(result.weatherAdjustment).toBeDefined();
    expect(result.weatherAdjustment!.factor).toBeGreaterThan(1.0);
  });

  it('should hide recommendations for short sessions', () => {
    const input: TrainingInput = { duration: 45, intensity: 'endurance' };
    const result = calculateFuelingNeeds(input);

    expect(result.carbs.perHour).toBe(0);
    expect(result.sodium.perHour).toBe(0);
    expect(result.carbs.includeRecommendation).toBe(false);
    expect(result.sodium.includeRecommendation).toBe(false);
    expect(result.water.perHour).toBeGreaterThan(0); // Water still needed
  });

  it('should include gram measurements for sodium', () => {
    const input: TrainingInput = { duration: 90, intensity: 'endurance' };
    const result = calculateFuelingNeeds(input);

    expect(result.sodium.totalGrams).toBeGreaterThan(0);
    expect(result.sodium.perHourGrams).toBeGreaterThan(0);
  });

  it('should return rounded values', () => {
    const input: TrainingInput = { duration: 90, intensity: 'endurance' };
    const result = calculateFuelingNeeds(input);

    expect(result.carbs.total).toBe(Math.round(result.carbs.total));
    expect(result.sodium.total).toBe(Math.round(result.sodium.total));
    expect(result.water.total).toBe(Math.round(result.water.total));
  });

  it('should handle very short sessions', () => {
    const input: TrainingInput = { duration: 30, intensity: 'easy' };
    const result = calculateFuelingNeeds(input);

    expect(result.carbs.recommendation).toContain('under 60 minutes');
    expect(result.sodium.recommendation).toContain('under 60 minutes');
    expect(result.water.recommendation).toContain('Focus on hydration');
  });

  it('should handle very long sessions', () => {
    const input: TrainingInput = { duration: 240, intensity: 'endurance' };
    const weather: WeatherData = { temperature: 32, humidity: 85 };
    const result = calculateFuelingNeeds(input, weather);

    expect(result.carbs.total).toBeGreaterThan(100);
    expect(result.sodium.total).toBeGreaterThan(500);
    expect(result.water.total).toBeGreaterThan(1000);
    expect(result.weatherAdjustment!.factor).toBeGreaterThan(1.0);
  });

  it('should use realistic intensity modifiers', () => {
    const input: TrainingInput = { duration: 90, intensity: 'tempo' };
    const result = calculateFuelingNeeds(input);

    // Tempo should be 20% higher than endurance
    const enduranceResult = calculateFuelingNeeds({ duration: 90, intensity: 'endurance' });
    expect(result.carbs.perHour).toBeGreaterThan(enduranceResult.carbs.perHour);
    expect(result.sodium.perHour).toBeGreaterThan(enduranceResult.sodium.perHour);
  });
});
