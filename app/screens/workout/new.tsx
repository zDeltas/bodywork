import React, { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { router, useLocalSearchParams } from 'expo-router';
import { BarChart, Calendar, ChevronDown, Gauge, Layers, Plus, Weight, X } from 'lucide-react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Text from '../../components/ui/Text';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import ExerciseList from '@/app/components/exercises/ExerciseList';
import { Series, SeriesType, Workout } from '@/app/types/common';
import { WorkoutDateUtils } from '@/app/types/workout';
import { MuscleGroupKey } from '@/app/components/exercises/ExerciseList';
import { TranslationKey } from '@/translations';
import { useWorkouts } from '@/app/hooks/useWorkouts';

SplashScreen.preventAutoHideAsync();

interface EditableSeries {
  weight: string;
  reps: string;
  note: string;
  rpe: string;
  showRpeDropdown?: boolean;
  type: SeriesType;
}

export default function NewWorkoutScreen() {
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

  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const { workouts, saveWorkout: saveWorkoutToStorage } = useWorkouts();
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<MuscleGroupKey | string>('');
  const [exercise, setExercise] = useState<string>('');
  const [exerciseKey, setExerciseKey] = useState<string>('');
  const [rpe, setRpe] = useState<string>('');
  const [series, setSeries] = useState<EditableSeries[]>([{
    weight: '',
    reps: '',
    note: '',
    rpe: '',
    showRpeDropdown: false,
    type: 'workingSet'
  }]);
  const params = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(params.selectedDate as string || WorkoutDateUtils.getDatePart(new Date().toISOString()));
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [showExerciseSelector, setShowExerciseSelector] = useState<boolean>(false);

  const processSeries = (series: EditableSeries[], rpe: string): Series[] => {
    return series.map(s => ({
      ...s,
      weight: parseFloat(s.weight) || 0,
      reps: parseInt(s.reps) || 0,
      rpe: s.type === 'warmUp' ? 0 : (parseInt(s.rpe) || parseInt(rpe) || 7),
      type: s.type || 'workingSet'
    }));
  };

  const saveWorkout = async (): Promise<void> => {
    try {
      const validSeries = series.filter(s => {
        const hasWeightOrReps = parseFloat(s.weight) > 0 || parseInt(s.reps) > 0;
        if (!hasWeightOrReps) return false;
        if (s.type === 'warmUp') return true;
        return (parseInt(s.rpe) >= 1 && parseInt(s.rpe) <= 10) || (parseInt(rpe) >= 1 && parseInt(rpe) <= 10);
      });

      if (validSeries.length === 0) {
        console.error('No valid series to save');
        return;
      }

      const processedSeries: Series[] = processSeries(validSeries, rpe);

      const workout: Workout = {
        id: Date.now().toString(),
        muscleGroup: selectedMuscleKey,
        exercise: exerciseKey,
        series: processedSeries,
        date: selectedDate ? WorkoutDateUtils.createISOString(selectedDate) : new Date().toISOString()
      };

      await saveWorkoutToStorage(workout);
      router.push({
        pathname: '/(tabs)',
        params: { refresh: 'true' }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const isAnyRpeDropdownOpen = series.some(s => s.showRpeDropdown);

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Header title={t('workout.newWorkout')} showBackButton={true} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowCalendar(true)}
        >
          <Calendar color={theme.colors.primary} size={20} style={styles.dateButtonIcon} />
          <Text variant="body" style={styles.dateButtonText}>
            {format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text variant="heading" style={styles.modalTitle}>{t('workout.selectDate')}</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowCalendar(false)}
                >
                  <X color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
              </View>
              <RNCalendar
                theme={{
                  backgroundColor: theme.colors.background.card,
                  calendarBackground: theme.colors.background.card,
                  textSectionTitleColor: theme.colors.text.secondary,
                  textSectionTitleDisabledColor: theme.colors.border.default,
                  selectedDayBackgroundColor: theme.colors.primary,
                  selectedDayTextColor: theme.colors.text.primary,
                  todayTextColor: theme.colors.primary,
                  dayTextColor: theme.colors.text.primary,
                  textDisabledColor: theme.colors.text.disabled,
                  dotColor: theme.colors.primary,
                  selectedDotColor: theme.colors.text.primary,
                  arrowColor: theme.colors.primary,
                  monthTextColor: theme.colors.text.primary,
                  indicatorColor: theme.colors.primary,
                  textDayFontFamily: theme.typography.fontFamily.regular,
                  textMonthFontFamily: theme.typography.fontFamily.semiBold,
                  textDayHeaderFontFamily: theme.typography.fontFamily.regular,
                  textDayFontSize: theme.typography.fontSize.base,
                  textMonthFontSize: theme.typography.fontSize.lg,
                  textDayHeaderFontSize: theme.typography.fontSize.md
                }}
                markedDates={{
                  [selectedDate]: { selected: true }
                }}
                onDayPress={(day: { dateString: string }) => {
                  setSelectedDate(day.dateString);
                  setShowCalendar(false);
                }}
                enableSwipeMonths={true}
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={showExerciseSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowExerciseSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: '80%' }]}>
              <View style={styles.modalHeader}>
                <Text variant="heading" style={styles.modalTitle}>{t('stats.selectExercise')}</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowExerciseSelector(false)}
                >
                  <X color={theme.colors.text.primary} size={24} />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ flex: 1 }}>
                <ExerciseList
                  selectedMuscle={selectedMuscle}
                  setSelectedMuscle={(muscleGroup: string, muscleKey?: string) => {
                    setSelectedMuscle(muscleGroup);
                    setSelectedMuscleKey(muscleKey || muscleGroup);
                  }}
                  exercise={exercise}
                  setExercise={(selectedExercise, selectedExerciseKey) => {
                    setExercise(selectedExercise);
                    setExerciseKey(selectedExerciseKey || selectedExercise);
                    setShowExerciseSelector(false);
                  }}
                  setIsCustomExercise={() => {}}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.exerciseButton}
          onPress={() => setShowExerciseSelector(true)}
        >
          <Text variant="body" style={[styles.exerciseButtonText, !exercise && { color: theme.colors.text.secondary }]}>
            {exercise ? t(exerciseKey as TranslationKey) : t('stats.selectExercise')}
          </Text>
          <ChevronDown color={theme.colors.text.secondary} size={20} />
        </TouchableOpacity>

        <View style={styles.sectionTitleContainer}>
          <Layers color={theme.colors.primary} size={24} style={styles.sectionTitleIcon} />
          <Text variant="heading" style={styles.sectionTitle}>
            {t('workout.series')}
          </Text>
        </View>

        {series.map((item, index) => (
          <View
            key={index}
            style={styles.seriesContainer}
          >
            <View style={styles.seriesHeader}>
              <Text variant="subheading" style={styles.seriesTitle}>{t('workout.series')} {index + 1}</Text>
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

            <View style={styles.seriesTypeContainer}>
              <Text variant="body" style={styles.seriesInputLabel}>{t('workout.seriesType')}</Text>
              <View style={styles.seriesTypeButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.seriesTypeButton,
                    item.type === 'warmUp' && styles.seriesTypeButtonSelected
                  ]}
                  onPress={() => {
                    const newSeries = [...series];
                    newSeries[index] = { ...newSeries[index], type: 'warmUp' };
                    setSeries(newSeries);
                  }}
                >
                  <Text
                    style={[
                      styles.seriesTypeButtonText,
                      item.type === 'warmUp' && styles.seriesTypeButtonTextSelected
                    ]}
                  >
                    {t('workout.warmUp')}
                  </Text>
                  <Text variant="caption" style={styles.seriesTypeDescription}>
                    {t('workout.warmUpDescription')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.seriesTypeButton,
                    item.type === 'workingSet' && styles.seriesTypeButtonSelected
                  ]}
                  onPress={() => {
                    const newSeries = [...series];
                    newSeries[index] = { ...newSeries[index], type: 'workingSet' };
                    setSeries(newSeries);
                  }}
                >
                  <Text
                    style={[
                      styles.seriesTypeButtonText,
                      item.type === 'workingSet' && styles.seriesTypeButtonTextSelected
                    ]}
                  >
                    {t('workout.workingSet')}
                  </Text>
                  <Text variant="caption" style={styles.seriesTypeDescription}>
                    {t('workout.workingSetDescription')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.row]}>
              <View style={styles.column}>
                <View style={styles.sectionTitleContainer}>
                  <Weight color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
                  <Text variant="body" style={styles.seriesInputLabel}>{t('workout.weightKg')}</Text>
                </View>
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
                  <Text variant="body" style={styles.seriesInputLabel}>{t('workout.reps')}</Text>
                </View>
                <TextInput
                  style={styles.compactInput}
                  value={item.reps}
                  onChangeText={(value) => {
                    const newSeries = [...series];
                    newSeries[index] = { ...newSeries[index], reps: value };
                    setSeries(newSeries);
                  }}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.secondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.rpeSectionContainer}>
              <View style={styles.sectionTitleContainer}>
                <Gauge color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
                <Text
                  style={[
                    styles.seriesInputLabel,
                    item.type === 'warmUp' && styles.disabledLabel
                  ]}
                >
                  {t('workout.rpe')}
                  {item.type === 'warmUp' && (
                    <Text variant="caption" style={styles.disabledLabelNote}> ({t('workout.notApplicable')})</Text>
                  )}
                </Text>
              </View>
              {item.type === 'warmUp' ? (
                <View style={[styles.rpeButtonGrid, styles.disabledDropdown]}>
                  <Text variant="body" style={styles.disabledDropdownButtonText}>{t('workout.notApplicable')}</Text>
                </View>
              ) : (
                <>
                  <View style={styles.rpeButtonRow}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Pressable
                        key={value}
                        style={[styles.rpeButtonModern, item.rpe === value.toString() && styles.rpeButtonModernSelected]}
                        onPress={() => {
                          const rpeValue = value.toString();
                          const newSeries = [...series];
                          newSeries[index] = {
                            ...newSeries[index],
                            rpe: rpeValue
                          };
                          setSeries(newSeries);
                        }}
                      >
                        <Text variant="body"
                              style={[styles.rpeButtonModernText, item.rpe === value.toString() && styles.rpeButtonModernTextSelected]}>{value}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.rpeButtonRow}>
                    {[6, 7, 8, 9, 10].map((value) => (
                      <Pressable
                        key={value}
                        style={[styles.rpeButtonModern, item.rpe === value.toString() && styles.rpeButtonModernSelected]}
                        onPress={() => {
                          const rpeValue = value.toString();
                          const newSeries = [...series];
                          newSeries[index] = {
                            ...newSeries[index],
                            rpe: rpeValue
                          };
                          setSeries(newSeries);
                        }}
                      >
                        <Text variant="body"
                              style={[styles.rpeButtonModernText, item.rpe === value.toString() && styles.rpeButtonModernTextSelected]}>{value}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
            </View>

            <View style={styles.noteContainer}>
              <Text variant="body" style={styles.seriesInputLabel}>{t('common.note')}</Text>
              <TextInput
                style={styles.noteInput}
                value={item.note}
                onChangeText={(value) => {
                  const newSeries = [...series];
                  newSeries[index] = { ...newSeries[index], note: value };
                  setSeries(newSeries);
                }}
                placeholder={t('workout.optionalNote')}
                placeholderTextColor={theme.colors.text.secondary}
                multiline
              />
            </View>

            {index > 0 && (
              <View style={styles.quickFillContainer}>
                <TouchableOpacity
                  style={styles.quickFillButton}
                  onPress={() => {
                    const newSeries = [...series];
                    const prevSeries = newSeries[index - 1];
                    newSeries[index] = {
                      ...newSeries[index],
                      weight: prevSeries.weight,
                      reps: prevSeries.reps,
                      rpe: prevSeries.rpe,
                      type: prevSeries.type,
                      showRpeDropdown: false
                    };
                    setSeries(newSeries);
                  }}
                >
                  <Text variant="body" style={styles.quickFillButtonText}>{t('workout.usePreviousValues')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {!isAnyRpeDropdownOpen && series.length > 0 && (
          <TouchableOpacity
            style={styles.duplicateButton}
            onPress={() => {
              const lastSeries = series[series.length - 1];
              setSeries([...series, {
                ...lastSeries,
                showRpeDropdown: false
              }]);
            }}
          >
            <Text variant="body" style={styles.duplicateButtonText}>{t('workout.duplicateLastSeries')}</Text>
          </TouchableOpacity>
        )}

        {!isAnyRpeDropdownOpen && (
          <TouchableOpacity
            style={styles.addSeriesButton}
            onPress={() => {
              setSeries([...series, {
                weight: '',
                reps: '',
                note: '',
                rpe: '',
                showRpeDropdown: false,
                type: 'workingSet'
              }]);
            }}
          >
            <Plus color={theme.colors.text.primary} size={20} style={{ marginRight: theme.spacing.sm }} />
            <Text variant="body" style={styles.addSeriesButtonText}>{t('workout.addSeries')}</Text>
          </TouchableOpacity>
        )}

        {!isAnyRpeDropdownOpen && (
          <TouchableOpacity
            style={[styles.addButton, (!exercise || !selectedMuscle) && styles.addButtonDisabled]}
            onPress={saveWorkout}
            disabled={!exercise || !selectedMuscle}
          >
            <Text variant="body" style={styles.addButtonText}>{t('workout.addExercise')}</Text>
          </TouchableOpacity>
        )}
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
    seriesTypeContainer: {
      marginBottom: theme.spacing.base
    },
    seriesInputLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginBottom: theme.spacing.sm
    },
    seriesTypeButtonsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm
    },
    seriesTypeButton: {
      flex: 1,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    seriesTypeButtonSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primaryBorder
    },
    seriesTypeButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginBottom: theme.spacing.xs,
      textAlign: 'center'
    },
    seriesTypeButtonTextSelected: {
      color: theme.colors.primary
    },
    seriesTypeDescription: {
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
      zIndex: 9999,
      elevation: 9999,
      maxHeight: 400
    },
    dropdownScroll: {
      maxHeight: 600
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
      backgroundColor: theme.colors.background.card,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    addSeriesButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      marginTop: theme.spacing.sm
    },
    addButtonDisabled: {
      backgroundColor: theme.colors.background.button,
      opacity: 0.5
    },
    addButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.lg
    },
    rpeButtonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.base
    },
    rpeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.background.button,
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    rpeButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    rpeButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    rpeButtonTextSelected: {
      color: theme.colors.background.main
    },
    rpeSectionContainer: {
      marginTop: theme.spacing.base,
      marginBottom: theme.spacing.base
    },
    rpeButtonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs
    },
    rpeButtonModern: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background.button,
      alignItems: 'center',
      justifyContent: 'center',
      margin: theme.spacing.xs,
      borderWidth: 2,
      borderColor: theme.colors.border.default,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      transitionDuration: '150ms'
    },
    rpeButtonModernSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.25,
      elevation: 6,
      transform: [{ scale: 1.12 }]
    },
    rpeButtonModernText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.lg
    },
    rpeButtonModernTextSelected: {
      color: theme.colors.background.main
    },
    calendarContainer: {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginBottom: theme.spacing.lg,
      ...theme.shadows.md
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm
    },
    dateButtonIcon: {
      marginRight: theme.spacing.sm
    },
    dateButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    modalContent: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.lg
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg
    },
    modalTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.lg
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
    exerciseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm
    },
    exerciseButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginRight: theme.spacing.sm
    },
    duplicateButton: {
      backgroundColor: theme.colors.background.card,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    duplicateButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    }
  });
};
