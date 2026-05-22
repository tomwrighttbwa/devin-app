export interface TrainingInput {
  duration: number; // in minutes
  intensity: 'easy' | 'endurance' | 'tempo' | 'high';
}

export interface WeatherData {
  temperature: number; // in Celsius
  humidity: number; // in percentage
}

export interface FuelingResult {
  carbs: {
    total: number; // in grams
    perHour: number; // in grams
    recommendation: string;
    includeRecommendation: boolean; // Whether to show carb recommendations
  };
  sodium: {
    total: number; // in milligrams
    totalGrams: number; // in grams (for salt measurement)
    perHour: number; // in milligrams
    perHourGrams: number; // in grams (for salt measurement)
    recommendation: string;
    includeRecommendation: boolean; // Whether to show sodium recommendations
  };
  water: {
    total: number; // in milliliters
    perHour: number; // in milliliters
    recommendation: string;
  };
  weatherAdjustment?: {
    factor: number;
    reason: string;
  };
}

/**
 * Calculate weather adjustment factor based on temperature and humidity
 * Based on sports nutrition research showing increased sweat rates in hot/humid conditions
 */
export function calculateWeatherAdjustment(weather: WeatherData): {
  factor: number;
  reason: string;
} {
  const { temperature, humidity } = weather;
  let factor = 1.0;
  const reasons: string[] = [];

  // Temperature-based adjustments
  if (temperature > 30) {
    factor += 0.4;
    reasons.push('high temperature (>30°C)');
  } else if (temperature > 25) {
    factor += 0.3;
    reasons.push('warm temperature (25-30°C)');
  } else if (temperature > 20) {
    factor += 0.1;
    reasons.push('mild temperature (20-25°C)');
  } else if (temperature < 10) {
    factor -= 0.1;
    reasons.push('cold temperature (<10°C)');
  }

  // Humidity-based adjustments (more realistic thresholds)
  if (humidity > 85) {
    factor += 0.4;
    reasons.push('very high humidity (>85%)');
  } else if (humidity > 75) {
    factor += 0.2;
    reasons.push('high humidity (75-85%)');
  } else if (humidity > 60) {
    factor += 0.1;
    reasons.push('moderate humidity (60-75%)');
  }

  // Cap the maximum adjustment to prevent excessive recommendations
  factor = Math.min(factor, 1.8);
  factor = Math.max(factor, 0.8);

  return {
    factor,
    reason: reasons.length > 0 ? reasons.join(', ') : 'normal conditions',
  };
}

/**
 * Calculate carbohydrate needs based on training duration and intensity
 * Duration-based approach with intensity as secondary modifier
 */
export function calculateCarbs(
  duration: number,
  intensity: TrainingInput['intensity'],
  weatherFactor: number = 1.0
): {
  total: number;
  perHour: number;
  recommendation: string;
  includeRecommendation: boolean;
} {
  const hours = duration / 60;
  let includeRecommendation = true;

  // Duration-based recommendations (primary factor)
  let basePerHour: number;
  if (duration < 60) {
    basePerHour = 0;
    includeRecommendation = false; // No carb recommendations for short sessions
  } else if (duration < 90) {
    basePerHour = 30; // 30g/hour for 60-90 min sessions
  } else if (duration < 120) {
    basePerHour = 45; // 45g/hour for 90-120 min sessions
  } else {
    basePerHour = 60; // 60g/hour for 120+ min sessions
  }

  // Intensity modifiers (secondary factor)
  let intensityModifier = 1.0;
  switch (intensity) {
    case 'easy': // Zone 1-2: Recovery, conversation pace
      intensityModifier = 0.9;
      break;
    case 'endurance': // Zone 2-3: Comfortable working pace
      intensityModifier = 1.0;
      break;
    case 'tempo': // Zone 4: Threshold work
      intensityModifier = 1.2;
      break;
    case 'high': // Zone 5: VO2 max/intervals
      intensityModifier = 1.4;
      break;
  }

  // Apply intensity modifier
  let adjustedPerHour = basePerHour * intensityModifier;

  // Apply weather adjustment (carbs needs increase slightly in heat)
  if (duration >= 60) {
    adjustedPerHour = adjustedPerHour * (1 + (weatherFactor - 1) * 0.2);
  }

  // Cap at reasonable maximum
  adjustedPerHour = Math.min(adjustedPerHour, 90);

  // Total carbs for the session
  const total = adjustedPerHour * hours;

  let recommendation = '';
  if (duration < 60) {
    recommendation = 'Water sufficient for sessions under 60 minutes. Focus on pre-training nutrition.';
  } else if (duration < 90) {
    recommendation = `Start fueling: ${Math.round(adjustedPerHour)}g carbs/hour. Use sugar, maple syrup, gels, or bananas.`;
  } else if (duration < 120) {
    recommendation = `${Math.round(adjustedPerHour)}g carbs/hour. Mix glucose/fructose sources (e.g., sugar and maltodextrin).`;
  } else {
    recommendation = `${Math.round(adjustedPerHour)}g carbs/hour. Use multiple transportable carbs for endurance events.`;
  }

  return {
    total: Math.round(total),
    perHour: Math.round(adjustedPerHour),
    recommendation,
    includeRecommendation,
  };
}

