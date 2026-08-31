import { AlertPriority, FactorBreakdown, RiskLevel } from '../types';

export interface RiskCalculationInput {
  rainfall24h: number;
  rainfallRate1h?: number;
  soilMoisture: number;
  slopeDegrees: number;
  elevation: number;
  vegetationCover?: number;
  population?: number;
  geologyType?: string;
  historicalLandslidesCount?: number;
}

export interface RiskCalculationResult {
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  alertPriority: AlertPriority;
  factorOfSafety: number; // geotechnical FoS < 1.0 is failure
  xaiExplanation: string;
  factors: FactorBreakdown[];
  urgencyRecommendation: string;
  evacuationAdvisory: 'none' | 'advisory' | 'mandatory';
}

/**
 * Calculates physics & geotechnical explainable landslide risk
 */
export function calculateRiskScore(input: RiskCalculationInput): RiskCalculationResult {
  const {
    rainfall24h,
    soilMoisture,
    slopeDegrees,
    elevation,
    vegetationCover = 50,
    population = 2000,
    geologyType = 'Weathered Charnockite / Gneiss',
    historicalLandslidesCount = 1
  } = input;

  // 1. Precipitation Trigger Weight (0 - 35 pts)
  // Thresholds: >100mm is warning, >150mm is critical in hill slopes
  const rainNorm = Math.min(rainfall24h / 200, 1.0);
  const rainWeight = rainNorm * 35;

  // 2. Pore Water Moisture Saturation Weight (0 - 30 pts)
  // Moisture > 80% severely reduces effective cohesion
  const moistureNorm = Math.min(soilMoisture / 100, 1.0);
  const moistureWeight = Math.pow(moistureNorm, 1.3) * 30;

  // 3. Slope Angle Weight (0 - 25 pts)
  // Slopes > 30° are susceptible; slopes > 40° in loose soil have high shear stress
  const slopeNorm = Math.min(slopeDegrees / 50, 1.0);
  const slopeWeight = Math.pow(slopeNorm, 1.2) * 25;

  // 4. Elevation & Deforestation Modifiers (0 - 10 pts)
  const vegetationShield = (100 - vegetationCover) / 100; // less vegetation = more risk
  const terrainWeight = (Math.min(elevation / 2000, 1.0) * 0.4 + vegetationShield * 0.6) * 10;

  const rawScore = Math.round(rainWeight + moistureWeight + slopeWeight + terrainWeight);
  const riskScore = Math.min(Math.max(rawScore, 4), 99);

  // Approximate Factor of Safety (FoS) = Resisting Forces / Driving Forces
  // Simplified infinite slope model approximation:
  const frictionAngleRad = (32 * Math.PI) / 180;
  const slopeAngleRad = (Math.max(slopeDegrees, 5) * Math.PI) / 180;
  const porePressureFactor = (1 - (soilMoisture / 100) * 0.65);
  const factorOfSafety = Math.max(
    0.4,
    Number(((Math.tan(frictionAngleRad) / Math.tan(slopeAngleRad)) * porePressureFactor).toFixed(2))
  );

  let riskLevel: RiskLevel = 'low';
  let alertPriority: AlertPriority = 'P3';
  let evacuationAdvisory: 'none' | 'advisory' | 'mandatory' = 'none';

  if (riskScore >= 75 || factorOfSafety < 0.95) {
    riskLevel = 'critical';
    alertPriority = population > 1000 ? 'P1' : 'P2';
    evacuationAdvisory = 'mandatory';
  } else if (riskScore >= 60 || factorOfSafety < 1.15) {
    riskLevel = 'high';
    alertPriority = population > 3000 ? 'P1' : 'P2';
    evacuationAdvisory = 'advisory';
  } else if (riskScore >= 35 || factorOfSafety < 1.4) {
    riskLevel = 'medium';
    alertPriority = population > 5000 ? 'P2' : 'P3';
    evacuationAdvisory = 'none';
  } else {
    riskLevel = 'low';
    alertPriority = 'P3';
    evacuationAdvisory = 'none';
  }

  // Explainable AI (XAI) Synthesis
  let xaiExplanation = '';
  if (riskLevel === 'critical') {
    xaiExplanation = `CRITICAL HAZARD (${riskScore}/100, FoS: ${factorOfSafety}): 24h precipitation (${rainfall24h}mm) heavily exceeds the critical pore pressure trigger. Soil saturation at ${soilMoisture}% has caused severe hydrostatic pressure on steep ${slopeDegrees}° gradient, reducing effective shear strength along the ${geologyType} bed. High probability of sudden debris flow.`;
  } else if (riskLevel === 'high') {
    xaiExplanation = `HIGH HAZARD (${riskScore}/100, FoS: ${factorOfSafety}): Soil moisture is elevated at ${soilMoisture}% with ${rainfall24h}mm rainfall. The ${slopeDegrees}° terrain gradient and low vegetation retention (${vegetationCover}%) heighten slope failure risks. Recommend precautionary evacuation for downslope residents.`;
  } else if (riskLevel === 'medium') {
    xaiExplanation = `MODERATE RISK (${riskScore}/100, FoS: ${factorOfSafety}): Rainfall of ${rainfall24h}mm and soil saturation of ${soilMoisture}% are within manageable limits, but steep cut slopes and road embankments may experience localized rock slips and slumps.`;
  } else {
    xaiExplanation = `LOW RISK (${riskScore}/100, FoS: ${factorOfSafety}): Gentle terrain gradient (${slopeDegrees}°), low saturation (${soilMoisture}%), and good vegetation cover (${vegetationCover}%) keep the slope in a highly stable equilibrium state.`;
  }

  const factors: FactorBreakdown[] = [
    {
      factor: 'Rainfall Inflow (24h)',
      impact: Math.round((rainWeight / 35) * 100),
      description: `${rainfall24h}mm recorded (Threshold: 100mm)`,
      status: rainfall24h >= 140 ? 'danger' : rainfall24h >= 70 ? 'caution' : 'safe'
    },
    {
      factor: 'Soil Pore Saturation',
      impact: Math.round(moistureNorm * 100),
      description: `${soilMoisture}% volumetric water content`,
      status: soilMoisture >= 85 ? 'danger' : soilMoisture >= 60 ? 'caution' : 'safe'
    },
    {
      factor: 'Terrain Gradient Shear Stress',
      impact: Math.round(slopeNorm * 100),
      description: `${slopeDegrees}° slope angle (Critical: >35°)`,
      status: slopeDegrees >= 35 ? 'danger' : slopeDegrees >= 22 ? 'caution' : 'safe'
    },
    {
      factor: 'Vegetation & Geological Stability',
      impact: Math.round(vegetationShield * 100),
      description: `${vegetationCover}% canopy cover on ${geologyType}`,
      status: vegetationCover < 40 ? 'caution' : 'safe'
    }
  ];

  let urgencyRecommendation = '';
  if (riskLevel === 'critical') {
    urgencyRecommendation = 'Mandatory evacuation of valley runout zone. Activate emergency sirens and dispatch NDRF quick response units.';
  } else if (riskLevel === 'high') {
    urgencyRecommendation = 'Issue yellow advisory alert. Direct elderly and vulnerable residents to designated transit shelters.';
  } else if (riskLevel === 'medium') {
    urgencyRecommendation = 'Maintain continuous telemetry watch. Restrict heavy commercial vehicular transit along ghat curves.';
  } else {
    urgencyRecommendation = 'Normal monitoring. Maintain standard sensor polling interval.';
  }

  return {
    riskScore,
    riskLevel,
    alertPriority,
    factorOfSafety,
    xaiExplanation,
    factors,
    urgencyRecommendation,
    evacuationAdvisory
  };
}

/**
 * Async helper to get AI prediction with server proxy fallback
 */
export async function getAiRiskAssessment(zone: {
  areaName: string;
  rainfall24h: number;
  soilMoisture: number;
  slopeDegrees: number;
  elevation: number;
  geologyType?: string;
  population?: number;
}): Promise<{
  riskScore: number;
  riskLevel: RiskLevel;
  explanation: string;
  factors: FactorBreakdown[];
}> {
  try {
    const res = await fetch('/api/predict-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zone),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          riskScore: data.riskScore,
          riskLevel: data.riskLevel,
          explanation: data.explanation,
          factors: data.factors.map((f: any) => ({
            factor: f.factor,
            impact: f.impact,
            description: f.description,
            status: f.impact > 70 ? 'danger' : f.impact > 40 ? 'caution' : 'safe'
          }))
        };
      }
    }
  } catch (err) {
    // Network or offline fallback
  }

  // Local fallback
  const result = calculateRiskScore(zone);
  return {
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    explanation: result.xaiExplanation,
    factors: result.factors
  };
}
