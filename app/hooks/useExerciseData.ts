import { useMemo } from 'react';
import { useTranslation } from '@/app/hooks/useTranslation';
import { defaultExerciseImage, exerciseToImage, predefinedExercises, getBaseExerciseKey } from '@/app/components/exercises';
import { Exercise } from '@/types/common';

export interface UseExerciseDataReturn {
  exerciseImage: any;
  targetedMuscles: string[];
  musclesText: string;
}

export const useExerciseData = (exercise: Exercise): UseExerciseDataReturn => {
  const { t } = useTranslation();

  const { exerciseImage, targetedMuscles, musclesText } = useMemo(() => {
    // Get exercise image
    const baseKey = getBaseExerciseKey(exercise.translationKey);
    const image = exerciseToImage[baseKey] || defaultExerciseImage;

    // Get targeted muscles
    const exerciseData = predefinedExercises.find(ex => ex.key === baseKey);
    let muscles: string[] = [];
    
    if (exerciseData) {
      muscles = [t(`muscleGroups.${exerciseData.primaryMuscle}`)];
      if (exerciseData.secondaryMuscles) {
        muscles.push(...exerciseData.secondaryMuscles.map(muscle => t(`muscleGroups.${muscle}`)));
      }
      muscles = muscles.filter(Boolean);
    }

    const musclesString = muscles.length > 0 ? muscles.join(' • ') : '';

    return {
      exerciseImage: image,
      targetedMuscles: muscles,
      musclesText: musclesString
    };
  }, [exercise.translationKey, t]);

  return { exerciseImage, targetedMuscles, musclesText };
};

export default useExerciseData;
