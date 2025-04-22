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
        if (storedWorkouts) {
          const parsedWorkouts = JSON.parse(storedWorkouts);

          // Extract unique exercise names for the exercise selector
          const uniqueExercises = Array.from(new Set(parsedWorkouts.map((w: any) => w.exercise)));

          // Combine with predefined exercises
          const predefinedExercisesList = Object.values(predefinedExercises).flat();
          const allExercises = Array.from(new Set([
            ...uniqueExercises,
            ...predefinedExercisesList
          ]));

          setExerciseOptions(allExercises);
        }
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
          <X color="#fff" size={24} />
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
                <Text style={[styles.exerciseSelectorText, !newGoalExercise && { color: '#666' }]}>
                  {newGoalExercise || t('selectExerciseForGoal')}
                </Text>
                <ChevronDown color="#666" size={20} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>{t('currentWeight')}</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor="#666"
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
                    <ActivityIndicator size="small" color="#fff" />
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
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#fd8f09',
    paddingLeft: 10,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  formInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseSelectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  exerciseSelectorText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedButton: {
    backgroundColor: '#fd8f09',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    shadowColor: '#fd8f09',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#fd8f09',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#fd8f09',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOpacity: 0.2,
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
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
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    padding: 0,
  },
  exerciseList: {
    maxHeight: 400,
    marginVertical: 16,
  },
  exerciseOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exerciseOptionText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  muscleGroupContainer: {
    marginBottom: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  muscleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  muscleGroupTitle: {
    color: '#fd8f09',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  exerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    marginBottom: 8,
  },
  exerciseButtonSelected: {
    backgroundColor: '#fd8f09',
  },
  exerciseButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  exerciseButtonTextSelected: {
    fontFamily: 'Inter-SemiBold',
  },
  cancelButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});
