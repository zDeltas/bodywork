import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useExerciseData } from '@/app/hooks/useExerciseData';
import { Exercise, Series } from '@/types/common';
import ExerciseImage from './atoms/ExerciseImage';
import ExerciseInfo from './atoms/ExerciseInfo';


type CurrentExerciseProps = {
  exercise: Exercise;
  currentSeries: Series;
  currentSeriesIndex: number;
};

const CurrentExercise = React.memo<CurrentExerciseProps>(({
                                                            exercise,
                                                            currentSeries,
                                                            currentSeriesIndex
                                                          }) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const [imageExpanded, setImageExpanded] = useState(false);

  // Hook optimisé pour les données d'exercice
  const { exerciseImage, musclesText } = useExerciseData(exercise);


  return (
    <View style={styles.exerciseCard}>
      {imageExpanded ? (
        <ExerciseImage
          imageSource={exerciseImage}
          exerciseName={exercise.name}
          musclesText={musclesText}
          compact={false}
          isExpanded={true}
          onToggleExpand={() => setImageExpanded(false)}
        />
      ) : (
        <View style={styles.exerciseHeader}>
          <ExerciseImage
            imageSource={exerciseImage}
            exerciseName={exercise.name}
            musclesText={musclesText}
            compact={true}
            isExpanded={false}
            onToggleExpand={() => setImageExpanded(true)}
          />
          <ExerciseInfo
            exerciseName={exercise.name}
            musclesText={musclesText}
          />
        </View>
      )}
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  exerciseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md
  }
});

CurrentExercise.displayName = 'CurrentExercise';

export default CurrentExercise; 
