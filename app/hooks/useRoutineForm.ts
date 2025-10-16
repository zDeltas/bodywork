import { useState, useCallback } from 'react';
import { EditableSeries, Exercise, Routine } from '@/types/common';
import { formatSeries, getValidSeries } from '../utils/seriesUtils';
import { storageService } from '@/app/services/storage';

const DEFAULT_UNIT_TYPE = 'repsAndWeight' as const;
const DEFAULT_SERIES_TYPE = 'workingSet' as const;
const UNIT_TYPES_WITH_LOAD = ['time', 'distance'] as const;

const createDefaultSeries = (unitType: 'repsAndWeight' | 'reps' | 'time' | 'distance' = DEFAULT_UNIT_TYPE, seriesType: 'warmUp' | 'workingSet' = DEFAULT_SERIES_TYPE, rest = ''): EditableSeries => ({
  unitType,
  weight: '',
  reps: '',
  duration: '',
  distance: '',
  note: '',
  rest,
  type: seriesType
});

export const useRoutineForm = () => {
  const [routine, setRoutine] = useState({
    title: '',
    description: '',
    exercises: [],
    exerciseRestMode: 'beginner' as 'beginner' | 'advanced'
  });

  const [defaultRestBetweenExercises, setDefaultRestBetweenExercises] = useState<number>(60);
  const [enablePreparation, setEnablePreparation] = useState<boolean>(false);
  const [preparationTime, setPreparationTime] = useState<number>(10); // 10 secondes par défaut

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState<string>('');
  const [exerciseKey, setExerciseKey] = useState<string>('');
  const [exerciseNote, setExerciseNote] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [series, setSeries] = useState<EditableSeries[]>([createDefaultSeries()]);

  const [globalUnitType, setGlobalUnitType] = useState<'repsAndWeight' | 'reps' | 'time' | 'distance'>(DEFAULT_UNIT_TYPE);
  const [globalSeriesType, setGlobalSeriesType] = useState<'warmUp' | 'workingSet'>(DEFAULT_SERIES_TYPE);
  const [withLoad, setWithLoad] = useState<boolean>(false);
  const [globalRest, setGlobalRest] = useState<string>('');
  const [exerciseRest, setExerciseRest] = useState<string>('');

  const addSeries = useCallback(() => {
    setSeries(prev => [...prev, createDefaultSeries(globalUnitType, globalSeriesType, globalRest)]);
  }, [globalUnitType, globalRest, globalSeriesType]);

  const removeSeries = useCallback((index: number) => {
    setSeries(prev => prev.filter((_, i) => i !== index));
  }, []);

  const copySeries = useCallback((index: number) => {
    const seriesToCopy = { ...series[index] };
    setSeries(prev => {
      const newSeries = [...prev];
      newSeries.splice(index + 1, 0, { ...seriesToCopy });
      return newSeries;
    });
  }, [series]);

  const updateSeries = useCallback((index: number, field: keyof EditableSeries, value: string) => {
    setSeries(prev => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }, []);

  const resetExerciseForm = useCallback(() => {
    setExerciseName('');
    setExerciseKey('');
    setGlobalUnitType(DEFAULT_UNIT_TYPE);
    setGlobalSeriesType(DEFAULT_SERIES_TYPE);
    setWithLoad(false);
    setExerciseNote('');
    setGlobalRest('');
    setExerciseRest('');
    setSeries([createDefaultSeries()]);
    setEditingIndex(null);
  }, []);

  const loadExerciseForEdit = useCallback((index: number) => {
    const ex = exercises[index];
    setExerciseName(ex.name);
    setExerciseKey(ex.translationKey);
    setExerciseNote(ex.note || '');
    setExerciseRest(ex.restBetweenExercises?.toString() || '');

    const first = ex.series[0];
    if (first) {
      setGlobalUnitType(first.unitType);
      setGlobalSeriesType(first.type);
      setWithLoad(first.unitType === 'time' || first.unitType === 'distance' ? (first.weight > 0) : false);
      setGlobalRest(first.rest || '');
    }
    
    setSeries(ex.series.map((s) => ({
      unitType: s.unitType,
      weight: s.weight?.toString() || '',
      reps: s.reps?.toString() || '',
      duration: s.duration?.toString() || '',
      distance: s.distance?.toString() || '',
      note: '',
      rest: s.rest || '',
      type: first ? first.type : s.type
    })));
    setEditingIndex(index);
  }, [exercises]);

  const saveExercise = useCallback(() => {
    if (!exerciseKey || !exerciseName) return false;
    
    const validSeries = getValidSeries(series);
    if (validSeries.length === 0) return false;

    const formattedSeries = formatSeries(validSeries, withLoad);
    const newEx: Exercise = {
      name: exerciseName,
      key: `${exerciseKey}_${Date.now()}`,
      translationKey: exerciseKey,
      series: formattedSeries,
      note: exerciseNote?.trim() || undefined,
      restBetweenExercises: routine.exerciseRestMode === 'advanced' && exerciseRest 
        ? parseInt(exerciseRest) 
        : routine.exerciseRestMode === 'beginner' 
          ? defaultRestBetweenExercises 
          : undefined
    };

    setExercises(prev => {
      if (editingIndex !== null) {
        const copy = [...prev];
        copy[editingIndex] = newEx;
        return copy;
      } else {
        return [...prev, newEx];
      }
    });
    
    return true;
  }, [exerciseKey, exerciseName, series, exerciseNote, editingIndex, withLoad]);

  const removeExercise = useCallback((index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  }, []);

  const loadRoutine = useCallback(async (routineId: string) => {
    try {
      const routines = await storageService.getRoutines();
      const existingRoutine = routines.find(r => r.id === routineId);
      if (existingRoutine) {
        setRoutine({
          title: existingRoutine.title,
          description: existingRoutine.description,
          exercises: [],
          exerciseRestMode: existingRoutine.exerciseRestMode || 'beginner'
        });

        if (existingRoutine.exerciseRestMode === 'beginner' && existingRoutine.exercises.length > 0) {
          const firstExerciseRest = existingRoutine.exercises[0]?.restBetweenExercises;
          if (firstExerciseRest) {
            setDefaultRestBetweenExercises(firstExerciseRest);
          }
        }

        // Charger les paramètres de temps de préparation
        setEnablePreparation(existingRoutine.enablePreparation || false);
        setPreparationTime(existingRoutine.preparationTime || 10);

        setExercises(existingRoutine.exercises);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading routine:', error);
      return false;
    }
  }, []);

  const updateGlobalSeriesType = useCallback((type: 'warmUp' | 'workingSet') => {
    setGlobalSeriesType(type);
    setSeries(prev => prev.map(s => ({ ...s, type })));
  }, []);

  const getFieldsToKeep = useCallback((unitType: string) => {
    const fieldsConfig = {
      repsAndWeight: ['weight', 'reps'],
      reps: ['reps'],
      time: ['duration'],
      distance: ['distance']
    };
    return fieldsConfig[unitType as keyof typeof fieldsConfig] || [];
  }, []);

  const updateGlobalUnitType = useCallback((unitType: 'repsAndWeight' | 'reps' | 'time' | 'distance') => {
    setGlobalUnitType(unitType);
    
    const fieldsToKeep = getFieldsToKeep(unitType);
    const allFields = ['weight', 'reps', 'duration', 'distance'] as const;

    setSeries(prev => prev.map(s => {
      const cleanedSeries = { ...s, unitType };

      allFields.forEach(field => {
        if (!fieldsToKeep.includes(field)) {
          switch (field) {
            case 'weight':
              cleanedSeries.weight = '';
              break;
            case 'reps':
              cleanedSeries.reps = '';
              break;
            case 'duration':
              cleanedSeries.duration = '';
              break;
            case 'distance':
              cleanedSeries.distance = '';
              break;
          }
        }
      });
      
      return cleanedSeries;
    }));

    if (!UNIT_TYPES_WITH_LOAD.includes(unitType as any)) {
      setWithLoad(false);
    }
  }, [getFieldsToKeep]);

  const updateGlobalRest = useCallback((rest: string) => {
    setGlobalRest(rest);
    setSeries(prev => prev.map(s => ({ ...s, rest })));
  }, []);

  const updateWithLoad = useCallback((newWithLoad: boolean) => {
    setWithLoad(newWithLoad);

    if (!newWithLoad && UNIT_TYPES_WITH_LOAD.includes(globalUnitType as any)) {
      setSeries(prev => prev.map(s => ({ ...s, weight: '' })));
    }
  }, [globalUnitType]);

  const updateExerciseRestMode = useCallback((mode: 'beginner' | 'advanced') => {
    setRoutine(prev => ({ ...prev, exerciseRestMode: mode }));
  }, []);

  const updateDefaultRestBetweenExercises = useCallback((rest: number) => {
    setDefaultRestBetweenExercises(rest);

    if (routine.exerciseRestMode === 'beginner') {
      setExercises(prev => prev.map(exercise => ({
        ...exercise,
        restBetweenExercises: rest
      })));
    }
  }, [routine.exerciseRestMode]);

  const updateExerciseRestTime = useCallback((exerciseIndex: number, restTime: number) => {
    setExercises(prev => prev.map((exercise, index) => 
      index === exerciseIndex 
        ? { ...exercise, restBetweenExercises: restTime }
        : exercise
    ));
  }, []);

  const updateEnablePreparation = useCallback((enabled: boolean) => {
    setEnablePreparation(enabled);
  }, []);

  const updatePreparationTime = useCallback((time: number) => {
    setPreparationTime(time);
  }, []);

  return {
    routine,
    exercises,
    exerciseName,
    exerciseKey,
    exerciseNote,
    editingIndex,
    series,
    globalUnitType,
    globalSeriesType,
    withLoad,
    globalRest,
    exerciseRest,
    defaultRestBetweenExercises,
    enablePreparation,
    preparationTime,

    setRoutine,
    setExerciseName,
    setExerciseKey,
    setExerciseNote,
    setWithLoad,
    setExerciseRest,

    addSeries,
    removeSeries,
    copySeries,
    updateSeries,
    resetExerciseForm,
    loadExerciseForEdit,
    saveExercise,
    removeExercise,
    loadRoutine,
    updateGlobalSeriesType,
    updateGlobalUnitType,
    updateGlobalRest,
    updateWithLoad,
    updateExerciseRestMode,
    updateDefaultRestBetweenExercises,
    updateExerciseRestTime,
    updateEnablePreparation,
    updatePreparationTime
  };
};

// Default export to satisfy Expo Router
export default function UseRoutineFormIndex() {
  // Empty function to satisfy Expo Router requirement
}
