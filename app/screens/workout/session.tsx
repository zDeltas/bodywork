import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Check, Trophy } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { useSession } from '@/app/hooks/useSession';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';
import Modal from '@/app/components/ui/Modal';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';
import BottomBarTimer from '@/app/components/timer/BottomBarTimer';
import ProgressBar from '@/app/components/session/ProgressBar';
import CurrentExercise from '@/app/components/session/CurrentExercise';
import NextExercise from '@/app/components/session/NextExercise';
import ConfirmModal from '@/app/components/ui/ConfirmModal';
import RpeModal from '@/app/components/session/RpeModal';
import { SessionState } from '@/types/common';

function WorkoutSessionScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  const { routineId } = useLocalSearchParams();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const {
    routine,
    sessionState,
    setSessionState,
    handleCompletedSeries,
    handleRestComplete,
    handleRpeSave,
    handleCancel,
    handleFinishWorkout
  } = useSession(routineId as string);

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    handleCancel();
  };

  if (!routine) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('workout.loading')}</Text>
      </View>
    );
  }

  const currentExercise = routine.exercises[sessionState.currentExerciseIndex];
  const currentSeries = currentExercise.series[sessionState.currentSeriesIndex];
  const nextExercise = sessionState.currentSeriesIndex < currentExercise.series.length - 1
    ? currentExercise
    : sessionState.currentExerciseIndex < routine.exercises.length - 1
      ? routine.exercises[sessionState.currentExerciseIndex + 1]
      : null;

  return (
    <View style={styles.container}>
      <Header
        title={routine.title}
        showBackButton={true}
        onBack={() => setShowCancelModal(true)}
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

        {sessionState.isResting && nextExercise && (
          <NextExercise exercise={nextExercise} />
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
          visible={true}
          showCloseButton={false}
          title={undefined}
          onClose={handleFinishWorkout}
          contentStyle={styles.modalContent}
        >
          <View style={styles.successIconContainer}>
            <Trophy size={56} color={theme.colors.primary} />
          </View>
          <Text style={styles.congratsTitle}>
            {t('workout.routineCompleted')}
          </Text>
          <Text style={styles.congratsText}>
            Félicitations, tu as terminé ta séance !
          </Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{routine.exercises.length}</Text>
              <Text style={styles.statLabel}>{t('common.exercises')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {routine.exercises.reduce((total, exercise) => total + exercise.series.length, 0)}
              </Text>
              <Text style={styles.statLabel}>{t('common.series')}</Text>
            </View>
          </View>
          <Button
            title={t('common.finish')}
            onPress={handleFinishWorkout}
            size="large"
            variant="primary"
            style={styles.actionButton}
          />
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
        onClose={() => setSessionState((prev: SessionState) => ({ ...prev, pendingSeries: null }))}
        onSave={handleRpeSave}
        rpe={sessionState.rpe}
        onRpeChange={(value) => setSessionState((prev: SessionState) => ({ ...prev, rpe: value }))}
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
    } as ViewStyle,
    loadingText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.lg
    } as TextStyle,
    content: {
      flex: 1,
      padding: theme.spacing.lg
    } as ViewStyle,
    timerContainer: {
      backgroundColor: theme.colors.background.card,
      padding: theme.spacing.lg,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      ...theme.shadows.lg
    } as ViewStyle,
    modalContent: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl
    } as ViewStyle,
    successIconContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg
    } as ViewStyle,
    congratsTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      color: theme.colors.primary,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: theme.spacing.sm
    } as TextStyle,
    congratsText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl
    } as TextStyle,
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      width: '100%',
      maxWidth: 350,
      alignSelf: 'center'
    } as ViewStyle,
    statItem: {
      flex: 1,
      alignItems: 'center'
    } as ViewStyle,
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginBottom: theme.spacing.xs
    } as TextStyle,
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    } as TextStyle,
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.border.default,
      marginHorizontal: theme.spacing.xl
    } as ViewStyle,
    actionButton: {
      width: '100%',
      marginTop: theme.spacing.lg,
      alignSelf: 'center'
    } as ViewStyle
  });
};

export default WorkoutSessionScreen;
