import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { router } from 'expo-router';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { differenceInHours } from 'date-fns';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
}

interface MuscleMapProps {
  workouts: Workout[];
}

const muscleSlugs: Record<string, Slug> = {
  CHEST: "chest" as Slug,
  ABS: "abs" as Slug,
  BICEPS: "biceps" as Slug,
  UPPER_BACK: "upper-back" as Slug,
  LOWER_BACK: "lower-back" as Slug,
  TRICEPS: "triceps" as Slug,
  DELTOIDS: "deltoids" as Slug,
  TRAPEZIUS: "trapezius" as Slug,
  QUADRICEPS: "quadriceps" as Slug,
  CALVES: "calves" as Slug,
  HAMSTRING: "hamstring" as Slug,
  GLUTEAL: "gluteal" as Slug,
  FOREARM: "forearm" as Slug,
  ADDUCTORS: "adductors" as Slug,
  HAIR: "hair" as Slug,
  NECK: "neck" as Slug,
  HANDS: "hands" as Slug,
  FEET: "feet" as Slug,
  HEAD: "head" as Slug,
  ANKLES: "ankles" as Slug,
  TIBIALIS: "tibialis" as Slug,
  OBLIQUES: "obliques" as Slug,
  KNEES: "knees" as Slug,
};

const muscleGroupToSlug: Record<string, Slug> = {
  'Chest': muscleSlugs.CHEST,
  'Back': muscleSlugs.UPPER_BACK,
  'Legs': muscleSlugs.QUADRICEPS,
  'Shoulders': muscleSlugs.DELTOIDS,
  'Biceps': muscleSlugs.BICEPS,
  'Triceps': muscleSlugs.TRICEPS,
  'Core': muscleSlugs.ABS,
};

export default function MuscleMap({ workouts }: MuscleMapProps) {
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const { settings } = useSettings();
  const { t } = useTranslation();

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
    transform: [{ rotateY: `${rotationValue.value}deg` }],
  }));

  // Calculer l'état de repos des muscles
  const calculateMuscleRestState = (muscleGroup: string): number => {
    const now = new Date();
    const muscleWorkouts = workouts.filter(w => w.muscleGroup === muscleGroup);

    if (muscleWorkouts.length === 0) return 3; // Plus de 72h (gris)

    const lastWorkout = muscleWorkouts.reduce((latest, current) => {
      const currentDate = new Date(current.date);
      const latestDate = new Date(latest.date);
      return currentDate > latestDate ? current : latest;
    });

    const hoursSinceLastWorkout = differenceInHours(now, new Date(lastWorkout.date));

    if (hoursSinceLastWorkout < 24) return 1; // 0-24h (rouge)
    if (hoursSinceLastWorkout < 72) return 2; // 24-72h (bordeaux)
    return 3; // Plus de 72h (gris)
  };

  // Convertir en format ExtendedBodyPart avec les états de repos
  const bodyData: ExtendedBodyPart[] = Object.entries(muscleGroupToSlug).map(([group, slug]) => ({
    slug: slug as Slug,
    intensity: calculateMuscleRestState(group)
  }));

  // Définir les couleurs pour l'intensité sous forme de tableau
  const intensityColorsArray: string[] = [
    colors.error,          // 0-24h (rouge)
    colors.text.warning,   // 24-72h (remplacé bordeaux par warning)
    colors.text.disabled   // 72h+ (gris)
  ];

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <Pressable
          style={[styles.toggleButton, selectedView === 'front' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('front')}>
          <AnimatedText style={[styles.toggleText]}>
            {t('frontView')}
          </AnimatedText>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, selectedView === 'back' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('back')}>
          <AnimatedText style={[styles.toggleText]}>
            {t('backView')}
          </AnimatedText>
        </Pressable>
      </View>
      <Animated.View style={[styles.bodyContainer, containerStyle]}>
        <Body
          data={bodyData}
          side={selectedView}
          gender={settings.gender}
          colors={intensityColorsArray}
        />
      </Animated.View>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{t('muscleRestState')}</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColorsArray[0] }]} />
            <Text style={styles.legendText}>{t('restPeriod0to24')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColorsArray[1] }]} />
            <Text style={styles.legendText}>{t('restPeriod24to72')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColorsArray[2] }]} />
            <Text style={styles.legendText}>{t('restPeriod72plus')}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
    ...theme.shadows.md,
  },
  viewToggle: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.background.button,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  toggleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  bodyContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  legend: {
    backgroundColor: colors.background.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
  },
  legendTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  legendText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
});
