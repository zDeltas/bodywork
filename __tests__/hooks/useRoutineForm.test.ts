import { renderHook, act } from '@testing-library/react-native';
import { useRoutineForm } from '@/app/hooks/useRoutineForm';
import { storageService } from '@/app/services/storage';
import { EditableSeries, Exercise, Routine } from '@/types/common';

// Mock storage service
jest.mock('@/app/services/storage', () => ({
  storageService: {
    getRoutines: jest.fn(),
  },
}));

const mockStorageService = storageService as jest.Mocked<typeof storageService>;

describe('useRoutineForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.mockDate('2024-01-20T15:30:00.000Z');
  });

  afterEach(() => {
    global.restoreDate();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useRoutineForm());

      expect(result.current.routine.title).toBe('');
      expect(result.current.routine.description).toBe('');
      expect(result.current.routine.exercises).toEqual([]);
      expect(result.current.routine.exerciseRestMode).toBe('beginner');
      expect(result.current.exercises).toEqual([]);
      expect(result.current.exerciseName).toBe('');
      expect(result.current.exerciseKey).toBe('');
      expect(result.current.globalUnitType).toBe('repsAndWeight');
      expect(result.current.globalSeriesType).toBe('workingSet');
      expect(result.current.withLoad).toBe(false);
      expect(result.current.defaultRestBetweenExercises).toBe(60);
      expect(result.current.enablePreparation).toBe(false);
      expect(result.current.preparationTime).toBe(10);
      expect(result.current.series).toHaveLength(1);
    });

    it('should initialize with a default series', () => {
      const { result } = renderHook(() => useRoutineForm());

      const defaultSeries = result.current.series[0];
      expect(defaultSeries.unitType).toBe('repsAndWeight');
      expect(defaultSeries.weight).toBe('');
      expect(defaultSeries.reps).toBe('');
      expect(defaultSeries.type).toBe('workingSet');
    });
  });

  describe('Series Management', () => {
    it('should add a new series with current global settings', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.updateGlobalUnitType('time');
        result.current.updateGlobalRest('120');
      });

      act(() => {
        result.current.addSeries();
      });

      expect(result.current.series).toHaveLength(2);
      expect(result.current.series[1].unitType).toBe('time');
      expect(result.current.series[1].rest).toBe('120');
    });

    it('should remove a series at specific index', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.addSeries();
        result.current.addSeries();
      });

      expect(result.current.series).toHaveLength(3);

      act(() => {
        result.current.removeSeries(1);
      });

      expect(result.current.series).toHaveLength(2);
    });

    it('should copy a series at specific index', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.updateSeries(0, 'weight', '80');
        result.current.updateSeries(0, 'reps', '10');
      });

      act(() => {
        result.current.copySeries(0);
      });

      expect(result.current.series).toHaveLength(2);
      expect(result.current.series[1].weight).toBe('80');
      expect(result.current.series[1].reps).toBe('10');
    });

    it('should update a series field', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.updateSeries(0, 'weight', '75');
        result.current.updateSeries(0, 'note', 'Test note');
      });

      expect(result.current.series[0].weight).toBe('75');
      expect(result.current.series[0].note).toBe('Test note');
    });
  });

  describe('Global Settings', () => {
    it('should update global unit type and clean series data', () => {
      const { result } = renderHook(() => useRoutineForm());

      // Set initial data
      act(() => {
        result.current.updateSeries(0, 'weight', '80');
        result.current.updateSeries(0, 'reps', '10');
        result.current.updateSeries(0, 'duration', '120');
      });

      // Change to time unit type
      act(() => {
        result.current.updateGlobalUnitType('time');
      });

      expect(result.current.globalUnitType).toBe('time');
      expect(result.current.series[0].unitType).toBe('time');
      expect(result.current.series[0].weight).toBe(''); // Should be cleared
      expect(result.current.series[0].reps).toBe(''); // Should be cleared
      expect(result.current.series[0].duration).toBe('120'); // Should be kept
    });

    it('should update global series type', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.addSeries();
      });

      act(() => {
        result.current.updateGlobalSeriesType('warmUp');
      });

      expect(result.current.globalSeriesType).toBe('warmUp');
      expect(result.current.series[0].type).toBe('warmUp');
      expect(result.current.series[1].type).toBe('warmUp');
    });

    it('should update global rest time', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.addSeries();
      });

      act(() => {
        result.current.updateGlobalRest('90');
      });

      expect(result.current.globalRest).toBe('90');
      expect(result.current.series[0].rest).toBe('90');
      expect(result.current.series[1].rest).toBe('90');
    });

    it('should handle withLoad toggle correctly', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.updateGlobalUnitType('time');
        result.current.updateSeries(0, 'weight', '20');
      });

      act(() => {
        result.current.updateWithLoad(true);
      });

      expect(result.current.withLoad).toBe(true);

      act(() => {
        result.current.updateWithLoad(false);
      });

      expect(result.current.withLoad).toBe(false);
      expect(result.current.series[0].weight).toBe(''); // Should be cleared
    });

    it('should disable withLoad for repsAndWeight and reps unit types', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.updateWithLoad(true);
        result.current.updateGlobalUnitType('time');
      });

      expect(result.current.withLoad).toBe(true);

      act(() => {
        result.current.updateGlobalUnitType('repsAndWeight');
      });

      expect(result.current.withLoad).toBe(false);
    });
  });

  describe('Exercise Management', () => {
    it('should save a valid exercise', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.setExerciseName('Bench Press');
        result.current.setExerciseKey('exercise_chest_benchPress');
        result.current.updateSeries(0, 'weight', '80');
        result.current.updateSeries(0, 'reps', '10');
      });

      let saveResult: boolean;
      act(() => {
        saveResult = result.current.saveExercise();
      });

      expect(saveResult!).toBe(true);
      expect(result.current.exercises).toHaveLength(1);
      
      const savedExercise = result.current.exercises[0];
      expect(savedExercise.name).toBe('Bench Press');
      expect(savedExercise.translationKey).toBe('exercise_chest_benchPress');
      expect(savedExercise.key).toContain('exercise_chest_benchPress_');
      expect(savedExercise.series).toHaveLength(1);
      expect(savedExercise.series[0].weight).toBe(80);
      expect(savedExercise.series[0].reps).toBe(10);
    });

    it('should not save exercise without name or key', () => {
      const { result } = renderHook(() => useRoutineForm());

      let saveResult: boolean;
      act(() => {
        saveResult = result.current.saveExercise();
      });

      expect(saveResult!).toBe(false);
      expect(result.current.exercises).toHaveLength(0);
    });

    it('should not save exercise without valid series', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.setExerciseName('Empty Exercise');
        result.current.setExerciseKey('exercise_test_empty');
        // Don't set any valid series data
      });

      let saveResult: boolean;
      act(() => {
        saveResult = result.current.saveExercise();
      });

      expect(saveResult!).toBe(false);
      expect(result.current.exercises).toHaveLength(0);
    });

    it('should remove exercise at specific index', () => {
      const { result } = renderHook(() => useRoutineForm());

      // Add first exercise with valid series
      act(() => {
        result.current.setExerciseName('Exercise 1');
        result.current.setExerciseKey('exercise_test_1');
        result.current.updateSeries(0, 'reps', '10');
        result.current.updateSeries(0, 'weight', '80');
        result.current.saveExercise();
      });

      // Verify first exercise was saved
      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0].name).toBe('Exercise 1');

      // Add second exercise with valid series
      act(() => {
        result.current.resetExerciseForm();
        result.current.setExerciseName('Exercise 2');
        result.current.setExerciseKey('exercise_test_2');
        result.current.updateSeries(0, 'reps', '12');
        result.current.updateSeries(0, 'weight', '60');
        result.current.saveExercise();
      });

      // Verify both exercises exist
      expect(result.current.exercises).toHaveLength(2);
      expect(result.current.exercises[0].name).toBe('Exercise 1');
      expect(result.current.exercises[1].name).toBe('Exercise 2');

      // Remove first exercise
      act(() => {
        result.current.removeExercise(0);
      });

      // Verify removal
      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0].name).toBe('Exercise 2');
    });

    it('should load exercise for editing', () => {
      const { result } = renderHook(() => useRoutineForm());

      // Create and save an exercise with valid series
      act(() => {
        result.current.setExerciseName('Squat');
        result.current.setExerciseKey('exercise_legs_squat');
        result.current.setExerciseNote('Focus on depth');
        result.current.setExerciseRest('120');
        result.current.updateSeries(0, 'reps', '8');
        result.current.updateSeries(0, 'weight', '100');
        result.current.saveExercise();
      });

      // Verify exercise was saved
      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0]).toBeDefined();
      expect(result.current.exercises[0].name).toBe('Squat');

      // Load for editing
      act(() => {
        result.current.loadExerciseForEdit(0);
      });

      // Verify form was populated
      expect(result.current.exerciseName).toBe('Squat');
      expect(result.current.exerciseKey).toBe('exercise_legs_squat');
      expect(result.current.exerciseNote).toBe('Focus on depth');
      expect(result.current.exerciseRest).toBe('120');
      expect(result.current.editingIndex).toBe(0);
    });

    it('should update existing exercise when editing', () => {
      const { result } = renderHook(() => useRoutineForm());

      // Create and save an exercise with valid series
      act(() => {
        result.current.setExerciseName('Original Name');
        result.current.setExerciseKey('exercise_test_original');
        result.current.updateSeries(0, 'reps', '15');
        result.current.updateSeries(0, 'weight', '50');
        result.current.saveExercise();
      });

      // Verify exercise was saved
      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0].name).toBe('Original Name');

      // Load for editing and modify
      act(() => {
        result.current.loadExerciseForEdit(0);
        result.current.setExerciseName('Updated Name');
        result.current.saveExercise();
      });

      // Verify update
      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0].name).toBe('Updated Name');
      expect(result.current.editingIndex).toBe(-1);
    });
  });

  describe('Rest Between Exercises', () => {
    it('should handle beginner mode rest settings', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.updateDefaultRestBetweenExercises(90);
      });

      expect(result.current.defaultRestBetweenExercises).toBe(90);

      // Save exercise in beginner mode with valid series
      act(() => {
        result.current.setExerciseName('Test Exercise');
        result.current.setExerciseKey('exercise_test');
        result.current.updateSeries(0, 'reps', '10');
        result.current.updateSeries(0, 'weight', '50');
        result.current.saveExercise();
      });

      // Verify exercise was saved with correct rest time
      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0]).toBeDefined();
      expect(result.current.exercises[0].restBetweenExercises).toBe(90);
    });

    it('should handle advanced mode rest settings', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.updateExerciseRestMode('advanced');
        result.current.setExerciseName('Test Exercise');
        result.current.setExerciseKey('exercise_test');
        result.current.setExerciseRest('150');
        result.current.updateSeries(0, 'reps', '10');
        result.current.updateSeries(0, 'weight', '50');
        result.current.saveExercise();
      });

      // Verify exercise was saved with correct rest time
      expect(result.current.exercises).toHaveLength(1);
      expect(result.current.exercises[0]).toBeDefined();
      expect(result.current.exercises[0].restBetweenExercises).toBe(150);
    });

    it('should update all exercises when changing default rest in beginner mode', () => {
      const { result } = renderHook(() => useRoutineForm());

      // Add exercises in beginner mode with valid series
      act(() => {
        result.current.setExerciseName('Exercise 1');
        result.current.setExerciseKey('exercise_test_1');
        result.current.updateSeries(0, 'reps', '10');
        result.current.updateSeries(0, 'weight', '50');
        result.current.saveExercise();

        result.current.resetExerciseForm();
        result.current.setExerciseName('Exercise 2');
        result.current.setExerciseKey('exercise_test_2');
        result.current.updateSeries(0, 'reps', '8');
        result.current.updateSeries(0, 'weight', '60');
        result.current.saveExercise();
      });

      // Verify both exercises were saved
      expect(result.current.exercises).toHaveLength(2);
      expect(result.current.exercises[0]).toBeDefined();
      expect(result.current.exercises[1]).toBeDefined();

      // Change default rest
      act(() => {
        result.current.updateDefaultRestBetweenExercises(120);
      });

      // Verify both exercises have updated rest time
      expect(result.current.exercises[0].restBetweenExercises).toBe(120);
      expect(result.current.exercises[1].restBetweenExercises).toBe(120);
    });
  });

  describe('Preparation Settings', () => {
    it('should update preparation settings', () => {
      const { result } = renderHook(() => useRoutineForm());

      act(() => {
        result.current.updateEnablePreparation(true);
        result.current.updatePreparationTime(15);
      });

      expect(result.current.enablePreparation).toBe(true);
      expect(result.current.preparationTime).toBe(15);
    });
  });

  describe('Form Reset', () => {
    it('should reset exercise form to defaults', () => {
      const { result } = renderHook(() => useRoutineForm());

      // Set some values
      act(() => {
        result.current.setExerciseName('Test Exercise');
        result.current.setExerciseKey('exercise_test');
        result.current.setExerciseNote('Test note');
        result.current.updateGlobalUnitType('time');
        result.current.updateWithLoad(true);
        result.current.updateSeries(0, 'duration', '120');
        result.current.addSeries();
      });

      // Reset form
      act(() => {
        result.current.resetExerciseForm();
      });

      expect(result.current.exerciseName).toBe('');
      expect(result.current.exerciseKey).toBe('');
      expect(result.current.exerciseNote).toBe('');
      expect(result.current.globalUnitType).toBe('repsAndWeight');
      expect(result.current.globalSeriesType).toBe('workingSet');
      expect(result.current.withLoad).toBe(false);
      expect(result.current.globalRest).toBe('');
      expect(result.current.exerciseRest).toBe('');
      expect(result.current.series).toHaveLength(1);
      expect(result.current.editingIndex).toBeNull();
    });
  });

  describe('Load Routine', () => {
    it('should load existing routine successfully', async () => {
      const mockRoutine: Routine = {
        id: 'routine_123',
        title: 'Test Routine',
        description: 'Test Description',
        exercises: [
          {
            name: 'Bench Press',
            key: 'exercise_chest_benchPress_123',
            translationKey: 'exercise_chest_benchPress',
            series: [
              {
                unitType: 'repsAndWeight',
                weight: 80,
                reps: 10,
                duration: undefined,
                distance: undefined,
                note: '',
                rpe: 7,
                type: 'workingSet',
                rest: '90'
              }
            ],
            restBetweenExercises: 120
          }
        ],
        createdAt: '2024-01-15T10:00:00.000Z',
        exerciseRestMode: 'advanced',
        enablePreparation: true,
        preparationTime: 15
      };

      mockStorageService.getRoutines.mockResolvedValue([mockRoutine]);

      const { result } = renderHook(() => useRoutineForm());

      let loadResult: boolean;
      await act(async () => {
        loadResult = await result.current.loadRoutine('routine_123');
      });

      expect(loadResult!).toBe(true);
      expect(result.current.routine.title).toBe('Test Routine');
      expect(result.current.routine.description).toBe('Test Description');
      expect(result.current.routine.exerciseRestMode).toBe('advanced');
      expect(result.current.enablePreparation).toBe(true);
      expect(result.current.preparationTime).toBe(15);
      expect(result.current.exercises).toHaveLength(1);
    });

    it('should handle routine not found', async () => {
      mockStorageService.getRoutines.mockResolvedValue([]);

      const { result } = renderHook(() => useRoutineForm());

      let loadResult: boolean;
      await act(async () => {
        loadResult = await result.current.loadRoutine('nonexistent');
      });

      expect(loadResult!).toBe(false);
    });

    it('should handle storage error', async () => {
      mockStorageService.getRoutines.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useRoutineForm());

      let loadResult: boolean;
      await act(async () => {
        loadResult = await result.current.loadRoutine('routine_123');
      });

      expect(loadResult!).toBe(false);
    });
  });
});
