import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { muscleGroupKeys } from '@/app/components/ExerciseList';
import { useTheme } from '@/hooks/useTheme';
import KpiMotivation from '@/app/components/KpiMotivation';
import { Workout } from '@/app/types/workout';
import StatsExerciseList from '@/app/components/stats/StatsExerciseList';
import StatsGoals from '@/app/components/stats/StatsGoals';
import StatsMuscleDistribution from '@/app/components/stats/StatsMuscleDistribution';
import StatsMuscleRestState from '@/app/components/stats/StatsMuscleRestState';
import Header from '@/app/components/Header';
import useStats from '@/app/hooks/useStats';
import useGoals from '@/app/hooks/useGoals';

type MuscleGroupKey = typeof muscleGroupKeys[number];

type CategoryKey = MuscleGroupKey | 'arms' | 'cardio' | 'other';

type ExerciseName = string;

type Period = '1m' | '3m' | '6m';

export default function StatsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1m');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteExercises, setFavoriteExercises] = useState<ExerciseName[]>([]);
  const [recentExercises, setRecentExercises] = useState<ExerciseName[]>([]);
  const [expandedMuscleGroup, setExpandedMuscleGroup] = useState<CategoryKey | null>(null);
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseName[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [newGoalExercise, setNewGoalExercise] = useState<ExerciseName>('exercise_chest_benchPress');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [suggestedTarget, setSuggestedTarget] = useState<number | null>(null);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseName[]>([]);
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const graphsSectionRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const statsData = useStats(selectedPeriod);
  const { goals, setGoals, getCurrentWeight, suggestTargetWeight } = useGoals(statsData.workouts);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load favorite exercises
        const storedFavorites = await AsyncStorage.getItem('favoriteExercises');
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites) as ExerciseName[];
          if (Array.isArray(parsedFavorites)) {
            setFavoriteExercises(parsedFavorites);
          }
        }

        // Load recent exercises
        const storedRecent = await AsyncStorage.getItem('recentExercises');
        if (storedRecent) {
          try {
            const parsed = JSON.parse(storedRecent);
            if (Array.isArray(parsed)) {
              setRecentExercises(parsed as ExerciseName[]);
            }
          } catch (error) {
            console.error('Error parsing recent exercises:', error);
          }
        }
      } catch (error) {
        console.error(t('common.errorLoadingWorkouts'), error);
      }
    };

    loadInitialData();
  }, [t]);

  // Animation effect
  useEffect(() => {
    if (fontsLoaded) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [fontsLoaded]);

  const getFilteredExercises = useCallback((query: string, options: ExerciseName[]): ExerciseName[] => {
    if (!query || !options || !Array.isArray(options)) return [];
    return options.filter(exercise =>
      exercise.toLowerCase().includes(query.toLowerCase())
    );
  }, []);

  // Update filtered exercises when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredExercises([]);
      return;
    }
    const filtered = getFilteredExercises(searchQuery, exerciseOptions);
    if (Array.isArray(filtered)) {
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exerciseOptions, getFilteredExercises]);

  const handleSelectExercise = useCallback((exercise: ExerciseName) => {
    if (!exercise) return;
    setNewGoalExercise(exercise);
    setShowExerciseSelector(false);
    setSearchQuery('');

    const currentWeight = getCurrentWeight(exercise);
    if (currentWeight !== null) {
      setNewGoalCurrent(currentWeight.toString());
      const target = suggestTargetWeight(currentWeight);
      if (target !== null) {
        setSuggestedTarget(target);
      }
    }
  }, [getCurrentWeight, suggestTargetWeight]);

  const toggleFavorite = useCallback((exercise: ExerciseName) => {
    if (!exercise) return;
    setFavoriteExercises(prev => {
      if (!Array.isArray(prev)) return [exercise];
      const isFavorite = prev.includes(exercise);
      const newFavorites = isFavorite
        ? prev.filter(e => e !== exercise)
        : [...prev, exercise];

      try {
        AsyncStorage.setItem('favoriteExercises', JSON.stringify(newFavorites));
      } catch (error) {
        console.error(t('common.errorSavingWorkouts'), error);
      }

      return newFavorites;
    });
  }, [t]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleMuscleSelect = useCallback((muscleGroup: string) => {
    setSelectedMuscle(muscleGroup);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 400, animated: true });
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Header title={t('stats.title')} showBackButton={false} />
      <ScrollView
        style={styles.content}
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <KpiMotivation
          fadeAnim={fadeAnim}
          bestProgressExercise={statsData.bestProgressExercise}
          monthlyProgress={statsData.monthlyProgress}
          trainingFrequency={statsData.trainingFrequency}
          totalSets={statsData.workouts.reduce((total: number, workout: Workout) => total + workout.series.length, 0)}
          totalWorkouts={statsData.workouts.length}
        />

        <StatsExerciseList
          selectedMuscle={selectedMuscle}
          setSelectedMuscle={setSelectedMuscle}
          selectedExercise={selectedExercise}
          setSelectedExercise={setSelectedExercise}
          exerciseOptions={exerciseOptions}
          onExerciseSelect={(exercise) => {
            handleSelectExercise(exercise as ExerciseName);
            router.push({
              pathname: '/components/exerciseDetails',
              params: { exercise }
            });
          }}
          onMuscleSelect={handleMuscleSelect}
        />

        <View ref={graphsSectionRef}>
          <StatsGoals
            fadeAnim={fadeAnim}
            goals={goals}
            setGoals={setGoals}
            workouts={statsData.workouts}
            getCurrentWeight={getCurrentWeight}
          />

          <StatsMuscleDistribution
            fadeAnim={fadeAnim}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            graphsSectionRef={graphsSectionRef}
            muscleGroups={statsData.muscleDistribution}
          />

          <StatsMuscleRestState
            fadeAnim={fadeAnim}
            workouts={statsData.workouts}
          />
        </View>

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t('goals.selectExerciseForGoal')}</Text>

              <ScrollView style={styles.exerciseList}>
                {exerciseOptions
                  .filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((ex, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.exerciseOption}
                      onPress={() => handleSelectExercise(ex)}
                    >
                      <Text style={styles.exerciseOptionText}>{ex}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowExerciseSelector(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
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
    content: {
      flex: 1
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    iconButton: {
      padding: theme.spacing.sm
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg
    },
    searchIcon: {
      marginRight: theme.spacing.sm
    },
    searchInput: {
      flex: 1,
      height: 44,
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular
    },
    periodSelector: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.xs
    },
    periodButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.sm
    },
    periodButtonActive: {
      backgroundColor: theme.colors.primary
    },
    sectionContainer: {
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md
    },
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.md
    },
    chartContainer: {
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md
    },
    chartTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary
    },
    chart: {
      height: 250,
      alignItems: 'center'
    },
    exerciseItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    exerciseItemText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base
    },
    favoriteButton: {
      padding: theme.spacing.sm
    },
    statsContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.lg
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md
    },
    statCard: {
      flex: 1,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginHorizontal: theme.spacing.xs
    },
    statGradient: {
      padding: theme.spacing.base,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center'
    },
    statIcon: {
      marginBottom: theme.spacing.sm
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      textAlign: 'center'
    },
    statValue: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      textAlign: 'center'
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: theme.zIndex.modal,
      elevation: 5
    },
    modalContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '90%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      ...theme.shadows.lg
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center'
    },
    formGroup: {
      marginBottom: theme.spacing.base
    },
    formLabel: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm
    },
    formInput: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginRight: theme.spacing.sm,
      alignItems: 'center'
    },
    cancelButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    saveButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginLeft: theme.spacing.sm,
      alignItems: 'center'
    },
    saveButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    exerciseList: {
      maxHeight: 300,
      marginVertical: theme.spacing.base,
      borderColor: theme.colors.border.default,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md
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
    }
  });
};
