import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import MuscleMap from '@/app/components/muscles/MuscleMap';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { Workout } from '@/app/types/common';
import { StatsCardSkeleton } from '@/app/components/ui/SkeletonComponents';

interface MuscleRestStateProps {
  fadeAnim: Animated.Value;
  workouts: Workout[];
  isLoading: boolean;
}

const MuscleRestState: React.FC<MuscleRestStateProps> = ({ fadeAnim, workouts, isLoading }) => {
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
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg
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
      {isLoading ? (
        <View style={styles.container}>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </View>
      ) : (
      <MuscleMap workouts={workouts} />
      )}
    </Animated.View>
  );
};

export default MuscleRestState;
