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
import Header from '@/app/components/layout/Header';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';

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
        <Text style={styles.loadingText}>Chargement...</Text>
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
      console.log(rest);
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

  const renderProgressBar = () => {
    const totalExercises = routine.exercises.length;
    const progress = ((currentExerciseIndex + 1) / totalExercises) * 100;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text variant="caption" style={styles.progressText}>
          {currentExerciseIndex + 1}/{totalExercises} {t('workout.exercises' as any)}
        </Text>
      </View>
    );
  };

  const renderCurrentExercise = () => (
    <View style={styles.exerciseCard}>
      <Text variant="heading" style={styles.exerciseTitle}>
        {currentExercise.name}
      </Text>
      <View style={styles.seriesInfo}>
        <View style={styles.seriesRow}>
          <Text variant="body" style={styles.seriesLabel}>{t('workout.series' as any)}</Text>
          <Text variant="heading" style={styles.seriesValue}>
            {currentSeriesIndex + 1}/{currentExercise.series.length}
          </Text>
        </View>
        <View style={styles.seriesRow}>
          <Text variant="body" style={styles.seriesLabel}>{t('workout.weight' as any)}</Text>
          <Text variant="heading" style={styles.seriesValue}>{currentSeries.weight} kg</Text>
        </View>
        <View style={styles.seriesRow}>
          <Text variant="body" style={styles.seriesLabel}>{t('workout.reps' as any)}</Text>
          <Text variant="heading" style={styles.seriesValue}>{currentSeries.reps}</Text>
        </View>
        <View style={styles.seriesRow}>
          <Text variant="body" style={styles.seriesLabel}>{t('workout.rest' as any)}</Text>
          <Text variant="heading" style={styles.seriesValue}>{currentSeries.rest}</Text>
        </View>
      </View>
    </View>
  );

  const renderNextExercise = () => {
    const nextExercise = getNextExercise();
    if (!nextExercise) return null;

    return (
      <View style={styles.nextExerciseCard}>
        <Text variant="subheading" style={styles.nextExerciseTitle}>
          {t('workout.nextExercise' as any)}
        </Text>
        <Text variant="heading" style={styles.nextExerciseName}>
          {nextExercise.name}
        </Text>
        {nextExercise.series[0] && (
          <View style={styles.nextExerciseDetails}>
            <Text variant="body" style={styles.nextExerciseDetail}>
              {nextExercise.series[0].weight}kg × {nextExercise.series[0].reps} {t('workout.reps' as any)}
            </Text>
          </View>
        )}
      </View>
    );
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
            size="large"
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header 
        title={routine.title}
        showBackButton={true}
        onBack={handleCancel}
      />

      {renderProgressBar()}
      
      <ScrollView style={styles.content}>
        {renderCurrentExercise()}
        
        {isResting && renderNextExercise()}
      </ScrollView>

      {isResting ? (
        <View style={styles.timerContainer}>
          <BottomBarTimer
            initialTime={restTime}
            onComplete={handleRestComplete}
            autoStart={true}
          />
        </View>
      ) : (
        <FloatButtonAction
          icon={<Check size={24} color={theme.colors.background.main} />}
          onPress={handleCompletedSeries}
        />
      )}

      {routineFinished && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text variant="heading" style={styles.modalTitle}>{t('workout.routineCompleted' as any)}</Text>
              <Button 
                title={t('common.backToHome' as any)}
                onPress={() => {
                  setRoutineFinished(false);
                  router.push('/(tabs)');
                }}
                size="large"
              />
            </View>
          </View>
        </Modal>
      )}

      <Modal visible={showCancelModal} transparent animationType="fade"
             onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AlertTriangle size={40} color={theme.colors.error} style={styles.modalIcon} />
            <Text variant="heading" style={styles.modalTitle}>{t('workout.quitRoutine' as any)}</Text>
            <Text style={styles.modalMessage}>{t('workout.quitRoutineMessage' as any)}</Text>
            <View style={styles.modalButtons}>
              <Button
                title={t('common.continue' as any)}
                variant="secondary"
                onPress={() => setShowCancelModal(false)}
                style={styles.modalButton}
              />
              <Button
                title={t('common.quit' as any)}
                variant="primary"
                onPress={handleConfirmCancel}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: theme.colors.error
                }}
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
  loadingText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg
  },
  progressContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.background.button,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  exerciseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  exerciseTitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  },
  seriesInfo: {
    gap: theme.spacing.md,
  },
  seriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seriesLabel: {
    color: theme.colors.text.secondary,
  },
  seriesValue: {
    color: theme.colors.text.primary,
  },
  nextExerciseCard: {
    backgroundColor: theme.colors.background.button,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  nextExerciseTitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  nextExerciseName: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  nextExerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextExerciseDetail: {
    color: theme.colors.text.secondary,
  },
  timerContainer: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    ...theme.shadows.lg
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rpeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
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
    backgroundColor: theme.colors.primary,
  },
  rpeButtonText: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
  },
  rpeButtonTextSelected: {
    color: theme.colors.text.primary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
}); 
