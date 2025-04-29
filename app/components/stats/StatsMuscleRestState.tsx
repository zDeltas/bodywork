import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import MuscleRestState from '@/app/components/MuscleRestState';

interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  rpe?: number;
}

interface StatsMuscleRestStateProps {
  fadeAnim: Animated.Value;
  workouts: Workout[];
}

export default function StatsMuscleRestState({
  fadeAnim,
  workouts
}: StatsMuscleRestStateProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl
    }
  });

  return (
    <View style={styles.container}>
      <MuscleRestState
        fadeAnim={fadeAnim}
        workouts={workouts}
      />
    </View>
  );
} 