import { useMemo } from 'react';
import { useTranslation } from '@/app/hooks/useTranslation';

export interface UseMotivationOptions {
  currentExerciseIndex: number;
  currentSeriesIndex: number;
  totalExercises: number;
  totalSeries: number;
  isResting: boolean;
}

export interface UseMotivationReturn {
  motivationalText: string;
  progress: number;
}

export const useMotivation = ({
  currentExerciseIndex,
  currentSeriesIndex,
  totalExercises,
  totalSeries,
  isResting
}: UseMotivationOptions): UseMotivationReturn => {
  const { t } = useTranslation();

  const { motivationalText, progress } = useMemo(() => {
    if (isResting) {
      return {
        motivationalText: t('session.takeBreath'),
        progress: 0
      };
    }

    const calculatedProgress = ((currentExerciseIndex * totalSeries + currentSeriesIndex + 1) / (totalExercises * totalSeries)) * 100;

    let text: string;
    if (calculatedProgress < 25) {
      text = t('session.letsGo');
    } else if (calculatedProgress < 50) {
      text = t('session.keepGoing');
    } else if (calculatedProgress < 75) {
      text = t('session.halfwayThere');
    } else if (calculatedProgress < 95) {
      text = t('session.almostDone');
    } else {
      text = t('session.finalPush');
    }

    return {
      motivationalText: text,
      progress: calculatedProgress
    };
  }, [currentExerciseIndex, currentSeriesIndex, totalExercises, totalSeries, isResting, t]);

  return { motivationalText, progress };
};

export default useMotivation;
