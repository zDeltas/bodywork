import { useState, useCallback } from 'react';
import { EditableSeries, Exercise, Routine } from '@/types/common';
import { formatSeries, getValidSeries } from '../utils/seriesUtils';
import { storageService } from '@/app/services/storage';

/**
 * Hook personnalisé pour gérer l'état et la logique du formulaire de routine
 * Sépare la logique métier de l'interface utilisateur
 */
export const useRoutineForm = () => {
  // État de base de la routine
  const [routine, setRoutine] = useState({
    title: '',
    description: '',
    exercises: []
  });

  // État des exercices
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseName, setExerciseName] = useState<string>('');
  const [exerciseKey, setExerciseKey] = useState<string>('');
  const [exerciseNote, setExerciseNote] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // État des séries
  const [series, setSeries] = useState<EditableSeries[]>([
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
  ]);

  // Configuration globale des séries
  const [globalUnitType, setGlobalUnitType] = useState<'repsAndWeight' | 'reps' | 'time' | 'distance'>('repsAndWeight');
  const [globalSeriesType, setGlobalSeriesType] = useState<'warmUp' | 'workingSet'>('workingSet');
  const [withLoad, setWithLoad] = useState<boolean>(false);
  const [globalRest, setGlobalRest] = useState<string>('');

  // Fonctions de manipulation des séries
  const addSeries = useCallback(() => {
    setSeries(prev => [
      ...prev,
      {
        unitType: globalUnitType,
        weight: '',
        reps: '',
        duration: '',
        distance: '',
        note: '',
        rest: globalRest,
        type: globalSeriesType
      }
    ]);
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

  // Fonctions de manipulation des exercices
  const resetExerciseForm = useCallback(() => {
    setExerciseName('');
    setExerciseKey('');
    setGlobalUnitType('repsAndWeight');
    setGlobalSeriesType('workingSet');
    setWithLoad(false);
    setExerciseNote('');
    setGlobalRest('');
    setSeries([{
      unitType: 'repsAndWeight',
      weight: '',
      reps: '',
      duration: '',
      distance: '',
      note: '',
      rest: '',
      type: 'workingSet'
    }]);
    setEditingIndex(null);
  }, []);

  const loadExerciseForEdit = useCallback((index: number) => {
    const ex = exercises[index];
    setExerciseName(ex.name);
    setExerciseKey(ex.translationKey);
    setExerciseNote(ex.note || '');
    
    // Inférer les paramètres globaux depuis la première série
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

    const formattedSeries = formatSeries(validSeries, '7');
    const newEx: Exercise = {
      name: exerciseName,
      key: `${exerciseKey}_${Date.now()}`,
      translationKey: exerciseKey,
      series: formattedSeries,
      note: exerciseNote?.trim() || undefined
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
  }, [exerciseKey, exerciseName, series, exerciseNote, editingIndex]);

  const removeExercise = useCallback((index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Fonction pour charger une routine existante (pour l'édition)
  const loadRoutine = useCallback(async (routineId: string) => {
    try {
      const routines = await storageService.getRoutines();
      const existingRoutine = routines.find(r => r.id === routineId);
      if (existingRoutine) {
        setRoutine({
          title: existingRoutine.title,
          description: existingRoutine.description,
          exercises: []
        });
        setExercises(existingRoutine.exercises);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading routine:', error);
      return false;
    }
  }, []);

  // Fonctions de configuration globale
  const updateGlobalSeriesType = useCallback((type: 'warmUp' | 'workingSet') => {
    setGlobalSeriesType(type);
    setSeries(prev => prev.map(s => ({ ...s, type })));
  }, []);

  const updateGlobalUnitType = useCallback((unitType: 'repsAndWeight' | 'reps' | 'time' | 'distance') => {
    setGlobalUnitType(unitType);
    setSeries(prev => prev.map(s => ({ ...s, unitType })));
    if (unitType === 'repsAndWeight' || unitType === 'reps') {
      setWithLoad(false);
    }
  }, []);

  const updateGlobalRest = useCallback((rest: string) => {
    setGlobalRest(rest);
    setSeries(prev => prev.map(s => ({ ...s, rest })));
  }, []);

  return {
    // État
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
    
    // Setters
    setRoutine,
    setExerciseName,
    setExerciseKey,
    setExerciseNote,
    setWithLoad,
    
    // Actions
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
    updateGlobalRest
  };
};
