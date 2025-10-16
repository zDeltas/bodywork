import { useState, useCallback } from 'react';
import { EditableSeries } from '@/types/common';
import { getValidSeries } from '../utils/seriesUtils';

const DEFAULT_UNIT_TYPE = 'repsAndWeight' as const;
const DEFAULT_SERIES_TYPE = 'workingSet' as const;
const UNIT_TYPES_WITH_LOAD = ['time', 'distance'] as const;

const createDefaultSeries = (
  unitType: 'repsAndWeight' | 'reps' | 'time' | 'distance' = DEFAULT_UNIT_TYPE, 
  seriesType: 'warmUp' | 'workingSet' = DEFAULT_SERIES_TYPE, 
  rest = ''
): EditableSeries => ({
  unitType,
  weight: '',
  reps: '',
  duration: '',
  distance: '',
  note: '',
  rest,
  type: seriesType
});

export const useWorkoutForm = () => {
  const [exerciseName, setExerciseName] = useState<string>('');
  const [exerciseKey, setExerciseKey] = useState<string>('');
  const [exerciseNote, setExerciseNote] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');

  const [series, setSeries] = useState<EditableSeries[]>([createDefaultSeries()]);

  const [globalUnitType, setGlobalUnitType] = useState<'repsAndWeight' | 'reps' | 'time' | 'distance'>(DEFAULT_UNIT_TYPE);
  const [globalSeriesType, setGlobalSeriesType] = useState<'warmUp' | 'workingSet'>(DEFAULT_SERIES_TYPE);
  const [withLoad, setWithLoad] = useState<boolean>(false);
  const [globalRest, setGlobalRest] = useState<string>('');

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

  const resetForm = useCallback(() => {
    setExerciseName('');
    setExerciseKey('');
    setGlobalUnitType(DEFAULT_UNIT_TYPE);
    setGlobalSeriesType(DEFAULT_SERIES_TYPE);
    setWithLoad(false);
    setExerciseNote('');
    setGlobalRest('');
    setRpe('');
    setSeries([createDefaultSeries()]);
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

  const canSave = useCallback(() => {
    return getValidSeries(series).length > 0 && exerciseKey && exerciseName;
  }, [series, exerciseKey, exerciseName]);

  return {
    exerciseName,
    exerciseKey,
    exerciseNote,
    rpe,
    series,
    globalUnitType,
    globalSeriesType,
    withLoad,
    globalRest,

    setExerciseName,
    setExerciseKey,
    setExerciseNote,
    setRpe,
    setWithLoad,

    addSeries,
    removeSeries,
    copySeries,
    updateSeries,
    resetForm,
    updateGlobalSeriesType,
    updateGlobalUnitType,
    updateGlobalRest,
    updateWithLoad,
    canSave
  };
};

// Default export to satisfy Expo Router
export default function UseWorkoutFormIndex() {
  // Empty function to satisfy Expo Router requirement
}
