import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import useHaptics from '@/app/hooks/useHaptics';
import Text from '@/app/components/ui/Text';
import InteractiveMuscleMap, { MuscleGroupKey } from './InteractiveMuscleMap';
import UnifiedExerciseList from './UnifiedExerciseList';
import { useRouter } from 'expo-router';
import { Exercise, getMuscleGroups, muscleGroupKeys } from './index';

export interface ExerciseSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onExerciseSelect: (exercise: Exercise) => void;
  selectedExercise?: string;
  title?: string;
}

export default function ExerciseSelectionModal({
                                                 visible,
                                                 onClose,
                                                 onExerciseSelect,
                                                 selectedExercise,
                                                 title
                                               }: ExerciseSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroupKey | undefined>();
  const [phase, setPhase] = useState<'pick' | 'list'>('pick');

  const { t } = useTranslation();
  const { theme } = useTheme();
  const { impactLight, impactMedium } = useHaptics();
  const styles = useStyles();
  const router = useRouter();

  const muscleGroups = useMemo(() => getMuscleGroups(t as (key: string) => string), [t]);

  useEffect(() => {
    if (!visible) {
      setPhase('pick');
      setSearchQuery('');
      setSelectedMuscle(undefined);
    }
  }, [visible]);


  const getMuscleGroupName = (muscleKey: MuscleGroupKey) => {
    const index = muscleGroupKeys.indexOf(muscleKey);
    return muscleGroups[index] || muscleKey;
  };

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      setPhase('list');
    } else {
      setPhase('pick');
    }
  }, []);

  const handleMuscleSelect = useCallback((muscleGroup: MuscleGroupKey) => {
    setSelectedMuscle(muscleGroup);
    impactMedium();
    setPhase('list');
  }, [impactMedium]);

  const clearSearch = useCallback(() => {
    if (searchQuery) {
      setSearchQuery('');
      impactLight();
    }
  }, [searchQuery, impactLight]);

  const handleExerciseChosen = useCallback((exercise: Exercise) => {
    impactMedium();
    onExerciseSelect(exercise);
    onClose();
    // reset internal phase for next open
    setPhase('pick');
  }, [impactMedium, onClose, onExerciseSelect]);


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X color={theme.colors.text.primary} size={24} />
            </TouchableOpacity>
            <Text variant="heading" style={styles.modalTitle}>
              {title || t('exerciseSelection.title')}
            </Text>
            <View style={styles.modalHeaderRight} />
          </View>

          {/* Search Bar */}
          <Animated.View entering={FadeIn.duration(500)} style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search color={theme.colors.text.secondary} size={20} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder={t('exerciseSelection.searchPlaceholder')}
                placeholderTextColor={theme.colors.text.secondary}
                onSubmitEditing={() => {}}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                  <X color={theme.colors.text.secondary} size={20} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Content */}
          {phase === 'pick' ? (
            <Animated.View entering={FadeIn.duration(500).delay(200)} style={styles.muscleMapContainer}>
              <InteractiveMuscleMap
                onMuscleSelect={handleMuscleSelect}
                selectedMuscle={selectedMuscle}
              />
            </Animated.View>
          ) : (
            <View style={styles.exerciseListContainer}>
              <UnifiedExerciseList
                mode="modal"
                viewMode="grid"
                initialMuscleGroup={selectedMuscle ? getMuscleGroupName(selectedMuscle) : ''}
                initialSearchQuery={searchQuery}
                onExerciseSelect={handleExerciseChosen}
                showSearch={false}
                showViewModeToggle={true}
                showAddButton={true}
                showFavorites={true}
                onAddCustomExercise={() =>
                  router.push({
                    pathname: '/screens/exercise-custom-edit',
                    params: { muscleGroupLabel: selectedMuscle ? getMuscleGroupName(selectedMuscle) : '' }
                  })
                }
              />
            </View>
          )}
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
      justifyContent: 'flex-start'
    },
    modalContent: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      flex: 1,
      marginTop: theme.spacing.xs,
      ...theme.shadows.lg
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    closeButton: {
      padding: theme.spacing.sm
    },
    modalTitle: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.text.primary
    },
    modalHeaderRight: {
      width: 40
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    searchIcon: {
      marginRight: theme.spacing.sm
    },
    searchInput: {
      flex: 1,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    },
    clearButton: {
      padding: theme.spacing.xs
    },
    muscleMapContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center'
    },
    exerciseListContainer: {
      flex: 1
    }
  });
};
