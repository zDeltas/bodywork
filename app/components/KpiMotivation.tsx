import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

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
            <Text style={styles.kpiValue}>{trainingFrequency}%</Text>
            <Text style={styles.kpiLabel}>{t('attendance')}</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{totalSets}</Text>
            <Text style={styles.kpiLabel}>{t('series')}</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{totalWorkouts}</Text>
            <Text style={styles.kpiLabel}>{t('sessions')}</Text>
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
