import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, ChevronDown, Timer, Dumbbell, Plus, Activity, Ruler, FileText, Target } from 'lucide-react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as SplashScreen from 'expo-splash-screen';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import Header from '@/app/components/layout/Header';
import TimerPickerModal from '@/app/components/timer/TimerPickerModal';
import ExerciseSelectionModal from '@/app/components/exercises/ExerciseSelectionModal';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useHaptics from '@/app/hooks/useHaptics';
import { useWorkouts } from '@/app/hooks/useWorkouts';
import { useWorkoutForm } from '@/app/hooks/useWorkoutForm';
import { EditableSeries, Series, Workout } from '@/types/common';
import { WorkoutDateUtils } from '@/types/workout';
import { formatDuration, formatRestTime } from '@/app/utils/routineUtils';
import { formatSeries, getValidSeries } from '../../utils/seriesUtils';
import { predefinedExercises } from '@/app/components/exercises';
import { TranslationKey } from '@/translations';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';

import UnitTypeSelector from '@/app/components/routine/UnitTypeSelector';
import SeriesTypeSelector from '@/app/components/routine/SeriesTypeSelector';
import SeriesInput from '@/app/components/routine/SeriesInput';
import RestTimeSelector from '@/app/components/routine/RestTimeSelector';
import LoadToggle from '@/app/components/routine/LoadToggle';

