import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import { useTranslation } from '@/app/hooks/useTranslation';
import ExerciseSelectionModal from '@/app/components/exercises/ExerciseSelectionModal';
import TimerPickerModal from '@/app/components/timer/TimerPickerModal';
import { Clock, Layers, Plus, Settings } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { storageService } from '@/app/services/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getValidSeries } from '../../utils/seriesUtils';
import { useRoutineForm } from '@/app/hooks/useRoutineForm';
import { formatRestTime, generateRoutineId, isRoutineComplete } from '@/app/utils/routineUtils';

import SeriesConfigModal from '@/app/components/routine/SeriesConfigModal';
import RoutineExerciseCard from '@/app/components/routine/RoutineExerciseCard';
import { useSnackbar } from '@/app/hooks/useSnackbar';

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
  const isEditMode = Boolean(id);

  const { showSuccess, showError } = useSnackbar();

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

      const routineToSave = {
        id: isEditMode ? (id as string) : generateRoutineId(),
        title: routine.title.trim(),
        description: routine.description.trim(),
        exercises: exercises,
        createdAt: new Date().toISOString(),
        exerciseRestMode: routine.exerciseRestMode || 'beginner',
        enablePreparation: enablePreparation,
        preparationTime: enablePreparation ? preparationTime : undefined
      };

      await storageService.saveRoutine(routineToSave);
      showSuccess(isEditMode ? t('routine.updated') : t('routine.saved'));
      router.push('/(tabs)/routines');
    } catch (error) {
      console.error('Error saving routine:', error);
      showError(t('common.error'));
    }
  }, [routine, exercises, t, router, isEditMode, id, enablePreparation, preparationTime, showSuccess, showError]);

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
    <View style={{ flex: 1 }}>
      <View style={styles.sectionTitleContainer}>
        <Layers color={theme.colors.primary} size={24} style={styles.sectionTitleIcon} />
        <Text variant="heading" style={styles.sectionTitle}>
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
          style={styles.secondaryButton}
          icon={<Plus size={20} color={theme.colors.text.primary} style={styles.buttonIcon} />}
        />
        <Button
          title={isEditMode ? t('common.update') : t('common.save')}
          onPress={handleSaveRoutine}
          style={styles.primaryButton}
          disabled={!isRoutineSaveReady}
        />
      </View>

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
    </View>
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
      <Text variant="subheading" style={styles.label}>{t('routine.title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('routine.titlePlaceholder')}
        value={routine.title}
        onChangeText={title => setRoutine(r => ({ ...r, title }))}
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text variant="subheading" style={styles.label}>{t('routine.description')}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={t('routine.descriptionPlaceholder')}
        value={routine.description}
        onChangeText={description => setRoutine(r => ({ ...r, description }))}
        multiline
        numberOfLines={3}
        placeholderTextColor={theme.colors.text.secondary}
      />

      {}
      <View style={styles.exerciseRestSection}>
        <View style={styles.sectionTitleContainer}>
          <Clock color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
          <Text variant="subheading" style={styles.sectionTitle}>
            {t('routine.exerciseRestTitle')}
          </Text>
        </View>

        <Text variant="caption" style={styles.sectionDescription}>
          {t('routine.exerciseRestDescription')}
        </Text>

        {}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              routine.exerciseRestMode === 'beginner' && styles.modeButtonActive
            ]}
            onPress={() => updateExerciseRestMode('beginner')}
          >
            <View style={styles.modeContent}>
              <Clock
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

        {}
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

      {/* Section Temps de préparation */}
      <View style={styles.exerciseRestSection}>
        <View style={styles.sectionTitleContainer}>
          <Clock color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
          <Text variant="subheading" style={styles.sectionTitle}>
            {t('routine.preparationTitle')}
          </Text>
        </View>

        <Text variant="caption" style={styles.sectionDescription}>
          {t('routine.preparationDescription')}
        </Text>

        {/* Switch pour activer/désactiver le temps de préparation */}
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

        {/* Configuration du temps de préparation si activé */}
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          title={isEditMode ? t('routine.editTitle') : t('routine.createTitle')}
          showBackButton
        />
        <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text variant="body" style={{ color: theme.colors.text.secondary }}>
            {t('common.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={isEditMode ? t('routine.editTitle') : t('routine.createTitle')}
        showBackButton
      />
      <View style={styles.content}>
        {step === 1 && renderStep1}
        {step === 2 && renderStep2}
      </View>
    </View>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.main },
  content: { flex: 1, padding: theme.spacing.base },
  title: { marginBottom: theme.spacing.base, color: theme.colors.text.primary },
  label: { marginBottom: theme.spacing.xs, color: theme.colors.text.primary },
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
  primaryButton: {
    backgroundColor: theme.colors.primary,
    marginVertical: theme.spacing.sm,
    height: 48
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
    fontFamily: theme.typography.fontFamily.medium
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
    fontFamily: theme.typography.fontFamily.medium
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
    fontFamily: theme.typography.fontFamily.medium,
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
    fontFamily: theme.typography.fontFamily.medium,
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
  }
});

export default NewRoutineScreen;
