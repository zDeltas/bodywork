import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Modal from '@/app/components/ui/Modal';
import UnifiedExerciseList from '@/app/components/exercises/UnifiedExerciseList';
import { Exercise } from '@/types/common';

interface ExerciseListModalProps {
  visible: boolean;
  onClose: () => void;
  selectedMuscle: string;
  onMuscleSelect: (muscleGroup: string, muscleKey?: string) => void;
  selectedExercise: string;
  onExerciseSelect: (exercise: Exercise) => void;
  title?: string;
}

export default function ExerciseListModal({
  visible,
  onClose,
  selectedMuscle,
  onMuscleSelect,
  selectedExercise,
  onExerciseSelect,
  title
}: ExerciseListModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const modalTitle = title || t('stats.selectExercise');

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={modalTitle}
      showCloseButton
      animationType="slide"
      style={styles.modalOverlay}
      contentStyle={styles.modalContent}
    >
      <ScrollView style={styles.scrollView}>
        <UnifiedExerciseList
          mode="modal"
          viewMode="collapsible"
          selectedMuscle={selectedMuscle}
          onMuscleSelect={onMuscleSelect}
          selectedExercise={selectedExercise}
          onExerciseSelect={onExerciseSelect}
          showSearch
          showViewModeToggle={false}
          showAddButton={false}
          showFavorites={false}
        />
      </ScrollView>
    </Modal>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    modalOverlay: {
      justifyContent: 'flex-end',
      padding: 0
    },
    modalContent: {
      height: '80%',
      maxWidth: '100%',
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0
    },
    scrollView: {
      flex: 1
    }
  });
}; 