SplashScreen.preventAutoHideAsync();

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
  const haptics = useHaptics();
  const styles = useStyles();
  const { workouts, saveWorkout: saveWorkoutToStorage } = useWorkouts();
  const {
    exerciseName,
    exerciseKey,
    exerciseNote,
    rpe,
    series,
    globalUnitType,
    globalSeriesType,
    withLoad,
    globalRest,
    setExerciseName,
    setExerciseKey,
    setExerciseNote,
    setRpe,
    addSeries,
    removeSeries,
    copySeries,
    updateSeries,
    resetForm,
    updateGlobalSeriesType,
    updateGlobalUnitType,
    updateGlobalRest,
    updateWithLoad,
    canSave
  } = useWorkoutForm();

  const params = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(
    (params.selectedDate as string) || WorkoutDateUtils.getDatePart(new Date().toISOString())
  );
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // États copiés de SeriesConfigModal
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState<number | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  // Ouvrir automatiquement la modal de sélection d'exercices au chargement
  useEffect(() => {
    if (!exerciseName && !exerciseKey) {
      setShowExerciseSelector(true);
    }
  }, [exerciseName, exerciseKey]);

  // Callbacks copiés de SeriesConfigModal
  const handleTimerConfirm = useCallback(({ minutes, seconds }: { minutes: number; seconds: number }) => {
    const formatted = formatRestTime(minutes, seconds);
    updateGlobalRest(formatted);
    setShowTimerPicker(false);
  }, [updateGlobalRest]);

  const handleDurationConfirm = useCallback(({ minutes, seconds }: { minutes: number; seconds: number }) => {
    if (currentSeriesIndex !== null) {
      const formattedDuration = formatDuration(minutes, seconds);
      updateSeries(currentSeriesIndex, 'duration', formattedDuration);
    }
    setShowDurationPicker(false);
    setCurrentSeriesIndex(null);
  }, [currentSeriesIndex, updateSeries]);

  const handleDurationPress = useCallback((index: number) => {
    setCurrentSeriesIndex(index);
    setShowDurationPicker(true);
  }, []);

  const handleSeriesUpdate = useCallback((index: number) => (field: keyof EditableSeries, value: string) => {
    updateSeries(index, field, value);
  }, [updateSeries]);

  const handleSeriesCopy = useCallback((index: number) => () => {
    copySeries(index);
  }, [copySeries]);

  const handleSeriesRemove = useCallback((index: number) => () => {
    removeSeries(index);
  }, [removeSeries]);


  // Éléments de série copiés de SeriesConfigModal
  const seriesElements = useMemo(() => {
    return series.map((item, index) => (
      <SeriesInput
        key={index}
        series={item}
        index={index}
        showLabels={index === 0}
        withLoad={withLoad && (globalUnitType === 'time' || globalUnitType === 'distance')}
        onUpdate={handleSeriesUpdate(index)}
        onCopy={handleSeriesCopy(index)}
        onRemove={handleSeriesRemove(index)}
        onDurationPress={globalUnitType === 'time' ? () => handleDurationPress(index) : undefined}
        canRemove={!(index === 0 && series.length === 1)}
      />
    ));
  }, [series, withLoad, globalUnitType, handleSeriesUpdate, handleSeriesCopy, handleSeriesRemove, handleDurationPress]);

  const showLoadToggle = globalUnitType === 'time' || globalUnitType === 'distance';

  const saveWorkout = async (): Promise<void> => {
    try {
      const validSeries = getValidSeries(series);

      if (validSeries.length === 0) {
        console.error('No valid series to save');
        return;
      }

      const processedSeries: Series[] = formatSeries(validSeries, withLoad).map(series => ({
        ...series,
        rpe: rpe ? parseInt(rpe) : 0
      }));

      const workout: Workout = {
        id: Date.now().toString(),
        muscleGroup: exerciseKey ? (predefinedExercises.find(e => e.key === exerciseKey)?.primaryMuscle || '') : '',
        exercise: exerciseKey || '',
        series: processedSeries,
        date: selectedDate
          ? WorkoutDateUtils.createISOString(selectedDate)
          : new Date().toISOString()
      };

      await saveWorkoutToStorage(workout);
      resetForm();
      router.push({
        pathname: '/(tabs)',
        params: { refresh: 'true' }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };


  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Header title={t('workout.newWorkout')} showBackButton={true} />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Section Date */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Calendar color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
            <Text variant="subheading" style={styles.sectionTitle}>
              {t('workout.selectDate')}
            </Text>
          </View>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowCalendar(true)}>
            <Text variant="body" style={styles.dateButtonText}>
              {format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })}
            </Text>
            <ChevronDown color={theme.colors.text.secondary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Section Exercice */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.exerciseButton}
            onPress={() => setShowExerciseSelector(true)}
          >
            <Text
              variant="body"
              style={[
                styles.exerciseButtonText,
                !exerciseName && { color: theme.colors.text.secondary }
              ]}
            >
              {exerciseName ? t(exerciseKey as TranslationKey) : t('stats.selectExercise')}
            </Text>
            <ChevronDown color={theme.colors.text.secondary} size={20} />
          </TouchableOpacity>

          <SeriesTypeSelector
            selectedType={globalSeriesType}
            onTypeChange={updateGlobalSeriesType}
          />

          <UnitTypeSelector
            selectedType={globalUnitType}
            onTypeChange={updateGlobalUnitType}
          />

          {showLoadToggle && (
            <LoadToggle
              withLoad={withLoad}
              onToggle={() => updateWithLoad(!withLoad)}
            />
          )}

          <RestTimeSelector
            restTime={globalRest}
            onPress={() => setShowTimerPicker(true)}
          />

          {/* RPE Global */}
          <View style={styles.rpeContainer}>
            <View style={styles.titleContainer}>
              <Target color={theme.colors.text.secondary} size={22} style={styles.titleIcon} />
              <Text variant="body" style={styles.titleLabel}>
                {t('workout.rpe')}
              </Text>
            </View>
            <View style={styles.rpeModalContent}>
              <View style={styles.rpeRow}>
                {Array.from({ length: 5 }, (_, i) => i + 1).map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.rpeButton,
                      rpe === value.toString() && styles.rpeButtonSelected
                    ]}
                    onPress={() => {
                      setRpe(value.toString());
                      haptics.impactLight();
                    }}
                  >
                    <Text
                      style={[
                        styles.rpeButtonText,
                        rpe === value.toString() && styles.rpeButtonTextSelected
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.rpeRow}>
                {Array.from({ length: 5 }, (_, i) => i + 6).map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.rpeButton,
                      rpe === value.toString() && styles.rpeButtonSelected
                    ]}
                    onPress={() => {
                      setRpe(value.toString());
                      haptics.impactLight();
                    }}
                  >
                    <Text
                      style={[
                        styles.rpeButtonText,
                        rpe === value.toString() && styles.rpeButtonTextSelected
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.noteContainer}>
            <View style={styles.titleContainer}>
              <FileText color={theme.colors.text.secondary} size={22} style={styles.titleIcon} />
              <Text variant="body" style={styles.titleLabel}>
                {t('common.note')}
              </Text>
            </View>
            <TextInput
              style={styles.noteInput}
              value={exerciseNote}
              onChangeText={setExerciseNote}
              placeholder={t('routine.optionalNote')}
              placeholderTextColor={theme.colors.text.secondary}
              multiline
            />
          </View>
        </View>

        {/* Section Séries */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionTitleContainer}>
            <Plus color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
            <Text variant="subheading" style={styles.titleLabel}>
              {t('workout.series')}
            </Text>
          </View>

          {seriesElements}

          <TouchableOpacity
            style={styles.addSeriesButton}
            onPress={addSeries}
          >
            <Plus size={20} color={theme.colors.text.primary} />
            <Text style={styles.addSeriesText}>{t('workout.addSeries')}</Text>
          </TouchableOpacity>
        </View>

        <Button
          title={t('common.save')}
          onPress={saveWorkout}
          style={styles.saveButton}
          disabled={!canSave()}
        />
      </ScrollView>

      {/* Modales copiées de SeriesConfigModal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <RNCalendar
              theme={{
                backgroundColor: theme.colors.background.card,
                calendarBackground: theme.colors.background.card,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.text.primary,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text.primary,
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text.primary
              }}
              markedDates={{
                [selectedDate]: { selected: true }
              }}
              onDayPress={(day: { dateString: string }) => {
                setSelectedDate(day.dateString);
                setShowCalendar(false);
              }}
            />
          </View>
        </View>
      </Modal>

      <TimerPickerModal
        visible={showTimerPicker}
        onClose={() => setShowTimerPicker(false)}
        onConfirm={handleTimerConfirm}
        modalTitle={t('routine.selectRestTime')}
        hideHours
      />

      <TimerPickerModal
        visible={showDurationPicker}
        onClose={() => setShowDurationPicker(false)}
        onConfirm={handleDurationConfirm}
        modalTitle={t('routine.selectDuration')}
        hideHours
      />

      <ExerciseSelectionModal
        visible={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onExerciseSelect={(exercise) => {
          setExerciseName(exercise.name);
          setExerciseKey(exercise.key);
          setShowExerciseSelector(false);
        }}
        selectedExercise={exerciseName}
        title={t('exerciseSelection.title')}
      />

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
    scrollContent: {
      padding: theme.spacing.base
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
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    modalHeaderWorkout: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.xl * 1.5,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background.card,
      ...theme.shadows.md
    },
    modalTitleWorkout: {
      flex: 1,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    modalHeaderRight: {
      width: 44
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
    sectionTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.base
    },
    sectionTitleIcon: {
      marginRight: theme.spacing.sm
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm
    },
    titleIcon: {
      marginRight: theme.spacing.sm
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.input,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    dateButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
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
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.input,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      marginBottom: theme.spacing.base
    },
    exerciseButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      flex: 1
    },
    exerciseSelectedContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm
    },
    exerciseSelectedText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginBottom: theme.spacing.xs
    },
    seriesCountText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm
    },
    sectionContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.lg,
      marginBottom: theme.spacing.md
    },
    configRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingVertical: theme.spacing.xs
    },
    titleLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    seriesContainer: {
      marginTop: theme.spacing.md
    },
    seriesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md
    },
    seriesHeaderText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    addSeriesButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.input,
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      marginTop: theme.spacing.base
    },
    addSeriesText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginLeft: theme.spacing.sm
    },
    saveButton: {
      backgroundColor: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      height: 48
    },
    globalConfigSection: {
      marginBottom: theme.spacing.lg
    },
    noteContainer: {
      marginBottom: theme.spacing.base
    },
    noteInput: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      minHeight: 80,
      textAlignVertical: 'top'
    },
    seriesSection: {
      marginTop: theme.spacing.md
    },
    addSeriesButtonLarge: {
      marginTop: theme.spacing.base,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder
    },
    rpeContainer: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg
    },
    rpeModalContent: {
      gap: theme.spacing.md
    },
    rpeRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm
    },
    rpeButton: {
      width: theme.layout.buttonSize.large,
      height: theme.layout.buttonSize.large,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    },
    rpeButtonSelected: {
      backgroundColor: theme.colors.primary
    },
    rpeButtonText: {
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text.primary
    },
    rpeButtonTextSelected: {
      color: theme.colors.text.onPrimary
    }
  });
};
