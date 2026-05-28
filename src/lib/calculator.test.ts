import { describe, it, expect } from 'vitest';
import {
  calculateFuelingNeeds,
  calculateCarbs,
  calculateSodium,
  calculateWater,
  type TrainingInput,
  type WeatherData,
} from './calculator';

describe('calculateFuelingNeeds', () => {
  it('should calculate fueling needs without weather', () => {
    const input: TrainingInput = {
      duration: 90,
      intensity: 'endurance',
    };

    const result = calculateFuelingNeeds(input);

    expect(result.carbs.total).toBeGreaterThan(0);
    expect(result.carbs.perHour).toBeGreaterThan(0);
    expect(result.carbs.recommendation).toBeTruthy();
    expect(result.carbs.scienceNotes).toBeTruthy();
    expect(result.weatherAssessment.heatIndex).toBe(20);
    expect(result.weatherAssessment.riskLevel).toBe('low');
  });

  it('should calculate fueling needs with weather', () => {
    const input: TrainingInput = {
      duration: 90,
      intensity: 'endurance',
    };

    const weather: WeatherData = {
      temperature: 30,
      humidity: 70,
    };

    const result = calculateFuelingNeeds(input, weather);

    expect(result.weatherAssessment.heatIndex).toBeGreaterThan(30);
    expect(result.weatherAssessment.warnings.length).toBeGreaterThan(0);
  });

  it('should handle extreme heat conditions', () => {
    const input: TrainingInput = {
      duration: 120,
      intensity: 'high',
    };

    const weather: WeatherData = {
      temperature: 40,
      humidity: 80,
    };

    const result = calculateFuelingNeeds(input, weather);

    expect(result.weatherAssessment.riskLevel).toBe('extreme');
    expect(result.weatherAssessment.warnings.length).toBeGreaterThan(0);
  });

  it('should return rounded values', () => {
    const input: TrainingInput = {
      duration: 90,
      intensity: 'endurance',
    };

    const result = calculateFuelingNeeds(input);

    expect(result.carbs.total).toBe(Math.round(result.carbs.total));
    expect(result.carbs.perHour).toBe(Math.round(result.carbs.perHour));
  });

  it('should handle very short sessions', () => {
    const input: TrainingInput = {
      duration: 30,
      intensity: 'easy',
    };

    const result = calculateFuelingNeeds(input);

    expect(result.carbs.includeRecommendation).toBe(false);
    expect(result.sodium.includeRecommendation).toBe(false);
  });

  it('should handle very long sessions', () => {
    const input: TrainingInput = {
      duration: 240,
      intensity: 'endurance',
    };

    const result = calculateFuelingNeeds(input);

    expect(result.carbs.total).toBeGreaterThan(0);
    expect(result.sodium.total).toBeGreaterThan(0);
    expect(result.water.total).toBeGreaterThan(0);
  });
});

describe('calculateCarbs', () => {
  it('should return 0 carbs for sessions under 60 minutes', () => {
    const result = calculateCarbs(45, 'easy', 'low');
    expect(result.perHour).toBe(0);
    expect(result.total).toBe(0);
    expect(result.includeRecommendation).toBe(false);
  });

  it('should calculate carbs for 60-90 minute sessions', () => {
    const result = calculateCarbs(75, 'endurance', 'low');
    expect(result.perHour).toBeGreaterThan(30);
    expect(result.perHour).toBeLessThan(60);
    expect(result.includeRecommendation).toBe(true);
  });

  it('should calculate carbs for 90-120 minute sessions', () => {
    const result = calculateCarbs(105, 'endurance', 'low');
    expect(result.perHour).toBeGreaterThanOrEqual(30);
    expect(result.perHour).toBeLessThanOrEqual(60);
    expect(result.includeRecommendation).toBe(true);
  });

  it('should calculate carbs for 120-180 minute sessions', () => {
    const result = calculateCarbs(150, 'endurance', 'low');
    expect(result.perHour).toBeGreaterThanOrEqual(60);
    expect(result.perHour).toBeLessThanOrEqual(90);
  });

  it('should calculate carbs for ultra-endurance sessions', () => {
    const result = calculateCarbs(240, 'endurance', 'low');
    expect(result.perHour).toBeGreaterThanOrEqual(60);
    expect(result.perHour).toBeLessThanOrEqual(90);
  });

  it('should provide appropriate science notes', () => {
    const result = calculateCarbs(90, 'endurance', 'low');
    expect(result.scienceNotes).toContain('ACSM');
    expect(result.scienceNotes).toBeTruthy();
  });

  it('should add heat warnings in extreme conditions', () => {
    const result = calculateCarbs(90, 'endurance', 'extreme');
    expect(result.recommendation).toContain('Heat stress');
  });

  it('should calculate total carbs correctly for multi-hour sessions', () => {
    const result = calculateCarbs(120, 'endurance', 'low');
    expect(result.total).toBe(result.perHour * 2);
  });
});

