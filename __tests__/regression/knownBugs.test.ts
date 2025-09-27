import { renderHook, act } from '@testing-library/react-native';
import { useRoutineForm } from '@/app/hooks/useRoutineForm';
import useSession from '@/app/hooks/useSession';
import { formatSeries, isValidSeries, getValidSeries } from '@/app/utils/seriesUtils';
import { EditableSeries, Series } from '@/types/common';

// Mock dependencies
jest.mock('@/app/services/storage', () => ({
  storageService: {
    getRoutines: jest.fn(),
    saveRoutine: jest.fn(),
    saveRoutineSession: jest.fn(),
  },
}));

jest.mock('@/app/hooks/useSettings', () => ({
  useSettings: jest.fn(() => ({
    settings: { rpeMode: 'always' },
    updateSetting: jest.fn(),
  })),
}));

jest.mock('@/app/hooks/useHaptics', () => ({
  default: () => ({
    impactLight: jest.fn(),
  }),
}));

describe('Regression Tests - Known Bug Fixes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockDate('2024-01-20T15:30:00.000Z');
  });

  afterEach(() => {
    global.restoreDate();
  });

  describe('Series Data Validation Bugs', () => {
    it('should handle empty string values in series data without crashing', () => {
      // Regression test for bug where empty strings caused parsing errors
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '',
          reps: '',
          duration: '',
          distance: '',
          note: '',
          rest: '',
          type: 'workingSet'
        }
      ];

      expect(() => {
        const validSeries = getValidSeries(editableSeries);
        expect(validSeries).toHaveLength(0);
      }).not.toThrow();

      expect(() => {
        const formattedSeries = formatSeries(editableSeries);
        expect(formattedSeries[0].weight).toBe(0);
        expect(formattedSeries[0].reps).toBe(0);
      }).not.toThrow();
    });

    it('should handle invalid RPE values gracefully', () => {
      // Regression test for RPE validation bug
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '80',
          reps: '10',
          duration: '',
          distance: '',
          note: '',
          rest: '90',
          rpe: '15', // Invalid RPE (should be 1-10)
          type: 'workingSet'
        }
      ];

      const formattedSeries = formatSeries(editableSeries);
      expect(formattedSeries[0].rpe).toBe(5); // Should default to 5 for invalid values
    });

    it('should handle negative values in series data', () => {
      // Regression test for negative value handling
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '-80',
          reps: '-10',
          duration: '-120',
          distance: '-1000',
          note: '',
          rest: '90',
          type: 'workingSet'
        }
      ];

      const formattedSeries = formatSeries(editableSeries);
      expect(formattedSeries[0].weight).toBe(0); // Should default to 0 for negative values
      expect(formattedSeries[0].reps).toBe(0);
    });

    it('should handle decimal values in reps field', () => {
      // Regression test for decimal reps handling
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '80',
          reps: '10.5', // Decimal reps should be rounded down
          duration: '',
          distance: '',
          note: '',
          rest: '90',
          type: 'workingSet'
        }
      ];

      const formattedSeries = formatSeries(editableSeries);
      expect(formattedSeries[0].reps).toBe(10); // Should be integer
    });
  });

  describe('Routine Form State Bugs', () => {
    it('should maintain series data when switching unit types', () => {
      // Regression test for data loss when changing unit types
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.setExerciseName('Test Exercise');
        result.current.setExerciseKey('exercise_test');
        result.current.updateSeries(0, 'weight', '80');
        result.current.updateSeries(0, 'reps', '10');
        result.current.updateSeries(0, 'note', 'Important note');
      });

      // Switch unit type
      act(() => {
        result.current.updateGlobalUnitType('time');
      });

      // Note should be preserved
      expect(result.current.currentSeries[0].note).toBe('Important note');
      expect(result.current.currentSeries[0].unitType).toBe('time');
    });

    it('should handle exercise deletion without affecting other exercises', () => {
      // Regression test for exercise deletion bug
      const { result } = renderHook(() => useRoutineForm());

      // Add first exercise
      act(() => {
        result.current.setExerciseName('Exercise 1');
        result.current.setExerciseKey('exercise_1');
        result.current.updateSeries(0, 'weight', '80');
        result.current.updateSeries(0, 'reps', '10');
        result.current.saveExercise();
      });

      // Add second exercise
      act(() => {
        result.current.resetExerciseForm();
        result.current.setExerciseName('Exercise 2');
        result.current.setExerciseKey('exercise_2');
        result.current.updateSeries(0, 'weight', '100');
        result.current.updateSeries(0, 'reps', '8');
        result.current.saveExercise();
      });

      expect(result.current.exercises).toHaveLength(2);

      // Delete first exercise
      act(() => {
        result.current.deleteExercise(0);
      });

      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0].name).toBe('Exercise 2');
      expect(result.current.exercises[0].series[0].weight).toBe(100);
    });

    it('should reset form completely without residual state', () => {
      // Regression test for incomplete form reset
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.setRoutine({
          title: 'Test Routine',
          description: 'Test Description',
          exercises: [],
          exerciseRestMode: 'advanced'
        });
        result.current.setExerciseName('Test Exercise');
        result.current.setExerciseKey('exercise_test');
        result.current.updateSeries(0, 'weight', '80');
        result.current.updateGlobalRestTime('120');
        result.current.updatePreparationTime('30');
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.routine.title).toBe('');
      expect(result.current.routine.description).toBe('');
      expect(result.current.routine.exerciseRestMode).toBe('beginner');
      expect(result.current.exerciseName).toBe('');
      expect(result.current.exerciseKey).toBe('');
      expect(result.current.currentSeries[0].weight).toBe('');
      expect(result.current.globalRestTime).toBe('');
      expect(result.current.preparationTime).toBe('');
    });
  });

  describe('Session State Bugs', () => {
    it('should handle session completion with empty routine gracefully', async () => {
      // Regression test for crash when completing empty routine
      const { result } = renderHook(() => useSession('empty_routine'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(() => {
        act(() => {
          result.current.handleNext();
        });
      }).not.toThrow();

      expect(result.current.sessionState.routineFinished).toBe(false);
    });

    it('should handle rest timer with zero rest time', () => {
      // Regression test for rest timer bug with zero rest
      const mockRoutine = {
        id: 'test_routine',
        title: 'Test Routine',
        description: '',
        exercises: [{
          name: 'Test Exercise',
          key: 'exercise_test',
          translationKey: 'exercise_test',
          series: [{
            unitType: 'repsAndWeight' as const,
            weight: 80,
            reps: 10,
            rest: '0', // Zero rest time
            rpe: 7,
            type: 'workingSet' as const
          }],
          restBetweenExercises: 0
        }],
        createdAt: '2024-01-20T15:30:00.000Z'
      };

      const { storageService } = require('@/app/services/storage');
      storageService.getRoutines.mockResolvedValue([mockRoutine]);

      const { result } = renderHook(() => useSession('test_routine'));

      act(() => {
        result.current.handleNext();
      });

      // Should not enter rest state with zero rest time
      expect(result.current.sessionState.isResting).toBe(false);
      expect(result.current.sessionState.routineFinished).toBe(true);
    });

    it('should handle RPE saving for warmup sets correctly', () => {
      // Regression test for RPE handling in warmup sets
      const mockRoutine = {
        id: 'test_routine',
        title: 'Test Routine',
        description: '',
        exercises: [{
          name: 'Test Exercise',
          key: 'exercise_test',
          translationKey: 'exercise_test',
          series: [{
            unitType: 'repsAndWeight' as const,
            weight: 40,
            reps: 10,
            rest: '60',
            rpe: 0, // Warmup set should have RPE 0
            type: 'warmUp' as const
          }],
          restBetweenExercises: 120
        }],
        createdAt: '2024-01-20T15:30:00.000Z'
      };

      const { storageService } = require('@/app/services/storage');
      storageService.getRoutines.mockResolvedValue([mockRoutine]);

      const { result } = renderHook(() => useSession('test_routine'));

      act(() => {
        result.current.saveRpe(5); // Try to save RPE for warmup
      });

      // RPE should remain 0 for warmup sets
      expect(result.current.sessionState.completedSeries[0]?.rpe).toBe(0);
    });
  });

  describe('Data Type Consistency Bugs', () => {
    it('should handle mixed unit types in same routine', () => {
      // Regression test for mixed unit type handling
      const mixedSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '80',
          reps: '10',
          duration: '',
          distance: '',
          note: '',
          rest: '90',
          type: 'workingSet'
        },
        {
          unitType: 'time',
          weight: '',
          reps: '',
          duration: '120',
          distance: '',
          note: '',
          rest: '60',
          type: 'workingSet'
        },
        {
          unitType: 'distance',
          weight: '',
          reps: '',
          duration: '',
          distance: '1000',
          note: '',
          rest: '30',
          type: 'workingSet'
        }
      ];

      const formattedSeries = formatSeries(mixedSeries);
      
      expect(formattedSeries[0].unitType).toBe('repsAndWeight');
      expect(formattedSeries[0].weight).toBe(80);
      expect(formattedSeries[0].reps).toBe(10);
      expect(formattedSeries[0].duration).toBeUndefined();
      expect(formattedSeries[0].distance).toBeUndefined();

      expect(formattedSeries[1].unitType).toBe('time');
      expect(formattedSeries[1].weight).toBe(0);
      expect(formattedSeries[1].reps).toBeUndefined();
      expect(formattedSeries[1].duration).toBe(120);
      expect(formattedSeries[1].distance).toBeUndefined();

      expect(formattedSeries[2].unitType).toBe('distance');
      expect(formattedSeries[2].weight).toBe(0);
      expect(formattedSeries[2].reps).toBeUndefined();
      expect(formattedSeries[2].duration).toBeUndefined();
      expect(formattedSeries[2].distance).toBe(1000);
    });

    it('should handle undefined and null values in series validation', () => {
      // Regression test for null/undefined handling
      const seriesWithNulls: any = {
        unitType: null,
        weight: undefined,
        reps: null,
        duration: undefined,
        distance: null,
        note: undefined,
        rest: null,
        rpe: undefined,
        type: null
      };

      expect(() => {
        isValidSeries(seriesWithNulls);
      }).not.toThrow();

      const isValid = isValidSeries(seriesWithNulls);
      expect(isValid).toBe(false);
    });
  });

  describe('Storage Service Edge Cases', () => {
    it('should handle corrupted data in storage gracefully', async () => {
      // Regression test for corrupted storage data
      const { storageService } = require('@/app/services/storage');
      
      // Mock corrupted data
      storageService.getRoutines.mockResolvedValue([
        {
          id: 'corrupted_routine',
          // Missing required fields
          exercises: null,
          createdAt: 'invalid-date'
        }
      ]);

      const { result } = renderHook(() => useSession('corrupted_routine'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should handle corrupted data without crashing
      expect(result.current.routine).toBeNull();
    });

    it('should handle storage quota exceeded gracefully', async () => {
      // Regression test for storage quota issues
      const { storageService } = require('@/app/services/storage');
      
      storageService.saveRoutine.mockRejectedValue(new Error('QuotaExceededError'));

      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.setRoutine({
          title: 'Large Routine',
          description: 'A' * 10000, // Very large description
          exercises: [],
        });
      });

      let saveResult: any;
      await act(async () => {
        saveResult = await result.current.saveRoutine();
      });

      // Should handle storage errors gracefully
      expect(saveResult).toBe(false);
    });
  });
});
