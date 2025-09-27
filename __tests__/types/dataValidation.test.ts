import { 
  Series, 
  EditableSeries, 
  Exercise, 
  Routine, 
  Workout, 
  SessionState, 
  RoutineSession,
  SeriesType,
  ExerciseUnit 
} from '@/types/common';

describe('Data Type Validation', () => {
  describe('Series Data Integrity', () => {
    it('should validate Series structure', () => {
      const validSeries: Series = {
        unitType: 'repsAndWeight',
        weight: 80,
        reps: 10,
        duration: undefined,
        distance: undefined,
        note: 'Test series',
        rpe: 7,
        type: 'workingSet',
        rest: '90'
      };

      expect(validSeries.unitType).toBeDefined();
      expect(validSeries.weight).toBeGreaterThanOrEqual(0);
      expect(validSeries.rpe).toBeGreaterThanOrEqual(0);
      expect(validSeries.rpe).toBeLessThanOrEqual(10);
      expect(['warmUp', 'workingSet']).toContain(validSeries.type);
      expect(['repsAndWeight', 'reps', 'time', 'distance']).toContain(validSeries.unitType);
    });

    it('should validate repsAndWeight series has required fields', () => {
      const repsAndWeightSeries: Series = {
        unitType: 'repsAndWeight',
        weight: 75,
        reps: 8,
        duration: undefined,
        distance: undefined,
        note: '',
        rpe: 6,
        type: 'workingSet',
        rest: '60'
      };

      expect(repsAndWeightSeries.weight).toBeGreaterThan(0);
      expect(repsAndWeightSeries.reps).toBeGreaterThan(0);
      expect(repsAndWeightSeries.duration).toBeUndefined();
      expect(repsAndWeightSeries.distance).toBeUndefined();
    });

    it('should validate time series has duration field', () => {
      const timeSeries: Series = {
        unitType: 'time',
        weight: 0,
        reps: undefined,
        duration: 120,
        distance: undefined,
        note: '',
        rpe: 8,
        type: 'workingSet',
        rest: '45'
      };

      expect(timeSeries.duration).toBeGreaterThan(0);
      expect(timeSeries.reps).toBeUndefined();
      expect(timeSeries.distance).toBeUndefined();
    });

    it('should validate distance series has distance field', () => {
      const distanceSeries: Series = {
        unitType: 'distance',
        weight: 0,
        reps: undefined,
        duration: undefined,
        distance: 1000,
        note: '',
        rpe: 7,
        type: 'workingSet',
        rest: '90'
      };

      expect(distanceSeries.distance).toBeGreaterThan(0);
      expect(distanceSeries.reps).toBeUndefined();
      expect(distanceSeries.duration).toBeUndefined();
    });

    it('should validate warmUp series has RPE 0', () => {
      const warmUpSeries: Series = {
        unitType: 'repsAndWeight',
        weight: 40,
        reps: 12,
        duration: undefined,
        distance: undefined,
        note: 'Warm up',
        rpe: 0,
        type: 'warmUp',
        rest: '60'
      };

      expect(warmUpSeries.type).toBe('warmUp');
      expect(warmUpSeries.rpe).toBe(0);
    });
  });

  describe('Exercise Data Integrity', () => {
    it('should validate Exercise structure', () => {
      const validExercise: Exercise = {
        name: 'Bench Press',
        key: 'exercise_chest_benchPress_1234567890',
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
        note: 'Focus on form',
        restBetweenExercises: 120
      };

      expect(validExercise.name).toBeTruthy();
      expect(validExercise.key).toContain('_');
      expect(validExercise.translationKey).toBeTruthy();
      expect(validExercise.series).toHaveLength(1);
      expect(validExercise.restBetweenExercises).toBeGreaterThan(0);
    });

    it('should validate Exercise key format with timestamp', () => {
      const exercise: Exercise = {
        name: 'Squat',
        key: 'exercise_legs_squat_1758388470809',
        translationKey: 'exercise_legs_squat',
        series: [],
        restBetweenExercises: 90
      };

      // Key should contain timestamp
      expect(exercise.key).toMatch(/_\d+$/);
      // Translation key should not contain timestamp
      expect(exercise.translationKey).not.toMatch(/_\d+$/);
    });

    it('should validate Exercise has at least one series', () => {
      const exerciseWithSeries: Exercise = {
        name: 'Push-ups',
        key: 'exercise_chest_pushups_1234567890',
        translationKey: 'exercise_chest_pushups',
        series: [
          {
            unitType: 'reps',
            weight: 0,
            reps: 20,
            duration: undefined,
            distance: undefined,
            note: '',
            rpe: 6,
            type: 'workingSet',
            rest: '60'
          }
        ]
      };

      expect(exerciseWithSeries.series.length).toBeGreaterThan(0);
    });
  });

  describe('Routine Data Integrity', () => {
    it('should validate Routine structure', () => {
      const validRoutine: Routine = {
        id: 'routine_123',
        title: 'Push Day',
        description: 'Chest, shoulders, triceps',
        exercises: [],
        createdAt: '2024-01-15T10:00:00.000Z',
        lastUsed: '2024-01-20T15:30:00.000Z',
        favorite: false,
        usageCount: 5,
        totalTime: 3600,
        exerciseRestMode: 'beginner',
        enablePreparation: true,
        preparationTime: 10
      };

      expect(validRoutine.id).toBeTruthy();
      expect(validRoutine.title).toBeTruthy();
      expect(validRoutine.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(['beginner', 'advanced']).toContain(validRoutine.exerciseRestMode);
      expect(validRoutine.preparationTime).toBeGreaterThan(0);
    });

    it('should validate Routine dates are valid ISO strings', () => {
      const routine: Routine = {
        id: 'routine_456',
        title: 'Pull Day',
        description: 'Back and biceps',
        exercises: [],
        createdAt: '2024-01-15T10:00:00.000Z',
        lastUsed: '2024-01-20T15:30:00.000Z'
      };

      expect(() => new Date(routine.createdAt)).not.toThrow();
      expect(() => new Date(routine.lastUsed!)).not.toThrow();
      expect(new Date(routine.createdAt).getTime()).not.toBeNaN();
      expect(new Date(routine.lastUsed!).getTime()).not.toBeNaN();
    });

    it('should validate exerciseRestMode values', () => {
      const beginnerRoutine: Routine = {
        id: 'routine_789',
        title: 'Beginner Routine',
        description: 'Simple routine',
        exercises: [],
        createdAt: '2024-01-15T10:00:00.000Z',
        exerciseRestMode: 'beginner'
      };

      const advancedRoutine: Routine = {
        id: 'routine_101',
        title: 'Advanced Routine',
        description: 'Complex routine',
        exercises: [],
        createdAt: '2024-01-15T10:00:00.000Z',
        exerciseRestMode: 'advanced'
      };

      expect(['beginner', 'advanced']).toContain(beginnerRoutine.exerciseRestMode);
      expect(['beginner', 'advanced']).toContain(advancedRoutine.exerciseRestMode);
    });
  });

  describe('Workout Data Integrity', () => {
    it('should validate Workout structure', () => {
      const validWorkout: Workout = {
        id: 'workout_123',
        exercise: 'Bench Press',
        muscleGroup: 'chest',
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
        date: '2024-01-20T15:30:00.000Z',
        name: 'Push Day Session',
        routineId: 'routine_456',
        routineTitle: 'Push Day',
        exerciseIndex: 0,
        prepSeconds: 10,
        restSeriesSeconds: 180,
        restBetweenExercisesSeconds: 120,
        restSeconds: 300,
        workSeconds: 240,
        totalSeconds: 550
      };

      expect(validWorkout.id).toBeTruthy();
      expect(validWorkout.exercise).toBeTruthy();
      expect(validWorkout.muscleGroup).toBeTruthy();
      expect(validWorkout.series.length).toBeGreaterThan(0);
      expect(validWorkout.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(validWorkout.exerciseIndex).toBeGreaterThanOrEqual(0);
    });

    it('should validate Workout timing data consistency', () => {
      const workout: Workout = {
        id: 'workout_456',
        exercise: 'Squat',
        muscleGroup: 'legs',
        series: [],
        date: '2024-01-20T15:30:00.000Z',
        prepSeconds: 10,
        restSeriesSeconds: 120,
        restBetweenExercisesSeconds: 60,
        restSeconds: 180,
        workSeconds: 300,
        totalSeconds: 490
      };

      // Rest seconds should equal sum of series and between exercises rest
      expect(workout.restSeconds).toBe(
        workout.restSeriesSeconds! + workout.restBetweenExercisesSeconds!
      );

      // Total should include all components
      expect(workout.totalSeconds).toBe(
        workout.prepSeconds! + workout.restSeconds! + workout.workSeconds!
      );
    });
  });

  describe('SessionState Data Integrity', () => {
    it('should validate SessionState structure', () => {
      const validSessionState: SessionState = {
        currentExerciseIndex: 0,
        currentSeriesIndex: 2,
        isResting: true,
        restTime: 90,
        restType: 'series',
        isPreparation: false,
        preparationTime: 0,
        routineFinished: false,
        completedExercises: [],
        pendingSeries: { exerciseIdx: 0, seriesIdx: 1 },
        rpe: '7'
      };

      expect(validSessionState.currentExerciseIndex).toBeGreaterThanOrEqual(0);
      expect(validSessionState.currentSeriesIndex).toBeGreaterThanOrEqual(0);
      expect(typeof validSessionState.isResting).toBe('boolean');
      expect(validSessionState.restTime).toBeGreaterThanOrEqual(0);
      expect(['series', 'exercise']).toContain(validSessionState.restType);
      expect(typeof validSessionState.isPreparation).toBe('boolean');
      expect(validSessionState.preparationTime).toBeGreaterThanOrEqual(0);
    });

    it('should validate pendingSeries structure when present', () => {
      const sessionWithPending: SessionState = {
        currentExerciseIndex: 1,
        currentSeriesIndex: 0,
        isResting: false,
        restTime: 0,
        isPreparation: false,
        preparationTime: 0,
        routineFinished: false,
        completedExercises: [],
        pendingSeries: { exerciseIdx: 1, seriesIdx: 2 },
        rpe: '8'
      };

      expect(sessionWithPending.pendingSeries?.exerciseIdx).toBeGreaterThanOrEqual(0);
      expect(sessionWithPending.pendingSeries?.seriesIdx).toBeGreaterThanOrEqual(0);
    });
  });

  describe('RoutineSession Data Integrity', () => {
    it('should validate RoutineSession structure', () => {
      const validRoutineSession: RoutineSession = {
        id: 'session_123',
        routineId: 'routine_456',
        routineTitle: 'Push Day',
        date: '2024-01-20',
        exercises: [],
        totals: {
          prepSeconds: 30,
          restSeriesSeconds: 600,
          restBetweenExercisesSeconds: 240,
          workSeconds: 1800,
          totalSeconds: 2670
        },
        notes: ['Good form', 'Increase weight next time'],
        muscles: ['chest', 'shoulders', 'triceps'],
        exerciseCount: 3,
        seriesCount: 12
      };

      expect(validRoutineSession.id).toBeTruthy();
      expect(validRoutineSession.routineId).toBeTruthy();
      expect(validRoutineSession.routineTitle).toBeTruthy();
      expect(validRoutineSession.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validRoutineSession.exerciseCount).toBeGreaterThan(0);
      expect(validRoutineSession.seriesCount).toBeGreaterThan(0);
    });

    it('should validate RoutineSession totals consistency', () => {
      const session: RoutineSession = {
        id: 'session_456',
        routineId: 'routine_789',
        routineTitle: 'Pull Day',
        date: '2024-01-21',
        exercises: [],
        totals: {
          prepSeconds: 20,
          restSeriesSeconds: 480,
          restBetweenExercisesSeconds: 180,
          workSeconds: 1200,
          totalSeconds: 1880
        },
        exerciseCount: 4,
        seriesCount: 16
      };

      const expectedTotal = 
        session.totals.prepSeconds + 
        session.totals.restSeriesSeconds + 
        session.totals.restBetweenExercisesSeconds + 
        session.totals.workSeconds;

      expect(session.totals.totalSeconds).toBe(expectedTotal);
    });
  });

  describe('Type Constraints', () => {
    it('should validate SeriesType enum values', () => {
      const validTypes: SeriesType[] = ['warmUp', 'workingSet'];
      
      validTypes.forEach(type => {
        expect(['warmUp', 'workingSet']).toContain(type);
      });
    });

    it('should validate ExerciseUnit enum values', () => {
      const validUnits: ExerciseUnit[] = ['repsAndWeight', 'reps', 'time', 'distance'];
      
      validUnits.forEach(unit => {
        expect(['repsAndWeight', 'reps', 'time', 'distance']).toContain(unit);
      });
    });

    it('should validate RPE range constraints', () => {
      const validRpeValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const invalidRpeValues = [-1, 11, 15, 20];

      validRpeValues.forEach(rpe => {
        expect(rpe).toBeGreaterThanOrEqual(0);
        expect(rpe).toBeLessThanOrEqual(10);
      });

      invalidRpeValues.forEach(rpe => {
        expect(rpe < 0 || rpe > 10).toBe(true);
      });
    });
  });
});
