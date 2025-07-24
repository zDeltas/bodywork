import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import MuscleMap from '@/app/components/muscles/MuscleMap';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { Workout } from '@/types/common';

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
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary
    },
    chartSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.lg
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xl
    },
    emptyStateText: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    }
  });

  // Vérifier si des entraînements sont disponibles
  const hasWorkouts = workouts && workouts.length > 0;

  return (
    <Animated.View
      style={[styles.chartContainer, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}
    >
      <Text style={styles.chartTitle}>{t('muscleMap.muscleRestState')}</Text>
      <Text style={styles.chartSubtitle}>
        État de repos de vos groupes musculaires basé sur vos derniers entraînements
      </Text>
      
      {hasWorkouts ? (
        <MuscleMap workouts={workouts} />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            Aucun entraînement enregistré.{'\n'}
            Commencez à vous entraîner pour voir l'état de repos de vos muscles.
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default MuscleRestState;
