import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useHaptics from '@/app/hooks/useHaptics';
import Text from '@/app/components/ui/Text';
import { UnifiedExerciseList, Exercise, InteractiveMuscleMap, MuscleGroupKey, getMuscleGroups, muscleGroupKeys } from '@/app/components/exercises';

interface ExerciseSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onExerciseSelect: (exercise: Exercise) => void;
}

export default function ExerciseSearchModal({
  visible,
  onClose,
  onExerciseSelect
}: ExerciseSearchModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { impactMedium } = useHaptics();
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupKey | undefined>();

  const muscleGroups = useMemo(() => getMuscleGroups(t as (key: string) => string), [t]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedMuscle(undefined);
    }
  }, [visible]);

  const getMuscleGroupName = useCallback((muscleKey: MuscleGroupKey) => {
    const index = muscleGroupKeys.indexOf(muscleKey);
    return muscleGroups[index] || muscleKey;
  }, [muscleGroups]);

  const handleMuscleSelect = useCallback((muscleGroup: MuscleGroupKey) => {
    setSelectedMuscle(muscleGroup);
    impactMedium();
  }, [impactMedium]);

  const handleBackToBodyMap = useCallback(() => {
    setSelectedMuscle(undefined);
  }, []);

  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    impactMedium();
    onExerciseSelect(exercise);
    onClose();
  }, [impactMedium, onExerciseSelect, onClose]);

  const styles = useStyles();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color={theme.colors.text.primary} size={24} />
          </TouchableOpacity>
          <Text variant="heading" style={styles.title}>
            {selectedMuscle ? getMuscleGroupName(selectedMuscle) : t('stats.searchByExercise')}
          </Text>
          {selectedMuscle ? (
            <TouchableOpacity onPress={handleBackToBodyMap}>
              <Text style={styles.backText}>
                {t('common.back')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.closeButton} />
          )}
        </View>

        {!selectedMuscle ? (
          <View style={styles.muscleMapContainer}>
            <InteractiveMuscleMap
              onMuscleSelect={handleMuscleSelect}
              selectedMuscle={selectedMuscle}
            />
          </View>
        ) : (
          <View style={styles.exerciseListContainer}>
            <UnifiedExerciseList
              mode="modal"
              viewMode="grid"
              initialMuscleGroup={getMuscleGroupName(selectedMuscle)}
              onExerciseSelect={handleExerciseSelect}
              showSearch={true}
              showViewModeToggle={false}
              showAddButton={false}
              showFavorites={true}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.text.primary,
    },
    backText: {
      fontWeight: '600',
      color: theme.colors.primary,
    },
    muscleMapContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    exerciseListContainer: {
      flex: 1,
    },
  });
};
