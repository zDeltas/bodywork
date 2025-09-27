import {
  formatRestTime,
  parseRestTime,
  formatDuration,
  isSeriesValid,
  isRoutineTitleValid,
  isRoutineComplete,
  generateRoutineId,
  generateExerciseKey,
  createEmptySeries,
  isLoadApplicable,
  getTotalSeriesCount,
  estimateRoutineDuration,
  formatEstimatedDuration
} from '@/app/utils/routineUtils';
import { EditableSeries } from '@/types/common';

describe('routineUtils', () => {
  beforeEach(() => {
    global.mockDate('2024-01-20T15:30:00.000Z');
  });

  afterEach(() => {
    global.restoreDate();
  });

  describe('formatRestTime', () => {
    it('should format rest time correctly', () => {
      expect(formatRestTime(1, 30)).toBe('1:30');
      expect(formatRestTime(0, 5)).toBe('0:05');
      expect(formatRestTime(2, 0)).toBe('2:00');
    });

    it('should return empty string for zero time', () => {
      expect(formatRestTime(0, 0)).toBe('');
    });
  });

  describe('parseRestTime', () => {
    it('should parse rest time correctly', () => {
      expect(parseRestTime('1:30')).toEqual({ minutes: 1, seconds: 30 });
      expect(parseRestTime('0:05')).toEqual({ minutes: 0, seconds: 5 });
      expect(parseRestTime('2:00')).toEqual({ minutes: 2, seconds: 0 });
    });

    it('should handle empty or zero time strings', () => {
      expect(parseRestTime('')).toEqual({ minutes: 0, seconds: 0 });
      expect(parseRestTime('00:00')).toEqual({ minutes: 0, seconds: 0 });
    });

    it('should handle invalid time strings gracefully', () => {
      expect(parseRestTime('invalid')).toEqual({ minutes: 0, seconds: 0 });
      expect(parseRestTime('1:')).toEqual({ minutes: 1, seconds: 0 });
      expect(parseRestTime(':30')).toEqual({ minutes: 0, seconds: 30 });
    });
  });

  describe('formatDuration', () => {
    it('should format duration with leading zeros', () => {
      expect(formatDuration(1, 30)).toBe('01:30');
      expect(formatDuration(0, 5)).toBe('00:05');
      expect(formatDuration(12, 45)).toBe('12:45');
    });
  });

  describe('isSeriesValid', () => {
    it('should validate repsAndWeight series', () => {
      const validSeries: EditableSeries = {
        unitType: 'repsAndWeight',
        weight: '80',
        reps: '10',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };
      expect(isSeriesValid(validSeries)).toBe(true);

      const invalidSeries: EditableSeries = {
        ...validSeries,
        weight: ''
      };
      expect(isSeriesValid(invalidSeries)).toBe(false);
    });

    it('should validate reps series', () => {
      const validSeries: EditableSeries = {
        unitType: 'reps',
        weight: '',
        reps: '15',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };
      expect(isSeriesValid(validSeries)).toBe(true);

      const invalidSeries: EditableSeries = {
        ...validSeries,
        reps: ''
      };
      expect(isSeriesValid(invalidSeries)).toBe(false);
    });

    it('should validate time series', () => {
      const validSeries: EditableSeries = {
        unitType: 'time',
        weight: '',
        reps: '',
        duration: '120',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };
      expect(isSeriesValid(validSeries)).toBe(true);

      const invalidSeries: EditableSeries = {
        ...validSeries,
        duration: ''
      };
      expect(isSeriesValid(invalidSeries)).toBe(false);
    });

    it('should validate distance series', () => {
      const validSeries: EditableSeries = {
        unitType: 'distance',
        weight: '',
        reps: '',
        duration: '',
        distance: '1000',
        note: '',
        rest: '',
        type: 'workingSet'
      };
      expect(isSeriesValid(validSeries)).toBe(true);

      const invalidSeries: EditableSeries = {
        ...validSeries,
        distance: ''
      };
      expect(isSeriesValid(invalidSeries)).toBe(false);
    });

    it('should return false for unknown unit types', () => {
      const invalidSeries: any = {
        unitType: 'unknown',
        weight: '80',
        reps: '10',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      };
      expect(isSeriesValid(invalidSeries)).toBe(false);
    });
  });

  describe('isRoutineTitleValid', () => {
    it('should validate routine titles', () => {
      expect(isRoutineTitleValid('My Routine')).toBe(true);
      expect(isRoutineTitleValid('A')).toBe(true);
      expect(isRoutineTitleValid('')).toBe(false);
      expect(isRoutineTitleValid('   ')).toBe(false);
    });
  });

  describe('isRoutineComplete', () => {
    it('should validate complete routines', () => {
      expect(isRoutineComplete('My Routine', 3)).toBe(true);
      expect(isRoutineComplete('My Routine', 0)).toBe(false);
      expect(isRoutineComplete('', 3)).toBe(false);
      expect(isRoutineComplete('', 0)).toBe(false);
    });
  });

  describe('generateRoutineId', () => {
    it('should generate unique routine IDs with correct format', () => {
      const id1 = generateRoutineId();
      const id2 = generateRoutineId();
      
      // Test format: routine_timestamp_randomString
      expect(id1).toMatch(/^routine_\d+_0\.[a-z0-9]+$/);
      expect(id2).toMatch(/^routine_\d+_0\.[a-z0-9]+$/);
      
      // Test uniqueness
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateExerciseKey', () => {
    it('should generate unique exercise keys', () => {
      // Mock Date.now directly
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => 1705762200000);
      
      const key1 = generateExerciseKey('exercise_chest_benchPress');
      expect(key1).toBe('exercise_chest_benchPress_1705762200000');
      
      Date.now = originalDateNow;
    });
  });

  describe('createEmptySeries', () => {
    it('should create empty series with default values', () => {
      const series = createEmptySeries();
      
      expect(series).toEqual({
        unitType: 'repsAndWeight',
        weight: '',
        reps: '',
        duration: '',
        distance: '',
        note: '',
        rest: '',
        type: 'workingSet'
      });
    });

    it('should create empty series with custom values', () => {
      const series = createEmptySeries('time', 'warmUp', '60');
      
      expect(series).toEqual({
        unitType: 'time',
        weight: '',
        reps: '',
        duration: '',
        distance: '',
        note: '',
        rest: '60',
        type: 'warmUp'
      });
    });
  });

  describe('isLoadApplicable', () => {
    it('should determine if load is applicable for unit types', () => {
      expect(isLoadApplicable('time')).toBe(true);
      expect(isLoadApplicable('distance')).toBe(true);
      expect(isLoadApplicable('repsAndWeight')).toBe(false);
      expect(isLoadApplicable('reps')).toBe(false);
    });
  });

  describe('getTotalSeriesCount', () => {
    it('should count total series in exercises', () => {
      const exercises = [
        { series: [1, 2, 3] },
        { series: [1, 2] },
        { series: [1] }
      ];
      
      expect(getTotalSeriesCount(exercises)).toBe(6);
    });

    it('should handle empty exercises array', () => {
      expect(getTotalSeriesCount([])).toBe(0);
    });
  });

  describe('estimateRoutineDuration', () => {
    it('should estimate routine duration', () => {
      const exercises = [
        { series: [1, 2, 3] }, // 3 series
        { series: [1, 2] }     // 2 series
      ];
      
      // 5 series * (30s + 90s) = 5 * 120 = 600 seconds
      expect(estimateRoutineDuration(exercises)).toBe(600);
    });

    it('should handle empty exercises', () => {
      expect(estimateRoutineDuration([])).toBe(0);
    });
  });

  describe('formatEstimatedDuration', () => {
    it('should format duration in minutes for short durations', () => {
      expect(formatEstimatedDuration(1800)).toBe('30 min'); // 30 minutes
      expect(formatEstimatedDuration(2700)).toBe('45 min'); // 45 minutes
    });

    it('should format duration in hours and minutes for long durations', () => {
      expect(formatEstimatedDuration(3600)).toBe('1h 0min'); // 1 hour
      expect(formatEstimatedDuration(5400)).toBe('1h 30min'); // 1.5 hours
      expect(formatEstimatedDuration(7200)).toBe('2h 0min'); // 2 hours
    });

    it('should handle zero duration', () => {
      expect(formatEstimatedDuration(0)).toBe('0 min');
    });
  });
});
