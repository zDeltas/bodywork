import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, X } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Exercise } from '@/types/common';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: () => void;
  onRemove: () => void;
}

const RoutineExerciseCard: React.FC<ExerciseCardProps> = React.memo(({
  exercise,
  onEdit,
  onRemove
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

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
  }
});

export default RoutineExerciseCard;
