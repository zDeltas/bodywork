import { renderHook, act } from '@testing-library/react-native';
import { useRoutineForm } from '@/app/hooks/useRoutineForm';
import useSession from '@/app/hooks/useSession';
import { storageService } from '@/app/services/storage';
import { formatSeries, getValidSeries } from '@/app/utils/seriesUtils';
import { Routine, Exercise, Series, EditableSeries } from '@/types/common';

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

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('Data Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockDate('2024-01-20T15:30:00.000Z');
  });

  afterEach(() => {
    global.restoreDate();
  });

  describe('Complete Routine Creation to Session Flow', () => {
    it('should create routine, save it, and use it in session', async () => {
      // Step 1: Create routine using useRoutineForm
      const { result: routineFormResult } = renderHook(() => useRoutineForm());

      // Set up routine data
      act(() => {
        routineFormResult.current.setRoutine({
          title: 'Integration Test Routine',
          description: 'Test routine for integration testing',
          exercises: [],
          exerciseRestMode: 'beginner'
        });
        
        // Add first exercise
        routineFormResult.current.setExerciseName('Bench Press');
        routineFormResult.current.setExerciseKey('exercise_chest_benchPress');
        routineFormResult.current.updateSeries(0, 'weight', '80');
        routineFormResult.current.updateSeries(0, 'reps', '10');
        routineFormResult.current.updateSeries(0, 'rest', '90');
      });

      // Save first exercise
      let saveResult: boolean;
      act(() => {
        saveResult = routineFormResult.current.saveExercise();
      });

      expect(saveResult!).toBe(true);
      expect(routineFormResult.current.exercises).toHaveLength(1);

      // Add second exercise
      act(() => {
        routineFormResult.current.resetExerciseForm();
        routineFormResult.current.setExerciseName('Squat');
        routineFormResult.current.setExerciseKey('exercise_legs_squat');
        routineFormResult.current.updateSeries(0, 'weight', '100');
        routineFormResult.current.updateSeries(0, 'reps', '8');
        routineFormResult.current.updateSeries(0, 'rest', '120');
      });

      act(() => {
        saveResult = routineFormResult.current.saveExercise();
      });

      expect(saveResult!).toBe(true);
      expect(routineFormResult.current.exercises).toHaveLength(2);

      // Step 2: Create complete routine for session
      const completeRoutine: Routine = {
        id: 'routine_integration_test',
        title: routineFormResult.current.routine.title,
        description: routineFormResult.current.routine.description,
        exercises: routineFormResult.current.exercises,
        createdAt: '2024-01-20T15:30:00.000Z',
        exerciseRestMode: 'beginner',
        enablePreparation: false
      };

      // Mock storage to return our created routine
      mockStorageService.getRoutines.mockResolvedValue([completeRoutine]);

      // Step 3: Use routine in session
      const { result: sessionResult } = renderHook(() => 
        useSession('routine_integration_test')
      );

      // Wait for routine to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Verify session loaded routine correctly
      expect(sessionResult.current.routine).toEqual(completeRoutine);
      expect(sessionResult.current.sessionState.currentExerciseIndex).toBe(0);
      expect(sessionResult.current.sessionState.currentSeriesIndex).toBe(0);

      // Step 4: Simulate workout progression
      act(() => {
        sessionResult.current.handleNext(); // Complete first series
      });

      expect(sessionResult.current.sessionState.isResting).toBe(true);
      expect(sessionResult.current.sessionState.restTime).toBe(90);
      expect(sessionResult.current.sessionState.restType).toBe('series');

      // Complete rest and move to next exercise
      act(() => {
        sessionResult.current.handleRestComplete();
      });

      expect(sessionResult.current.sessionState.currentExerciseIndex).toBe(1);
      expect(sessionResult.current.sessionState.currentSeriesIndex).toBe(0);

      // Complete second exercise
      act(() => {
        sessionResult.current.handleNext();
      });

      expect(sessionResult.current.sessionState.isResting).toBe(true);
      expect(sessionResult.current.sessionState.restType).toBe('exercise');

      // Complete final rest
      await act(async () => {
        await sessionResult.current.handleRestComplete();
      });

      expect(sessionResult.current.sessionState.routineFinished).toBe(true);
      expect(mockStorageService.saveRoutineSession).toHaveBeenCalled();
    });
  });

  describe('Data Validation Throughout Flow', () => {
    it('should maintain data integrity from creation to session completion', async () => {
      // Test data validation at each step
      const editableSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '80',
          reps: '10',
          duration: '',
          distance: '',
          note: 'Test series',
          rest: '90',
          rpe: '7',
          type: 'workingSet'
        }
      ];

      // Step 1: Validate series formatting
      const validSeries = getValidSeries(editableSeries);
      expect(validSeries).toHaveLength(1);

      const formattedSeries = formatSeries(validSeries);
      expect(formattedSeries[0]).toEqual({
        unitType: 'repsAndWeight',
        weight: 80,
        reps: 10,
        duration: undefined,
        distance: undefined,
        note: 'Test series',
        rest: '90',
        rpe: 7,
        type: 'workingSet'
      });

      // Step 2: Validate exercise structure
      const exercise: Exercise = {
        name: 'Test Exercise',
        key: 'exercise_test_123',
        translationKey: 'exercise_test',
        series: formattedSeries,
        restBetweenExercises: 120
      };

      expect(exercise.series).toHaveLength(1);
      expect(exercise.series[0].weight).toBe(80);
      expect(exercise.series[0].reps).toBe(10);

      // Step 3: Validate routine structure
      const routine: Routine = {
        id: 'routine_validation_test',
        title: 'Validation Test',
        description: 'Test routine',
        exercises: [exercise],
        createdAt: '2024-01-20T15:30:00.000Z'
      };

      expect(routine.exercises).toHaveLength(1);
      expect(routine.exercises[0].series[0].unitType).toBe('repsAndWeight');

      // Step 4: Validate session data consistency
      mockStorageService.getRoutines.mockResolvedValue([routine]);

      const { result } = renderHook(() => useSession('routine_validation_test'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.routine?.exercises[0].series[0].weight).toBe(80);
      expect(result.current.routine?.exercises[0].series[0].reps).toBe(10);
    });
  });

  describe('Error Handling in Data Flow', () => {
    it('should handle invalid data gracefully throughout the flow', async () => {
      // Test with invalid series data
      const invalidSeries: EditableSeries[] = [
        {
          unitType: 'repsAndWeight',
          weight: '0',
          reps: '0',
          duration: '',
          distance: '',
          note: '',
          rest: '',
          type: 'workingSet'
        }
      ];

      const validSeries = getValidSeries(invalidSeries);
      expect(validSeries).toHaveLength(0);

      // Test routine form with invalid data
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.setExerciseName('Invalid Exercise');
        result.current.setExerciseKey('exercise_invalid');
        // Don't set any valid series data
      });

      let saveResult: boolean;
      act(() => {
        saveResult = result.current.saveExercise();
      });

      expect(saveResult!).toBe(false);
      expect(result.current.exercises).toHaveLength(0);
    });

    it('should handle storage errors gracefully', async () => {
      mockStorageService.getRoutines.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useSession('nonexistent_routine'));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.routine).toBeNull();
    });
  });

  describe('Unit Type Consistency', () => {
    it('should maintain unit type consistency from creation to session', async () => {
      const { result: routineFormResult } = renderHook(() => useRoutineForm());

      // Test different unit types
      const unitTypes = ['repsAndWeight', 'reps', 'time', 'distance'] as const;

      for (const unitType of unitTypes) {
        act(() => {
          routineFormResult.current.resetExerciseForm();
          routineFormResult.current.setExerciseName(`${unitType} Exercise`);
          routineFormResult.current.setExerciseKey(`exercise_test_${unitType}`);
          routineFormResult.current.updateGlobalUnitType(unitType);

          switch (unitType) {
            case 'repsAndWeight':
              routineFormResult.current.updateSeries(0, 'weight', '80');
              routineFormResult.current.updateSeries(0, 'reps', '10');
              break;
            case 'reps':
              routineFormResult.current.updateSeries(0, 'reps', '15');
              break;
            case 'time':
              routineFormResult.current.updateSeries(0, 'duration', '120');
              break;
            case 'distance':
              routineFormResult.current.updateSeries(0, 'distance', '1000');
              break;
          }
        });

        let saveResult: boolean;
        act(() => {
          saveResult = routineFormResult.current.saveExercise();
        });

        expect(saveResult!).toBe(true);
        
        const savedExercise = routineFormResult.current.exercises[routineFormResult.current.exercises.length - 1];
        expect(savedExercise.series[0].unitType).toBe(unitType);

        // Verify correct fields are set based on unit type
        switch (unitType) {
          case 'repsAndWeight':
            expect(savedExercise.series[0].weight).toBeGreaterThan(0);
            expect(savedExercise.series[0].reps).toBeGreaterThan(0);
            expect(savedExercise.series[0].duration).toBeUndefined();
            expect(savedExercise.series[0].distance).toBeUndefined();
            break;
          case 'reps':
            expect(savedExercise.series[0].weight).toBe(0);
            expect(savedExercise.series[0].reps).toBeGreaterThan(0);
            expect(savedExercise.series[0].duration).toBeUndefined();
            expect(savedExercise.series[0].distance).toBeUndefined();
            break;
          case 'time':
            expect(savedExercise.series[0].weight).toBe(0);
            expect(savedExercise.series[0].reps).toBeUndefined();
            expect(savedExercise.series[0].duration).toBeGreaterThan(0);
            expect(savedExercise.series[0].distance).toBeUndefined();
            break;
          case 'distance':
            expect(savedExercise.series[0].weight).toBe(0);
            expect(savedExercise.series[0].reps).toBeUndefined();
            expect(savedExercise.series[0].duration).toBeUndefined();
            expect(savedExercise.series[0].distance).toBeGreaterThan(0);
            break;
        }
      }

      expect(routineFormResult.current.exercises).toHaveLength(4);
    });
  });
});
