import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import { useTranslation } from '@/app/hooks/useTranslation';
import ExerciseList from '@/app/components/exercises/ExerciseList';
import { BarChart, ChevronDown, Edit2, Layers, Plus, TimerIcon, Weight, X, Clock, Ruler } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { storageService } from '@/app/services/storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TimerPickerModal } from 'react-native-timer-picker';
import { Exercise, Routine, Series } from '@/types/common';

// Structure de base pour la routine en cours d'édition
const initialRoutine = {
  title: '',
  description: '',
  exercises: []
};

// Structure pour chaque série
interface RoutineSeries {
  unitType: 'reps' | 'time' | 'distance';
  weight: string;
  reps: string;
  duration: string; // in seconds
  distance: string; // in meters
  note: string;
  rest: string;
  type: 'warmUp' | 'workingSet';
}

export default function EditRoutineScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [step, setStep] = useState(1);
  const [routine, setRoutine] = useState(initialRoutine);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; key: string } | null>(null);
  const [series, setSeries] = useState<RoutineSeries[]>([
    { unitType: 'reps', weight: '', reps: '', duration: '', distance: '', note: '', rest: '', type: 'workingSet' }
  ]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showSeriesConfig, setShowSeriesConfig] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState<number | null>(null);

  // Charger la routine existante
  useEffect(() => {
    const loadRoutine = async () => {
      try {
        const routines = await storageService.getRoutines();
        const existingRoutine = routines.find(r => r.id === id);
        if (existingRoutine) {
          setRoutine({
            title: existingRoutine.title,
            description: existingRoutine.description,
            exercises: []
          });
          setExercises(existingRoutine.exercises);
        }
      } catch (error) {
        console.error('Error loading routine:', error);
        alert(t('common.error'));
      }
    };
    loadRoutine();
  }, [id]);

  // Ouvre la modale pour ajouter un nouvel exercice
  const openAddExercise = () => {
    setSelectedMuscle('');
    setSelectedExercise(null);
    setSeries([{ unitType: 'reps', weight: '', reps: '', duration: '', distance: '', note: '', rest: '', type: 'workingSet' }]);
    setEditingIndex(null);
    setShowExerciseSelector(true);
  };

  // Ouvre la modale pour éditer un exercice existant
  const openEditExercise = (index: number) => {
    const ex = exercises[index];
    setSelectedMuscle('');
    setSelectedExercise({ name: ex.name, key: ex.translationKey });
    setSeries(ex.series.map((s) => ({
      unitType: s.unitType || 'reps', // Default to 'reps' for backward compatibility
      weight: s.weight.toString(),
      reps: s.reps ? s.reps.toString() : '',
      duration: s.duration ? s.duration.toString() : '',
      distance: s.distance ? s.distance.toString() : '',
      note: s.note,
      rest: s.rest ?? '',
      type: s.type
    })));
    setEditingIndex(index);
    setShowSeriesConfig(true);
  };

  // Supprime un exercice de la routine
  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Ajout/suppression de séries
  const addSeries = () => {
    setSeries((prev) => [
      ...prev,
      { unitType: 'reps', weight: '', reps: '', duration: '', distance: '', note: '', rest: '', type: 'workingSet' }
    ]);
  };

  const removeSeries = (index: number) => {
    setSeries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSeries = (index: number, field: keyof RoutineSeries, value: string) => {
    setSeries((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const setSeriesType = (index: number, type: 'warmUp' | 'workingSet') => {
    setSeries((prev) => prev.map((s, i) => (i === index ? { ...s, type } : s)));
  };

  // Sauvegarde de l'exercice
  const saveExercise = () => {
    if (!selectedExercise) return;
    const formattedSeries: Series[] = series.map((s) => ({
      unitType: s.unitType,
      weight: parseFloat(s.weight) || 0,
      reps: s.unitType === 'reps' ? (parseInt(s.reps) || 0) : undefined,
      duration: s.unitType === 'time' ? (parseInt(s.duration) || 0) : undefined,
      distance: s.unitType === 'distance' ? (parseFloat(s.distance) || 0) : undefined,
      note: s.note,
      rest: s.rest,
      type: s.type,
      rpe: 0
    }));
    const newEx: Exercise = {
      name: selectedExercise.name,
      key: `${selectedExercise.key}_${Date.now()}`,
      translationKey: selectedExercise.key,
      series: formattedSeries
    };
    setExercises((prev) => {
      if (editingIndex !== null) {
        const copy = [...prev];
        copy[editingIndex] = newEx;
        return copy;
      } else {
        return [...prev, newEx];
      }
    });
    setShowSeriesConfig(false);
  };

  // Sauvegarde de la routine
  const handleSaveRoutine = async () => {
    try {
      if (!routine.title.trim()) {
        alert(t('common.error'));
        return;
      }

      if (exercises.length === 0) {
        alert(t('routine.noExerciseSelected'));
        return;
      }

      const routineToSave: Routine = {
        id: id as string,
        title: routine.title.trim(),
        description: routine.description.trim(),
        exercises: exercises,
        createdAt: new Date().toISOString()
      };

      await storageService.saveRoutine(routineToSave);
      alert(t('routine.saved'));
      router.push('/(tabs)/routines');
    } catch (error) {
      console.error('Error saving routine:', error);
      alert(t('common.error'));
    }
  };

  // Étape 1 : titre et description
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.sectionTitleContainer}>
        <Layers color={theme.colors.primary} size={24} style={styles.sectionTitleIcon} />
        <Text variant="heading" style={styles.sectionTitle}>
          {t('routine.title')}
        </Text>
      </View>

      <TextInput
        style={styles.input}
        value={routine.title}
        onChangeText={(text) => setRoutine(prev => ({ ...prev, title: text }))}
        placeholder={t('routine.titlePlaceholder')}
        placeholderTextColor={theme.colors.text.secondary}
      />

      <View style={styles.sectionTitleContainer}>
        <Layers color={theme.colors.primary} size={24} style={styles.sectionTitleIcon} />
        <Text variant="heading" style={styles.sectionTitle}>
          {t('routine.description')}
        </Text>
      </View>

      <TextInput
        style={[styles.input, styles.textArea]}
        value={routine.description}
        onChangeText={(text) => setRoutine(prev => ({ ...prev, description: text }))}
        placeholder={t('routine.descriptionPlaceholder')}
        placeholderTextColor={theme.colors.text.secondary}
        multiline
        numberOfLines={4}
      />

      <Button
        title={t('common.next')}
        onPress={() => setStep(2)}
        style={styles.primaryButton}
        disabled={!routine.title.trim()}
      />
    </View>
  );

  // Étape 2 : gestion des exercices
  const renderStep2 = () => (
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
          <View key={ex.key} style={styles.exerciseCard}>
            <View style={styles.exerciseCardContent}>
              <View style={styles.exerciseInfo}>
                <Text variant="subheading" style={styles.exerciseName}>
                  {ex.name}
                </Text>
                <Text variant="caption" style={styles.exerciseDetails}>
                  {t('workout.series')}: {ex.series.length}
                </Text>
              </View>
              <View style={styles.exerciseActions}>
                <TouchableOpacity
                  style={styles.exerciseActionButton}
                  onPress={() => openEditExercise(idx)}
                >
                  <Edit2 size={18} color={theme.colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.exerciseActionButton}
                  onPress={() => removeExercise(idx)}
                >
                  <X size={18} color={theme.colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
          title={t('common.save')}
          onPress={handleSaveRoutine}
          style={styles.primaryButton}
          disabled={exercises.length === 0 || !routine.title.trim()}
        />
      </View>

      {/* Modales */}
      <Modal
        visible={showExerciseSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExerciseSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setShowExerciseSelector(false)}
              >
                <X size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text variant="heading">{t('workout.customExercise')}</Text>
            </View>
            <ExerciseList
              selectedMuscle={selectedMuscle}
              setSelectedMuscle={setSelectedMuscle}
              exercise={selectedExercise?.name || ''}
              setExercise={(name, key) => {
                setSelectedExercise({ name, key: key || '' });
                setShowExerciseSelector(false);
                setShowSeriesConfig(true);
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSeriesConfig}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSeriesConfig(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text variant="heading">{t('routine.configureSeries')}</Text>
              <TouchableOpacity onPress={() => setShowSeriesConfig(false)}>
                <X size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.exerciseButton}
              onPress={() => {
                setShowSeriesConfig(false);
                setShowExerciseSelector(true);
              }}
            >
              <Text
                variant="body"
                style={[styles.exerciseButtonText, !selectedExercise?.name && { color: theme.colors.text.secondary }]}
              >
                {selectedExercise?.name || t('stats.selectExercise')}
              </Text>
              <ChevronDown color={theme.colors.text.secondary} size={20} />
            </TouchableOpacity>

            <ScrollView style={{ flex: 1 }}>
              {series.map((item, index) => (
                <View key={index} style={styles.seriesContainer}>
                  <View style={styles.seriesHeader}>
                    <Text variant="subheading" style={styles.seriesTitle}>
                      {t('workout.series')} {index + 1}
                    </Text>
                    <View style={styles.seriesActions}>
                      {index > 0 && (
                        <TouchableOpacity
                          style={styles.seriesActionButton}
                          onPress={() => removeSeries(index)}
                        >
                          <X color={theme.colors.text.primary} size={18} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.column}>
                      <View style={styles.sectionTitleContainer}>
                        <Weight color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
                        <Text variant="body" style={styles.seriesInputLabel}>
                          {t('workout.weightKg')}
                        </Text>
                      </View>
                      <TextInput
                        style={styles.compactInput}
                        value={item.weight}
                        onChangeText={(value) => updateSeries(index, 'weight', value)}
                        placeholder="0"
                        placeholderTextColor={theme.colors.text.secondary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.column}>
                      <View style={styles.sectionTitleContainer}>
                        <BarChart
                          color={theme.colors.primary}
                          size={20}
                          style={styles.sectionTitleIcon}
                        />
                        <Text variant="body" style={styles.seriesInputLabel}>
                          {t('workout.reps')}
                        </Text>
                      </View>
                      <TextInput
                        style={styles.compactInput}
                        value={item.reps}
                        onChangeText={(value) => updateSeries(index, 'reps', value)}
                        placeholder="0"
                        placeholderTextColor={theme.colors.text.secondary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.column}>
                      <View style={styles.sectionTitleContainer}>
                        <TimerIcon color={theme.colors.primary} size={20} style={styles.sectionTitleIcon} />
                        <Text variant="body" style={styles.seriesInputLabel}>
                          {t('timer.restTime')}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.compactInput}
                        onPress={() => {
                          setCurrentSeriesIndex(index);
                          setShowTimerPicker(true);
                        }}
                      >
                        <Text style={styles.restTimeText}>
                          {item.rest || '0:00'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.noteContainer}>
                    <Text variant="body" style={styles.seriesInputLabel}>
                      {t('common.note')}
                    </Text>
                    <TextInput
                      style={styles.noteInput}
                      value={item.note}
                      onChangeText={(value) => updateSeries(index, 'note', value)}
                      placeholder={t('workout.optionalNote')}
                      placeholderTextColor={theme.colors.text.secondary}
                      multiline
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSeriesButton}
                onPress={addSeries}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Plus size={20} color={theme.colors.text.primary} />
                  <Text style={styles.addSeriesText}>{t('workout.addSeries')}</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <Button
              title={t('common.save')}
              onPress={saveExercise}
              style={styles.primaryButton}
              disabled={!selectedExercise}
            />
          </View>
        </View>
      </Modal>

      <TimerPickerModal
        visible={showTimerPicker}
        setIsVisible={setShowTimerPicker}
        onConfirm={({ hours, minutes, seconds }) => {
          if (currentSeriesIndex !== null) {
            const rest = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            updateSeries(currentSeriesIndex, 'rest', rest);
          }
        }}
        modalTitle={t('timer.restTime')}
        closeOnOverlayPress
        hideHours
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={t('routine.title')}
        showBackButton
      />
      <View style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </View>
    </View>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main
  },
  content: {
    flex: 1,
    padding: theme.spacing.base
  },
  stepContainer: {
    flex: 1,
    gap: theme.spacing.lg
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  },
  sectionTitleIcon: {
    marginRight: theme.spacing.xs
  },
  sectionTitle: {
    color: theme.colors.text.primary
  },
  input: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.lg
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.button
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: theme.colors.background.main,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.base,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  modalBackButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center'
  },
  exerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg
  },
  exerciseButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base
  },
  seriesContainer: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.base
  },
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base
  },
  seriesTitle: {
    color: theme.colors.text.primary
  },
  seriesActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  seriesActionButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    marginBottom: theme.spacing.base
  },
  column: {
    flex: 1
  },
  seriesInputLabel: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  compactInput: {
    backgroundColor: theme.colors.background.main,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base
  },
  restTimeText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base
  },
  noteContainer: {
    marginTop: theme.spacing.base
  },
  noteInput: {
    backgroundColor: theme.colors.background.main,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  addSeriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.base
  },
  addSeriesText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    marginLeft: theme.spacing.sm
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  emptyStateText: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm
  },
  emptyStateSubtext: {
    color: theme.colors.text.secondary,
    textAlign: 'center'
  },
  exerciseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.base,
    overflow: 'hidden'
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.base
  },
  exerciseInfo: {
    flex: 1
  },
  exerciseName: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  exerciseDetails: {
    color: theme.colors.text.secondary
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  exerciseActionButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomButtons: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.base
  },
  buttonIcon: {
    marginRight: theme.spacing.sm
  }
}); 
