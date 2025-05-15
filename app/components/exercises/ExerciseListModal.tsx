import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import ExerciseList from '@/app/components/exercises/ExerciseList';
import { useTranslation } from '@/app/hooks/useTranslation';

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
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text variant="heading" style={styles.modalTitle}>
              {t('stats.selectExercise')}
            </Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <X color={theme.colors.text.primary} size={24} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }}>
            <ExerciseList
              selectedMuscle={selectedMuscle}
              setSelectedMuscle={setSelectedMuscle}
              exercise={exercise}
              setExercise={setExercise}
              setIsCustomExercise={setIsCustomExercise}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    modalContent: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.lg
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg
    },
    modalTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.lg
    },
    modalCloseButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    }
  });
}; 
