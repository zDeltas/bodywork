import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, X, Timer } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';
import TimerPickerModal from '@/app/components/timer/TimerPickerModal';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Exercise } from '@/types/common';
import { formatRestTime } from '@/app/utils/routineUtils';

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseRestMode?: 'beginner' | 'advanced';
  onEdit: () => void;
  onRemove: () => void;
  onRestTimeChange?: (restTime: number) => void;
}

const RoutineExerciseCard: React.FC<ExerciseCardProps> = React.memo(({
  exercise,
  exerciseRestMode,
  onEdit,
  onRemove,
  onRestTimeChange
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);
  const [showRestTimePicker, setShowRestTimePicker] = useState(false);

  const handleRestTimeConfirm = useCallback(({ minutes, seconds }: { minutes: number; seconds: number }) => {
    const totalSeconds = minutes * 60 + seconds;
    onRestTimeChange?.(totalSeconds);
    setShowRestTimePicker(false);
  }, [onRestTimeChange]);

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.exerciseInfo}>
          <Text variant="subheading" style={styles.exerciseName}>
            {exercise.name}
          </Text>
          <Text variant="caption" style={styles.exerciseDetails}>
            {t('workout.series')}: {exercise.series.length}
          </Text>
        </View>
        <View style={styles.exerciseActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onEdit}
          >
            <Edit2 size={18} color={theme.colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onRemove}
          >
            <X size={18} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Rest Time Input for Advanced Mode */}
      {exerciseRestMode === 'advanced' && (
        <View style={styles.restTimeContainer}>
          <View style={styles.restTimeSection}>
            <Timer size={16} color={theme.colors.text.secondary} style={styles.restTimeIcon} />
            <Text variant="caption" style={styles.restTimeLabel}>
              {t('routine.exerciseRestTime')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.restTimeButton}
            onPress={() => setShowRestTimePicker(true)}
          >
            <Text variant="body" style={styles.restTimeButtonText}>
              {formatRestTime(
                Math.floor((exercise.restBetweenExercises || 60) / 60), 
                (exercise.restBetweenExercises || 60) % 60
              )}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TimerPickerModal
        visible={showRestTimePicker}
        onClose={() => setShowRestTimePicker(false)}
        onConfirm={handleRestTimeConfirm}
        modalTitle={t('routine.selectRestTime')}
        hideHours
      />
    </View>
  );
});

RoutineExerciseCard.displayName = 'ExerciseCard';

const useStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm
  },
  cardContent: {
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
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center'
  },
  restTimeContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  restTimeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  restTimeIcon: {
    marginRight: theme.spacing.xs
  },
  restTimeLabel: {
    color: theme.colors.text.secondary
  },
  restTimeButton: {
    backgroundColor: theme.colors.background.main,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80
  },
  restTimeButtonText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm
  }
});

export default RoutineExerciseCard;
