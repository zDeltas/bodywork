import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import ExerciseList from '@/app/components/exercises/ExerciseList';
import { useTranslation } from '@/app/hooks/useTranslation';
import Modal from '@/app/components/ui/Modal';

interface ExerciseListModalProps {
  visible: boolean;
  onClose: () => void;
  selectedMuscle: string;
  setSelectedMuscle: (muscleGroup: string, muscleKey?: string) => void;
  exercise: string;
  setExercise: (selectedExercise: string, selectedExerciseKey?: string) => void;
  setIsCustomExercise: () => void;
}

export default function ExerciseListModal({
                                            visible,
                                            onClose,
                                            selectedMuscle,
                                            setSelectedMuscle,
                                            exercise,
                                            setExercise,
                                            setIsCustomExercise
                                          }: ExerciseListModalProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('stats.selectExercise')}
      showCloseButton={true}
      animationType="slide"
      style={styles.modalOverlay}
      contentStyle={styles.modalContent}
    >
      <ScrollView style={{ flex: 1 }}>
        <ExerciseList
          selectedMuscle={selectedMuscle}
          setSelectedMuscle={setSelectedMuscle}
          exercise={exercise}
          setExercise={setExercise}
          setIsCustomExercise={setIsCustomExercise}
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
    }
  });
}; 
