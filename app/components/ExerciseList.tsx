import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ChevronDown, ChevronUp, Search, Plus } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

// Import the muscle groups and predefined exercises from the original file
import { muscleGroups, muscleGroupIcons, predefinedExercises } from '../workout/new';

interface ExerciseListProps {
  selectedMuscle: string;
  setSelectedMuscle: (muscleGroup: string) => void;
  exercise: string;
  setExercise: (exercise: string) => void;
  setIsCustomExercise?: (isCustom: boolean) => void;
  onExerciseSelect?: (exercise: string) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  selectedMuscle,
  setSelectedMuscle,
  exercise,
  setExercise,
  setIsCustomExercise,
  onExerciseSelect,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedMuscleGroups, setExpandedMuscleGroups] = React.useState<string[]>([]);
  const [filteredExercises, setFilteredExercises] = React.useState<{[key: string]: string[]}>({});

  // Function to toggle expanded state of a muscle group
  const toggleMuscleGroupExpanded = (muscleGroup: string) => {
    setExpandedMuscleGroups(prev => 
      prev.includes(muscleGroup) 
        ? prev.filter(group => group !== muscleGroup)
        : [...prev, muscleGroup]
    );
  };

  // Handle search filtering
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredExercises({});
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered: {[key: string]: string[]} = {};

    Object.entries(predefinedExercises).forEach(([muscleGroup, exercises]) => {
      const matchingExercises = exercises.filter(ex => 
        ex.toLowerCase().includes(query)
      );

      if (matchingExercises.length > 0) {
        filtered[muscleGroup] = matchingExercises;

        // Auto-expand muscle groups with matching exercises
        if (!expandedMuscleGroups.includes(muscleGroup)) {
          setExpandedMuscleGroups(prev => [...prev, muscleGroup]);
        }
      }
    });

    setFilteredExercises(filtered);
  }, [searchQuery, expandedMuscleGroups]);

  return (
    <>
      {/* Search Bar */}
      <Animated.View
        entering={FadeIn.duration(500)}
        style={styles.searchContainer}
      >
        <View style={styles.searchInputContainer}>
          <Search color={colors.text.secondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchExercises')}
            placeholderTextColor={colors.text.secondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <ChevronUp color={colors.text.secondary} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.duration(500).delay(100)}>
        {muscleGroups.map((muscleGroup, index) => {
          // If searching, only show muscle groups with matching exercises
          if (searchQuery && Object.keys(filteredExercises).length > 0 && !filteredExercises[muscleGroup]) {
            return null;
          }

          const isExpanded = expandedMuscleGroups.includes(muscleGroup);
          const isSelected = selectedMuscle === muscleGroup;

          // Get the exercises to display (filtered or all)
          const exercisesToDisplay = searchQuery && filteredExercises[muscleGroup]
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
                style={[
                  styles.collapsibleHeader,
                  isSelected && styles.collapsibleHeaderSelected
                ]}
                onPress={() => {
                  toggleMuscleGroupExpanded(muscleGroup);
                  if (selectedMuscle !== muscleGroup) {
                    setSelectedMuscle(muscleGroup);
                    setExercise('');
                    if (setIsCustomExercise) {
                      setIsCustomExercise(false);
                    }
                  }
                }}
              >
                <View style={styles.muscleButtonContent}>
                  {React.createElement(muscleGroupIcons[muscleGroup as keyof typeof muscleGroupIcons], {
                    size: 20,
                    color: isSelected ? colors.text.primary : colors.primary,
                    style: styles.muscleIcon
                  })}
                  <Text style={[
                    styles.muscleButtonText,
                    isSelected && styles.muscleButtonTextSelected,
                  ]}>
                    {muscleGroup}
                  </Text>
                </View>
                {isExpanded ? (
                  <ChevronUp color={isSelected ? colors.text.primary : colors.primary} size={20} />
                ) : (
                  <ChevronDown color={isSelected ? colors.text.primary : colors.primary} size={20} />
                )}
              </TouchableOpacity>

              {/* Exercises List (Collapsible) */}
              {isExpanded && (
                <Animated.View
                  entering={FadeIn.duration(300)}
                  style={styles.collapsibleContent}
                >
                  {exercisesToDisplay.map((ex, exIndex) => (
                    <Animated.View
                      key={ex}
                      entering={SlideInRight.duration(200).delay(50 + exIndex * 30)}
                    >
                      <TouchableOpacity
                        style={[
                          styles.exerciseListItem,
                          exercise === ex && styles.exerciseListItemSelected,
                        ]}
                        onPress={() => {
                          setExercise(ex);
                          // Notify parent component that an exercise was selected
                          if (onExerciseSelect) {
                            onExerciseSelect(ex);
                          }
                        }}
                      >
                        <Text style={[
                          styles.exerciseListItemText,
                          exercise === ex && styles.exerciseListItemTextSelected,
                        ]}>
                          {ex}
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
                          setSelectedMuscle(muscleGroup);
                          setIsCustomExercise(true);
                        }}
                      >
                        <Plus color={colors.primary} size={20} />
                        <Text style={styles.customExerciseButtonText}>{t('customExercise')}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </Animated.View>
              )}
            </Animated.View>
          );
        })}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    height: 30,
  },
  collapsibleSection: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  collapsibleHeaderSelected: {
    backgroundColor: colors.primary,
  },
  muscleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muscleIcon: {
    marginRight: spacing.sm,
  },
  muscleButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    color: colors.primary,
  },
  muscleButtonTextSelected: {
    color: colors.text.primary,
  },
  collapsibleContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  exerciseListItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    marginLeft: spacing.lg,
  },
  exerciseListItemSelected: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
    borderBottomColor: 'transparent',
  },
  exerciseListItemText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  exerciseListItemTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  customExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
  },
  customExerciseButtonText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});

export default ExerciseList;
