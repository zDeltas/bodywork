import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCallback, useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Plus, Heart, Activity, Dumbbell, Footprints, Hammer, Weight, BarChart, Layers, Gauge } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import ExerciseList from '../components/ExerciseList';

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

// Mapping of muscle groups to their respective icons
export const muscleGroupIcons = {
  'Poitrine': Heart,
  'Dos': Activity,
  'Jambes': Footprints,
  'Epaules': Hammer,
  'Biceps': Dumbbell,
  'Triceps': Dumbbell,
  'Ceinture abdominale': Activity,
};

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
  const { t } = useTranslation();
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [exercise, setExercise] = useState('');
  const [rpe, setRpe] = useState('');
  const [series, setSeries] = useState<Array<{weight: string, reps: string, note: string, rpe: string, showRpeDropdown?: boolean, type: 'warmUp' | 'workingSet'}>>([{
    weight: '',
    reps: '',
    note: '',
    rpe: '',
    showRpeDropdown: false,
    type: 'workingSet'
  }]);
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

  // Function to try to calculate suggested weight based on exercise, reps, and RPE
  const tryCalculateSuggestedWeight = useCallback(async (selectedExercise: string) => {
    const currentReps = series[0]?.reps || '';
    const currentRpe = series[0]?.rpe || rpe;

    // Try to calculate suggested weight if reps and RPE are already set
    if (selectedExercise && currentReps && currentRpe) {
      calculateSuggestedWeight(selectedExercise, currentReps, currentRpe);
      return;
    }

    // Otherwise, try to find previous workouts for this exercise
    try {
      const existingWorkouts = await AsyncStorage.getItem('workouts');
      if (!existingWorkouts) return;

      const workouts = JSON.parse(existingWorkouts);
      const sameExerciseWorkouts = workouts
        .filter((w: any) => w.exercise === selectedExercise)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (sameExerciseWorkouts.length === 0) return;

      const lastWorkout = sameExerciseWorkouts[0];

      // If we have reps but no RPE, use the last workout's RPE
      if (currentReps && !currentRpe && lastWorkout.rpe) {
        calculateSuggestedWeight(selectedExercise, currentReps, lastWorkout.rpe.toString());
      }
      // If we have RPE but no reps, use the last workout's reps
      else if (!currentReps && currentRpe && lastWorkout.reps) {
        calculateSuggestedWeight(selectedExercise, lastWorkout.reps.toString(), currentRpe);
      }
      // If we have neither, use both from the last workout
      else if (!currentReps && !currentRpe && lastWorkout.reps && lastWorkout.rpe) {
        // Update the first series with the reps from the last workout
        const newSeries = [...series];
        if (newSeries.length > 0) {
          newSeries[0] = {
            ...newSeries[0],
            reps: lastWorkout.reps.toString()
          };
          setSeries(newSeries);
        }
        setRpe(lastWorkout.rpe.toString());
        calculateSuggestedWeight(selectedExercise, lastWorkout.reps.toString(), lastWorkout.rpe.toString());
      }
    } catch (error) {
      console.error('Error loading previous workouts:', error);
    }
  }, [series, rpe, calculateSuggestedWeight]);



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
        // If the last workout has series, use the weight from the first series
        if (lastWorkout.series && lastWorkout.series.length > 0) {
          setSuggestedWeight(lastWorkout.series[0].weight);
        } else {
          setSuggestedWeight(lastWorkout.weight);
        }
        return;
      }

      // Get the weight, reps, and RPE from the last workout
      let lastWeight, lastReps, lastRpe;

      // If the last workout has series, use the values from the first working set
      if (lastWorkout.series && lastWorkout.series.length > 0) {
        // Find the first working set in the series
        const workingSet = lastWorkout.series.find((s: any) => s.type === 'workingSet') || lastWorkout.series[0];
        lastWeight = parseFloat(workingSet.weight) || 0;
        lastReps = parseInt(workingSet.reps) || 0;
        lastRpe = parseInt(workingSet.rpe) || parseInt(lastWorkout.rpe) || 0;
      } else {
        lastWeight = lastWorkout.weight;
        lastReps = lastWorkout.reps;
        lastRpe = lastWorkout.rpe;
      }

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
      // Filter out empty series
      const validSeries = series.filter(s => {
        // Basic validation: must have weight or reps
        const hasWeightOrReps = parseFloat(s.weight) > 0 || parseInt(s.reps) > 0;

        if (!hasWeightOrReps) return false;

        // For warm-up sets, RPE is not required
        if (s.type === 'warmUp') return true;

        // For working sets, ensure RPE is between 1 and 10
        return (parseInt(s.rpe) >= 1 && parseInt(s.rpe) <= 10) || (parseInt(rpe) >= 1 && parseInt(rpe) <= 10);
      });

      // If no valid series, don't save
      if (validSeries.length === 0) {
        // Show an alert or message to the user
        console.error('No valid series to save');
        return;
      }

      // Process series
      const processedSeries = validSeries.map(s => {
        // For warm-up sets, RPE is not applicable
        const rpeValue = s.type === 'warmUp' 
          ? 0  // Use 0 to indicate N/A for warm-up sets
          : (parseInt(s.rpe) || parseInt(rpe) || 7); // Default to 7 for working sets if not specified

        return {
          weight: parseFloat(s.weight) || 0,
          reps: parseInt(s.reps) || 0,
          note: s.note || '',
          rpe: rpeValue,
          type: s.type || 'workingSet' // Include the series type
        };
      });

      const workout = {
        id: Date.now().toString(),
        muscleGroup: selectedMuscle,
        exercise,
        series: processedSeries,
        rpe: parseInt(rpe) || 0, // Keep global RPE for backward compatibility
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
      <Animated.View 
        entering={FadeIn.duration(500)} 
        style={styles.header}
      >
        <Animated.Text 
          entering={FadeIn.duration(600).delay(100)} 
          style={styles.title}
        >
          {t('newWorkout')}
        </Animated.Text>
        <Animated.View entering={FadeIn.duration(600).delay(200)}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X color="#fff" size={24} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      <ScrollView 
        style={[styles.content, { zIndex: 1 }]} 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ExerciseList
          selectedMuscle={selectedMuscle}
          setSelectedMuscle={setSelectedMuscle}
          exercise={exercise}
          setExercise={setExercise}
          setIsCustomExercise={setIsCustomExercise}
          onExerciseSelect={(selectedExercise) => {
            tryCalculateSuggestedWeight(selectedExercise);
          }}
        />

        {/* Custom Exercise Input */}
        {isCustomExercise && selectedMuscle && (
          <Animated.View 
            entering={FadeIn.duration(400)} 
            style={styles.customExerciseContainer}
          >
            <TextInput
              style={styles.input}
              value={exercise}
              onChangeText={(value) => {
                setExercise(value);
                if (value) {
                  tryCalculateSuggestedWeight(value);
                }
              }}
              placeholder={t('enterExerciseName')}
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setIsCustomExercise(false)}
            >
              <Text style={styles.backButtonText}>{t('backToPredefined')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View 
          entering={FadeIn.duration(500).delay(300)} 
        >
          <View style={styles.sectionTitleContainer}>
            <Layers color="#fd8f09" size={24} style={styles.sectionTitleIcon} />
            <Animated.Text 
              entering={FadeIn.duration(400)} 
              style={styles.sectionTitle}
            >
              {t('series')}
            </Animated.Text>
          </View>

          {series.map((item, index) => (
            <Animated.View 
              key={index}
              entering={FadeIn.duration(400).delay(100 + index * 50)} 
              style={styles.seriesContainer}
            >
              <View style={styles.seriesHeader}>
                <Text style={styles.seriesTitle}>{t('serie')} {index + 1}</Text>
                <View style={styles.seriesActions}>
                  {index > 0 && (
                    <TouchableOpacity
                      style={styles.seriesActionButton}
                      onPress={() => {
                        const newSeries = [...series];
                        newSeries.splice(index, 1);
                        setSeries(newSeries);
                      }}
                    >
                      <X color="#fff" size={18} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.serieTypeContainer}>
                <Text style={styles.seriesInputLabel}>{t('serieType')}</Text>
                <View style={styles.serieTypeButtonsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.serieTypeButton,
                      item.type === 'warmUp' && styles.serieTypeButtonSelected
                    ]}
                    onPress={() => {
                      const newSeries = [...series];
                      newSeries[index] = {...newSeries[index], type: 'warmUp'};
                      setSeries(newSeries);
                    }}
                  >
                    <Text 
                      style={[
                        styles.serieTypeButtonText,
                        item.type === 'warmUp' && styles.serieTypeButtonTextSelected
                      ]}
                    >
                      {t('warmUp')}
                    </Text>
                    <Text style={styles.serieTypeDescription}>
                      {t('warmUpDescription')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.serieTypeButton,
                      item.type === 'workingSet' && styles.serieTypeButtonSelected
                    ]}
                    onPress={() => {
                      const newSeries = [...series];
                      newSeries[index] = {...newSeries[index], type: 'workingSet'};
                      setSeries(newSeries);
                    }}
                  >
                    <Text 
                      style={[
                        styles.serieTypeButtonText,
                        item.type === 'workingSet' && styles.serieTypeButtonTextSelected
                      ]}
                    >
                      {t('workingSet')}
                    </Text>
                    <Text style={styles.serieTypeDescription}>
                      {t('workingSetDescription')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.row]}>
                <View style={styles.column}>
                  <View style={styles.sectionTitleContainer}>
                    <Weight color="#fd8f09" size={20} style={styles.sectionTitleIcon} />
                    <Text style={styles.seriesInputLabel}>{t('weightKg')}</Text>
                  </View>
                  {index === 0 && suggestedWeight !== null && (
                    <Animated.View 
                      entering={FadeIn.duration(400).delay(100)} 
                      style={styles.suggestedWeightContainer}
                    >
                      <Text style={styles.suggestedWeightText}>
                        {t('suggested')}: {suggestedWeight} kg
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const newSeries = [...series];
                          newSeries[index] = {...newSeries[index], weight: suggestedWeight.toString()};
                          setSeries(newSeries);
                        }}
                        style={styles.useSuggestedButton}
                      >
                        <Text style={styles.useSuggestedButtonText}>{t('use')}</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                  <TextInput
                    style={styles.compactInput}
                    value={item.weight}
                    onChangeText={(value) => {
                      const newSeries = [...series];
                      newSeries[index] = {...newSeries[index], weight: value};
                      setSeries(newSeries);
                    }}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <View style={styles.sectionTitleContainer}>
                    <BarChart color="#fd8f09" size={20} style={styles.sectionTitleIcon} />
                    <Text style={styles.seriesInputLabel}>{t('reps')}</Text>
                  </View>
                  <TextInput
                    style={styles.compactInput}
                    value={item.reps}
                    onChangeText={(value) => {
                      const newSeries = [...series];
                      newSeries[index] = {...newSeries[index], reps: value};
                      setSeries(newSeries);

                      if (index === 0 && exercise && value && (item.rpe || rpe)) {
                        calculateSuggestedWeight(exercise, value, item.rpe || rpe);
                      }
                    }}
                    placeholder="0"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.column]}>
                  <View style={styles.sectionTitleContainer}>
                    <Gauge color="#fd8f09" size={20} style={styles.sectionTitleIcon} />
                    <Text 
                      style={[
                        styles.seriesInputLabel,
                        item.type === 'warmUp' && styles.disabledLabel
                      ]}
                    >
                      {t('rpe')}
                      {item.type === 'warmUp' && (
                        <Text style={styles.disabledLabelNote}> ({t('notApplicable')})</Text>
                      )}
                    </Text>
                  </View>
                  <View 
                    style={[
                      styles.dropdownContainer, 
                      { position: 'relative' },
                      item.type === 'warmUp' && styles.disabledDropdown
                    ]}
                  >
                    <Pressable
                      style={[
                        styles.dropdownButton,
                        item.type === 'warmUp' && styles.disabledDropdownButton
                      ]}
                      onPress={() => {
                        // Only allow RPE selection for working sets
                        if (item.type === 'workingSet') {
                          // Toggle dropdown visibility for this specific series
                          const newSeries = [...series];
                          newSeries[index] = {
                            ...newSeries[index], 
                            showRpeDropdown: !item.showRpeDropdown
                          };
                          setSeries(newSeries);
                        }
                      }}
                    >
                      <Text 
                        style={[
                          styles.dropdownButtonText,
                          item.type === 'warmUp' && styles.disabledDropdownButtonText
                        ]}
                      >
                        {item.type === 'warmUp' ? t('notApplicable') : (item.rpe || t('select'))}
                      </Text>
                    </Pressable>

                    {item.showRpeDropdown && item.type === 'workingSet' && (
                      <View style={[styles.dropdownList, { position: 'absolute', zIndex: 99999 }]}>
                        <ScrollView style={styles.dropdownScroll}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                            <Pressable
                              key={value}
                              style={styles.dropdownItem}
                              onPress={() => {
                                const rpeValue = value.toString();

                                const newSeries = [...series];
                                newSeries[index] = {
                                  ...newSeries[index], 
                                  rpe: rpeValue,
                                  showRpeDropdown: false
                                };
                                setSeries(newSeries);

                                if (index === 0 && exercise && item.reps && rpeValue && item.type === 'workingSet') {
                                  calculateSuggestedWeight(exercise, item.reps, rpeValue);
                                }
                              }}
                            >
                              <Text 
                                style={[
                                  styles.dropdownItemText,
                                  item.rpe === value.toString() && styles.dropdownItemTextSelected
                                ]}
                              >
                                {value}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.noteContainer}>
                <Text style={styles.seriesInputLabel}>{t('note')}</Text>
                <TextInput
                  style={styles.noteInput}
                  value={item.note}
                  onChangeText={(value) => {
                    const newSeries = [...series];
                    newSeries[index] = {...newSeries[index], note: value};
                    setSeries(newSeries);
                  }}
                  placeholder={t('optionalNote')}
                  placeholderTextColor="#666"
                  multiline
                />
              </View>

              {index > 0 && (
                <View style={styles.quickFillContainer}>
                  <TouchableOpacity
                    style={styles.quickFillButton}
                    onPress={() => {
                      // Copy values from previous series
                      const newSeries = [...series];
                      const prevSeries = newSeries[index - 1];
                      newSeries[index] = {
                        ...newSeries[index],
                        weight: prevSeries.weight,
                        reps: prevSeries.reps,
                        rpe: prevSeries.rpe,
                        type: prevSeries.type, // Copy the series type as well
                        showRpeDropdown: false
                      };
                      setSeries(newSeries);
                    }}
                  >
                    <Text style={styles.quickFillButtonText}>{t('usePreviousValues')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          ))}

          <TouchableOpacity
            style={styles.addSeriesButton}
            onPress={() => {
              setSeries([...series, { 
                weight: '', 
                reps: '', 
                note: '', 
                rpe: '', 
                showRpeDropdown: false,
                type: 'workingSet' // Default to working set for new series
              }]);
            }}
          >
            <Plus color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.addSeriesButtonText}>{t('addSeries')}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeIn.duration(500).delay(500)}
        >
          <TouchableOpacity 
            style={[styles.addButton, (!exercise || !selectedMuscle) && styles.addButtonDisabled]}
            onPress={saveWorkout}
            disabled={!exercise || !selectedMuscle}
          >
            <Text style={styles.addButtonText}>{t('addExercise')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  serieTypeContainer: {
    marginBottom: 16,
  },
  serieTypeButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  serieTypeButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  serieTypeButtonSelected: {
    backgroundColor: 'rgba(253, 143, 9, 0.1)',
    borderColor: '#fd8f09',
  },
  serieTypeButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  serieTypeButtonTextSelected: {
    color: '#fd8f09',
  },
  serieTypeDescription: {
    color: '#999',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
  disabledLabel: {
    color: '#666',
  },
  disabledLabelNote: {
    color: '#666',
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  disabledDropdown: {
    opacity: 0.7,
  },
  disabledDropdownButton: {
    backgroundColor: '#222',
    borderColor: '#444',
  },
  disabledDropdownButtonText: {
    color: '#666',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 99999,
    marginBottom: 16,
  },
  dropdownButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#333',
    height: 44, // Match height with compactInput
    width: 60, // Reduced width for RPE (small numbers only)
  },
  dropdownButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginTop: 4,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#333',
    zIndex: 99999,
    elevation: 99999, // Higher elevation for Android
    maxHeight: 200, // Limit height to prevent overflow
  },
  dropdownScroll: {
    maxHeight: 200, // Match maxHeight with dropdownList
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  dropdownItemTextSelected: {
    color: '#fd8f09',
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleIcon: {
    marginRight: 10,
  },
  // Keep existing styles
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 28,
    gap: 10,
  },
  muscleButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  muscleButtonSelected: {
    backgroundColor: '#fd8f09',
    shadowColor: '#fd8f09',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  muscleButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
  muscleButtonTextSelected: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 28,
    gap: 10,
  },
  exerciseButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  exerciseButtonSelected: {
    backgroundColor: '#fd8f09',
    shadowColor: '#fd8f09',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  exerciseButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
  },
  exerciseButtonTextSelected: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  customExerciseContainer: {
    marginBottom: 28,
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(253, 143, 9, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fd8f09',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  compactInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  suggestedWeightContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 143, 9, 0.1)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(253, 143, 9, 0.3)',
  },
  suggestedWeightText: {
    color: '#fd8f09',
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  useSuggestedButton: {
    backgroundColor: '#fd8f09',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#fd8f09',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  useSuggestedButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
  },
  addButton: {
    backgroundColor: '#fd8f09',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#fd8f09',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginTop: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  // New styles for series
  seriesContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 12,
  },
  seriesTitle: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  seriesActions: {
    flexDirection: 'row',
    gap: 10,
  },
  seriesActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  seriesInputLabel: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 8,
  },
  noteContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  quickFillContainer: {
    marginTop: 8,
  },
  quickFillButton: {
    backgroundColor: 'rgba(253, 143, 9, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(253, 143, 9, 0.3)',
  },
  quickFillButtonText: {
    color: '#fd8f09',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  addSeriesButton: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  addSeriesButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});
