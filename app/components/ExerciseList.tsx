import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChevronDown, ChevronUp, Plus, Search } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

// Define muscle groups using translation keys
export const muscleGroupKeys = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core'
];

// Function to get translated muscle groups
export const getMuscleGroups = (t: (key: string) => string) => {
  return muscleGroupKeys.map(key => t(key));
};

// Define exercises for each muscle group
export const predefinedExercisesByKey = {
  'chest': ['Développé couché', 'Développé incliné', 'Développé décliné', 'Écarté avec haltères', 'Crossover à la poulie'],
  'back': ['Tractions', 'Tirage vertical', 'Rowing barre', 'Rowing haltère', 'Rowing T-Bar'],
  'legs': ['Squat', 'Soulevé de terre', 'Presse à jambes', 'Fentes', 'Extension des jambes'],
  'shoulders': ['Développé militaire', 'Élévations latérales', 'Élévations frontales', 'Oiseau pour deltoïdes postérieurs', 'Haussements d\'épaules'],
  'biceps': ['Curl barre', 'Curl haltères', 'Curl marteau', 'Curl au pupitre', 'Curl concentration'],
  'triceps': ['Extension à la poulie', 'Barre au front', 'Extension au-dessus de la tête', 'Dips', 'Développé couché prise serrée'],
  'core': ['Planche', 'Twists russes', 'Relevés de jambes', 'Crunchs', 'Relevés de genoux suspendu']
};

// Function to get predefined exercises with translated muscle group names
export const getPredefinedExercises = (t: (key: string) => string) => {
  const result: { [key: string]: string[] } = {};

  muscleGroupKeys.forEach(key => {
    result[t(key)] = predefinedExercisesByKey[key];
  });

  return result;
};

const muscleImagesByKey = {
  'chest': require('../../assets/images/muscles/chest.png'),
  'back': require('../../assets/images/muscles/back.png'),
  'legs': require('../../assets/images/muscles/legs.png'),
  'shoulders': require('../../assets/images/muscles/shoulders.png'),
  'biceps': require('../../assets/images/muscles/biceps.png'),
  'triceps': require('../../assets/images/muscles/triceps.png'),
  'core': require('../../assets/images/muscles/core.png')
};


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
                                                            onExerciseSelect
                                                          }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedMuscleGroups, setExpandedMuscleGroups] = React.useState<string[]>([]);
  const [filteredExercises, setFilteredExercises] = React.useState<{ [key: string]: string[] }>({});

  // Get translated muscle groups and predefined exercises
  const muscleGroups = getMuscleGroups(t);
  const predefinedExercises = getPredefinedExercises(t);

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
    const filtered: { [key: string]: string[] } = {};

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
                  <Image
                    source={muscleImagesByKey[muscleGroupKeys[index]]}
                    style={[
                      styles.muscleIcon,
                      { width: 32, height: 32 }
                    ]}
                    resizeMode="contain"
                  />
                  <Text style={[
                    styles.muscleButtonText,
                    isSelected && styles.muscleButtonTextSelected
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
                          exercise === ex && styles.exerciseListItemSelected
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
                          exercise === ex && styles.exerciseListItemTextSelected
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
      marginBottom: theme.spacing.lg
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm
    },
    searchIcon: {
      marginRight: theme.spacing.sm
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      height: 30
    },
    collapsibleSection: {
      marginBottom: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.card
    },
    collapsibleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md
    },
    collapsibleHeaderSelected: {
      backgroundColor: theme.colors.primary
    },
    muscleButtonContent: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    muscleIcon: {
      marginRight: theme.spacing.sm,
      borderRadius: 40
    },
    muscleButtonText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary
    },
    muscleButtonTextSelected: {
      color: theme.colors.text.primary
    },
    collapsibleContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xs
    },
    exerciseListItem: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      marginLeft: theme.spacing.lg
    },
    exerciseListItemSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.sm,
      borderBottomColor: 'transparent'
    },
    exerciseListItemText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary
    },
    exerciseListItemTextSelected: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    customExerciseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      marginLeft: theme.spacing.lg
    },
    customExerciseButtonText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm
    }
  });
};

export default ExerciseList;