describe('calculateSodium', () => {
  it('should return 0 sodium for sessions under 60 minutes', () => {
    const result = calculateSodium(45, 'low');
    expect(result.perHour).toBe(0);
    expect(result.total).toBe(0);
    expect(result.includeRecommendation).toBe(false);
  });

  it('should calculate minimal sodium for 60-120 minute sessions in normal conditions', () => {
    const result = calculateSodium(90, 'low');
    expect(result.perHour).toBe(200);
    expect(result.includeRecommendation).toBe(true);
  });

  it('should calculate higher sodium for 60-120 minute sessions in extreme heat', () => {
    const result = calculateSodium(90, 'extreme');
    expect(result.perHour).toBe(400);
  });

  it('should calculate sodium for 120+ minute sessions', () => {
    const result = calculateSodium(150, 'low');
    expect(result.perHour).toBe(400);
  });

  it('should calculate higher sodium for 120+ minute sessions in extreme heat', () => {
    const result = calculateSodium(150, 'extreme');
    expect(result.perHour).toBe(600);
  });

  it('should provide appropriate science notes', () => {
    const result = calculateSodium(90, 'low');
    expect(result.scienceNotes).toContain('ACSM');
    expect(result.scienceNotes).toBeTruthy();
  });

  it('should mention individual variation in recommendations', () => {
    const result = calculateSodium(90, 'low');
    expect(result.recommendation).toContain('individual');
  });

  it('should convert sodium to grams correctly', () => {
    const result = calculateSodium(120, 'low');
    expect(result.totalGrams).toBeCloseTo(result.total * 0.0025);
    expect(result.perHourGrams).toBeCloseTo(result.perHour * 0.0025);
  });

  it('should calculate total sodium correctly for multi-hour sessions', () => {
    const result = calculateSodium(120, 'low');
    expect(result.total).toBe(result.perHour * 2);
  });
});

describe('calculateWater', () => {
  it('should calculate water for short sessions', () => {
    const result = calculateWater(45, 'low');
    expect(result.perHour).toBe(400);
    expect(result.total).toBeGreaterThan(0);
  });

  it('should calculate water for moderate sessions', () => {
    const result = calculateWater(90, 'low');
    expect(result.perHour).toBe(400);
  });

  it('should calculate water for long sessions', () => {
    const result = calculateWater(150, 'low');
    expect(result.perHour).toBe(400);
  });

  it('should increase water needs in moderate heat', () => {
    const result = calculateWater(90, 'moderate');
    expect(result.perHour).toBe(500);
  });

  it('should increase water needs in high heat', () => {
    const result = calculateWater(90, 'high');
    expect(result.perHour).toBe(600);
  });

  it('should increase water needs in extreme heat but respect safety limit', () => {
    const result = calculateWater(90, 'extreme');
    expect(result.perHour).toBe(700);
    expect(result.perHour).toBeLessThanOrEqual(800);
  });

  it('should never exceed ACSM safety limit of 800ml/hour', () => {
    const result = calculateWater(60, 'extreme');
    expect(result.perHour).toBeLessThanOrEqual(800);
  });

  it('should provide appropriate science notes', () => {
    const result = calculateWater(90, 'low');
    expect(result.scienceNotes).toContain('ACSM');
    expect(result.scienceNotes).toContain('800ml/hour');
  });

  it('should mention hyponatremia risk', () => {
    const result = calculateWater(90, 'low');
    expect(result.scienceNotes).toContain('hyponatremia');
  });

  it('should calculate total water correctly for multi-hour sessions', () => {
    const result = calculateWater(120, 'low');
    expect(result.total).toBe(result.perHour * 2);
  });

  it('should add heat warnings in extreme conditions', () => {
    const result = calculateWater(90, 'extreme');
    expect(result.recommendation).toContain('EXTREME HEAT');
  });
});

describe('Heat Index Calculations', () => {
  it('should handle normal conditions', () => {
    const input: TrainingInput = {
      duration: 60,
      intensity: 'endurance',
    };

    const weather: WeatherData = {
      temperature: 20,
      humidity: 50,
    };

    const result = calculateFuelingNeeds(input, weather);

    expect(result.weatherAssessment.heatIndex).toBe(20);
    expect(result.weatherAssessment.riskLevel).toBe('low');
  });

  it('should calculate heat index for hot conditions', () => {
    const input: TrainingInput = {
      duration: 60,
      intensity: 'endurance',
    };

    const weather: WeatherData = {
      temperature: 35,
      humidity: 70,
    };

    const result = calculateFuelingNeeds(input, weather);

    expect(result.weatherAssessment.heatIndex).toBeGreaterThan(35);
    expect(result.weatherAssessment.riskLevel).not.toBe('low');
  });

  it('should provide warnings for high heat risk', () => {
    const input: TrainingInput = {
      duration: 60,
      intensity: 'endurance',
    };

    const weather: WeatherData = {
      temperature: 40,
      humidity: 80,
    };

    const result = calculateFuelingNeeds(input, weather);

    expect(result.weatherAssessment.riskLevel).toBe('extreme');
    expect(result.weatherAssessment.warnings.length).toBeGreaterThan(0);
  });
});