import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInput as RNTextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import { useTranslation } from '@/app/hooks/useTranslation';
import ExerciseList from '@/app/components/exercises/ExerciseList';
import { BarChart, ChevronDown, Edit2, Layers, Plus, TimerIcon, Weight, X } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { storageService } from '@/app/services/storage';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'expo-router';
import { TimerPickerModal } from 'react-native-timer-picker';

// Structure de base pour la routine en cours de création
const initialRoutine = {
  title: '',
  description: '',
  exercises: [] // à remplir à l'étape 2
};

// Nouvelle structure pour chaque série (sans RPE)
interface RoutineSeries {
  weight: string;
  reps: string;
  note: string;
  rest: string;
  type: 'warmUp' | 'workingSet';
}

export default function NewRoutineScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [routine, setRoutine] = useState(initialRoutine);
  const [exercises, setExercises] = useState<any[]>([]); // [{ name, key, series }]
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; key: string } | null>(null);
  const [series, setSeries] = useState<RoutineSeries[]>([
    { weight: '', reps: '', note: '', rest: '', type: 'workingSet' }
  ]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showSeriesConfig, setShowSeriesConfig] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState<number | null>(null);

  // Ouvre la modale pour ajouter un nouvel exercice
  const openAddExercise = () => {
    setSelectedMuscle('');
    setSelectedExercise(null);
    setSeries([{ weight: '', reps: '', note: '', rest: '', type: 'workingSet' }]);
    setEditingIndex(null);
    setShowExerciseSelector(true);
  };

  // Ouvre la modale pour éditer un exercice existant
  const openEditExercise = (index: number) => {
    const ex = exercises[index];
    setSelectedMuscle('');
    setSelectedExercise({ name: ex.name, key: ex.key });
    setSeries(ex.series);
    setEditingIndex(index);
    setShowSeriesConfig(true);
  };

  // Ajoute ou met à jour un exercice dans la routine
  const saveExercise = () => {
    if (!selectedExercise) return;
    const newEx = {
      name: selectedExercise.name,
      key: `${selectedExercise.key}_${Date.now()}`, // Ajout d'un timestamp pour garantir l'unicité
      series: [...series]
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

  // Supprime un exercice de la routine
  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Ajout/suppression de séries
  const addSeries = () => {
    setSeries((prev) => [
      ...prev,
      { weight: '', reps: '', note: '', rest: '', type: 'workingSet' }
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

  // Fonction pour formater le temps de repos
  const formatRestTime = (minutes: number, seconds: number) => {
    if (minutes === 0 && seconds === 0) return '';
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fonction pour parser le temps de repos
  const parseRestTime = (rest: string) => {
    if (!rest) return { minutes: 0, seconds: 0 };
    const [minutes, seconds] = rest.split(':').map(Number);
    return { minutes, seconds };
  };

  // Modale de sélection d'exercice
  const renderExerciseSelectorModal = () => (
    <Modal
      visible={showExerciseSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowExerciseSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text variant="heading" style={styles.modalTitle}>
              {t('stats.selectExercise')}
            </Text>
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
              setSelectedMuscle={setSelectedMuscle}
              exercise={selectedExercise?.name || ''}
              setExercise={(name, key) => {
                setSelectedExercise({ name, key: key || name });
                setShowExerciseSelector(false);
                setShowSeriesConfig(true);
              }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Étape 2 : gestion des exercices de la routine
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

      {renderExerciseSelectorModal()}
      {renderSeriesConfigModal()}
    </View>
  );

  // Modale de configuration des séries
  const renderSeriesConfigModal = () => (
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

                <View style={styles.seriesTypeContainer}>
                  <Text variant="body" style={styles.seriesInputLabel}>
                    {t('workout.seriesType')}
                  </Text>
                  <View style={styles.seriesTypeButtonsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.seriesTypeButton,
                        item.type === 'warmUp' && styles.seriesTypeButtonSelected
                      ]}
                      onPress={() => setSeriesType(index, 'warmUp')}
                    >
                      <Text
                        style={[
                          styles.seriesTypeButtonText,
                          item.type === 'warmUp' && styles.seriesTypeButtonTextSelected
                        ]}
                      >
                        {t('workout.warmUp')}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.seriesTypeButton,
                        item.type === 'workingSet' && styles.seriesTypeButtonSelected
                      ]}
                      onPress={() => setSeriesType(index, 'workingSet')}
                    >
                      <Text
                        style={[
                          styles.seriesTypeButtonText,
                          item.type === 'workingSet' && styles.seriesTypeButtonTextSelected
                        ]}
                      >
                        {t('workout.workingSet')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.row]}>
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

            <Button
              onPress={saveExercise}
              style={styles.saveButton}
            >
              <Text style={{ color: theme.colors.text.primary }}>{t('common.save')}</Text>
            </Button>
          </ScrollView>
        </View>
      </View>

      <TimerPickerModal
        visible={showTimerPicker}
        setIsVisible={setShowTimerPicker}
        onConfirm={({ minutes, seconds }) => {
          if (currentSeriesIndex !== null) {
            updateSeries(currentSeriesIndex, 'rest', formatRestTime(minutes, seconds));
          }
          setShowTimerPicker(false);
        }}
        modalTitle={t('workout.selectRestTime' as any)}
        hideHours
      />
    </Modal>
  );

  // Étape 1 : titre & description
  const renderStep1 = () => (
    <>
      <Text variant="subheading" style={styles.label}>{t('routine.title')}</Text>
      <RNTextInput
        style={styles.input}
        placeholder={t('routine.titlePlaceholder')}
        value={routine.title}
        onChangeText={title => setRoutine(r => ({ ...r, title }))}
        placeholderTextColor={theme.colors.text.secondary}
      />
      <Text variant="subheading" style={styles.label}>{t('routine.description')}</Text>
      <RNTextInput
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
  );

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

      const routineToSave = {
        id: `routine_${Date.now()}_${Math.random().toString(36)}`,
        title: routine.title.trim(),
        description: routine.description.trim(),
        exercises: exercises.map(ex => ({
          ...ex,
          series: ex.series.map((s: RoutineSeries) => ({
            ...s,
            weight: parseFloat(s.weight) || 0,
            reps: parseInt(s.reps) || 0
          }))
        })),
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

  return (
    <View style={styles.container}>
      <Header
        title={t('routine.createTitle')}
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
  selectedExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm
  },
  exerciseConfigCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  seriesContainer: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.lg
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
  seriesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing.sm
  },
  seriesTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary
  },
  seriesTypeWrapper: {
    alignItems: 'flex-end'
  },
  seriesTypeLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  seriesTypeContainer: {
    marginBottom: theme.spacing.base
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
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm
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
  addSeriesButton: {
    marginTop: theme.spacing.base,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center'
  },
  addSeriesText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.main
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  sectionTitleIcon: {
    marginRight: theme.spacing.sm
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text.primary
  },
  seriesActionButton: {
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.button
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
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text.primary
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
    justifyContent: 'center',
    alignItems: 'center'
  },
  restTimeText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center'
  },
  seriesActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    marginVertical: theme.spacing.lg,
    paddingVertical: theme.spacing.base
  },
  seriesInputLabel: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base,
    marginBottom: theme.spacing.sm
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
  exerciseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm
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
  primaryButton: {
    backgroundColor: theme.colors.primary,
    marginVertical: theme.spacing.sm,
    height: 48
  },
  secondaryButton: {
    backgroundColor: theme.colors.background.button,
    marginVertical: theme.spacing.sm,
    height: 48
  },
  modalBackButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
    alignSelf: 'center'
  }
});