/**
 * Calculate sodium needs based on training duration and weather conditions
 * Duration-based approach with gram measurements for salt
 */
export function calculateSodium(
  duration: number,
  intensity: TrainingInput['intensity'],
  weatherFactor: number = 1.0
): {
  total: number;
  totalGrams: number;
  perHour: number;
  perHourGrams: number;
  recommendation: string;
  includeRecommendation: boolean;
} {
  const hours = duration / 60;
  let includeRecommendation = true;

  // Convert sodium to salt: 1g salt ≈ 400mg sodium
  const sodiumToSaltRatio = 0.0025; // mg to grams conversion

  // Duration-based recommendations (primary factor)
  let basePerHour: number;
  if (duration < 60) {
    basePerHour = 0;
    includeRecommendation = false; // No sodium recommendations for short sessions
  } else if (duration < 90) {
    basePerHour = 300; // 300mg/hour for 60-90 min sessions
  } else if (duration < 120) {
    basePerHour = 400; // 400mg/hour for 90-120 min sessions
  } else {
    basePerHour = 500; // 500mg/hour for 120+ min sessions
  }

  // Intensity modifiers (secondary factor)
  let intensityModifier = 1.0;
  switch (intensity) {
    case 'easy': // Zone 1-2: Recovery
      intensityModifier = 0.9;
      break;
    case 'endurance': // Zone 2-3: Comfortable working pace
      intensityModifier = 1.0;
      break;
    case 'tempo': // Zone 4: Threshold work
      intensityModifier = 1.2;
      break;
    case 'high': // Zone 5: VO2 max/intervals
      intensityModifier = 1.4;
      break;
  }

  // Apply intensity modifier
  let adjustedPerHour = basePerHour * intensityModifier;

  // Apply weather adjustment (sodium needs increase significantly in heat)
  if (duration >= 60) {
    adjustedPerHour = adjustedPerHour * weatherFactor;
  }

  // Cap at reasonable maximum
  adjustedPerHour = Math.min(adjustedPerHour, 1200);

  // Total sodium for the session
  const total = adjustedPerHour * hours;

  // Convert to grams for salt measurement
  const totalGrams = total * sodiumToSaltRatio;
  const perHourGrams = adjustedPerHour * sodiumToSaltRatio;

  let recommendation = '';
  if (duration < 60) {
    recommendation = 'Sodium not needed for sessions under 60 minutes.';
  } else if (adjustedPerHour < 400) {
    const perHourGrams = adjustedPerHour / 1000;
    recommendation = `Light sodium needs: ${Math.round(adjustedPerHour)}mg/hour (~${Math.round(perHourGrams * 10) / 10}g salt). Electrolyte drink sufficient.`;
  } else if (adjustedPerHour < 600) {
    const perHourGrams = adjustedPerHour / 1000;
    recommendation = `Moderate sodium: ${Math.round(adjustedPerHour)}mg/hour (~${Math.round(perHourGrams * 10) / 10}g salt). Use electrolyte tablets or add salt to food.`;
  } else {
    const perHourGrams = adjustedPerHour / 1000;
    recommendation = `High sodium: ${Math.round(adjustedPerHour)}mg/hour (~${Math.round(perHourGrams * 10) / 10}g salt). Consider multiple electrolyte sources.`;
  }

  return {
    total: Math.round(total),
    totalGrams: Math.round(totalGrams * 100) / 100,
    perHour: Math.round(adjustedPerHour),
    perHourGrams: Math.round(perHourGrams * 100) / 100,
    recommendation,
    includeRecommendation,
  };
}

