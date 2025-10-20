import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import OnboardingFooter from '@/app/components/onboarding/OnboardingFooter';
import { useTranslation } from '@/app/hooks/useTranslation';
import ExerciseSelectionModal from '@/app/components/exercises/ExerciseSelectionModal';
import TimerPickerModal from '@/app/components/timer/TimerPickerModal';
import { Timer, Layers, Plus, Settings, FileText, Zap } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { storageService } from '@/app/services/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getValidSeries } from '../../utils/seriesUtils';
import { useRoutineForm } from '@/app/hooks/useRoutineForm';
import { formatRestTime, generateRoutineId, isRoutineComplete } from '@/app/utils/routineUtils';

import SeriesConfigModal from '@/app/components/routine/SeriesConfigModal';
import RoutineExerciseCard from '@/app/components/routine/RoutineExerciseCard';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoutineSchedule } from '@/app/hooks/useRoutineSchedule';
import { DayOfWeek } from '@/types/common';
import routineScheduleService from '@/app/services/routineSchedule';
import ActionFooter from '@/app/components/ui/ActionFooter';

function NewRoutineScreen() {

  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [step, setStep] = useState(1);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showSeriesConfig, setShowSeriesConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommonRestTimePicker, setShowCommonRestTimePicker] = useState(false);
  const [showPreparationTimePicker, setShowPreparationTimePicker] = useState(false);
  const [savedRoutineId, setSavedRoutineId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([]);
  const [quickSelection, setQuickSelection] = useState<'none' | 'week' | 'weekend'>('none');
  const isEditMode = Boolean(id);

  const { showSuccess, showError } = useSnackbar();
  const { saveSchedule } = useRoutineSchedule();

  const {
    routine,
    exercises,
    exerciseName,
    exerciseKey,
    exerciseNote,
    exerciseRest,
    series,
    globalUnitType,
    globalSeriesType,
    withLoad,
    globalRest,
    setRoutine,
    setExerciseName,
    setExerciseKey,
    setExerciseNote,
    setExerciseRest,
    setWithLoad,
    addSeries,
    removeSeries,
    copySeries,
    updateSeries,
    resetExerciseForm,
    loadExerciseForEdit,
    saveExercise,
    removeExercise,
    loadRoutine,
    updateGlobalSeriesType,
    updateGlobalUnitType,
    updateGlobalRest,
    updateWithLoad,
    updateExerciseRestMode,
    defaultRestBetweenExercises,
    updateDefaultRestBetweenExercises,
    updateExerciseRestTime,
    enablePreparation,
    preparationTime,
    updateEnablePreparation,
    updatePreparationTime
  } = useRoutineForm();

  useEffect(() => {
    if (isEditMode && id) {
      const loadExistingRoutine = async () => {
        setIsLoading(true);
        try {
          const success = await loadRoutine(id as string);
          if (!success) {
            showError(t('common.error'));
            router.back();
          }
        } catch (error) {
          console.error('Error loading routine:', error);
          showError(t('common.error'));
          router.back();
        } finally {
          setIsLoading(false);
        }
      };
      loadExistingRoutine();
    }
  }, [isEditMode, id]);

  // Preselect scheduled days when editing
  useEffect(() => {
    const loadExistingSchedule = async () => {
      if (!isEditMode || !id) return;
      try {
        const existing = await routineScheduleService.getScheduleByRoutineId(id as string);
        if (existing && Array.isArray(existing.scheduledDays)) {
          setSelectedDays(existing.scheduledDays);
          // infer quick selection
          const weekdays: DayOfWeek[] = ['monday','tuesday','wednesday','thursday','friday'];
          const weekend: DayOfWeek[] = ['saturday','sunday'];
          const sameSet = (a: DayOfWeek[], b: DayOfWeek[]) => a.length === b.length && a.every(d => b.includes(d));
          const sorted = [...existing.scheduledDays].sort((a,b) => ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].indexOf(a) - ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].indexOf(b));
          if (sameSet(sorted, weekdays)) setQuickSelection('week');
          else if (sameSet(sorted, weekend)) setQuickSelection('weekend');
          else setQuickSelection('none');
        } else {
          setSelectedDays([]);
          setQuickSelection('none');
        }
      } catch (e) {
        // Silent fail: keep defaults
      }
    };
    loadExistingSchedule();
  }, [isEditMode, id, step]);

  const applyExerciseSelection = useCallback((name: string, key: string) => {
    setExerciseName(name);
    setExerciseKey(key);
    setShowSeriesConfig(true);
  }, [setExerciseName, setExerciseKey]);

  const openAddExercise = useCallback(() => {
    resetExerciseForm();
    setShowExerciseSelector(true);
  }, [resetExerciseForm]);

  const openEditExercise = useCallback((index: number) => {
    loadExerciseForEdit(index);
    setShowSeriesConfig(true);
  }, [loadExerciseForEdit]);

  const handleSaveExercise = useCallback(() => {
    if (saveExercise()) {
      setShowSeriesConfig(false);
    }
  }, [saveExercise]);

  const handleExerciseSelect = useCallback(() => {
    setShowSeriesConfig(false);
    setShowExerciseSelector(true);
  }, []);

  const handleCommonRestTimeConfirm = useCallback(({ minutes, seconds }: { minutes: number; seconds: number }) => {
    const totalSeconds = minutes * 60 + seconds;
    updateDefaultRestBetweenExercises(totalSeconds);
    setShowCommonRestTimePicker(false);
  }, [updateDefaultRestBetweenExercises]);

  const handlePreparationTimeConfirm = useCallback(({ minutes, seconds }: { minutes: number; seconds: number }) => {
    const totalSeconds = minutes * 60 + seconds;
    updatePreparationTime(totalSeconds);
    setShowPreparationTimePicker(false);
  }, [updatePreparationTime]);

  const handleSaveRoutine = useCallback(async () => {
    try {
      if (!isRoutineComplete(routine.title, exercises.length)) {
        showError(t('common.error'));
        return;
      }

      const routineId = isEditMode ? (id as string) : generateRoutineId();
      const routineToSave = {
        id: routineId,
        title: routine.title.trim(),
        description: routine.description.trim(),
        exercises: exercises,
        createdAt: new Date().toISOString(),
        exerciseRestMode: routine.exerciseRestMode || 'beginner',
        enablePreparation: enablePreparation,
        preparationTime: enablePreparation ? preparationTime : undefined
      };

      await storageService.saveRoutine(routineToSave);
      setSavedRoutineId(routineId);
      
      if (isEditMode) {
        showSuccess(t('routine.updated'));
        router.push('/(tabs)/routines');
      } else {
        // Pour une nouvelle routine, passer à l'étape de planification
        setStep(3);
      }
    } catch (error) {
      console.error('Error saving routine:', error);
      showError(t('common.error'));
    }
  }, [routine, exercises, t, router, isEditMode, id, enablePreparation, preparationTime, showSuccess, showError]);

  const handleScheduleSave = useCallback(async (schedule: any) => {
    try {
      await saveSchedule(schedule);
      showSuccess(t('routine.saved'));
      router.push('/(tabs)/routines');
    } catch (error) {
      console.error('Error saving schedule:', error);
      showError(t('common.error'));
    }
  }, [saveSchedule, showSuccess, showError, t, router]);

  const handleSkipScheduling = useCallback(() => {
    if (isEditMode) {
      handleSaveRoutine();
    } else {
      showSuccess(t('routine.saved'));
      router.push('/(tabs)/routines');
    }
  }, [isEditMode, handleSaveRoutine, showSuccess, t, router]);

  const handleUpdateWithSchedule = useCallback(async () => {
    try {
      // D'abord sauvegarder la routine
      if (!isRoutineComplete(routine.title, exercises.length)) {
        showError(t('common.error'));
        return;
      }

      const routineId = id as string;
      const routineToSave = {
        id: routineId,
        title: routine.title.trim(),
        description: routine.description.trim(),
        exercises: exercises,
        createdAt: new Date().toISOString(),
        exerciseRestMode: routine.exerciseRestMode || 'beginner',
        enablePreparation: enablePreparation,
        preparationTime: enablePreparation ? preparationTime : undefined
      };

      await storageService.saveRoutine(routineToSave);

      // Ensuite sauvegarder la planification si des jours sont sélectionnés
      if (selectedDays.length > 0) {
        const schedule = routineScheduleService.createSchedule(
          routineId,
          routine.title.trim(),
          selectedDays
        );
        await saveSchedule(schedule);
      }

      showSuccess(t('routine.updated'));
      router.push('/(tabs)/routines');
    } catch (error) {
      console.error('Error updating routine with schedule:', error);
      showError(t('common.error'));
    }
  }, [routine, exercises, selectedDays, id, enablePreparation, preparationTime, saveSchedule, showSuccess, showError, t, router]);

  // Jours de la semaine avec traductions
  const daysOfWeek = useMemo(() => [
    { key: 'monday' as DayOfWeek, label: t('schedule.days.monday'), shortLabel: t('schedule.days.mondayShort') },
    { key: 'tuesday' as DayOfWeek, label: t('schedule.days.tuesday'), shortLabel: t('schedule.days.tuesdayShort') },
    { key: 'wednesday' as DayOfWeek, label: t('schedule.days.wednesday'), shortLabel: t('schedule.days.wednesdayShort') },
    { key: 'thursday' as DayOfWeek, label: t('schedule.days.thursday'), shortLabel: t('schedule.days.thursdayShort') },
    { key: 'friday' as DayOfWeek, label: t('schedule.days.friday'), shortLabel: t('schedule.days.fridayShort') },
    { key: 'saturday' as DayOfWeek, label: t('schedule.days.saturday'), shortLabel: t('schedule.days.saturdayShort') },
    { key: 'sunday' as DayOfWeek, label: t('schedule.days.sunday'), shortLabel: t('schedule.days.sundayShort') }
  ], [t]);

  const handleDayToggle = useCallback((day: DayOfWeek) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
    setQuickSelection('none');
  }, []);

  const handleQuickSelection = useCallback((type: 'none' | 'week' | 'weekend') => {
    setQuickSelection(type);
    
    switch (type) {
      case 'none':
        setSelectedDays([]);
        break;
      case 'week':
        setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
        break;
      case 'weekend':
        setSelectedDays(['saturday', 'sunday']);
        break;
    }
  }, []);

  const getDaysSummary = useCallback(() => {
    if (selectedDays.length === 0) return '';
    
    const dayLabels = selectedDays
      .sort((a, b) => {
        const dayOrder: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
      })
      .map(day => {
        const dayInfo = daysOfWeek.find(d => d.key === day);
        return dayInfo?.shortLabel || day;
      });

    return dayLabels.join(', ');
  }, [selectedDays, daysOfWeek]);

  const handleDirectScheduleSave = useCallback(async () => {
    if (selectedDays.length === 0) return;

    try {
      let routineId = savedRoutineId;

      // Ensure routine is saved first (creation flow safety)
      if (!routineId) {
        if (!isRoutineComplete(routine.title, exercises.length)) {
          showError(t('common.error'));
          return;
        }
        routineId = generateRoutineId();
        const routineToSave = {
          id: routineId,
          title: routine.title.trim(),
          description: routine.description.trim(),
          exercises: exercises,
          createdAt: new Date().toISOString(),
          exerciseRestMode: routine.exerciseRestMode || 'beginner',
          enablePreparation: enablePreparation,
          preparationTime: enablePreparation ? preparationTime : undefined
        };
        await storageService.saveRoutine(routineToSave);
        setSavedRoutineId(routineId);
      }

      const schedule = routineScheduleService.createSchedule(
        routineId as string,
        routine.title,
        selectedDays
      );
      await saveSchedule(schedule);
      showSuccess(t('routine.saved'));
      router.push('/(tabs)/routines');
    } catch (error) {
      console.error('Error saving schedule:', error);
      showError(t('common.error'));
    }
  }, [savedRoutineId, selectedDays, routine.title, exercises.length, routine.description, routine.exerciseRestMode, enablePreparation, preparationTime, saveSchedule, showSuccess, showError, t, router]);

  const canSave = useMemo(() => {
    return getValidSeries(series).length > 0;
  }, [series]);

  const isRoutineSaveReady = useMemo(() => {
    return isRoutineComplete(routine.title, exercises.length);
  }, [routine.title, exercises.length]);

  const renderExerciseSelectorModal = useMemo(() => (
    <ExerciseSelectionModal
      visible={showExerciseSelector}
      onClose={() => setShowExerciseSelector(false)}
      onExerciseSelect={(exercise) => {
        applyExerciseSelection(exercise.name, exercise.key);
        setShowExerciseSelector(false);
      }}
      selectedExercise={exerciseName}
      title={t('exerciseSelection.title')}
    />
  ), [showExerciseSelector, exerciseName, applyExerciseSelection, t]);

  const renderStep2 = useMemo(() => (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.sectionTitleContainer}>
        <Plus color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
        <Text variant="heading" style={styles.titleLabel}>
          {t('routine.selectExercises')}
        </Text>
      </View>

      {exercises.length === 0 && (
        <View style={styles.emptyStateContainer}>
          <Text variant="body" style={styles.emptyStateText}>
            {t('routine.noExerciseSelected')}
          </Text>
          <Text variant="caption" style={styles.emptyStateSubtext}>
            {t('routine.addExerciseToStart')}
          </Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }}>
        {exercises.map((ex, idx) => (
          <RoutineExerciseCard
            key={ex.key}
            exercise={ex}
            exerciseRestMode={routine.exerciseRestMode}
            onEdit={() => openEditExercise(idx)}
            onRemove={() => removeExercise(idx)}
            onRestTimeChange={(restTime) => updateExerciseRestTime(idx, restTime)}
          />
        ))}
      </ScrollView>

      <View style={styles.bottomButtons}>
        <Button
          title={t('routine.addExercise')}
          onPress={openAddExercise}
          variant="secondary"
          style={styles.secondaryButton}
          icon={<Plus size={20} color={theme.colors.text.primary} style={styles.buttonIcon} />}
        />
      </View>

      <View style={styles.footerSpacer} />

      <ActionFooter
        type="double"
        showSkipButton
        skipButtonText={t('common.back')}
        onSkip={() => setStep(1)}
        nextButtonText={t('common.next')}
        onNext={() => (isEditMode ? setStep(3) : handleSaveRoutine())}
        nextButtonDisabled={!isRoutineSaveReady}
      />

      {renderExerciseSelectorModal}
      <SeriesConfigModal
        visible={showSeriesConfig}
        exerciseName={exerciseName}
        series={series}
        globalUnitType={globalUnitType}
        globalSeriesType={globalSeriesType}
        withLoad={withLoad}
        globalRest={globalRest}
        exerciseNote={exerciseNote}
        exerciseRest={exerciseRest}
        exerciseRestMode={routine.exerciseRestMode || 'beginner'}
        onClose={() => setShowSeriesConfig(false)}
        onExerciseSelect={handleExerciseSelect}
        onSeriesAdd={addSeries}
        onSeriesRemove={removeSeries}
        onSeriesCopy={copySeries}
        onSeriesUpdate={updateSeries}
        onGlobalUnitTypeChange={updateGlobalUnitType}
        onGlobalSeriesTypeChange={updateGlobalSeriesType}
        onWithLoadToggle={() => updateWithLoad(!withLoad)}
        onGlobalRestChange={updateGlobalRest}
        onExerciseNoteChange={setExerciseNote}
        onExerciseRestChange={setExerciseRest}
        onSave={handleSaveExercise}
        canSave={canSave}
      />
    </SafeAreaView>
  ), [
    t,
    theme.colors.primary,
    routine.exerciseRestMode,
    exercises,
    updateExerciseRestTime,
    renderExerciseSelectorModal,
    showSeriesConfig,
    exerciseName,
    series,
    globalUnitType,
    globalSeriesType,
    withLoad,
    globalRest,
    exerciseNote,
    exerciseRest,
    openEditExercise,
    removeExercise,
    openAddExercise,
    handleSaveRoutine,
    isRoutineSaveReady,
    setShowSeriesConfig,
    handleExerciseSelect,
    addSeries,
    removeSeries,
    copySeries,
    updateSeries,
    updateGlobalUnitType,
    updateGlobalSeriesType,
    setWithLoad,
    updateGlobalRest,
    setExerciseNote,
    handleSaveExercise,
    canSave
  ]);

  const renderStep1 = useMemo(() => (
    <ScrollView style={{ flex: 1 }}>

      <View style={styles.exerciseRestSection}>
        <View style={styles.sectionTitleContainer}>
          <FileText color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
          <Text variant="subheading" style={styles.sectionTitle}>
            {t('routine.title')}
          </Text>
        </View>

        <Text variant="caption" style={styles.sectionDescription}>
          {t('routine.titleDescription')}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={t('routine.titlePlaceholder')}
          value={routine.title}
          onChangeText={title => setRoutine(r => ({ ...r, title }))}
          placeholderTextColor={theme.colors.text.secondary}
        />
      </View>

      <View style={styles.exerciseRestSection}>
        <View style={styles.sectionTitleContainer}>
          <FileText color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
          <Text variant="subheading" style={styles.sectionTitle}>
            {t('routine.description')}
          </Text>
        </View>

        <Text variant="caption" style={styles.sectionDescription}>
          {t('routine.descriptionDescription')}
        </Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={t('routine.descriptionPlaceholder')}
          value={routine.description}
          onChangeText={description => setRoutine(r => ({ ...r, description }))}
          multiline
          numberOfLines={3}
          placeholderTextColor={theme.colors.text.secondary}
        />
      </View>

      <View style={styles.exerciseRestSection}>
        <View style={styles.sectionTitleContainer}>
          <Timer color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
          <Text variant="subheading" style={styles.sectionTitle}>
            {t('routine.exerciseRestTitle')}
          </Text>
        </View>

        <Text variant="caption" style={styles.sectionDescription}>
          {t('routine.exerciseRestDescription')}
        </Text>

        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              routine.exerciseRestMode === 'beginner' && styles.modeButtonActive
            ]}
            onPress={() => updateExerciseRestMode('beginner')}
          >
            <View style={styles.modeContent}>
              <Timer
                color={routine.exerciseRestMode === 'beginner' ? theme.colors.background.main : theme.colors.text.secondary}
                size={16}
                style={styles.modeIcon}
              />
              <Text variant="body" style={[
                styles.modeTitle,
                routine.exerciseRestMode === 'beginner' && styles.modeTextActive
              ]}>
                {t('routine.beginnerMode')}
              </Text>
              <Text variant="caption" style={[
                styles.modeDescription,
                routine.exerciseRestMode === 'beginner' && styles.modeTextActive
              ]}>
                {t('routine.beginnerModeDescription')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              routine.exerciseRestMode === 'advanced' && styles.modeButtonActive
            ]}
            onPress={() => updateExerciseRestMode('advanced')}
          >
            <View style={styles.modeContent}>
              <Settings
                color={routine.exerciseRestMode === 'advanced' ? theme.colors.background.main : theme.colors.text.secondary}
                size={16}
                style={styles.modeIcon}
              />
              <Text variant="body" style={[
                styles.modeTitle,
                routine.exerciseRestMode === 'advanced' && styles.modeTextActive
              ]}>
                {t('routine.advancedMode')}
              </Text>
              <Text variant="caption" style={[
                styles.modeDescription,
                routine.exerciseRestMode === 'advanced' && styles.modeTextActive
              ]}>
                {t('routine.advancedModeDescription')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {routine.exerciseRestMode === 'beginner' && (
          <View style={styles.commonRestContainer}>
            <Text variant="body" style={styles.commonRestLabel}>
              {t('routine.commonExerciseRest')}
            </Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowCommonRestTimePicker(true)}
            >
              <Text variant="body" style={styles.timePickerButtonText}>
                {formatRestTime(Math.floor(defaultRestBetweenExercises / 60), defaultRestBetweenExercises % 60)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.exerciseRestSection}>
        <View style={styles.sectionTitleContainer}>
          <Zap color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
          <Text variant="subheading" style={styles.sectionTitle}>
            {t('routine.preparationTitle')}
          </Text>
        </View>

        <Text variant="caption" style={styles.sectionDescription}>
          {t('routine.preparationDescription')}
        </Text>

        <View style={styles.preparationToggleContainer}>
          <Text variant="body" style={styles.preparationToggleLabel}>
            {t('routine.enablePreparation')}
          </Text>
          <TouchableOpacity
            style={[
              styles.switchContainer,
              enablePreparation && styles.switchContainerActive
            ]}
            onPress={() => updateEnablePreparation(!enablePreparation)}
          >
            <View style={[
              styles.switchThumb,
              enablePreparation && styles.switchThumbActive
            ]} />
          </TouchableOpacity>
        </View>

        {enablePreparation && (
          <View style={styles.commonRestContainer}>
            <Text variant="body" style={styles.commonRestLabel}>
              {t('routine.preparationTime')}
            </Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setShowPreparationTimePicker(true)}
            >
              <Text variant="body" style={styles.timePickerButtonText}>
                {formatRestTime(Math.floor(preparationTime / 60), preparationTime % 60)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Button
        title={t('common.next')}
        onPress={() => setStep(2)}
        disabled={!routine.title.trim()}
        style={styles.button}
      />

      <TimerPickerModal
        visible={showCommonRestTimePicker}
        onClose={() => setShowCommonRestTimePicker(false)}
        onConfirm={handleCommonRestTimeConfirm}
        modalTitle={t('routine.selectRestTime')}
        hideHours
      />

      <TimerPickerModal
        visible={showPreparationTimePicker}
        onClose={() => setShowPreparationTimePicker(false)}
        onConfirm={handlePreparationTimeConfirm}
        modalTitle={t('routine.preparationTime')}
        hideHours
      />
    </ScrollView>
  ), [routine.title, routine.description, routine.exerciseRestMode, defaultRestBetweenExercises, enablePreparation, preparationTime, t, theme.colors, styles, setRoutine, updateExerciseRestMode, updateDefaultRestBetweenExercises, updateEnablePreparation, showCommonRestTimePicker, showPreparationTimePicker, handleCommonRestTimeConfirm, handlePreparationTimeConfirm]);

  const renderStep3 = useMemo(() => (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.sectionTitleContainer}>
        <Timer color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
        <Text variant="heading" style={styles.titleLabel}>
          {t('schedule.planRoutine')}
        </Text>
      </View>

      <View style={styles.exerciseRestSection}>
        <Text variant="body" style={styles.sectionDescription}>
          {t('schedule.description', { routine: routine.title })}
        </Text>

        {/* Sélections rapides */}
        <View style={styles.quickSelectionContainer}>
          <Text variant="body" style={styles.quickSelectionLabel}>
            {t('schedule.quickSelections')}
          </Text>
          
          <View style={styles.quickSelectionButtons}>
            <TouchableOpacity
              style={[
                styles.quickButton,
                quickSelection === 'none' && styles.quickButtonActive
              ]}
              onPress={() => handleQuickSelection('none')}
            >
              <Text style={[
                styles.quickButtonText,
                quickSelection === 'none' && styles.quickButtonTextActive
              ]}>
                {t('schedule.quick.none')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickButton,
                quickSelection === 'week' && styles.quickButtonActive
              ]}
              onPress={() => handleQuickSelection('week')}
            >
              <Text style={[
                styles.quickButtonText,
                quickSelection === 'week' && styles.quickButtonTextActive
              ]}>
                {t('schedule.quick.weekdays')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickButton,
                quickSelection === 'weekend' && styles.quickButtonActive
              ]}
              onPress={() => handleQuickSelection('weekend')}
            >
              <Text style={[
                styles.quickButtonText,
                quickSelection === 'weekend' && styles.quickButtonTextActive
              ]}>
                {t('schedule.quick.weekend')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sélection des jours */}
        <View style={styles.daysContainer}>
          <Text variant="body" style={styles.daysLabel}>
            {t('schedule.chooseDays')}
          </Text>
          
          <View style={styles.daysGrid}>
            {daysOfWeek.map((day) => {
              const isSelected = selectedDays.includes(day.key);
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    isSelected && styles.dayButtonSelected
                  ]}
                  onPress={() => handleDayToggle(day.key)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    isSelected && styles.dayButtonTextSelected
                  ]}>
                    {day.shortLabel}
                  </Text>
                  <Text style={[
                    styles.dayButtonSubtext,
                    isSelected && styles.dayButtonSubtextSelected
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Résumé */}
        {selectedDays.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text variant="body" style={styles.summaryText}>
              {t('schedule.summary', { 
                count: selectedDays.length,
                days: getDaysSummary()
              })}
            </Text>
          </View>
        )}

        {/* Note d'information */}
        <View style={styles.infoContainer}>
          <Text variant="caption" style={styles.infoText}>
            💡 {t('schedule.infoNote')}
          </Text>
        </View>
      </View>

      <View style={styles.footerSpacer} />

      <ActionFooter
        type="double"
        showSkipButton
        skipButtonText={isEditMode ? t('common.back') : t('routine.skipScheduling')}
        onSkip={isEditMode ? () => setStep(2) : handleSkipScheduling}
        nextButtonText={isEditMode ? t('common.update') : t('schedule.save')}
        onNext={isEditMode ? handleUpdateWithSchedule : handleDirectScheduleSave}
        nextButtonDisabled={!isEditMode && selectedDays.length === 0}
      />
    </ScrollView>
  ), [
    t,
    theme.colors,
    isEditMode,
    routine.title,
    selectedDays,
    quickSelection,
    daysOfWeek,
    handleQuickSelection,
    handleDayToggle,
    getDaysSummary,
    handleDirectScheduleSave,
    handleSkipScheduling,
    styles
  ]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title={isEditMode ? t('routine.editTitle') : t('routine.createTitle')}
          showBackButton
        />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text variant="body" style={{ color: theme.colors.text.secondary }}>
            {t('common.loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEditMode ? t('routine.editTitle') : t('routine.createTitle')}
        showBackButton
      />
      <View style={styles.content}>
        {step === 1 && renderStep1}
        {step === 2 && renderStep2}
        {step === 3 && renderStep3}
      </View>
    </SafeAreaView>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.main },
  content: { flex: 1, padding: theme.spacing.base },
  title: { marginBottom: theme.spacing.base, color: theme.colors.text.primary },
  label: { marginBottom: theme.spacing.xs, color: theme.colors.text.primary },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  titleIcon: {
    marginRight: theme.spacing.sm
  },
  titleLabel: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.background.input,
    color: theme.colors.text.primary
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.background.input,
    color: theme.colors.text.primary
  },
  button: {
    marginVertical: theme.spacing.sm
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
    color: theme.colors.text.primary
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  emptyStateText: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center'
  },
  emptyStateSubtext: {
    color: theme.colors.text.secondary,
    textAlign: 'center'
  },
  bottomButtons: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.base
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.base
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
    alignSelf: 'center'
  },
  exerciseRestSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm
  },
  sectionDescription: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.base,
    lineHeight: 20
  },
  modeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.base
  },
  modeButton: {
    flex: 1,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.input
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  modeContent: {
    alignItems: 'center'
  },
  modeIcon: {
    marginBottom: theme.spacing.xs
  },
  modeTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center'
  },
  modeDescription: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm
  },
  modeTextActive: {
    color: theme.colors.background.main
  },
  commonRestContainer: {
    marginTop: theme.spacing.base,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.md
  },
  commonRestLabel: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.regular
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.background.main,
    color: theme.colors.text.primary,
    textAlign: 'center'
  },
  timeUnit: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular
  },
  timePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timePickerButtonText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base
  },
  preparationToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm
  },
  preparationToggleLabel: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.base
  },
  switchContainer: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.background.input,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    padding: 2,
    justifyContent: 'center'
  },
  switchContainerActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.background.main,
    alignSelf: 'flex-start',
    ...theme.shadows.sm
  },
  switchThumbActive: {
    alignSelf: 'flex-end'
  },
  scheduleActions: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg
  },
  quickSelectionContainer: {
    marginBottom: theme.spacing.xl,
  },
  quickSelectionLabel: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  quickSelectionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  quickButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.background.input,
    backgroundColor: theme.colors.background.secondary,
  },
  quickButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  quickButtonTextActive: {
    color: 'white',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  daysContainer: {
    marginBottom: theme.spacing.xl,
  },
  daysLabel: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dayButton: {
    width: '30%',
    aspectRatio: 1.2,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.background.input,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  dayButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  dayButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.xs,
  },
  dayButtonTextSelected: {
    color: theme.colors.primary,
  },
  dayButtonSubtext: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
    textAlign: 'center',
  },
  dayButtonSubtextSelected: {
    color: theme.colors.primary,
  },
  summaryContainer: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryText: {
    color: theme.colors.primary,
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  infoContainer: {
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerSpacer: {
    height: theme.spacing.xl * 3,
  },
});

export default NewRoutineScreen;
