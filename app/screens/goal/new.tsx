import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { ChevronDown, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';
import ExerciseList, { getMuscleGroups, getPredefinedExercises } from '@/app/components/ExerciseList';
import Animated, { FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import Header from '@/app/components/Header';
import Text from '@/app/components/ui/Text';

SplashScreen.preventAutoHideAsync();

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    header: {
      paddingTop: theme.spacing.xl * 1.5,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...theme.shadows.md
    },
    title: {
      marginBottom: theme.spacing.xl
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg
    },
    formCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm
    },
    sectionTitle: {
      marginBottom: theme.spacing.md
    },
    formGroup: {
      marginBottom: theme.spacing.base
    },
    formLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginBottom: theme.spacing.sm
    },
    formInput: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      flex: 1,
      height: 48
    },
    weightInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    suggestedButton: {
      backgroundColor: theme.colors.background.button,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 80
    },
    suggestedButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      ...theme.shadows.lg
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.background.button,
      ...theme.shadows.sm
    },
    saveButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    modalContainer: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '100%',
      height: '80%',
      ...theme.shadows.lg
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center'
    },
    modalCloseButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm
    },
    searchIcon: {
      marginRight: theme.spacing.sm
    },
    searchInput: {
      backgroundColor: theme.colors.background.input, // Reuse for consistency inside container
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      flex: 1, // Make search input take available space
      height: 24, // Match icon size roughly
      padding: 0 // Remove padding, handled by container
    },
    exerciseList: {
      // No specific styles needed here, ScrollView manages layout
    },
    exerciseOption: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    exerciseOptionText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    },
    muscleGroupContainer: {
      marginBottom: theme.spacing.base // Add margin between groups
    },
    muscleGroupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      backgroundColor: theme.colors.background.button, // Distinguish header slightly
      width: '100%' // Ensure header takes full width
    },
    muscleGroupTitle: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    exerciseGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
      width: '100%',
      backgroundColor: theme.colors.background.card // Match card background
    },
    exerciseButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.input,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    exerciseButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    exerciseButtonText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm
    },
    exerciseButtonTextSelected: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    cancelButton: {
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.md
    },
    cancelButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    exerciseSelectorButton: { // Style for the touchable opacity wrapping the selector text/icon
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // Reuse formInput styles for appearance consistency
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      height: 48,
      flex: 1
    },
    exerciseSelectorText: { // Style for the text inside the selector button
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      flex: 1,
      marginRight: theme.spacing.sm
    },
    loadingIndicator: { // Style for the loading indicator
      marginLeft: theme.spacing.sm
    },
    // Added for completeness, if used elsewhere
    useSuggestedButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginLeft: theme.spacing.sm,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 80
    },
    useSuggestedButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm
    },
    suggestedTargetContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder
    },
    suggestedTargetText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
      flex: 1
    },
    goalTypeDescription: {
      marginBottom: theme.spacing.lg
    },
    inputLabel: {
      marginBottom: theme.spacing.sm
    },
    inputDescription: {
      marginTop: theme.spacing.xs
    }
  });
};

export default function NewGoalScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme(); // Get the theme object
  const styles = useStyles(); // Generate styles based on the theme
  const [newGoalExercise, setNewGoalExercise] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTarget, setSuggestedTarget] = useState<number | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [isLoadingLastWorkout, setIsLoadingLastWorkout] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
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
        const muscleGroups = getMuscleGroups(t as (key: string) => string);
        const predefinedExercises = getPredefinedExercises(t as (key: string) => string);
        const predefinedExercisesList = Object.values(predefinedExercises).flat();
        const allExercises = Array.from(new Set([
          ...uniqueExercises,
          ...predefinedExercisesList
        ]));

        setExerciseOptions(allExercises as string[]); // Assurer le type string[]

      } catch (error) {
        console.error(t('common.errorLoadingWorkouts'), error);
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
    return Math.ceil((currentWeight + suggestedImprovement) / roundingFactor) * roundingFactor;
  }, []);

  const saveGoal = async () => {
    // Validate inputs
    if (!newGoalExercise.trim() || !newGoalCurrent || !newGoalTarget) {
      Alert.alert(
        t('common.error'),
        t('goals.pleaseCompleteAllFields'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    const current = parseFloat(newGoalCurrent);
    const target = parseFloat(newGoalTarget);

    if (isNaN(current) || isNaN(target) || current <= 0 || target <= 0) {
      Alert.alert(
        t('common.error'),
        t('goals.invalidWeightValues'),
        [{ text: t('common.ok') }]
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
      console.error(t('common.errorSavingWorkouts'), error);
      Alert.alert(
        t('common.error'),
        t('goals.errorSavingGoal'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleMuscleGroupSelect = (muscleGroup: string) => {
    setSelectedMuscleGroup(muscleGroup);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Header title={t('goals.addGoal')} showBackButton={true} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View
          entering={FadeIn.duration(400).delay(100)}
          style={styles.formCard}
        >
          <Text variant="subheading" style={styles.sectionTitle}>{t('goals.goalDetails')}</Text>

          <View style={styles.formGroup}>
            <Text variant="body" style={styles.formLabel}>{t('timer.exercise')}</Text>
            <TouchableOpacity
              style={styles.exerciseSelectorButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowExerciseSelector(true);
              }}
            >
              <Text
                style={[
                  styles.exerciseSelectorText,
                  !newGoalExercise && { color: theme.colors.text.secondary }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {newGoalExercise || t('goals.selectExerciseForGoal')}
              </Text>
              <ChevronDown color={theme.colors.text.secondary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text variant="body" style={styles.formLabel}>{t('goals.currentWeight')}</Text>
            <Text variant="caption" style={styles.inputDescription}>{t('goals.currentWeightDescription')}</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor={theme.colors.text.secondary}
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
                    <ActivityIndicator size="small" color={theme.colors.text.primary} style={styles.loadingIndicator} />
                  ) : (
                    <Text style={styles.suggestedButtonText}>{t('goals.useLastWorkout')}</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text variant="body" style={styles.formLabel}>{t('goals.targetWeight')}</Text>
            <Text variant="caption" style={styles.inputDescription}>{t('goals.targetWeightDescription')}</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor={theme.colors.text.disabled}
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
                  <Text style={styles.suggestedButtonText}>{t('goals.useSuggested')}</Text>
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
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Exercise Selector Modal */}
      <Modal
        visible={showExerciseSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExerciseSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('goals.selectExerciseForGoal')}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowExerciseSelector(false)}
              >
                <X color={theme.colors.text.primary} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              <ExerciseList
                selectedMuscle={selectedMuscleGroup as string}
                setSelectedMuscle={(muscleGroup) => {
                  // Ne ferme pas la modale lors de la sélection d'un groupe musculaire
                  handleMuscleGroupSelect(muscleGroup);
                }}
                exercise={newGoalExercise}
                setExercise={(exercise) => {
                  setNewGoalExercise(exercise);
                  // Ferme la modale uniquement lors de la sélection d'un exercice
                  setShowExerciseSelector(false);

                  // Auto-populate current weight and suggest target
                  setIsLoadingLastWorkout(true);
                  const currentWeightPromise = getCurrentWeight(exercise);
                  if (currentWeightPromise) {
                    currentWeightPromise.then(currentWeight => {
                      if (currentWeight) {
                        setNewGoalCurrent(currentWeight.toString());
                        const target = suggestTargetWeight(currentWeight);
                        if (target) {
                          setSuggestedTarget(target);
                        }
                      }
                      setIsLoadingLastWorkout(false);
                    });
                  } else {
                    setIsLoadingLastWorkout(false);
                  }
                }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
