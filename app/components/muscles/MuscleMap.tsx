import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import { Workout } from '@/types/common';
import { useSettings } from '@/app/hooks/useSettings';
import { predefinedExercises, getBaseExerciseKey } from '@/app/components/exercises';

interface MuscleMapProps {
  workouts: Workout[];
}

const muscleSlugs: Record<string, Slug> = {
  CHEST: 'chest' as Slug,
  ABS: 'abs' as Slug,
  BICEPS: 'biceps' as Slug,
  UPPER_BACK: 'upper-back' as Slug,
  LOWER_BACK: 'lower-back' as Slug,
  TRICEPS: 'triceps' as Slug,
  DELTOIDS: 'deltoids' as Slug,
  TRAPEZIUS: 'trapezius' as Slug,
  QUADRICEPS: 'quadriceps' as Slug,
  CALVES: 'calves' as Slug,
  HAMSTRING: 'hamstring' as Slug,
  GLUTEAL: 'gluteal' as Slug,
  FOREARM: 'forearm' as Slug,
  ADDUCTORS: 'adductors' as Slug,
  HAIR: 'hair' as Slug,
  NECK: 'neck' as Slug,
  HANDS: 'hands' as Slug,
  FEET: 'feet' as Slug,
  HEAD: 'head' as Slug,
  ANKLES: 'ankles' as Slug,
  TIBIALIS: 'tibialis' as Slug,
  OBLIQUES: 'obliques' as Slug,
  KNEES: 'knees' as Slug
};

const muscleGroupToSlug: Record<string, Slug> = {
  chest: muscleSlugs.CHEST,
  back: muscleSlugs.UPPER_BACK,
  shoulders: muscleSlugs.DELTOIDS,
  biceps: muscleSlugs.BICEPS,
  triceps: muscleSlugs.TRICEPS,
  core: muscleSlugs.ABS,
  obliques: muscleSlugs.OBLIQUES,
  forearms: muscleSlugs.FOREARM,
  abductors: muscleSlugs.ADDUCTORS,
  adductors: muscleSlugs.ADDUCTORS,
  quadriceps: muscleSlugs.QUADRICEPS,
  trapezius: muscleSlugs.TRAPEZIUS,
  hamstrings: muscleSlugs.HAMSTRING,
  calves: muscleSlugs.CALVES,
  legs: muscleSlugs.QUADRICEPS // fallback generic
};

export default function MuscleMap({ workouts }: MuscleMapProps) {
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const { settings } = useSettings();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  const frontTextOpacity = useSharedValue(1);
  const backTextOpacity = useSharedValue(0);
  const rotationValue = useSharedValue(0);

  const handleViewChange = (view: 'front' | 'back') => {
    setSelectedView(view);
    frontTextOpacity.value = withTiming(view === 'front' ? 1 : 0);
    backTextOpacity.value = withTiming(view === 'back' ? 1 : 0);
    rotationValue.value = withSpring(view === 'front' ? 0 : 180);
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotationValue.value}deg` }]
  }));

  // Compute weighted activation per muscle group using the same rules as MuscleDistribution
  const getExtendedBodyParts = (workouts: Workout[]) => {
    // Build exercise index for quick lookup
    const exerciseIndex: Record<string, { primaryMuscle: string; secondaryMuscles: string[] }> =
      predefinedExercises.reduce((acc, ex) => {
        acc[ex.key] = { primaryMuscle: ex.primaryMuscle, secondaryMuscles: ex.secondaryMuscles ?? [] };
        return acc;
      }, {} as Record<string, { primaryMuscle: string; secondaryMuscles: string[] }>);

    // Aggregate scores per muscle
    const scores: Record<string, number> = {};
    const PRIMARY_PORTION = 0.7;
    const SECONDARY_PORTION = 0.3;

    workouts.forEach((workout) => {
      const volume = workout.series.reduce((total, series) => {
        switch (series.unitType) {
          case 'repsAndWeight': {
            const reps = typeof series.reps === 'number' ? series.reps : 0;
            const weight = typeof series.weight === 'number' ? series.weight : 0;
            return total + weight * reps;
          }
          case 'reps': {
            const reps = typeof series.reps === 'number' ? series.reps : 0;
            return total + reps;
          }
          case 'time': {
            const duration = typeof series.duration === 'number' ? series.duration : 0;
            return total + duration;
          }
          case 'distance': {
            const distance = typeof series.distance === 'number' ? series.distance : 0;
            return total + distance;
          }
          default:
            return total;
        }
      }, 0);

      if (volume <= 0) return;

      const baseKey = getBaseExerciseKey(workout.exercise);
      const def = exerciseIndex[baseKey];

      if (def) {
        // 70% to primary
        scores[def.primaryMuscle] = (scores[def.primaryMuscle] ?? 0) + volume * PRIMARY_PORTION;
        // 30% split among secondaries
        const secs = def.secondaryMuscles;
        if (secs.length > 0) {
          const share = (volume * SECONDARY_PORTION) / secs.length;
          secs.forEach((m) => {
            scores[m] = (scores[m] ?? 0) + share;
          });
        }
      } else {
        const fallback = (workout.muscleGroup || 'other').toLowerCase();
        scores[fallback] = (scores[fallback] ?? 0) + volume;
      }
    });

    // Normalize into 3 intensity bins to match legend/colors
    const values = Object.values(scores);
    const max = values.length ? Math.max(...values) : 0;

    const bodyParts: ExtendedBodyPart[] = [];
    Object.entries(scores).forEach(([group, value]) => {
      const slug = muscleGroupToSlug[group];
      if (!slug) return;
      const ratio = max > 0 ? value / max : 0;
      const intensity = ratio === 0 ? 0 : ratio <= 1 / 3 ? 1 : ratio <= 2 / 3 ? 2 : 3;
      if (intensity > 0) {
        bodyParts.push({ slug, intensity });
      }
    });

    return bodyParts;
  };

  const bodyData = getExtendedBodyParts(workouts);

  const intensityColors = [
    theme.colors.success, // low intensity
    theme.colors.warning, // medium intensity
    theme.colors.error    // high intensity
  ];

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <Pressable
          style={[styles.toggleButton, selectedView === 'front' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('front')}
        >
          <Text style={[styles.toggleText, selectedView === 'front' && styles.toggleButtonActive]}>
            {t('muscleMap.frontView')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, selectedView === 'back' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('back')}
        >
          <Text style={[styles.toggleText, selectedView === 'back' && styles.toggleButtonActive]}>
            {t('muscleMap.backView')}
          </Text>
        </Pressable>
      </View>
      <Animated.View style={[styles.bodyContainer, containerStyle]}>
        <Body
          data={bodyData}
          side={selectedView}
          gender={settings.gender}
          colors={intensityColors}
        />
      </Animated.View>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{t('muscleMap.muscleRestState')}</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColors[0] }]} />
            <Text style={styles.legendText}>{t('muscleMap.lowIntensity')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColors[1] }]} />
            <Text style={styles.legendText}>{t('muscleMap.mediumIntensity')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColors[2] }]} />
            <Text style={styles.legendText}>{t('muscleMap.highIntensity')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      width: '100%'
    },
    viewToggle: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.full,
      padding: theme.spacing.xs
    },
    toggleButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full
    },
    toggleButtonActive: {
      backgroundColor: theme.colors.primary,
      color: 'white'
    },
    toggleText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm
    },
    bodyContainer: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md
    },
    legend: {
      backgroundColor: theme.colors.background.main,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
      width: '100%'
    },
    legendTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center'
    },
    legendItems: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    legendColor: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: theme.spacing.sm
    },
    legendText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm
    }
  });
};
