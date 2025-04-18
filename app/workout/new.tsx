import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export const muscleGroups = [
  'Poitrine',
  'Dos',
  'Jambes',
  'Epaules',
  'Biceps',
  'Triceps',
  'Ceinture abdominale',
];

export const predefinedExercises = {
  'Poitrine': ['Développé couché', 'Développé incliné', 'Développé décliné', 'Écarté avec haltères', 'Crossover à la poulie'],
  'Dos': ['Tractions', 'Tirage vertical', 'Rowing barre', 'Rowing haltère', 'Rowing T-Bar'],
  'Jambes': ['Squat', 'Soulevé de terre', 'Presse à jambes', 'Fentes', 'Extension des jambes'],
  'Epaules': ['Développé militaire', 'Élévations latérales', 'Élévations frontales', 'Oiseau pour deltoïdes postérieurs', 'Haussements d’épaules'],
  'Biceps': ['Curl barre', 'Curl haltères', 'Curl marteau', 'Curl au pupitre', 'Curl concentration'],
  'Triceps': ['Extension à la poulie', 'Barre au front', 'Extension au-dessus de la tête', 'Dips', 'Développé couché prise serrée'],
  'Ceinture abdominale': ['Planche', 'Twists russes', 'Relevés de jambes', 'Crunchs', 'Relevés de genoux suspendu'],
};


