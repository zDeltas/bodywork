import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import { useTranslation } from '@/app/hooks/useTranslation';
import ExerciseSelectionModal from '@/app/components/exercises/ExerciseSelectionModal';
import { Layers, Plus } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { storageService } from '@/app/services/storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getValidSeries } from '../../utils/seriesUtils';
import { useRoutineForm } from '@/app/hooks/useRoutineForm';
import { generateRoutineId, isRoutineComplete } from '@/app/utils/routineUtils';

import SeriesConfigModal from '@/app/components/routine/SeriesConfigModal';
import RoutineExerciseCard from '@/app/components/routine/RoutineExerciseCard';

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
  
  // Détermine si on est en mode édition
  const isEditMode = Boolean(id);

  const {
    routine,
    exercises,
    exerciseName,
    exerciseKey,
    exerciseNote,
    series,
    globalUnitType,
    globalSeriesType,
    withLoad,
    globalRest,
    setRoutine,
    setExerciseName,
    setExerciseKey,
    setExerciseNote,
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
    updateGlobalRest
  } = useRoutineForm();

  // Charger la routine existante en mode édition
  useEffect(() => {
    if (isEditMode && id) {
      const loadExistingRoutine = async () => {
        setIsLoading(true);
        try {
          const success = await loadRoutine(id as string);
          if (!success) {
            alert(t('common.error'));
            router.back();
          }
        } catch (error) {
          console.error('Error loading routine:', error);
          alert(t('common.error'));
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

  const handleSaveRoutine = useCallback(async () => {
    try {
      if (!isRoutineComplete(routine.title, exercises.length)) {
        alert(t('common.error'));
        return;
      }

      const routineToSave = {
        id: isEditMode ? (id as string) : generateRoutineId(),
        title: routine.title.trim(),
        description: routine.description.trim(),
        exercises: exercises,
        createdAt: new Date().toISOString()
      };

      await storageService.saveRoutine(routineToSave);
      alert(isEditMode ? t('routine.updated') : t('routine.saved'));
      router.push('/(tabs)/routines');
    } catch (error) {
      console.error('Error saving routine:', error);
      alert(t('common.error'));
    }
  }, [routine, exercises, t, router]);

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
            onEdit={() => openEditExercise(idx)}
            onRemove={() => removeExercise(idx)}
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
        onClose={() => setShowSeriesConfig(false)}
        onExerciseSelect={handleExerciseSelect}
        onSeriesAdd={addSeries}
        onSeriesRemove={removeSeries}
        onSeriesCopy={copySeries}
        onSeriesUpdate={updateSeries}
        onGlobalUnitTypeChange={updateGlobalUnitType}
        onGlobalSeriesTypeChange={updateGlobalSeriesType}
        onWithLoadToggle={() => setWithLoad(!withLoad)}
        onGlobalRestChange={updateGlobalRest}
        onExerciseNoteChange={setExerciseNote}
        onSave={handleSaveExercise}
        canSave={canSave}
      />
    </View>
  ), [
    t,
    theme.colors.primary,
    exercises,
    renderExerciseSelectorModal,
    showSeriesConfig,
    exerciseName,
    series,
    globalUnitType,
    globalSeriesType,
    withLoad,
    globalRest,
    exerciseNote,
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
    <>
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
      <Button
        title={t('common.next')}
        onPress={() => setStep(2)}
        disabled={!routine.title.trim()}
        style={styles.button}
      />
    </>
  ), [routine.title, routine.description, t, theme.colors.text.secondary, styles, setRoutine]);

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
  }
});

export default NewRoutineScreen;
