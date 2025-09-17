import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { Star } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/app/hooks/useTheme';
import useHaptics from '@/app/hooks/useHaptics';
import Text from '@/app/components/ui/Text';
import { Exercise } from '@/types/common';
import { MuscleGroupKey } from './InteractiveMuscleMap';

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: (exerciseName: string) => void;
  onSelect: (exercise: Exercise) => void;
}

// Mapping des exercices vers leurs images (utilise les images de muscles existantes pour l'instant)
const exerciseToImage: Record<string, any> = {
  // Chest exercises
  'exercise_chest_benchPress': require('../../../assets/images/muscles/chest.png'),
  'exercise_chest_inclineBenchPress': require('../../../assets/images/muscles/chest.png'),
  'exercise_chest_declineBenchPress': require('../../../assets/images/muscles/chest.png'),
  'exercise_chest_dumbbellFlyes': require('../../../assets/images/muscles/chest.png'),
  'exercise_chest_cableCrossover': require('../../../assets/images/muscles/chest.png'),
  
  // Back exercises
  'exercise_back_pullUps': require('../../../assets/images/muscles/back.png'),
  'exercise_back_latPulldown': require('../../../assets/images/muscles/back.png'),
  'exercise_back_barbellRow': require('../../../assets/images/muscles/back.png'),
  'exercise_back_dumbbellRow': require('../../../assets/images/muscles/back.png'),
  'exercise_back_tBarRow': require('../../../assets/images/muscles/back.png'),
  'exercise_back_uprightRow': require('../../../assets/images/muscles/back.png'),
  'exercise_back_facePulls': require('../../../assets/images/muscles/back.png'),
  
  // Shoulder exercises
  'exercise_shoulders_militaryPress': require('../../../assets/images/muscles/shoulders.png'),
  'exercise_shoulders_lateralRaises': require('../../../assets/images/muscles/shoulders.png'),
  'exercise_shoulders_frontRaises': require('../../../assets/images/muscles/shoulders.png'),
  'exercise_shoulders_rearDeltFlyes': require('../../../assets/images/muscles/shoulders.png'),
  'exercise_shoulders_shrugs': require('../../../assets/images/muscles/shoulders.png'),
  
  // Bicep exercises
  'exercise_biceps_barbellCurl': require('../../../assets/images/muscles/biceps.png'),
  'exercise_biceps_dumbbellCurl': require('../../../assets/images/muscles/biceps.png'),
  'exercise_biceps_hammerCurl': require('../../../assets/images/muscles/biceps.png'),
  'exercise_biceps_preacherCurl': require('../../../assets/images/muscles/biceps.png'),
  'exercise_biceps_concentrationCurl': require('../../../assets/images/muscles/biceps.png'),
  
  // Tricep exercises
  'exercise_triceps_cableExtension': require('../../../assets/images/muscles/triceps.png'),
  'exercise_triceps_skullCrushers': require('../../../assets/images/muscles/triceps.png'),
  'exercise_triceps_overheadExtension': require('../../../assets/images/muscles/triceps.png'),
  'exercise_triceps_dips': require('../../../assets/images/muscles/triceps.png'),
  'exercise_triceps_closegripBenchPress': require('../../../assets/images/muscles/triceps.png'),
  
  // Core exercises
  'exercise_core_plank': require('../../../assets/images/muscles/core.png'),
  'exercise_core_russianTwist': require('../../../assets/images/muscles/core.png'),
  'exercise_core_legRaises': require('../../../assets/images/muscles/core.png'),
  'exercise_core_crunches': require('../../../assets/images/muscles/core.png'),
  'exercise_core_hangingKneeRaises': require('../../../assets/images/muscles/core.png'),
  'exercise_core_sidePlank': require('../../../assets/images/muscles/core.png'),
  'exercise_core_obliqueCrunches': require('../../../assets/images/muscles/core.png'),
  'exercise_core_woodChops': require('../../../assets/images/muscles/core.png'),
  
  // Leg exercises
  'exercise_legs_squat': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_deadlift': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_legPress': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_lunges': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_legExtension': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_frontSquat': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_bulgarianSplitSquat': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_legCurls': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_romanianDeadlift': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_goodMornings': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_gluteHamRaises': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_sideLunges': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_clamshells': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_hipAbduction': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_lateralWalks': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_sumoSquats': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_hipAdduction': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_innerThighLifts': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_adductorMachine': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_calfRaises': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_seatedCalfRaises': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_boxJumps': require('../../../assets/images/muscles/legs.png'),
  
  // Forearm exercises (utilise biceps pour l'instant)
  'exercise_forearms_wristCurls': require('../../../assets/images/muscles/biceps.png'),
  'exercise_forearms_reverseCurls': require('../../../assets/images/muscles/biceps.png'),
  'exercise_forearms_farmerWalk': require('../../../assets/images/muscles/biceps.png'),
  'exercise_forearms_gripTraining': require('../../../assets/images/muscles/biceps.png'),
  
  // Cardio exercises (utilise core pour l'instant)
  'exercise_cardio_running': require('../../../assets/images/muscles/core.png'),
  'exercise_cardio_cycling': require('../../../assets/images/muscles/core.png'),
  'exercise_cardio_rowing': require('../../../assets/images/muscles/core.png'),
  'exercise_cardio_jumpingJacks': require('../../../assets/images/muscles/core.png'),
  'exercise_cardio_burpees': require('../../../assets/images/muscles/core.png'),
};

// Image par défaut pour les exercices non mappés
const defaultExerciseImage = require('../../../assets/images/muscles/core.png');

export default function ExerciseCard({
  exercise,
  isFavorite,
  onToggleFavorite,
  onSelect
}: ExerciseCardProps) {
  const { theme } = useTheme();
  const { impactLight, impactMedium } = useHaptics();
  const styles = useStyles();

  const handleToggleFavorite = () => {
    impactLight();
    onToggleFavorite(exercise.name);
  };

  const handleSelect = () => {
    impactMedium();
    onSelect(exercise);
  };

  // Obtenir l'image de l'exercice
  const getExerciseImage = () => {
    return exerciseToImage[exercise.key] || defaultExerciseImage;
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={handleSelect}
        activeOpacity={0.7}
      >
        {/* Image de l'exercice */}
        <View style={styles.imageContainer}>
          <Image
            source={getExerciseImage()}
            style={styles.exerciseImage}
            resizeMode="contain"
          />
          
          {/* Bouton favori */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Star
              size={20}
              color={isFavorite ? theme.colors.warning : theme.colors.text.secondary}
              fill={isFavorite ? theme.colors.warning : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {/* Nom de l'exercice */}
        <View style={styles.labelContainer}>
          <Text variant="body" style={styles.exerciseName} numberOfLines={2}>
            {exercise.name}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    cardContainer: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      overflow: 'hidden',
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    imageContainer: {
      position: 'relative',
      height: 120,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    exerciseImage: {
      width: '100%',
      height: '100%',
    },
    favoriteButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.background.main,
      borderRadius: theme.borderRadius.full,
      padding: theme.spacing.xs,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    labelContainer: {
      padding: theme.spacing.md,
      minHeight: 50,
      justifyContent: 'center',
    },
    exerciseName: {
      color: theme.colors.text.primary,
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.medium,
      lineHeight: 20,
    },
  });
};
