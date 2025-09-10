import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import Animated, { FadeIn } from 'react-native-reanimated';
import useHaptics from '@/app/hooks/useHaptics';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import { ExerciseList, getPredefinedExercises } from '@/app/components/exercises/ExerciseList';
import { Button } from '@/app/components/ui/Button';
import useGoals from '@/app/hooks/useGoals';
import useWorkouts from '@/app/hooks/useWorkouts';
import Modal from '@/app/components/ui/Modal';

SplashScreen.preventAutoHideAsync();

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    header: {
      paddingTop: theme.spacing.xl * 1.5,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background.card,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...theme.shadows.md
    },
    title: {
      marginBottom: theme.spacing.xl
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg
    },
    formCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm
    },
    sectionTitle: {
      marginBottom: theme.spacing.md
    },
    formGroup: {
      marginBottom: theme.spacing.base
    },
    formLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginBottom: theme.spacing.sm
    },
    formInput: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      flex: 1,
      height: 48,
      width: '50%'
    },
    weightInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    suggestedButton: {
      backgroundColor: theme.colors.background.button,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      width: '50%'
    },
    suggestedButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.base,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      ...theme.shadows.lg
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.background.button,
      ...theme.shadows.sm
    },
    saveButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end'
    },
    modalContainer: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '100%',
      height: '80%',
      ...theme.shadows.lg
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center'
    },
    modalCloseButton: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm
    },
    searchIcon: {
      marginRight: theme.spacing.sm
    },
    searchInput: {
      backgroundColor: theme.colors.background.input, // Reuse for consistency inside container
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      flex: 1, // Make search input take available space
      height: 24, // Match icon size roughly
      padding: 0 // Remove padding, handled by container
    },
    exerciseList: {
      // No specific styles needed here, ScrollView manages layout
    },
    exerciseOption: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    exerciseOptionText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    },
    muscleGroupContainer: {
      marginBottom: theme.spacing.base // Add margin between groups
    },
    muscleGroupHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      backgroundColor: theme.colors.background.button, // Distinguish header slightly
      width: '100%' // Ensure header takes full width
    },
    muscleGroupTitle: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    exerciseGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
      width: '100%',
      backgroundColor: theme.colors.background.card // Match card background
    },
    exerciseButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.input,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    exerciseButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary
    },
    exerciseButtonText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm
    },
    exerciseButtonTextSelected: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    cancelButton: {
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.md
    },
    cancelButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    exerciseSelectorButton: {
      // Style for the touchable opacity wrapping the selector text/icon
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      // Reuse formInput styles for appearance consistency
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      height: 48,
      flex: 1
    },
    exerciseSelectorText: {
      // Style for the text inside the selector button
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      flex: 1,
      marginRight: theme.spacing.sm
    },
    loadingIndicator: {
      // Style for the loading indicator
      marginLeft: theme.spacing.sm
    },
    // Added for completeness, if used elsewhere
    useSuggestedButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      marginLeft: theme.spacing.sm,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 80
    },
    useSuggestedButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm
    },
    suggestedTargetContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder
    },
    suggestedTargetText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
      flex: 1
    },
    goalTypeDescription: {
      marginBottom: theme.spacing.lg
    },
    inputLabel: {
      marginBottom: theme.spacing.sm
    },
    inputDescription: {
      marginTop: theme.spacing.xs
    }
  });
};

