import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import MuscleRestState from '@/app/components/muscles/MuscleRestState';
import { Workout } from '@/app/types/workout';

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
