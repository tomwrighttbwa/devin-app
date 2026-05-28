/**
 * Evidence-based Endurance Fueling Calculator
 * Based on ACSM, ISSN position stands and current sports nutrition research
 * 
 * Key Principles:
 * 1. Use established guidelines rather than arbitrary calculations
 * 2. Acknowledge individual variation and provide ranges
 * 3. Prioritize safety with clear warnings
 * 4. Recommend professional individualization for serious athletes
 */

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
    includeRecommendation: boolean;
    scienceNotes: string;
  };
  sodium: {
    total: number; // in milligrams
    totalGrams: number; // in grams (for salt measurement)
    perHour: number; // in milligrams
    perHourGrams: number; // in grams (for salt measurement)
    recommendation: string;
    includeRecommendation: boolean;
    scienceNotes: string;
  };
  water: {
    total: number; // in milliliters
    perHour: number; // in milliliters
    recommendation: string;
    scienceNotes: string;
  };
  weatherAssessment: {
    heatIndex: number;
    riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
    warnings: string[];
  };
}

/**
 * Calculate heat index using Rothfusz equation (NWS standard)
 * Returns apparent temperature in Celsius
 */
function calculateHeatIndex(tempC: number, humidity: number): number {
  const tempF = tempC * 9/5 + 32;
  
  if (tempF < 80 || humidity < 13) {
    return tempC; // Heat index not meaningful in these conditions
  }
  
  const T = tempF;
  const RH = humidity;
  
  // Rothfusz regression equation
  let HI = -42.379 + 2.04901523*T + 10.14333127*RH - 0.22475541*T*RH 
           - 0.00683783*T*T - 0.05481717*RH*RH + 0.00122874*T*T*RH 
           + 0.00085282*T*RH*RH - 0.00000199*T*T*RH*RH;
  
  // Adjustments for extreme conditions
  if (RH < 13 && T >= 80 && T <= 112) {
    const adjustment = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
    HI -= adjustment;
  } else if (RH > 85 && T >= 80 && T <= 87) {
    const adjustment = ((RH - 85) / 10) * ((87 - T) / 5);
    HI += adjustment;
  }
  
  return (HI - 32) * 5/9; // Convert back to Celsius
}

/**
 * Assess heat stress risk level based on heat index
 */
function assessHeatRisk(heatIndexC: number): {
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  warnings: string[];
} {
  const warnings: string[] = [];
  let riskLevel: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
  
  if (heatIndexC >= 41) {
    riskLevel = 'extreme';
    warnings.push('EXTREME HEAT DANGER: Risk of heat stroke is high. Consider postponing exercise.');
    warnings.push('If exercising must occur: reduce intensity, stay hydrated, monitor for heat illness symptoms.');
  } else if (heatIndexC >= 35) {
    riskLevel = 'high';
    warnings.push('HIGH HEAT RISK: Heat cramps and heat exhaustion possible.');
    warnings.push('Reduce exercise intensity and duration. Ensure adequate hydration.');
  } else if (heatIndexC >= 27) {
    riskLevel = 'moderate';
    warnings.push('MODERATE HEAT: Increased sweat rate and fluid loss expected.');
    warnings.push('Monitor hydration status and adjust pace accordingly.');
  } else {
    riskLevel = 'low';
  }
  
  return { riskLevel, warnings };
}

/**
 * Calculate carbohydrate needs based on ACSM/ISSN evidence-based guidelines
 * Duration-based approach with established research backing
 * Note: Intensity not used in evidence-based approach as ACSM/ISSN guidelines are duration-based
 */
