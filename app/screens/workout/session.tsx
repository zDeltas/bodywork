import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import BottomBarTimer from '@/app/components/timer/BottomBarTimer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { storageService } from '@/app/services/storage';
import { AlertTriangle, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

type Exercise = {
  name: string;
  key: string;
  series: Array<{
    weight: number;
    reps: number;
    note: string;
    rest: string;
    type: 'warmUp' | 'workingSet';
    rpe?: number;
  }>;
};

type Routine = {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  createdAt: string;
};

export default function WorkoutSessionScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const router = useRouter();
  const { routineId } = useLocalSearchParams();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);
  const [showRpeModal, setShowRpeModal] = useState(false);
  const [rpe, setRpe] = useState<string>('');
  const [pendingSeries, setPendingSeries] = useState<{ exerciseIdx: number, seriesIdx: number } | null>(null);
  const [completedExercises, setCompletedExercises] = useState<any[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState<number>(0);
  const [routineFinished, setRoutineFinished] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const loadRoutine = async () => {
      const routines = await storageService.getRoutines();
      const foundRoutine = routines.find(r => r.id === routineId);
      if (foundRoutine) {
        setRoutine(foundRoutine);
      }
    };
    loadRoutine();
  }, [routineId]);

  if (!routine) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const currentExercise = routine.exercises[currentExerciseIndex];
  const currentSeries = currentExercise.series[currentSeriesIndex];
  const progress = `${currentExerciseIndex + 1}/${routine.exercises.length}`;

  const convertTimeToSeconds = (timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes * 60) + seconds;
  };

  const handleCompletedSeries = () => {
    if (currentSeries.type === 'workingSet') {
      setPendingSeries({ exerciseIdx: currentExerciseIndex, seriesIdx: currentSeriesIndex });
      setShowRpeModal(true);
    } else {
      const rest = convertTimeToSeconds(currentSeries.rest);
      setRestTime(rest);
      setIsResting(true);
      setRpe('');
      setPendingSeries(null);
    }
  };

  const handleRpeSave = () => {
    if (!pendingSeries) return;
    const { exerciseIdx, seriesIdx } = pendingSeries;
    const updatedRoutine = { ...routine };
    updatedRoutine.exercises = [...routine.exercises];
    updatedRoutine.exercises[exerciseIdx] = { ...routine.exercises[exerciseIdx] };
    updatedRoutine.exercises[exerciseIdx].series = [...routine.exercises[exerciseIdx].series];
    updatedRoutine.exercises[exerciseIdx].series[seriesIdx] = {
      ...routine.exercises[exerciseIdx].series[seriesIdx],
      rpe: parseInt(rpe) || 7
    };
    setRoutine(updatedRoutine);
    setShowRpeModal(false);
    setRpe('');
    setPendingSeries(null);
    const rest = convertTimeToSeconds(updatedRoutine.exercises[exerciseIdx].series[seriesIdx].rest);
    setRestTime(rest);
    setIsResting(true);
  };

  const handleRestComplete = async () => {
    setIsResting(false);
    if (currentSeriesIndex < currentExercise.series.length - 1) {
      setCurrentSeriesIndex(prev => prev + 1);
    } else {
      const workout = {
        id: Date.now().toString(),
        muscleGroup: currentExercise.key.split('_')[0],
        exercise: currentExercise.key,
        name: currentExercise.name,
        series: currentExercise.series,
        date: new Date().toISOString()
      };
      await storageService.saveWorkout(workout);
      setCompletedExercises(prev => [...prev, workout]);
      if (currentExerciseIndex < routine.exercises.length - 1) {
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSeriesIndex(0);
      } else {
        setRoutineFinished(true);
      }
    }
  };

  const getNextExercise = () => {
    if (currentSeriesIndex < currentExercise.series.length - 1) {
      return currentExercise;
    } else if (currentExerciseIndex < routine.exercises.length - 1) {
      return routine.exercises[currentExerciseIndex + 1];
    }
    return null;
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    router.push('/(tabs)');
  };

  const renderRpeModal = () => (
    <Modal
      visible={showRpeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRpeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text variant="heading" style={styles.modalTitle}>
              {t('workout.rpe')}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRpeModal(false)}
            >
              <X color={theme.colors.text.primary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.rpeContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.rpeButton,
                  rpe === value.toString() && styles.rpeButtonSelected
                ]}
                onPress={() => {
                  setRpe(value.toString());
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

          <Button
            title={t('common.save')}
            onPress={handleRpeSave}
            style={styles.saveButton}
            disabled={!rpe}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <X size={28} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.progressBar}>
        <Text style={styles.progressText}>
          {t('workout.exercise' as any)} {progress}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.exerciseCard}>
          <Text variant="heading" style={styles.exerciseName}>
            {currentExercise.name}
          </Text>
          <Text variant="body" style={styles.seriesInfo}>
            {t('workout.series')} {currentSeriesIndex + 1}/{currentExercise.series.length}
          </Text>
          <Text variant="body" style={styles.seriesDetails}>
            {currentSeries.weight}kg × {currentSeries.reps} {t('workout.reps')}
          </Text>
          {currentSeries.note && (
            <Text variant="caption" style={styles.note}>
              {currentSeries.note}
            </Text>
          )}
        </View>

        {isResting && getNextExercise() && (
          <View style={styles.nextExerciseContainer}>
            <Text variant="body" style={styles.nextExerciseTitle}>
              {t('workout.nextExercise' as any)}:
            </Text>
            <Text variant="heading" style={styles.nextExerciseName}>
              {getNextExercise()?.name}
            </Text>
            {getNextExercise()?.series[0] && (
              <Text variant="body" style={styles.nextExerciseDetails}>
                {getNextExercise()?.series[0].weight}kg × {getNextExercise()?.series[0].reps} {t('workout.reps')}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {isResting ? (
        <BottomBarTimer
          initialTime={restTime}
          onComplete={handleRestComplete}
          autoStart={true}
        />
      ) : (
        <View style={styles.exerciseContainer}>
          <Button
            title={t('workout.completedSeries' as any)}
            onPress={handleCompletedSeries}
            style={styles.completeButton}
            icon={<Check size={24} color={theme.colors.text.primary} />}
          />
        </View>
      )}

      {routineFinished && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text variant="heading" style={styles.modalTitle}>Routine terminée !</Text>
              <Button 
                title="Retour à l'accueil" 
                onPress={() => {
                  setRoutineFinished(false);
                  router.push('/(tabs)');
                }} 
              />
            </View>
          </View>
        </Modal>
      )}

      <Modal visible={showCancelModal} transparent animationType="fade"
             onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            <AlertTriangle size={40} color={theme.colors.error} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text variant="heading" style={styles.cancelModalTitle}>Quitter la routine ?</Text>
            <Text style={styles.cancelModalMessage}>Voulez-vous vraiment quitter la routine en cours ? Les progrès ne
              seront pas enregistrés.</Text>
            <View style={styles.cancelModalButtons}>
              <Button
                title="Continuer"
                variant="secondary"
                onPress={() => setShowCancelModal(false)}
                style={styles.cancelModalButtonSecondary}
              />
              <Button
                title="Quitter"
                variant="primary"
                onPress={handleConfirmCancel}
                style={styles.cancelModalButtonPrimary}
                textStyle={{ color: theme.colors.error }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {renderRpeModal()}
    </View>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 56,
    paddingHorizontal: theme.spacing.base,
    marginTop: theme.spacing.base
  },
  cancelButton: {
    padding: 8,
    borderRadius: 24
  },
  progressBar: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.base,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default
  },
  progressText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary
  },
  content: {
    flex: 1,
    padding: theme.spacing.base,
    paddingBottom: 120
  },
  exerciseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  exerciseName: {
    fontSize: theme.typography.fontSize.xl,
    marginBottom: theme.spacing.sm
  },
  seriesInfo: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  seriesDetails: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  note: {
    color: theme.colors.text.secondary,
    fontStyle: 'italic'
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
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rpeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg
  },
  rpeButton: {
    width: 60,
    height: 60,
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
    color: theme.colors.text.primary
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.base
  },
  exerciseContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    ...theme.shadows.lg
  },
  completeButton: {
    backgroundColor: theme.colors.primary,
    height: 56
  },
  nextExerciseContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.button,
    borderRadius: theme.borderRadius.md
  },
  nextExerciseTitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  nextExerciseName: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  nextExerciseDetails: {
    color: theme.colors.text.secondary
  },
  cancelModalContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  cancelModalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
    textAlign: 'center'
  },
  cancelModalMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center'
  },
  cancelModalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    width: '100%',
    justifyContent: 'space-between'
  },
  cancelModalButtonSecondary: {
    flex: 1,
    backgroundColor: theme.colors.background.button,
    marginRight: theme.spacing.xs
  },
  cancelModalButtonPrimary: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.error,
    marginLeft: theme.spacing.xs
  }
}); 
