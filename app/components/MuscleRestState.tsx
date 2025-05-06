import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import MuscleMap from '@/app/components/MuscleMap';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { Workout } from '@/app/types/workout';

interface MuscleRestStateProps {
  fadeAnim: Animated.Value;
  workouts: Workout[];
}

const MuscleRestState: React.FC<MuscleRestStateProps> = ({ fadeAnim, workouts }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    chartContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm
    },
    chartTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: theme.spacing.lg,
      color: theme.colors.text.primary
    }
  });

  return (
    <Animated.View
      style={[
        styles.chartContainer,
        { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
      ]}
    >
      <Text style={styles.chartTitle}>{t('muscleMap.muscleRestState')}</Text>
      <MuscleMap workouts={workouts} />
    </Animated.View>
  );
};

export default MuscleRestState;
