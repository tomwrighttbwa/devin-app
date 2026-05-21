export interface TrainingInput {
  duration: number; // in minutes
  intensity: 'low' | 'moderate' | 'high';
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
  };
  sodium: {
    total: number; // in milligrams
    perHour: number; // in milligrams
    recommendation: string;
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
 * Based on ISSN Position Stand: Nutrient Timing (2017) and ACSM guidelines
 */
export function calculateCarbs(
  duration: number,
  intensity: TrainingInput['intensity'],
  weatherFactor: number = 1.0
): {
  total: number;
  perHour: number;
  recommendation: string;
} {
  const hours = duration / 60;

  // Base carbohydrate needs per hour based on intensity (in grams)
  // ISSN guidelines: 30-60g/hour for moderate, up to 90g/hour for high intensity
  let basePerHour: number;
  switch (intensity) {
    case 'low':
      basePerHour = 30;
      break;
    case 'moderate':
      basePerHour = 45;
      break;
    case 'high':
      basePerHour = 60;
      break;
  }

  // Apply weather adjustment (carbs needs increase slightly in heat due to increased glycogen utilization)
  const adjustedPerHour = basePerHour * (1 + (weatherFactor - 1) * 0.3);

  // Total carbs for the session
  const total = adjustedPerHour * hours;

  let recommendation = '';
  if (duration < 60) {
    recommendation =
      'Water is sufficient for sessions under 60 minutes. Focus on pre-training nutrition.';
  } else if (duration < 90) {
    recommendation =
      'Consume 30-45g of carbs per hour from sports drinks, gels, or easily digestible foods.';
  } else if (duration < 150) {
    recommendation =
      'Aim for 45-60g of carbs per hour. Mix glucose and fructose sources for optimal absorption.';
  } else {
    recommendation =
      'Target 60-90g of carbs per hour. Use multiple transportable carbs (glucose:fructose 2:1 ratio).';
  }

  return {
    total: Math.round(total),
    perHour: Math.round(adjustedPerHour),
    recommendation,
  };
}

/**
 * Calculate sodium needs based on training duration and weather conditions
 * Based on ACSM and ISSN position stands, accounting for individual sweat rate variability
 */
export function calculateSodium(
  duration: number,
  intensity: TrainingInput['intensity'],
  weatherFactor: number = 1.0
): {
  total: number;
  perHour: number;
  recommendation: string;
} {
  const hours = duration / 60;

  // Base sodium needs per hour (in milligrams)
  // Average sweat sodium concentration: 300-800mg/L, typical sweat rate: 0.5-1.5L/hour
  let basePerHour: number;
  switch (intensity) {
    case 'low':
      basePerHour = 300;
      break;
    case 'moderate':
      basePerHour = 400;
      break;
    case 'high':
      basePerHour = 500;
      break;
  }

  // Apply weather adjustment (sodium needs increase significantly in heat due to higher sweat rates)
  const adjustedPerHour = basePerHour * weatherFactor;

  // Total sodium for the session
  const total = adjustedPerHour * hours;

  let recommendation = '';
  if (duration < 60) {
    recommendation =
      'Sodium supplementation generally not needed for sessions under 60 minutes unless in extreme heat.';
  } else if (adjustedPerHour < 400) {
    recommendation = `Light sodium needs: ${Math.round(adjustedPerHour)}mg/hour (~${Math.round(perHourGrams * 10) / 10}g salt). Electrolyte drink sufficient.`;
  } else if (adjustedPerHour < 600) {
    recommendation = `Moderate sodium: ${Math.round(adjustedPerHour)}mg/hour (~${Math.round(perHourGrams * 10) / 10}g salt). Use electrolyte tablets or add salt to food.`;
  } else {
    recommendation = `High sodium: ${Math.round(adjustedPerHour)}mg/hour (~${Math.round(perHourGrams * 10) / 10}g salt). Consider multiple electrolyte sources.`;
  }

  return {
    total: Math.round(total),
    perHour: Math.round(adjustedPerHour),
    recommendation,
  };
}

/**
 * Calculate water needs based on training duration and weather conditions
 * Based on ACSM hydration guidelines and sweat rate research
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

  // Base water needs per hour (in milliliters)
  // ACSM recommends 400-800ml/hour during exercise, depending on sweat rate
  let basePerHour: number;
  switch (intensity) {
    case 'low':
      basePerHour = 400;
      break;
    case 'moderate':
      basePerHour = 600;
      break;
    case 'high':
      basePerHour = 800;
      break;
  }

  // Apply weather adjustment (water needs increase significantly in heat/humidity)
  const adjustedPerHour = basePerHour * weatherFactor;

  // Total water for the session
  const total = adjustedPerHour * hours;

  let recommendation = '';
  if (duration < 60) {
    recommendation = 'Drink to thirst. Pre-hydrate with 400-600ml 2-3 hours before exercise.';
  } else if (adjustedPerHour < 500) {
    recommendation = 'Drink 400-500ml per hour. Monitor urine color as a hydration indicator.';
  } else if (adjustedPerHour < 700) {
    recommendation = 'Aim for 500-700ml per hour. Set reminders to drink every 15-20 minutes.';
  } else {
    recommendation =
      'High fluid needs due to conditions. Target 700-1000ml per hour. Consider cold fluids for better absorption.';
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
    carbs,
    sodium,
    water,
    weatherAdjustment,
  };
}