export default function NewGoalScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [newGoalExercise, setNewGoalExercise] = useState('');
  const [newGoalExerciseKey, setNewGoalExerciseKey] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTarget, setSuggestedTarget] = useState<number | null>(null);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [isLoadingLastWorkout, setIsLoadingLastWorkout] = useState(false);
  const [hasPreviousWorkouts, setHasPreviousWorkouts] = useState(false);
  const [highestWeight, setHighestWeight] = useState<number | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Utiliser les hooks optimisés
  const { workouts } = useWorkouts();
  const { addGoal, getCurrentWeight, suggestTargetWeight } = useGoals(workouts);
  const haptics = useHaptics();

  // Charger les options d'exercice à partir des workouts et des exercices prédéfinis
  useEffect(() => {
    const predefinedExercises = Object.values(
      getPredefinedExercises(t as (key: string) => string)
    ).flat();
    const workoutExercises = workouts.map((w) => w.exercise);
    const uniqueExercises = Array.from(new Set([...workoutExercises, ...predefinedExercises]));

    // Ne mettre à jour que si les exercices ont changé
    if (JSON.stringify(uniqueExercises) !== JSON.stringify(exerciseOptions)) {
      setExerciseOptions(uniqueExercises as string[]);
    }
  }, [workouts, t, exerciseOptions]);

  // Vérifier s'il y a des workouts précédents pour l'exercice sélectionné
  useEffect(() => {
    if (!newGoalExerciseKey) {
      setHasPreviousWorkouts(false);
      setHighestWeight(null);
      return;
    }

    const hasWorkouts = workouts.some((w) => w.exercise === newGoalExerciseKey);

    if (hasWorkouts) {
      const weight = getCurrentWeight(newGoalExerciseKey);
      setHighestWeight(weight || null);
    } else {
      setHighestWeight(null);
    }
    setHasPreviousWorkouts(hasWorkouts);
  }, [newGoalExerciseKey, workouts, getCurrentWeight]);

  // Mettre à jour le poids suggéré quand le poids actuel change
  useEffect(() => {
    if (newGoalCurrent && !isNaN(parseFloat(newGoalCurrent))) {
      const currentWeight = parseFloat(newGoalCurrent);
      const target = suggestTargetWeight(currentWeight);
      if (target !== suggestedTarget) {
        setSuggestedTarget(target);
      }
    }
  }, [newGoalCurrent, suggestTargetWeight, suggestedTarget]);

  const handleExerciseSelect = useCallback(
    (exercise: string, exerciseKey?: string) => {
      haptics.impactLight();
      setIsExerciseModalVisible(false);
      setNewGoalExercise(exercise);
      setNewGoalExerciseKey(exerciseKey || exercise);
      const weight = getCurrentWeight(exerciseKey || exercise);
      if (weight) {
        setNewGoalCurrent(weight.toString());
      }
    },
    [getCurrentWeight, haptics]
  );

  const handleUseLastWorkout = useCallback(() => {
    haptics.impactLight();
    if (highestWeight) {
      setNewGoalCurrent(highestWeight.toString());
      const target = suggestTargetWeight(highestWeight);
      if (target) {
        setSuggestedTarget(target);
      }
    }
  }, [highestWeight, suggestTargetWeight, haptics]);

  const handleUseSuggested = useCallback(() => {
    haptics.impactLight();
    if (suggestedTarget) {
      setNewGoalTarget(suggestedTarget.toString());
    }
  }, [suggestedTarget, haptics]);

  const handleOpenExerciseModal = useCallback(() => {
    haptics.impactLight();
    setIsExerciseModalVisible(true);
  }, [haptics]);

  const handleCloseExerciseModal = useCallback(() => {
    setIsExerciseModalVisible(false);
  }, []);

  const handleTargetChange = (value: string) => {
    haptics.impactLight();
    setNewGoalTarget(value);
  };

  const handleCurrentChange = (value: string) => {
    haptics.impactLight();
    setNewGoalCurrent(value);
  };

  const saveGoal = async () => {
    if (!newGoalExercise.trim() || !newGoalCurrent || !newGoalTarget) {
      Alert.alert(t('common.error'), t('goals.pleaseCompleteAllFields'), [
        { text: t('common.ok') }
      ]);
      return;
    }

    const current = parseFloat(newGoalCurrent);
    const target = parseFloat(newGoalTarget);

    if (isNaN(current) || isNaN(target) || current <= 0 || target <= 0) {
      Alert.alert(t('common.error'), t('goals.invalidWeightValues'), [{ text: t('common.ok') }]);
      return;
    }

    try {
      const progress = Math.min(Math.round((current / target) * 100), 100);
      const newGoal = {
        exercise: newGoalExercise,
        current,
        target,
        progress
      };
      await addGoal(newGoal);
      router.push({
        pathname: '/screens/stats',
        params: { refresh: 'true' }
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('goals.errorSavingGoal'), [{ text: t('common.ok') }]);
    }
  };

  const handleMuscleGroupSelect = (muscleGroup: string) => {
    setSelectedMuscleGroup(muscleGroup);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Header title={t('goals.addGoal')} showBackButton={true} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeIn.duration(400).delay(100)} style={styles.formCard}>
          <Text variant="subheading" style={styles.sectionTitle}>
            {t('goals.goalDetails')}
          </Text>

          <View style={styles.formGroup}>
            <Text variant="body" style={styles.formLabel}>
              {t('timer.exercise')}
            </Text>
            <TouchableOpacity
              style={styles.exerciseSelectorButton}
              onPress={handleOpenExerciseModal}
            >
              <Text
                style={[
                  styles.exerciseSelectorText,
                  !newGoalExercise && { color: theme.colors.text.secondary }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {newGoalExercise || t('goals.selectExerciseForGoal')}
              </Text>
              <ChevronDown color={theme.colors.text.secondary} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text variant="body" style={styles.formLabel}>
              {t('goals.currentWeight')}
            </Text>
            <Text variant="caption" style={styles.inputDescription}>
              {t('goals.currentWeightDescription')}
            </Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor={theme.colors.text.secondary}
                value={newGoalCurrent}
                onChangeText={handleCurrentChange}
                keyboardType="numeric"
              />
              {newGoalExercise && hasPreviousWorkouts && highestWeight && (
                <Button
                  variant="secondary"
                  title={t('goals.useLastWorkout')}
                  onPress={handleUseLastWorkout}
                  style={styles.suggestedButton}
                  textStyle={styles.suggestedButtonText}
                />
              )}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text variant="body" style={styles.formLabel}>
              {t('goals.targetWeight')}
            </Text>
            <Text variant="caption" style={styles.inputDescription}>
              {t('goals.targetWeightDescription')}
            </Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.formInput}
                placeholder="0"
                placeholderTextColor={theme.colors.text.disabled}
                value={newGoalTarget}
                onChangeText={handleTargetChange}
                keyboardType="numeric"
              />
              {suggestedTarget && (
                <Button
                  variant="secondary"
                  title={t('goals.useSuggested')}
                  onPress={handleUseSuggested}
                  style={styles.suggestedButton}
                  textStyle={styles.suggestedButtonText}
                />
              )}
            </View>
          </View>

          <Button
            variant="primary"
            title={t('common.save')}
            onPress={saveGoal}
            disabled={!newGoalExercise || !newGoalCurrent || !newGoalTarget}
            style={{
              ...styles.saveButton,
              ...(!newGoalExercise || !newGoalCurrent || !newGoalTarget
                ? styles.saveButtonDisabled
                : {})
            }}
          />
        </Animated.View>
      </ScrollView>

      <Modal
        visible={isExerciseModalVisible}
        onClose={handleCloseExerciseModal}
        title={t('goals.selectExerciseForGoal')}
        showCloseButton={true}
      >
        <ExerciseList
          exercise={newGoalExercise}
          setExercise={handleExerciseSelect}
          selectedMuscle={selectedMuscleGroup}
          setSelectedMuscle={handleMuscleGroupSelect}
        />
      </Modal>
    </View>
  );
}