export default function NewWorkoutScreen() {
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [rpe, setRpe] = useState('');
  const [suggestedWeight, setSuggestedWeight] = useState<number | null>(null);
  const [isCustomExercise, setIsCustomExercise] = useState(false);
  const params = useLocalSearchParams();
  const selectedDate = params.selectedDate as string;

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

  // Function to calculate suggested weight based on previous workouts
  const calculateSuggestedWeight = useCallback(async (selectedExercise: string, inputReps: string, inputRpe: string) => {
    if (!selectedExercise || !inputReps || !inputRpe) {
      setSuggestedWeight(null);
      return;
    }

    try {
      const existingWorkouts = await AsyncStorage.getItem('workouts');
      if (!existingWorkouts) {
        setSuggestedWeight(null);
        return;
      }

      const workouts = JSON.parse(existingWorkouts);

      // Filter workouts for the same exercise
      const sameExerciseWorkouts = workouts.filter(
        (w: any) => w.exercise === selectedExercise
      ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // If no previous workouts for this exercise, return null
      if (sameExerciseWorkouts.length === 0) {
        setSuggestedWeight(null);
        return;
      }

      // Get the most recent workout for this exercise
      const lastWorkout = sameExerciseWorkouts[0];

      // If the last workout doesn't have RPE, we can't calculate
      if (!lastWorkout.rpe) {
        setSuggestedWeight(lastWorkout.weight);
        return;
      }

      const lastWeight = lastWorkout.weight;
      const lastReps = lastWorkout.reps;
      const lastRpe = lastWorkout.rpe;
      const currentReps = parseInt(inputReps);
      const currentRpe = parseInt(inputRpe);

      // Calculate one-rep max (Epley formula)
      const lastOneRepMax = lastWeight * (1 + lastReps / 30);

      // Adjust based on RPE difference
      // RPE 10 is maximum effort, so we adjust based on how far from max
      const rpeAdjustment = (currentRpe - lastRpe) * 0.03;

      // Calculate suggested weight based on one-rep max, desired reps, and RPE
      let calculatedWeight = lastOneRepMax * (1 - currentReps / 30) * (1 + rpeAdjustment);

      // Round to nearest 2.5kg for barbells or 1kg for dumbbells
      // This is a simplification - in reality, you'd want to adjust based on the equipment type
      const roundingFactor = selectedExercise.toLowerCase().includes('haltères') ? 1 : 2.5;
      calculatedWeight = Math.round(calculatedWeight / roundingFactor) * roundingFactor;

      setSuggestedWeight(calculatedWeight > 0 ? calculatedWeight : lastWeight);
    } catch (error) {
      console.error('Error calculating suggested weight:', error);
      setSuggestedWeight(null);
    }
  }, []);

  const saveWorkout = async () => {
    try {
      const workout = {
        id: Date.now().toString(),
        muscleGroup: selectedMuscle,
        exercise,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || 0,
        sets: parseInt(sets) || 0,
        rpe: parseInt(rpe) || 0,
        date: selectedDate ? `${selectedDate}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString(),
      };

      const existingWorkouts = await AsyncStorage.getItem('workouts');
      const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
      workouts.push(workout);
      await AsyncStorage.setItem('workouts', JSON.stringify(workouts));

      router.push({
        pathname: '/(tabs)',
        params: { refresh: 'true' }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>Nouvel entraînement</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Groupe musculaire</Text>
        <View style={styles.muscleGrid}>
          {muscleGroups.map((muscle) => (
            <TouchableOpacity
              key={muscle}
              style={[
                styles.muscleButton,
                selectedMuscle === muscle && styles.muscleButtonSelected,
              ]}
              onPress={() => {
                setSelectedMuscle(muscle);
                setExercise('');
                setIsCustomExercise(false);
                setSuggestedWeight(null);
              }}
            >
              <Text style={[
                styles.muscleButtonText,
                selectedMuscle === muscle && styles.muscleButtonTextSelected,
              ]}>
                {muscle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMuscle && (
          <>
            <Text style={styles.sectionTitle}>Exercise</Text>
            {!isCustomExercise ? (
              <View style={styles.exerciseGrid}>
                {predefinedExercises[selectedMuscle as keyof typeof predefinedExercises].map((ex) => (
                  <TouchableOpacity
                    key={ex}
                    style={[
                      styles.exerciseButton,
                      exercise === ex && styles.exerciseButtonSelected,
                    ]}
                    onPress={() => {
                      setExercise(ex);
                      // Try to calculate suggested weight if reps and RPE are already set
                      if (reps && rpe) {
                        calculateSuggestedWeight(ex, reps, rpe);
                      } else {
                        // Otherwise, try to find previous workouts for this exercise
                        // and use default values to show a suggestion
                        (async () => {
                          try {
                            const existingWorkouts = await AsyncStorage.getItem('workouts');
                            if (existingWorkouts) {
                              const workouts = JSON.parse(existingWorkouts);
                              const sameExerciseWorkouts = workouts
                                .filter((w: any) => w.exercise === ex)
                                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                              if (sameExerciseWorkouts.length > 0) {
                                const lastWorkout = sameExerciseWorkouts[0];
                                // If we have reps but no RPE, use the last workout's RPE
                                if (reps && !rpe && lastWorkout.rpe) {
                                  calculateSuggestedWeight(ex, reps, lastWorkout.rpe.toString());
                                }
                                // If we have RPE but no reps, use the last workout's reps
                                else if (!reps && rpe && lastWorkout.reps) {
                                  calculateSuggestedWeight(ex, lastWorkout.reps.toString(), rpe);
                                }
                                // If we have neither, use both from the last workout
                                else if (!reps && !rpe && lastWorkout.reps && lastWorkout.rpe) {
                                  setReps(lastWorkout.reps.toString());
                                  setRpe(lastWorkout.rpe.toString());
                                  calculateSuggestedWeight(ex, lastWorkout.reps.toString(), lastWorkout.rpe.toString());
                                }
                              }
                            }
                          } catch (error) {
                            console.error('Error loading previous workouts:', error);
                          }
                        })();
                      }
                    }}
                  >
                    <Text style={[
                      styles.exerciseButtonText,
                      exercise === ex && styles.exerciseButtonTextSelected,
                    ]}>
                      {ex}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.customExerciseButton}
                  onPress={() => setIsCustomExercise(true)}
                >
                  <Plus color="#fd8f09" size={20} />
                  <Text style={styles.customExerciseButtonText}>Custom Exercise</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.customExerciseContainer}>
                <TextInput
                  style={styles.input}
                  value={exercise}
                  onChangeText={(value) => {
                    setExercise(value);
                    // Try to calculate suggested weight if reps and RPE are already set
                    if (value && reps && rpe) {
                      calculateSuggestedWeight(value, reps, rpe);
                    } else if (value) {
                      // Otherwise, try to find previous workouts for this exercise
                      // and use default values to show a suggestion
                      (async () => {
                        try {
                          const existingWorkouts = await AsyncStorage.getItem('workouts');
                          if (existingWorkouts) {
                            const workouts = JSON.parse(existingWorkouts);
                            const sameExerciseWorkouts = workouts
                              .filter((w: any) => w.exercise === value)
                              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                            if (sameExerciseWorkouts.length > 0) {
                              const lastWorkout = sameExerciseWorkouts[0];
                              // If we have reps but no RPE, use the last workout's RPE
                              if (reps && !rpe && lastWorkout.rpe) {
                                calculateSuggestedWeight(value, reps, lastWorkout.rpe.toString());
                              }
                              // If we have RPE but no reps, use the last workout's reps
                              else if (!reps && rpe && lastWorkout.reps) {
                                calculateSuggestedWeight(value, lastWorkout.reps.toString(), rpe);
                              }
                              // If we have neither, use both from the last workout
                              else if (!reps && !rpe && lastWorkout.reps && lastWorkout.rpe) {
                                setReps(lastWorkout.reps.toString());
                                setRpe(lastWorkout.rpe.toString());
                                calculateSuggestedWeight(value, lastWorkout.reps.toString(), lastWorkout.rpe.toString());
                              }
                            }
                          }
                        } catch (error) {
                          console.error('Error loading previous workouts:', error);
                        }
                      })();
                    }
                  }}
                  placeholder="Enter exercise name"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setIsCustomExercise(false)}
                >
                  <Text style={styles.backButtonText}>Back to Predefined</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Poids (kg)</Text>
            {suggestedWeight !== null && (
              <View style={styles.suggestedWeightContainer}>
                <Text style={styles.suggestedWeightText}>
                  Suggested: {suggestedWeight} kg
                </Text>
                <TouchableOpacity
                  onPress={() => setWeight(suggestedWeight.toString())}
                  style={styles.useSuggestedButton}
                >
                  <Text style={styles.useSuggestedButtonText}>Use</Text>
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Reps</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={(value) => {
                setReps(value);
                if (exercise && value && rpe) {
                  calculateSuggestedWeight(exercise, value, rpe);
                }
              }}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Sets</Text>
            <TextInput
              style={styles.input}
              value={sets}
              onChangeText={setSets}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.rpeContainer}>
          <Text style={styles.sectionTitle}>RPE (Rate of Perceived Exertion)</Text>
          <Text style={styles.rpeDescription}>
            1 = Très facile, 10 = Effort maximal,
          </Text>
          <View style={styles.rpeButtonsContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.rpeButton,
                  parseInt(rpe) === value && styles.rpeButtonSelected,
                ]}
                onPress={() => {
                  const rpeValue = value.toString();
                  setRpe(rpeValue);
                  if (exercise && reps && rpeValue) {
                    calculateSuggestedWeight(exercise, reps, rpeValue);
                  }
                }}
              >
                <Text
                  style={[
                    styles.rpeButtonText,
                    parseInt(rpe) === value && styles.rpeButtonTextSelected,
                  ]}
                >
                  {value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.addButton, (!exercise || !selectedMuscle) && styles.addButtonDisabled]}
          onPress={saveWorkout}
          disabled={!exercise || !selectedMuscle}
        >
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  muscleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    marginBottom: 8,
  },
  muscleButtonSelected: {
    backgroundColor: '#fd8f09',
  },
  muscleButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  muscleButtonTextSelected: {
    fontFamily: 'Inter-SemiBold',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
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
  customExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    marginBottom: 8,
    gap: 8,
  },
  customExerciseButtonText: {
    color: '#fd8f09',
    fontFamily: 'Inter-Regular',
  },
  customExerciseContainer: {
    marginBottom: 24,
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fd8f09',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  column: {
    flex: 1,
  },
  suggestedWeightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  suggestedWeightText: {
    color: '#fd8f09',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  useSuggestedButton: {
    backgroundColor: '#fd8f09',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  useSuggestedButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
  },
  rpeContainer: {
    marginBottom: 24,
  },
  rpeDescription: {
    color: '#999',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 12,
  },
  rpeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rpeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  rpeButtonSelected: {
    backgroundColor: '#fd8f09',
  },
  rpeButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  rpeButtonTextSelected: {
    fontFamily: 'Inter-SemiBold',
  },
  addButton: {
    backgroundColor: '#fd8f09',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#333',
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});
