import React, { useCallback } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp, Plus, Search } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import { ExerciseCardSkeleton } from '@/app/components/ui/SkeletonComponents';
import { Exercise } from '@/app/types/routine';

export type MuscleGroupKey =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core';

// Define muscle groups using translation keys
export const muscleGroupKeys: MuscleGroupKey[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core',
];

export const getMuscleGroups = (t: (key: string) => string) => {
  return muscleGroupKeys.map((key) => t(`muscleGroups.${key}`));
};

export const predefinedExercisesByKey: Record<MuscleGroupKey, string[]> = {
  chest: [
    'exercise_chest_benchPress',
    'exercise_chest_inclineBenchPress',
    'exercise_chest_declineBenchPress',
    'exercise_chest_dumbbellFlyes',
    'exercise_chest_cableCrossover',
  ],
  back: [
    'exercise_back_pullUps',
    'exercise_back_latPulldown',
    'exercise_back_barbellRow',
    'exercise_back_dumbbellRow',
    'exercise_back_tBarRow',
  ],
  legs: [
    'exercise_legs_squat',
    'exercise_legs_deadlift',
    'exercise_legs_legPress',
    'exercise_legs_lunges',
    'exercise_legs_legExtension',
  ],
  shoulders: [
    'exercise_shoulders_militaryPress',
    'exercise_shoulders_lateralRaises',
    'exercise_shoulders_frontRaises',
    'exercise_shoulders_rearDeltFlyes',
    'exercise_shoulders_shrugs',
  ],
  biceps: [
    'exercise_biceps_barbellCurl',
    'exercise_biceps_dumbbellCurl',
    'exercise_biceps_hammerCurl',
    'exercise_biceps_preacherCurl',
    'exercise_biceps_concentrationCurl',
  ],
  triceps: [
    'exercise_triceps_cableExtension',
    'exercise_triceps_skullCrushers',
    'exercise_triceps_overheadExtension',
    'exercise_triceps_dips',
    'exercise_triceps_closegripBenchPress',
  ],
  core: [
    'exercise_core_plank',
    'exercise_core_russianTwist',
    'exercise_core_legRaises',
    'exercise_core_crunches',
    'exercise_core_hangingKneeRaises',
  ],
};

export const getPredefinedExercises = (t: (key: string) => string) => {
  const result: Record<string, Exercise[]> = {};

  muscleGroupKeys.forEach((key) => {
    // Translate both the muscle group key and each exercise name
    result[t(`muscleGroups.${key}`)] = predefinedExercisesByKey[key].map((exerciseKey) => ({
      name: t(exerciseKey),
      key: exerciseKey,
      translationKey: exerciseKey,
      series: [], // par défaut vide, à remplir lors de l'ajout à une routine
    }));
  });

  return result;
};

const muscleImagesByKey: Record<MuscleGroupKey, any> = {
  chest: require('../../../assets/images/muscles/chest.png'),
  back: require('../../../assets/images/muscles/back.png'),
  legs: require('../../../assets/images/muscles/legs.png'),
  shoulders: require('../../../assets/images/muscles/shoulders.png'),
  biceps: require('../../../assets/images/muscles/biceps.png'),
  triceps: require('../../../assets/images/muscles/triceps.png'),
  core: require('../../../assets/images/muscles/core.png'),
};

