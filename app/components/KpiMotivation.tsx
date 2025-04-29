import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import Text from './ui/Text';

interface KpiMotivationProps {
  fadeAnim: Animated.Value;
  bestProgressExercise: { progress: number, exercise: string } | null;
  monthlyProgress: number;
  trainingFrequency: number;
  totalSets: number;
  totalWorkouts: number;
}

const KpiMotivation: React.FC<KpiMotivationProps> = ({
  fadeAnim,
  bestProgressExercise,
  monthlyProgress,
  trainingFrequency,
  totalSets,
  totalWorkouts
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Animated.View
      style={[
        styles.card,
        { marginHorizontal: theme.spacing.lg },
        { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
      ]}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statGradient}
      >
        <Text
          variant="subheading"
          style={[styles.kpiLabel, {
            marginBottom: theme.spacing.base,
            color: theme.colors.text.primary,
            textAlign: 'left'
          }]}
        >
          {bestProgressExercise && bestProgressExercise.progress && bestProgressExercise.exercise
            ? t('progressionText').replace('{progress}', bestProgressExercise.progress.toString()).replace('{exercise}', bestProgressExercise.exercise)
            : monthlyProgress > 0
              ? t('progressionTextMonth').replace('{progress}', monthlyProgress.toString())
              : t('progressionTextNone')}
        </Text>
        <View style={styles.kpiContainer}>
          <View style={styles.kpiItem}>
            <Text variant="heading" style={styles.kpiValue}>
              {trainingFrequency}%
            </Text>
            <Text variant="caption">{t('attendance')}</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text variant="heading" style={styles.kpiValue}>
              {totalSets}
            </Text>
            <Text variant="caption">{t('series')}</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text variant="heading" style={styles.kpiValue}>
              {totalWorkouts}
            </Text>
            <Text variant="caption">{t('sessions')}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
  },
  statGradient: {
    padding: 20,
    borderRadius: 16
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  kpiItem: {
    alignItems: 'center'
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  kpiLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8
  }
});

export default KpiMotivation;
