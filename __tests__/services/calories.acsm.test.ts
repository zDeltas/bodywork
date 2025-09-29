import { describe, expect, test } from '@jest/globals';

// We will import the helpers indirectly by re-implementing minimal wrappers mimicking useSession's logic
import { MET_CONSTANTS } from '@/app/components/exercises';

// Copy of formula used in useSession
const kcalFromMet = (met: number, weightKg: number, minutes: number) => met * 3.5 * weightKg / 200 * minutes;

// Minimal local copy for the test (same as in useSession)
const acsmKcalPerMin = (
  mode: 'walk' | 'run' | 'bike' | 'row' | 'elliptical' | 'other' | undefined,
  params: { duration?: string; distance?: number; grade?: number; power?: number },
  weightKg?: number
) => {
  const convertTimeToSeconds = (timeStr?: string): number => {
    if (!timeStr) return 1;
    const [m, s] = timeStr.split(':').map(Number);
    if (isNaN(m) || isNaN(s)) return 1;
    return m * 60 + s;
  };

  const durationSec = params.duration ? convertTimeToSeconds(params.duration) : undefined;
  const distanceM = typeof params.distance === 'number' ? params.distance : undefined;
  const v = durationSec && durationSec > 0 && distanceM && distanceM > 0 ? (distanceM / durationSec) * 60 : undefined; // m/min
  const grade = typeof params.grade === 'number' ? params.grade : 0;

  let vo2: number | undefined;
  if (mode === 'walk' && v) vo2 = 3.5 + 0.1 * v + 1.8 * v * grade;
  else if (mode === 'run' && v) vo2 = 3.5 + 0.2 * v + 0.9 * v * grade;
  else if (mode === 'bike') {
    const powerW = typeof params.power === 'number' ? params.power : undefined;
    if (powerW && weightKg && weightKg > 0) vo2 = 7 + 10.8 * (powerW / weightKg);
  }
  if (vo2 != null && weightKg) return (vo2 * weightKg) / 200;

  // Fallback to MET by mode constants
  const fallbackMet = (() => {
    switch (mode) {
      case 'walk': return 3.3;
      case 'run': return 9.8;
      case 'bike': return 8.0;
      case 'row': return 8.0;
      case 'elliptical': return 5.0;
      default: return 7.0;
    }
  })();
  return weightKg ? (fallbackMet * 3.5 * weightKg / 200) : 0;
};

describe('ACSM equations and fallbacks', () => {
  test('Walk VO2 equation', () => {
    const weight = 70; // kg
    // 1 km in 10 minutes => v = 1000m / 600s * 60 = 100 m/min, grade 1% = 0.01
    const kcalMin = acsmKcalPerMin('walk', { duration: '10:00', distance: 1000, grade: 0.01 }, weight);
    const vo2 = 3.5 + 0.1 * 100 + 1.8 * 100 * 0.01; // = 3.5 + 10 + 1.8 = 15.3
    expect(kcalMin).toBeCloseTo((vo2 * weight) / 200, 3);
  });

  test('Run VO2 equation', () => {
    const weight = 70;
    const kcalMin = acsmKcalPerMin('run', { duration: '10:00', distance: 2000, grade: 0.01 }, weight); // 200 m/min
    const vo2 = 3.5 + 0.2 * 200 + 0.9 * 200 * 0.01; // 3.5 + 40 + 1.8 = 45.3
    expect(kcalMin).toBeCloseTo((vo2 * weight) / 200, 3);
  });

  test('Bike power-based VO2', () => {
    const weight = 70;
    const kcalMin = acsmKcalPerMin('bike', { power: 200 }, weight);
    const vo2 = 7 + 10.8 * (200 / weight);
    expect(kcalMin).toBeCloseTo((vo2 * weight) / 200, 3);
  });

  test('Fallback by mode when insufficient inputs', () => {
    const weight = 70;
    // No duration/distance/grade provided => fallback to mode MET
    const walk = acsmKcalPerMin('walk', {}, weight);
    const run = acsmKcalPerMin('run', {}, weight);
    const bike = acsmKcalPerMin('bike', {}, weight);
    expect(walk).toBeCloseTo(kcalFromMet(MET_CONSTANTS.cardioFallback.walk, weight, 1), 3);
    expect(run).toBeCloseTo(kcalFromMet(MET_CONSTANTS.cardioFallback.run, weight, 1), 3);
    expect(bike).toBeCloseTo(kcalFromMet(MET_CONSTANTS.cardioFallback.bike, weight, 1), 3);
  });
});
