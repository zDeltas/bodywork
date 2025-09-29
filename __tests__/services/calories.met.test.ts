import { mapRpeToMet, getExerciseMeta, MET_CONSTANTS } from '@/app/components/exercises';

describe('Calories MET mapping', () => {
  test('RPE thresholds', () => {
    expect(mapRpeToMet(3)).toBeCloseTo(3.5);
    expect(mapRpeToMet(5)).toBeCloseTo(6.0);
    expect(mapRpeToMet(7)).toBeCloseTo(6.0);
    expect(mapRpeToMet(8)).toBeCloseTo(8.0);
  });

  test('Default MET via exercise meta (strength examples)', () => {
    const squat = getExerciseMeta('exercise_legs_squat');
    expect(squat?.defaultMet).toBeCloseTo(6.0);
    expect(mapRpeToMet(undefined, squat)).toBeCloseTo(6.0);

    const deadlift = getExerciseMeta('exercise_legs_deadlift');
    expect(deadlift?.defaultMet).toBeCloseTo(6.0);
    expect(mapRpeToMet(undefined, deadlift)).toBeCloseTo(6.0);

    const bench = getExerciseMeta('exercise_chest_benchPress');
    // benchPress has no explicit defaultMet, but RPE undefined should fallback to generic strength 6.0
    expect(mapRpeToMet(undefined, bench)).toBeCloseTo(6.0);
  });

  test('Core floor when RPE missing', () => {
    const plank = getExerciseMeta('exercise_core_plank');
    expect(plank?.primaryMuscle).toBe('core');
    expect(mapRpeToMet(undefined, plank)).toBeCloseTo(MET_CONSTANTS.strengthFallback.core);
  });

  test('Cardio mode fallbacks when RPE missing', () => {
    const run = getExerciseMeta('exercise_cardio_running');
    expect(run?.cardioMode).toBe('run');
    expect(mapRpeToMet(undefined, run)).toBeCloseTo(MET_CONSTANTS.cardioFallback.run);

    const bike = getExerciseMeta('exercise_cardio_cycling');
    expect(bike?.cardioMode).toBe('bike');
    expect(mapRpeToMet(undefined, bike)).toBeCloseTo(MET_CONSTANTS.cardioFallback.bike);

    const row = getExerciseMeta('exercise_cardio_rowing');
    expect(row?.cardioMode).toBe('row');
    expect(mapRpeToMet(undefined, row)).toBeCloseTo(MET_CONSTANTS.cardioFallback.row);
  });

  test('getExerciseMeta strips timestamp suffix', () => {
    const meta = getExerciseMeta('exercise_legs_squat_1699999999');
    expect(meta?.key).toBe('exercise_legs_squat');
  });
});
