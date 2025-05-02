import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import ExerciseList from '@/app/components/ExerciseList';

interface StatsExerciseListProps {
  selectedMuscle: string;
  setSelectedMuscle: (muscleGroup: string) => void;
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
  exerciseOptions: string[];
  onExerciseSelect: (exercise: string) => void;
  onMuscleSelect: (muscleGroup: string) => void;
}

export default function StatsExerciseList({
                                            selectedMuscle,
                                            setSelectedMuscle,
                                            selectedExercise,
                                            setSelectedExercise,
                                            exerciseOptions,
                                            onExerciseSelect,
                                            onMuscleSelect
                                          }: StatsExerciseListProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg
    }
  });

  return (
    <View style={styles.container}>
      <ExerciseList
        selectedMuscle={selectedMuscle}
        setSelectedMuscle={setSelectedMuscle}
        exercise={selectedExercise}
        setExercise={setSelectedExercise}
        onExerciseSelect={onExerciseSelect}
        onMuscleSelect={onMuscleSelect}
      />
    </View>
  );
} 