interface ExerciseListProps {
  selectedMuscle: string;
  setSelectedMuscle: (muscleGroup: string, muscleKey?: string) => void;
  exercise: string;
  setExercise: (exercise: string, exerciseKey?: string) => void;
  setIsCustomExercise?: (isCustom: boolean) => void;
  onExerciseSelect?: (exercise: string, exerciseKey?: string) => void;
  onMuscleSelect?: (muscleGroup: string) => void;
  isLoading?: boolean;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  selectedMuscle,
  setSelectedMuscle,
  exercise,
  setExercise,
  setIsCustomExercise,
  onExerciseSelect,
  onMuscleSelect,
  isLoading,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedMuscleGroups, setExpandedMuscleGroups] = React.useState<string[]>([]);
  const [filteredExercises, setFilteredExercises] = React.useState<{ [key: string]: Exercise[] }>({});

  // Get translated muscle groups and predefined exercises
  const muscleGroups = getMuscleGroups(t as (key: string) => string);
  const predefinedExercises = getPredefinedExercises(t as (key: string) => string);

  // Function to toggle expanded state of a muscle group
  const toggleMuscleGroupExpanded = useCallback(
    (muscleGroup: string) => {
      setExpandedMuscleGroups((prev) =>
        prev.includes(muscleGroup)
          ? prev.filter((group) => group !== muscleGroup)
          : [...prev, muscleGroup],
      );
    },
    [setExpandedMuscleGroups],
  );

  // Handle search filtering
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExercises({});
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered: { [key: string]: Exercise[] } = {};

    Object.entries(predefinedExercises).forEach(([muscleGroup, exercises]) => {
      const matchingExercises = exercises.filter((ex) =>
        ex.name.toLowerCase().includes(query),
      );

      if (matchingExercises.length > 0) {
        filtered[muscleGroup] = matchingExercises;

        // Auto-expand muscle groups with matching exercises
        if (!expandedMuscleGroups.includes(muscleGroup)) {
          setExpandedMuscleGroups((prev) => [...prev, muscleGroup]);
        }
      }
    });

    setFilteredExercises(filtered);
  }, [searchQuery, expandedMuscleGroups]);

  return (
    <>
      {/* Search Bar */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color={theme.colors.text.secondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('workout.searchExercises')}
            placeholderTextColor={theme.colors.text.secondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <ChevronUp color={theme.colors.text.secondary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {isLoading ? (
        <View style={styles.container}>
          <ExerciseCardSkeleton />
          <ExerciseCardSkeleton />
          <ExerciseCardSkeleton />
        </View>
      ) : (
        <Animated.View entering={FadeIn.duration(500).delay(100)}>
          {muscleGroups.map((muscleGroup, index) => {
            // If searching, only show muscle groups with matching exercises
            if (
              searchQuery &&
              Object.keys(filteredExercises).length > 0 &&
              !filteredExercises[muscleGroup]
            ) {
              return null;
            }

            const isExpanded = expandedMuscleGroups.includes(muscleGroup);
            const isSelected = selectedMuscle === muscleGroup;

            // Get the exercises to display (filtered or all)
            const exercisesToDisplay =
              searchQuery && filteredExercises[muscleGroup]
                ? filteredExercises[muscleGroup]
                : predefinedExercises[muscleGroup as keyof typeof predefinedExercises];

            return (
              <Animated.View
                key={muscleGroup}
                entering={FadeIn.duration(400).delay(100 + index * 50)}
                style={styles.collapsibleSection}
              >
                {/* Muscle Group Header */}
                <TouchableOpacity
                  style={[styles.collapsibleHeader, isSelected && styles.collapsibleHeaderSelected]}
                  onPress={() => {
                    toggleMuscleGroupExpanded(muscleGroup);
                    if (selectedMuscle !== muscleGroup) {
                      const muscleKey = muscleGroupKeys[index];
                      setSelectedMuscle(muscleGroup, muscleKey);
                      if (setIsCustomExercise) {
                        setIsCustomExercise(false);
                      }
                      if (onMuscleSelect) {
                        onMuscleSelect(muscleGroup);
                      }
                    }
                  }}
                >
                  <View style={styles.muscleButtonContent}>
                    <Image
                      source={muscleImagesByKey[muscleGroupKeys[index]]}
                      style={[styles.muscleIcon, { width: 32, height: 32 }]}
                      resizeMode="contain"
                    />
                    <Text variant="body" style={styles.muscleButtonText}>
                      {muscleGroup}
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp
                      color={isSelected ? theme.colors.text.primary : theme.colors.primary}
                      size={20}
                    />
                  ) : (
                    <ChevronDown
                      color={isSelected ? theme.colors.text.primary : theme.colors.primary}
                      size={20}
                    />
                  )}
                </TouchableOpacity>

                {/* Exercises List (Collapsible) */}
                {isExpanded && (
                  <Animated.View entering={FadeIn.duration(300)} style={styles.collapsibleContent}>
                    {exercisesToDisplay.map((ex, exIndex) => (
                      <Animated.View
                        key={ex.key}
                        entering={SlideInRight.duration(200).delay(50 + exIndex * 30)}
                      >
                        <TouchableOpacity
                          style={[
                            styles.exerciseListItem,
                            exercise === ex.name && styles.exerciseListItemSelected,
                          ]}
                          onPress={() => {
                            setExercise(ex.name, ex.translationKey);
                            // Notify parent component that an exercise was selected
                            if (onExerciseSelect) {
                              onExerciseSelect(ex.name, ex.translationKey);
                            }
                          }}
                        >
                          <Text variant="body" style={styles.exerciseName}>
                            {ex.name}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    ))}

                    {/* Custom Exercise Button */}
                    {setIsCustomExercise && (
                      <Animated.View entering={FadeIn.duration(300).delay(100)}>
                        <TouchableOpacity
                          style={styles.customExerciseButton}
                          onPress={() => {
                            setSelectedMuscle(muscleGroup, muscleGroupKeys[index]);
                            setIsCustomExercise(true);
                          }}
                        >
                          <Plus color={theme.colors.primary} size={20} />
                          <Text variant="body" style={styles.customExerciseButtonText}>
                            {t('workout.customExercise')}
                          </Text>
                        </TouchableOpacity>
                      </Animated.View>
                    )}
                  </Animated.View>
                )}
              </Animated.View>
            );
          })}
        </Animated.View>
      )}
    </>
  );
};

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    searchContainer: {
      marginBottom: theme.spacing.lg,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
    },
    collapsibleSection: {
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.card,
    },
    collapsibleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    collapsibleHeaderSelected: {
      backgroundColor: theme.colors.primaryLight,
    },
    muscleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    muscleIcon: {
      marginRight: theme.spacing.sm,
      borderRadius: 40,
    },
    muscleButtonText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
    },
    collapsibleContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    exerciseListItem: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      marginLeft: theme.spacing.lg,
    },
    exerciseListItemSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.sm,
      borderBottomColor: 'transparent',
    },
    exerciseName: {
      marginBottom: theme.spacing.xs,
    },
    customExerciseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.lg,
    },
    customExerciseButtonText: {
      textAlign: 'center',
    },
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
  });
};

export default ExerciseList;