/**
 * Calculate water needs based on training duration and weather conditions
 * Duration-based approach with focus on hydration for short sessions
 */
export function calculateWater(
  duration: number,
  intensity: TrainingInput['intensity'],
  weatherFactor: number = 1.0
): {
  total: number;
  perHour: number;
  recommendation: string;
} {
  const hours = duration / 60;

  // Duration-based recommendations (primary factor)
  let basePerHour: number;
  if (duration < 60) {
    basePerHour = 500; // Focus on water for short sessions
  } else if (duration < 90) {
    basePerHour = 600;
  } else if (duration < 120) {
    basePerHour = 700;
  } else {
    basePerHour = 800;
  }

  // Intensity modifiers (secondary factor)
  let intensityModifier = 1.0;
  switch (intensity) {
    case 'easy': // Zone 1-2: Recovery
      intensityModifier = 0.9;
      break;
    case 'endurance': // Zone 2-3: Comfortable working pace
      intensityModifier = 1.0;
      break;
    case 'tempo': // Zone 4: Threshold work
      intensityModifier = 1.2;
      break;
    case 'high': // Zone 5: VO2 max/intervals
      intensityModifier = 1.4;
      break;
  }

  // Apply intensity modifier
  let adjustedPerHour = basePerHour * intensityModifier;

  // Apply weather adjustment (water needs increase significantly in heat)
  adjustedPerHour = adjustedPerHour * weatherFactor;

  // Cap at reasonable maximum
  adjustedPerHour = Math.min(adjustedPerHour, 1500);

  // Total water for the session
  const total = adjustedPerHour * hours;

  let recommendation = '';
  if (duration < 60) {
    recommendation = `Focus on hydration: ${Math.round(total)}ml total. Drink to thirst, pre-hydrate with 400-600ml before exercise.`;
  } else if (duration < 90) {
    recommendation = `${Math.round(adjustedPerHour)}ml/hour. Set reminders to drink every 15-20 minutes.`;
  } else if (duration < 120) {
    recommendation = `${Math.round(adjustedPerHour)}ml/hour. Monitor urine color as hydration indicator.`;
  } else {
    recommendation = `${Math.round(adjustedPerHour)}ml/hour. High fluid needs - consider cold fluids for better absorption.`;
  }

  return {
    total: Math.round(total),
    perHour: Math.round(adjustedPerHour),
    recommendation,
  };
}

/**
 * Main function to calculate all fueling needs
 */
export function calculateFuelingNeeds(input: TrainingInput, weather?: WeatherData): FuelingResult {
  const weatherAdjustment = weather ? calculateWeatherAdjustment(weather) : undefined;
  const weatherFactor = weatherAdjustment?.factor ?? 1.0;

  const carbs = calculateCarbs(input.duration, input.intensity, weatherFactor);
  const sodium = calculateSodium(input.duration, input.intensity, weatherFactor);
  const water = calculateWater(input.duration, input.intensity, weatherFactor);

  return {
    carbs: {
      total: carbs.total,
      perHour: carbs.perHour,
      recommendation: carbs.recommendation,
      includeRecommendation: carbs.includeRecommendation,
    },
    sodium: {
      total: sodium.total,
      totalGrams: sodium.totalGrams,
      perHour: sodium.perHour,
      perHourGrams: sodium.perHourGrams,
      recommendation: sodium.recommendation,
      includeRecommendation: sodium.includeRecommendation,
    },
    water: water,
    weatherAdjustment,
  };
}
