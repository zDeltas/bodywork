import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { X, ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { predefinedExercises, muscleGroups } from '@/app/workout/new';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

SplashScreen.preventAutoHideAsync();

export default function NewGoalScreen() {
  const { t } = useTranslation();
  const [newGoalExercise, setNewGoalExercise] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTarget, setSuggestedTarget] = useState<number | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [isLoadingLastWorkout, setIsLoadingLastWorkout] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Load workouts to get exercise options
  useEffect(() => {
    const loadExerciseOptions = async () => {
      try {
        // Load workouts
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        let parsedWorkouts: any[] = []; // Initialiser comme tableau vide
        if (storedWorkouts) {
          try {
            const parsed = JSON.parse(storedWorkouts);
            if (Array.isArray(parsed)) {
              parsedWorkouts = parsed; // Assigner si c'est un tableau
            } else {
              console.warn('Stored workouts were not an array:', parsed);
            }
          } catch (parseError) {
            console.error('Error parsing workouts:', parseError);
          }
        }

        // Extract unique exercise names for the exercise selector
        const uniqueExercises = Array.from(new Set(parsedWorkouts.map((w: any) => w.exercise)));

        // Combine with predefined exercises
        const predefinedExercisesList = Object.values(predefinedExercises).flat();
        const allExercises = Array.from(new Set([
          ...uniqueExercises,
          ...predefinedExercisesList
        ]));

        setExerciseOptions(allExercises as string[]); // Assurer le type string[]

      } catch (error) {
        console.error(t('errorLoadingWorkouts'), error);
      }
    };

    loadExerciseOptions();
  }, [t]);

  // Function to get the current weight from the most recent workout for the selected exercise
  const getCurrentWeight = useCallback((exerciseName: string) => {
    if (!exerciseName) return null;

    // Get workouts from AsyncStorage
    return AsyncStorage.getItem('workouts')
      .then(existingWorkouts => {
        if (!existingWorkouts) return null;

        const workouts = JSON.parse(existingWorkouts);

        // Filter workouts for the selected exercise
        const exerciseWorkouts = workouts.filter((w: any) => w.exercise === exerciseName);
        if (exerciseWorkouts.length === 0) return null;

        // Sort by date (most recent first)
        exerciseWorkouts.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Return the weight from the most recent workout
        return exerciseWorkouts[0].weight;
      })
      .catch(error => {
        console.error('Error getting current weight:', error);
        return null;
      });
  }, []);

  // Function to suggest a target weight based on incremental improvement
  const suggestTargetWeight = useCallback((currentWeight: number) => {
    if (!currentWeight) return null;

    // Suggest a 5% improvement for weights under 50kg, 2.5% for heavier weights
    const improvementFactor = currentWeight < 50 ? 0.05 : 0.025;
    const suggestedImprovement = currentWeight * improvementFactor;

    // Round to nearest 2.5kg for barbells (simplification)
    const roundingFactor = 2.5;
    const suggestedTarget = Math.ceil((currentWeight + suggestedImprovement) / roundingFactor) * roundingFactor;

    return suggestedTarget;
  }, []);

  const saveGoal = async () => {
    // Validate inputs
    if (!newGoalExercise.trim() || !newGoalCurrent || !newGoalTarget) {
      Alert.alert(
        t('error'),
        t('pleaseCompleteAllFields'),
        [{ text: t('ok') }]
      );
      return;
    }

    const current = parseFloat(newGoalCurrent);
    const target = parseFloat(newGoalTarget);

    if (isNaN(current) || isNaN(target) || current <= 0 || target <= 0) {
      Alert.alert(
        t('error'),
        t('invalidWeightValues'),
        [{ text: t('ok') }]
      );
      return;
    }

    try {
      // Calculate progress
      const progress = Math.min(Math.round((current / target) * 100), 100);

      // Add new goal
      const newGoal = {
        exercise: newGoalExercise,
        current,
        target,
        progress
      };

      // Get existing goals
      const storedGoals = await AsyncStorage.getItem('goals');
      const goals = storedGoals ? JSON.parse(storedGoals) : [];

      // Add new goal
      const updatedGoals = [...goals, newGoal];

      // Save goals to AsyncStorage
      await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));

      // Navigate back to stats screen
      router.push({
        pathname: '/(tabs)',
        params: { refresh: 'true' }
      });
    } catch (error) {
      console.error(t('errorSavingWorkouts'), error);
      Alert.alert(
        t('error'),
        t('errorSavingGoal'),
        [{ text: t('ok') }]
      );
    }
  };


  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('addGoal')}</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <X color={colors.text.primary} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View 
          entering={FadeIn.duration(400).delay(100)} 
          style={styles.formCard}
        >
          <Text style={styles.sectionTitle}>{t('goalDetails')}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>{t('exercise')}</Text>
            <TouchableOpacity
              style={styles.formInput}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowExerciseSelector(true);
              }}
            >
              <View style={styles.exerciseSelectorButton}>
                <Text style={[styles.exerciseSelectorText, !newGoalExercise && { color: colors.text.secondary }]}>
                  {newGoalExercise || t('selectExerciseForGoal')}
                </Text>
                <ChevronDown color={colors.text.secondary} size={20} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>{t('currentWeight')}</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor={colors.text.secondary}
                value={newGoalCurrent}
                onChangeText={setNewGoalCurrent}
                keyboardType="numeric"
              />
              {newGoalExercise && (
                <TouchableOpacity
                  style={styles.suggestedButton}
                  onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsLoadingLastWorkout(true);
                    const currentWeight = await getCurrentWeight(newGoalExercise);
                    if (currentWeight) {
                      setNewGoalCurrent(currentWeight.toString());

                      // Update suggested target when current weight changes
                      const target = suggestTargetWeight(currentWeight);
                      if (target) {
                        setSuggestedTarget(target);
                      }
                    }
                    setIsLoadingLastWorkout(false);
                  }}
                >
                  {isLoadingLastWorkout ? (
                    <ActivityIndicator size="small" color={colors.text.primary} />
                  ) : (
                    <Text style={styles.suggestedButtonText}>{t('useLastWorkout')}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>{t('targetWeight')}</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor="#666"
                value={newGoalTarget}
                onChangeText={setNewGoalTarget}
                keyboardType="numeric"
              />
              {suggestedTarget && (
                <TouchableOpacity
                  style={styles.suggestedButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNewGoalTarget(suggestedTarget.toString());
                  }}
                >
                  <Text style={styles.suggestedButtonText}>{t('useSuggested')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, (!newGoalExercise || !newGoalCurrent || !newGoalTarget) && styles.saveButtonDisabled]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              saveGoal();
            }}
            disabled={!newGoalExercise || !newGoalCurrent || !newGoalTarget}
          >
            <Text style={styles.saveButtonText}>{t('save')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <Animated.View 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(300)}
          style={styles.modalOverlay}
        >
          <Animated.View 
            entering={FadeIn.duration(400).delay(100)} 
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>{t('selectExerciseForGoal')}</Text>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('searchExercise')}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSearchQuery('');
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            {searchQuery ? (
              <ScrollView style={styles.exerciseList}>
                {exerciseOptions
                  .filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((ex, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.exerciseOption}
                      onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setNewGoalExercise(ex);
                        setShowExerciseSelector(false);

                        // Auto-populate current weight and suggest target
                        setIsLoadingLastWorkout(true);
                        const currentWeight = await getCurrentWeight(ex);
                        if (currentWeight) {
                          setNewGoalCurrent(currentWeight.toString());

                          // Update suggested target
                          const target = suggestTargetWeight(currentWeight);
                          if (target) {
                            setSuggestedTarget(target);
                          }
                        }
                        setIsLoadingLastWorkout(false);
                      }}
                    >
                      <Text style={styles.exerciseOptionText}>{ex}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            ) : (
              <ScrollView style={styles.exerciseList}>
                {muscleGroups.map((muscleGroup) => (
                  <View key={muscleGroup} style={styles.muscleGroupContainer}>
                    <TouchableOpacity 
                      style={styles.muscleGroupHeader}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedMuscleGroup(selectedMuscleGroup === muscleGroup ? null : muscleGroup);
                      }}
                    >
                      <Text style={styles.muscleGroupTitle}>{muscleGroup}</Text>
                      <Ionicons 
                        name={selectedMuscleGroup === muscleGroup ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color="#fd8f09" 
                      />
                    </TouchableOpacity>

                    {selectedMuscleGroup === muscleGroup && (
                      <View style={styles.exerciseGrid}>
                        {predefinedExercises[muscleGroup as keyof typeof predefinedExercises].map((ex) => (
                          <TouchableOpacity
                            key={ex}
                            style={[
                              styles.exerciseButton,
                              newGoalExercise === ex && styles.exerciseButtonSelected,
                            ]}
                            onPress={async () => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              setNewGoalExercise(ex);
                              setShowExerciseSelector(false);

                              // Auto-populate current weight and suggest target
                              setIsLoadingLastWorkout(true);
                              const currentWeight = await getCurrentWeight(ex);
                              if (currentWeight) {
                                setNewGoalCurrent(currentWeight.toString());

                                // Update suggested target
                                const target = suggestTargetWeight(currentWeight);
                                if (target) {
                                  setSuggestedTarget(target);
                                }
                              }
                              setIsLoadingLastWorkout(false);
                            }}
                          >
                            <Text style={[
                              styles.exerciseButtonText,
                              newGoalExercise === ex && styles.exerciseButtonTextSelected,
                            ]}>
                              {ex}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowExerciseSelector(false);
              }}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.button,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...theme.shadows.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.sm,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  formInput: {
    backgroundColor: colors.background.input,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    ...theme.shadows.sm,
    fontSize: typography.fontSize.base,
    minHeight: 48,
    justifyContent: 'center',
  },
  exerciseSelectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  exerciseSelectorText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
    ...theme.shadows.sm,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedButtonText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    ...theme.shadows.primary,
  },
  saveButtonDisabled: {
    backgroundColor: colors.background.button,
    ...theme.shadows.sm,
  },
  saveButtonText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  // Exercise Selector Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: theme.zIndex.modal,
  },
  modalContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxHeight: '80%',
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    padding: 0,
    height: 24,
  },
  exerciseList: {
    // Pas de styles spécifiques, géré par ScrollView?
  },
  exerciseOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  exerciseOptionText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
  },
  muscleGroupContainer: {
    marginBottom: spacing.base,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  muscleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.button,
  },
  muscleGroupTitle: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  exerciseButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.input,
  },
  exerciseButtonSelected: {
    backgroundColor: colors.primary,
  },
  exerciseButtonText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
  },
  exerciseButtonTextSelected: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  cancelButton: {
    backgroundColor: colors.background.button,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  }
});
