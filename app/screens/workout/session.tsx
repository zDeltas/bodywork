import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import useSession from '@/app/hooks/useSession';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';
import Modal from '@/app/components/ui/Modal';
import ProgressBar from '@/app/components/session/ProgressBar';
import CurrentExercise from '@/app/components/session/CurrentExercise';
import UpcomingSection from '@/app/components/session/UpcomingSection';
import CurrentSeries from '@/app/components/session/CurrentSeries';
import ConfirmModal from '@/app/components/ui/ConfirmModal';
import RpeModal from '@/app/components/session/RpeModal';
import SessionBottomBar, { BOTTOM_BAR_HEIGHT } from '@/app/components/session/SessionBottomBar';
import { SessionState } from '@/types/common';
import { storageService } from '@/app/services';

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
    handleFinishWorkout,
    handlePrevious,
    handleNext,
    startPreparation,
    handlePreparationComplete
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: BOTTOM_BAR_HEIGHT }}
      >
        <CurrentExercise
          exercise={currentExercise}
          currentSeries={currentSeries}
          currentSeriesIndex={sessionState.currentSeriesIndex}
        />

        <CurrentSeries
          exercise={currentExercise}
          currentSeries={currentSeries}
          currentSeriesIndex={sessionState.currentSeriesIndex}
        />

        <UpcomingSection
          routine={routine}
          currentExerciseIndex={sessionState.currentExerciseIndex}
          currentSeriesIndex={sessionState.currentSeriesIndex}
        />
      </ScrollView>

      <SessionBottomBar
        isResting={sessionState.isResting}
        restTime={sessionState.restTime}
        restType={sessionState.restType}
        isPreparation={sessionState.isPreparation}
        preparationTime={sessionState.preparationTime}
        onRestComplete={handleRestComplete}
        onPreparationComplete={handlePreparationComplete}
        onPrevious={handlePrevious}
        onNext={handleNext}
        canGoPrevious={sessionState.currentExerciseIndex > 0 || sessionState.currentSeriesIndex > 0 || sessionState.isResting}
        canGoNext={true}
        currentSeriesIndex={sessionState.currentSeriesIndex}
        totalSeries={currentExercise.series.length}
        currentExerciseIndex={sessionState.currentExerciseIndex}
        totalExercises={routine.exercises.length}
      />

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
    modalContent: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl
    },
    successIconContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg
    },
    congratsTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      color: theme.colors.primary,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: theme.spacing.sm
    },
    congratsText: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl
    },
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
    },
    statItem: {
      flex: 1,
      alignItems: 'center'
    },
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginBottom: theme.spacing.xs
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: theme.colors.border.default,
      marginHorizontal: theme.spacing.xl
    },
    actionButton: {
      width: '100%',
      marginTop: theme.spacing.lg,
      alignSelf: 'center'
    }
  });
};

export default WorkoutSessionScreen;
