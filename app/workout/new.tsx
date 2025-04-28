import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { router, useLocalSearchParams } from 'expo-router';
import { BarChart, Gauge, Layers, Plus, Weight, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';
import Animated, { FadeIn } from 'react-native-reanimated';
import ExerciseList from '../components/ExerciseList';
import { useTheme } from '@/hooks/useTheme';

SplashScreen.preventAutoHideAsync();

export default function NewWorkoutScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [exercise, setExercise] = useState('');
  const [rpe, setRpe] = useState('');
  const [series, setSeries] = useState<Array<{
    weight: string,
    reps: string,
    note: string,
    rpe: string,
    showRpeDropdown?: boolean,
    type: 'warmUp' | 'workingSet'
  }>>([{
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
  }, [setSuggestedWeight]);

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
        date: selectedDate ? `${selectedDate}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString()
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

  return (
    <View style={styles.container}>
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
            <X color={theme.colors.text.primary} size={24} />
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
              placeholderTextColor={theme.colors.text.secondary}
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
            <Layers color={theme.colors.primary} size={24} style={styles.sectionTitleIcon} />
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
                      <X color={theme.colors.text.primary} size={18} />
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
                      newSeries[index] = { ...newSeries[index], type: 'warmUp' };
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
                      newSeries[index] = { ...newSeries[index], type: 'workingSet' };
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
                    <Weight color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
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
                          newSeries[index] = { ...newSeries[index], weight: suggestedWeight.toString() };
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
                      newSeries[index] = { ...newSeries[index], weight: value };
                      setSeries(newSeries);
                    }}
                    placeholder="0"
                    placeholderTextColor={theme.colors.text.secondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.column}>
                  <View style={styles.sectionTitleContainer}>
                    <BarChart color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
                    <Text style={styles.seriesInputLabel}>{t('reps')}</Text>
                  </View>
                  <TextInput
                    style={styles.compactInput}
                    value={item.reps}
                    onChangeText={(value) => {
                      const newSeries = [...series];
                      newSeries[index] = { ...newSeries[index], reps: value };
                      setSeries(newSeries);

                      if (index === 0 && exercise && value && (item.rpe || rpe)) {
                        calculateSuggestedWeight(exercise, value, item.rpe || rpe);
                      }
                    }}
                    placeholder="0"
                    placeholderTextColor={theme.colors.text.secondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.column]}>
                  <View style={styles.sectionTitleContainer}>
                    <Gauge color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
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
                    newSeries[index] = { ...newSeries[index], note: value };
                    setSeries(newSeries);
                  }}
                  placeholder={t('optionalNote')}
                  placeholderTextColor={theme.colors.text.secondary}
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
            <Plus color={theme.colors.text.primary} size={20} style={{ marginRight: theme.spacing.sm }} />
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
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
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
    customExerciseContainer: {
      marginBottom: theme.spacing.xl
    },
    input: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      marginBottom: theme.spacing.base,
      ...theme.shadows.sm,
      fontSize: theme.typography.fontSize.base,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    backButton: {
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center'
    },
    backButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      textAlign: 'center'
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm
    },
    sectionTitleIcon: {
      marginRight: theme.spacing.sm
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.base,
      marginTop: theme.spacing.sm
    },
    seriesContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm
    },
    seriesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      paddingBottom: theme.spacing.md
    },
    seriesTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.lg
    },
    seriesActions: {
      flexDirection: 'row',
      gap: theme.spacing.md
    },
    seriesActionButton: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    },
    serieTypeContainer: {
      marginBottom: theme.spacing.base
    },
    seriesInputLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginBottom: theme.spacing.sm
    },
    serieTypeButtonsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm
    },
    serieTypeButton: {
      flex: 1,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    serieTypeButtonSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primaryBorder
    },
    serieTypeButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginBottom: theme.spacing.xs,
      textAlign: 'center'
    },
    serieTypeButtonTextSelected: {
      color: theme.colors.primary
    },
    serieTypeDescription: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center'
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.base
    },
    column: {
      flex: 1
    },
    suggestedWeightContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder
    },
    suggestedWeightText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
      marginBottom: theme.spacing.xs,
      textAlign: 'center'
    },
    useSuggestedButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.xs,
      ...theme.shadows.primary
    },
    useSuggestedButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.xs
    },
    compactInput: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      marginBottom: theme.spacing.base,
      ...theme.shadows.sm,
      fontSize: theme.typography.fontSize.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      textAlign: 'center',
      height: 44
    },
    disabledLabel: {
      color: theme.colors.text.disabled
    },
    disabledLabelNote: {
      color: theme.colors.text.disabled,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm
    },
    dropdownContainer: {
      position: 'relative',
      zIndex: theme.zIndex.dropdown
    },
    dropdownButton: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center'
    },
    disabledDropdown: {
      opacity: 0.7
    },
    disabledDropdownButton: {
      backgroundColor: theme.colors.background.button,
      borderColor: theme.colors.border.default
    },
    disabledDropdownButtonText: {
      color: theme.colors.text.disabled
    },
    dropdownButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.md,
      textAlign: 'center'
    },
    dropdownList: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.xs,
      padding: theme.spacing.sm,
      ...theme.shadows.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      zIndex: theme.zIndex.dropdown + 1,
      elevation: theme.zIndex.dropdown + 1,
      maxHeight: 200
    },
    dropdownScroll: {
      maxHeight: 200
    },
    dropdownItem: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.borderRadius.sm
    },
    dropdownItemText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      textAlign: 'center'
    },
    dropdownItemTextSelected: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    noteContainer: {
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.base
    },
    noteInput: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.base,
      padding: theme.spacing.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      marginBottom: theme.spacing.base,
      ...theme.shadows.sm,
      fontSize: theme.typography.fontSize.base,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      minHeight: 80,
      textAlignVertical: 'top'
    },
    quickFillContainer: {
      marginTop: theme.spacing.sm
    },
    quickFillButton: {
      backgroundColor: theme.colors.primaryLight,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder
    },
    quickFillButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.md
    },
    addSeriesButton: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.button,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm
    },
    addSeriesButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      ...theme.shadows.lg,
      marginTop: theme.spacing.sm
    },
    addButtonDisabled: {
      backgroundColor: theme.colors.background.button,
      ...theme.shadows.sm
    },
    addButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg
    }
  });
};