export function calculateCarbs(
  duration: number,
  _intensity: TrainingInput['intensity'], // Parameter kept for interface compatibility, not used in evidence-based approach
  heatRisk: 'low' | 'moderate' | 'high' | 'extreme'
): {
  total: number;
  perHour: number;
  recommendation: string;
  includeRecommendation: boolean;
  scienceNotes: string;
} {
  const hours = duration / 60;
  
  // Evidence-based carbohydrate guidelines (ACSM/ISSN Position Stands)
  let perHourRange: { min: number; max: number };
  let includeRecommendation = true;
  
  if (duration < 60) {
    // ACSM: No carbohydrate needed for sessions <60 minutes
    perHourRange = { min: 0, max: 0 };
    includeRecommendation = false;
  } else if (duration < 120) {
    // ACSM: 30-60g/hour for 1-2 hour sessions
    perHourRange = { min: 30, max: 60 };
  } else if (duration < 180) {
    // ISSN: 60-90g/hour for 2-3 hour sessions
    perHourRange = { min: 60, max: 90 };
  } else {
    // ISSN: Up to 90g/hour for ultra-endurance (>3 hours)
    perHourRange = { min: 60, max: 90 };
  }
  
  // Use midpoint for recommendation (acknowledging individual variation)
  const perHour = (perHourRange.min + perHourRange.max) / 2;
  const total = perHour * hours;
  
  let recommendation = '';
  let scienceNotes = '';
  
  if (duration < 60) {
    recommendation = 'Water sufficient. Focus on pre-training nutrition.';
    scienceNotes = 'ACSM guidelines: No carbohydrate needed for sessions under 60 minutes.';
  } else if (duration < 120) {
    recommendation = `${Math.round(perHourRange.min)}-${Math.round(perHourRange.max)}g carbs/hour. Start fueling early and consistently.`;
    scienceNotes = 'ACSM Position Stand: 30-60g/hour for 1-2 hour exercise based on gut absorption limits.';
  } else if (duration < 180) {
    recommendation = `${Math.round(perHourRange.min)}-${Math.round(perHourRange.max)}g carbs/hour. Use multiple transportable carb sources (glucose + fructose).`;
    scienceNotes = 'ISSN guidelines: 60-90g/hour for 2-3 hour sessions. Multiple carb sources increase absorption to ~90g/hour.';
  } else {
    recommendation = `${Math.round(perHourRange.min)}-${Math.round(perHourRange.max)}g carbs/hour. Train gut to tolerate higher intake over time.`;
    scienceNotes = 'ISSN guidelines: Up to 90g/hour for ultra-endurance with multiple transportable carbs. Requires gut training.';
  }
  
  // Add heat-related considerations
  if (heatRisk !== 'low' && duration >= 60) {
    recommendation += ' Heat stress may reduce gut tolerance - start conservatively.';
    scienceNotes += ' Note: Heat stress can reduce gastrointestinal tolerance to carbohydrates.';
  }
  
  return {
    total: Math.round(total),
    perHour: Math.round(perHour),
    recommendation,
    includeRecommendation,
    scienceNotes,
  };
}

/**
 * Calculate sodium needs based on current research evidence
 * Acknowledges high individual variation and limited evidence for fixed recommendations
 */
export function calculateSodium(
  duration: number,
  heatRisk: 'low' | 'moderate' | 'high' | 'extreme'
): {
  total: number;
  totalGrams: number;
  perHour: number;
  perHourGrams: number;
  recommendation: string;
  includeRecommendation: boolean;
  scienceNotes: string;
} {
  const hours = duration / 60;
  const sodiumToSaltRatio = 0.0025; // 1mg sodium = 0.0025g salt
  
  let perHour: number;
  let includeRecommendation = true;
  
  // Evidence-based approach: Sodium needs vary widely (200-2000mg/L sweat sodium)
  // Current research shows limited evidence for fixed recommendations
  if (duration < 60) {
    // Research shows sodium replacement not needed for sessions under 60 minutes
    perHour = 0;
    includeRecommendation = false;
  } else if (duration < 120) {
    // For 1-2 hour sessions, sodium needs are highly individual
    // Most research suggests minimal replacement needed unless extreme conditions
    if (heatRisk === 'extreme') {
      perHour = 500; // Increased for extreme heat
    } else if (heatRisk === 'high') {
      perHour = 300; // Moderate for high heat
    } else {
      perHour = 200; // Minimal for moderate/low heat
    }
  } else {
    // For longer sessions, sodium needs depend on individual sweat sodium concentration
    // Provide conservative range for general population
    if (heatRisk === 'extreme') {
      perHour = 700; // Higher for extreme heat
    } else if (heatRisk === 'high') {
      perHour = 500; // Moderate for high heat
    } else if (heatRisk === 'moderate') {
      perHour = 400; // Moderate for moderate heat
    } else {
      perHour = 300; // Conservative for normal conditions
    }
  }
  
  const total = perHour * hours;
  const totalGrams = total * sodiumToSaltRatio;
  const perHourGrams = perHour * sodiumToSaltRatio;
  
  let recommendation = '';
  let scienceNotes = '';
  
  if (duration < 60) {
    recommendation = 'Sodium not needed for sessions under 60 minutes.';
    scienceNotes = 'Research shows sodium replacement unnecessary for sessions under 60 minutes in most conditions.';
  } else if (duration < 120) {
    if (heatRisk === 'extreme') {
      recommendation = `Consider ${Math.round(perHour)}mg/hour sodium in extreme heat. Individual needs vary widely.`;
      scienceNotes = 'Limited evidence for fixed recommendations. Individual sweat sodium concentration varies 200-2000mg/L.';
    } else {
      recommendation = 'Sodium needs vary greatly between individuals. Consider electrolyte drinks if heavy sweater.';
      scienceNotes = 'ACSM: Replace sodium "when large sweat losses occur" - highly individual. Sweat testing recommended for precision.';
    }
  } else {
    recommendation = `${Math.round(perHour)}mg/hour sodium as starting point. Individual needs vary 200-2000mg/hour based on sweat testing.`;
    scienceNotes = 'Research shows sodium replacement only necessary with high sweat sodium (>40mmol/L) and aggressive fluid replacement (>80%).';
  }
  
  // Add individualization warning
  if (duration >= 60) {
    recommendation += ' Consider individual sweat testing for precise needs.';
    scienceNotes += ' Professional sweat testing recommended for athletes training >5 hours/week.';
  }
  
  return {
    total: Math.round(total),
    totalGrams: Math.round(totalGrams * 100) / 100,
    perHour: Math.round(perHour),
    perHourGrams: Math.round(perHourGrams * 100) / 100,
    recommendation,
    includeRecommendation,
    scienceNotes,
  };
}

