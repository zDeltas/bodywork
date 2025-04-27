import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { ChevronDown, ChevronUp, Search, Plus } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

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
  const { theme } = useTheme();
  const styles = useStyles();
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
          <Search color={theme.colors.text.secondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchExercises')}
            placeholderTextColor={theme.colors.text.secondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <ChevronUp color={theme.colors.text.secondary} size={20} />
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
                    color: isSelected ? theme.colors.text.primary : theme.colors.primary,
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
                  <ChevronUp color={isSelected ? theme.colors.text.primary : theme.colors.primary} size={20} />
                ) : (
                  <ChevronDown color={isSelected ? theme.colors.text.primary : theme.colors.primary} size={20} />
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
                        <Plus color={theme.colors.primary} size={20} />
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
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      height: 30,
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
      backgroundColor: theme.colors.primary,
    },
    muscleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    muscleIcon: {
      marginRight: theme.spacing.sm,
    },
    muscleButtonText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
    },
    muscleButtonTextSelected: {
      color: theme.colors.text.primary,
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
    exerciseListItemText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
    },
    exerciseListItemTextSelected: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
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
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
    },
  });
};

export default ExerciseList;
