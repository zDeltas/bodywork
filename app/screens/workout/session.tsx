import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, Check } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';
import Modal from '@/app/components/ui/Modal';
import { ConfirmModal } from '@/app/components/ui/ConfirmModal';
import storageService from '@/app/services/storage';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';
import BottomBarTimer from '@/app/components/timer/BottomBarTimer';
import { ProgressBar } from '@/app/components/session/ProgressBar';
import { CurrentExercise } from '@/app/components/session/CurrentExercise';
import { NextExercise } from '@/app/components/session/NextExercise';
import { RpeModal } from '@/app/components/session/RpeModal';
import { Routine, SessionState, Workout } from '@/app/types/routine';

const initialState: SessionState = {
  currentExerciseIndex: 0,
  currentSeriesIndex: 0,
  isResting: false,
  restTime: 0,
  routineFinished: false,
  completedExercises: [],
  pendingSeries: null,
  rpe: ''
};

export default function WorkoutSessionScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const haptics = useHaptics();
  const { routineId } = useLocalSearchParams();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(initialState);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const convertTimeToSeconds = useCallback((timeStr: string): number => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return (minutes * 60) + seconds;
  }, []);

  const handleCompletedSeries = useCallback(() => {
    if (!routine) return;
    const currentExercise = routine.exercises[sessionState.currentExerciseIndex];
    const currentSeries = currentExercise.series[sessionState.currentSeriesIndex];

    if (currentSeries.type === 'workingSet') {
      setSessionState(prev => ({
        ...prev,
        pendingSeries: {
          exerciseIdx: sessionState.currentExerciseIndex,
          seriesIdx: sessionState.currentSeriesIndex
        }
      }));
    } else {
      const rest = convertTimeToSeconds(currentSeries.rest);
      setSessionState(prev => ({
        ...prev,
        restTime: rest,
        isResting: true,
        rpe: '',
        pendingSeries: null
      }));
    }
  }, [routine, sessionState.currentExerciseIndex, sessionState.currentSeriesIndex, convertTimeToSeconds]);

  const handleRpeSave = useCallback(() => {
    if (!routine || !sessionState.pendingSeries) return;
    const { exerciseIdx, seriesIdx } = sessionState.pendingSeries;
    const updatedRoutine = { ...routine };
    updatedRoutine.exercises = [...routine.exercises];
    updatedRoutine.exercises[exerciseIdx] = { ...routine.exercises[exerciseIdx] };
    updatedRoutine.exercises[exerciseIdx].series = [...routine.exercises[exerciseIdx].series];
    updatedRoutine.exercises[exerciseIdx].series[seriesIdx] = {
      ...routine.exercises[exerciseIdx].series[seriesIdx],
      rpe: parseInt(sessionState.rpe) || 7
    };
    setRoutine(updatedRoutine);
    const rest = convertTimeToSeconds(updatedRoutine.exercises[exerciseIdx].series[seriesIdx].rest);
    setSessionState(prev => ({
      ...prev,
      restTime: rest,
      isResting: true,
      rpe: '',
      pendingSeries: null
    }));
  }, [routine, sessionState.pendingSeries, sessionState.rpe, convertTimeToSeconds]);

  const handleRestComplete = useCallback(async () => {
    if (!routine) return;
    const currentExercise = routine.exercises[sessionState.currentExerciseIndex];

    setSessionState(prev => ({
      ...prev,
      isResting: false
    }));

    if (sessionState.currentSeriesIndex < currentExercise.series.length - 1) {
      setSessionState(prev => ({
        ...prev,
        currentSeriesIndex: prev.currentSeriesIndex + 1
      }));
    } else {
      const workout: Workout = {
        id: Date.now().toString(),
        muscleGroup: currentExercise.key.split('_')[0],
        exercise: currentExercise.key,
        name: currentExercise.name,
        series: currentExercise.series,
        date: new Date().toISOString()
      };
      await storageService.saveWorkout(workout);
      setSessionState(prev => ({
        ...prev,
        completedExercises: [...prev.completedExercises, workout]
      }));

      if (sessionState.currentExerciseIndex < routine.exercises.length - 1) {
        setSessionState(prev => ({
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSeriesIndex: 0
        }));
      } else {
        setSessionState(prev => ({
          ...prev,
          routineFinished: true
        }));
      }
    }
  }, [routine, sessionState.currentExerciseIndex, sessionState.currentSeriesIndex]);

  const getNextExercise = useCallback(() => {
    if (!routine) return null;
    const currentExercise = routine.exercises[sessionState.currentExerciseIndex];

    if (sessionState.currentSeriesIndex < currentExercise.series.length - 1) {
      return currentExercise;
    } else if (sessionState.currentExerciseIndex < routine.exercises.length - 1) {
      return routine.exercises[sessionState.currentExerciseIndex + 1];
    }
    return null;
  }, [routine, sessionState.currentExerciseIndex, sessionState.currentSeriesIndex]);

  const handleCancel = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false);
    router.push('/(tabs)');
  }, []);

  const handleFinishWorkout = useCallback(() => {
    haptics.impactLight();
    router.push('/(tabs)/workout/summary' as any);
  }, [haptics]);

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
        <Text style={styles.loadingText}>{t('workout.loading')}</Text>
      </View>
    );
  }

  const currentExercise = routine.exercises[sessionState.currentExerciseIndex];
  const currentSeries = currentExercise.series[sessionState.currentSeriesIndex];

  return (
    <View style={styles.container}>
      <Header
        title={routine.title}
        showBackButton={true}
        onBack={handleCancel}
      />

      <ProgressBar
        current={sessionState.currentExerciseIndex + 1}
        total={routine.exercises.length}
        label={t('workout.exercises')}
      />

      <ScrollView style={styles.content}>
        <CurrentExercise
          exercise={currentExercise}
          currentSeries={currentSeries}
          currentSeriesIndex={sessionState.currentSeriesIndex}
        />

        {sessionState.isResting && getNextExercise() && (
          <NextExercise exercise={getNextExercise()!} />
        )}
      </ScrollView>

      {sessionState.isResting ? (
        <View style={styles.timerContainer}>
          <BottomBarTimer
            initialTime={sessionState.restTime}
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

      {sessionState.routineFinished && (
        <Modal
          visible
          transparent
          animationType="fade"
          onClose={() => setSessionState(prev => ({ ...prev, routineFinished: false }))}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text variant="heading" style={styles.modalTitle}>
                {t('workout.routineCompleted')}
              </Text>
              <Button
                title={t('common.next')}
                onPress={handleFinishWorkout}
                size="large"
              />
            </View>
          </View>
        </Modal>
      )}

      <ConfirmModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title={t('workout.quitRoutine')}
        message={t('workout.quitRoutineMessage')}
        variant="warning"
      />

      <RpeModal
        visible={!!sessionState.pendingSeries}
        onClose={() => setSessionState(prev => ({ ...prev, pendingSeries: null }))}
        onSave={handleRpeSave}
        rpe={sessionState.rpe}
        onRpeChange={(value) => setSessionState(prev => ({ ...prev, rpe: value }))}
      />
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
  content: {
    flex: 1,
    padding: theme.spacing.lg
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
    padding: theme.spacing.lg
  },
  modalContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: theme.spacing.lg
  },
  modalMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  modalButton: {
    flex: 1
  }
}); 
