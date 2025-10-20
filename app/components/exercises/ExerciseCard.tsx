import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { Star, Info } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTheme } from '@/app/hooks/useTheme';
import useHaptics from '@/app/hooks/useHaptics';
import Text from '@/app/components/ui/Text';
import { Exercise } from '@/types/common';
import { MuscleGroupKey } from './InteractiveMuscleMap';
import { defaultExerciseImage, exerciseToImage } from '@/app/components/exercises/index';

interface ExerciseCardProps {
  exercise: Exercise;
  isFavorite: boolean;
  onToggleFavorite: (exerciseName: string) => void;
  onSelect: (exercise: Exercise) => void;
  onInfo?: (exercise: Exercise) => void;
}

export default function ExerciseCard({
  exercise,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onInfo
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

  const handleInfo = () => {
    impactLight();
    onInfo?.(exercise);
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

          {/* Bouton info */}
          {onInfo && (
            <TouchableOpacity
              style={styles.infoButton}
              onPress={handleInfo}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Info
                size={18}
                color={theme.colors.text.primary}
              />
            </TouchableOpacity>
          )}
          
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
    infoButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
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
      fontFamily: theme.typography.fontFamily.regular,
      lineHeight: 20,
    },
  });
};