/**
 * Calculate water needs based on ACSM evidence-based guidelines
 * Emphasizes individual variation and thirst-driven approach
 */
export function calculateWater(
  duration: number,
  heatRisk: 'low' | 'moderate' | 'high' | 'extreme'
): {
  total: number;
  perHour: number;
  recommendation: string;
  scienceNotes: string;
} {
  const hours = duration / 60;
  
  // Evidence-based approach: Individual sweat rates vary 0.5-2.5L/hour
  // ACSM recommends drinking to thirst rather than fixed volumes
  let basePerHour: number;
  
  if (heatRisk === 'extreme') {
    basePerHour = 700; // Conservative upper estimate for extreme conditions
  } else if (heatRisk === 'high') {
    basePerHour = 600;
  } else if (heatRisk === 'moderate') {
    basePerHour = 500;
  } else {
    basePerHour = 400; // Conservative estimate for normal conditions
  }
  
  // Apply ACSM safety limit: maximum 800ml/hour to prevent hyponatremia
  const safePerHour = Math.min(basePerHour, 800);
  const total = safePerHour * hours;
  
  let recommendation = '';
  let scienceNotes = '';
  
  if (duration < 60) {
    recommendation = `Drink to thirst. Pre-hydrate with 400-600ml 2-3 hours before exercise. Total ~${Math.round(total)}ml likely sufficient.`;
    scienceNotes = 'ACSM guidelines: Drink to thirst during exercise. Pre-hydration important for short sessions.';
  } else {
    recommendation = `Drink to thirst, approximately ${Math.round(safePerHour)}ml/hour maximum. Never exceed 800ml/hour due to hyponatremia risk.`;
    scienceNotes = 'ACSM Position Stand: "Drink no more than 800ml/hour" to prevent hyponatremia. Individual sweat rates vary 0.5-2.5L/hour.';
  }
  
  // Add heat-specific guidance
  if (heatRisk !== 'low') {
    if (heatRisk === 'extreme') {
      recommendation += ' EXTREME HEAT: Reduce intensity, monitor for heat illness, consider postponing.';
      scienceNotes += ' Heat stress significantly increases individual variation in fluid needs.';
    } else {
      recommendation += ' Increased fluid loss expected in heat - monitor urine color as hydration guide.';
      scienceNotes += ' Sweat rates can increase 20-30% in hot conditions, but individual variation remains high.';
    }
  }
  
  return {
    total: Math.round(total),
    perHour: Math.round(safePerHour),
    recommendation,
    scienceNotes,
  };
}

/**
 * Main function to calculate all fueling needs with evidence-based approach
 */
export function calculateFuelingNeeds(input: TrainingInput, weather?: WeatherData): FuelingResult {
  // Calculate heat index and assess risk if weather data provided
  let heatIndex = 20; // Default comfortable temperature
  let riskLevel: 'low' | 'moderate' | 'high' | 'extreme' = 'low';
  let warnings: string[] = [];
  
  if (weather) {
    heatIndex = calculateHeatIndex(weather.temperature, weather.humidity);
    const riskAssessment = assessHeatRisk(heatIndex);
    riskLevel = riskAssessment.riskLevel;
    warnings = riskAssessment.warnings;
  }
  
  const carbs = calculateCarbs(input.duration, input.intensity, riskLevel);
  const sodium = calculateSodium(input.duration, riskLevel);
  const water = calculateWater(input.duration, riskLevel);
  
  return {
    carbs: {
      total: carbs.total,
      perHour: carbs.perHour,
      recommendation: carbs.recommendation,
      includeRecommendation: carbs.includeRecommendation,
      scienceNotes: carbs.scienceNotes,
    },
    sodium: {
      total: sodium.total,
      totalGrams: sodium.totalGrams,
      perHour: sodium.perHour,
      perHourGrams: sodium.perHourGrams,
      recommendation: sodium.recommendation,
      includeRecommendation: sodium.includeRecommendation,
      scienceNotes: sodium.scienceNotes,
    },
    water: {
      total: water.total,
      perHour: water.perHour,
      recommendation: water.recommendation,
      scienceNotes: water.scienceNotes,
    },
    weatherAssessment: {
      heatIndex: Math.round(heatIndex),
      riskLevel,
      warnings,
    },
  };
}