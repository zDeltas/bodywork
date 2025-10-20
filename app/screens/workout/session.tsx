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
          scrollable={false}
        >
          <View style={styles.successIconContainer}>
            <View style={styles.iconCircle}>
              <Trophy size={40} color="#4CC9F0" strokeWidth={2} />
            </View>
          </View>

          {/* Titre et message */}
          <Text style={styles.congratsTitle}>
            {t('workout.routineCompleted')}
          </Text>
          <Text style={styles.congratsText}>
            {t('workout.congratulationsMessage')}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{routine.exercises.length}</Text>
              <Text style={styles.statLabel}>
                {routine.exercises.length === 1 ? t('common.exercise') : t('common.exercises')}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {routine.exercises.reduce((total, exercise) => total + exercise.series.length, 0)}
              </Text>
              <Text style={styles.statLabel}>
                {routine.exercises.reduce((total, exercise) => total + exercise.series.length, 0) === 1 
                  ? t('workout.series') 
                  : t('workout.seriesPlural')}
              </Text>
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
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md
    },
    successIconContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#4CC9F0' + '15',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#4CC9F0' + '30'
    },
    congratsTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm
    },
    congratsText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
      marginBottom: theme.spacing.lg
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.text.secondary + '15'
    },
    statItem: {
      flex: 1,
      alignItems: 'center'
    },
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: '#4CC9F0',
      marginBottom: theme.spacing.xs / 2
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.text.secondary,
      textTransform: 'lowercase'
    },
    statDivider: {
      width: 1,
      height: 36,
      backgroundColor: theme.colors.text.secondary + '20',
      marginHorizontal: theme.spacing.md
    },
    actionButton: {
      width: '100%',
      alignSelf: 'center'
    }
  });
};

export default WorkoutSessionScreen;
