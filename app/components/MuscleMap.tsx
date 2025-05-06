import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { differenceInHours } from 'date-fns';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import Text from './ui/Text';
import { Workout } from '@/types/workout';

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
  'Chest': muscleSlugs.CHEST,
  'Back': muscleSlugs.UPPER_BACK,
  'Legs': muscleSlugs.QUADRICEPS,
  'Shoulders': muscleSlugs.DELTOIDS,
  'Biceps': muscleSlugs.BICEPS,
  'Triceps': muscleSlugs.TRICEPS,
  'Core': muscleSlugs.ABS
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
    theme.colors.error,          // 0-24h (rouge)
    theme.colors.text.warning,   // 24-72h (remplacé bordeaux par warning)
    theme.colors.text.disabled   // 72h+ (gris)
  ];

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <Pressable
          style={[styles.toggleButton, selectedView === 'front' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('front')}>
          <Text style={[styles.toggleText, selectedView === 'front' && styles.toggleButtonActive]}>
            {t('muscleMap.frontView')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, selectedView === 'back' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('back')}>
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
          colors={intensityColorsArray}
        />
      </Animated.View>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>{t('muscleMap.muscleRestState')}</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColorsArray[0] }]} />
            <Text style={styles.legendText}>{t('muscleMap.restPeriod0to24')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColorsArray[1] }]} />
            <Text style={styles.legendText}>{t('muscleMap.restPeriod24to72')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: intensityColorsArray[2] }]} />
            <Text style={styles.legendText}>{t('muscleMap.restPeriod72plus')}</Text>
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
