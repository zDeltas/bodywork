import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  findNodeHandle,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, format, parseISO, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { muscleGroupKeys, predefinedExercisesByKey } from '@/app/components/ExerciseList';
import { useTheme } from '@/hooks/useTheme';
import KpiMotivation from '@/app/components/KpiMotivation';
import { Workout } from '@/types/workout';
import StatsExerciseList from '@/app/components/stats/StatsExerciseList';
import StatsGoals from '@/app/components/stats/StatsGoals';
import StatsMuscleDistribution from '@/app/components/stats/StatsMuscleDistribution';
import StatsMuscleRestState from '@/app/components/stats/StatsMuscleRestState';
import Header from '@/app/components/Header';

type MuscleGroupKey = typeof muscleGroupKeys[number];

type CategoryKey = MuscleGroupKey | 'arms' | 'cardio' | 'other';

type ExerciseName = string;

type Period = '1m' | '3m' | '6m';

// Define Goal interface
interface Goal {
  exercise: string;
  current: number;
  target: number;
  progress: number;
}

interface ExerciseData {
  x: string;
  y: number;
}

interface ExerciseDataSet {
  [key: string]: ExerciseData[];
}

interface MuscleGroupData {
  name: string;
  value: number;
  color: string;
}

// Define Workout interface for MuscleRestState
interface WorkoutForRestState {
  id: string;
  exercise: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  rpe?: number;
}

// Define BestProgressExercise interface for KpiMotivation
interface BestProgressExercise {
  progress: number;
  exercise: string;
}

// Define ExerciseListProps interface
interface ExerciseListProps {
  selectedMuscle: string;
  setSelectedMuscle: (muscleGroup: string) => void;
  exercise: string;
  setExercise: (exercise: string) => void;
  setIsCustomExercise?: (isCustom: boolean) => void;
  onExerciseSelect?: (exercise: string) => void;
  onMuscleSelect?: (muscleGroup: string) => void;
}

// Fonction pour calculer le 1RM estimé avec la formule d'Epley (plus précise)
const calculateEstimated1RM = (weight: number, reps: number): number => {
  return Math.round(weight * (1 + (reps / 30)));
};

// Fonction pour calculer le volume total
const calculateVolume = (weight: number, reps: number, sets: number): number => {
  return weight * reps * sets;
};

// Fonction pour formater la date en français
const formatDate = (date: string): string => {
  return format(parseISO(date), 'dd MMM', { locale: fr });
};

// Fonction pour calculer la progression mensuelle
const calculateMonthlyProgress = (workouts: Workout[]): number => {
  const lastMonthWorkouts = workouts.filter((workout: Workout) => {
    const workoutDate = new Date(workout.date);
    const oneMonthAgo = subMonths(new Date(), 1);
    return workoutDate >= oneMonthAgo;
  });

  if (lastMonthWorkouts.length === 0) return 0;

  const firstWorkout = lastMonthWorkouts.reduce((min: Workout, workout: Workout) =>
    new Date(workout.date) < new Date(min.date) ? workout : min
  );
  const lastWorkout = lastMonthWorkouts.reduce((max: Workout, workout: Workout) =>
    new Date(workout.date) > new Date(max.date) ? workout : max
  );

  // Get the first working set or the first series if no working set
  const firstWorkingSet = firstWorkout.series.find(s => s.type === 'workingSet') || firstWorkout.series[0];
  const lastWorkingSet = lastWorkout.series.find(s => s.type === 'workingSet') || lastWorkout.series[0];

  const first1RM = calculateEstimated1RM(firstWorkingSet.weight, firstWorkingSet.reps);
  const last1RM = calculateEstimated1RM(lastWorkingSet.weight, lastWorkingSet.reps);

  return Math.round(((last1RM - first1RM) / first1RM) * 100);
};

// Fonction pour calculer le nombre total de séries
const calculateTotalSets = (workouts: Workout[]): number => {
  return workouts.reduce((total, workout) => total + workout.series.length, 0);
};

// Fonction pour calculer la fréquence d'entraînement
const calculateTrainingFrequency = (workouts: Workout[], selectedPeriod: Period): number => {
  const filteredWorkouts = workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    const startDate = subMonths(new Date(), selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : 6);
    return workoutDate >= startDate;
  });

  if (!filteredWorkouts || !Array.isArray(filteredWorkouts)) {
    return 0;
  }

  const uniqueDates = new Set(filteredWorkouts.map(w => w.date));
  const daysInPeriod = differenceInDays(
    new Date(),
    subMonths(new Date(), selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : 6)
  );
  return Math.round((uniqueDates.size / daysInPeriod) * 100);
};

// Fonction pour trouver l'exercice avec la meilleure progression
const getBestProgressExercise = (workouts: Workout[]): { progress: number, exercise: string } | null => {
  if (!workouts || workouts.length === 0) return null;

  const exerciseProgress = workouts.reduce((acc: { [key: string]: { first: number, last: number } }, workout) => {
    const workingSet = workout.series.find(s => s.type === 'workingSet') || workout.series[0];
    const estimated1RM = calculateEstimated1RM(workingSet.weight, workingSet.reps);

    if (!acc[workout.exercise]) {
      acc[workout.exercise] = { first: estimated1RM, last: estimated1RM };
    } else {
      acc[workout.exercise].last = estimated1RM;
    }

    return acc;
  }, {});

  const progressData = Object.entries(exerciseProgress)
    .map(([exercise, data]) => ({
      progress: Math.round(((data.last - data.first) / data.first) * 100),
      exercise
    }))
    .filter(data => data.progress > 0);

  if (progressData.length === 0) return null;

  return progressData.reduce((max, current) =>
    current.progress > max.progress ? current : max
  );
};

export default function StatsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1m');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteExercises, setFavoriteExercises] = useState<ExerciseName[]>([]);
  const [recentExercises, setRecentExercises] = useState<ExerciseName[]>([]);
  const [expandedMuscleGroup, setExpandedMuscleGroup] = useState<CategoryKey | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
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

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load workouts
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          const parsedWorkouts = JSON.parse(storedWorkouts) as Workout[];
          if (Array.isArray(parsedWorkouts)) {
            setWorkouts(parsedWorkouts);

            // Extract unique exercise names
            const uniqueExercises = Array.from(new Set(parsedWorkouts.map((w: Workout) => w.exercise)));
            setExerciseOptions(uniqueExercises);
          }
        }

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

        // Load goals
        const storedGoals = await AsyncStorage.getItem('goals');
        if (storedGoals) {
          const parsedGoals = JSON.parse(storedGoals) as Goal[];
          if (Array.isArray(parsedGoals)) {
            setGoals(parsedGoals);
          }
        }
      } catch (error) {
        console.error(t('errorLoadingWorkouts'), error);
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

  // Corriger la fonction getFilteredExercises
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

  // Function to handle exercise selection
  const handleSelectExercise = useCallback((exercise: ExerciseName) => {
    if (!exercise) return;
    setNewGoalExercise(exercise);
    setShowExerciseSelector(false);
    setSearchQuery('');
  }, []);

  // Function to toggle favorite status of an exercise
  const toggleFavorite = useCallback((exercise: ExerciseName) => {
    if (!exercise) return;
    setFavoriteExercises(prev => {
      if (!Array.isArray(prev)) return [exercise];
      const isFavorite = prev.includes(exercise);
      const newFavorites = isFavorite
        ? prev.filter(e => e !== exercise)
        : [...prev, exercise];

      // Save to AsyncStorage
      try {
        AsyncStorage.setItem('favoriteExercises', JSON.stringify(newFavorites));
      } catch (error) {
        console.error(t('errorSavingWorkouts'), error);
      }

      return newFavorites;
    });
  }, [t]);

  // Function to suggest a target weight based on incremental improvement
  const suggestTargetWeight = useCallback((currentWeight: number) => {
    if (!currentWeight) return null;

    // Suggest a 5% improvement for weights under 50kg, 2.5% for heavier weights
    const improvementFactor = currentWeight < 50 ? 0.05 : 0.025;
    const suggestedImprovement = currentWeight * improvementFactor;

    // Round to nearest 2.5kg for barbells (simplification)
    const roundingFactor = 2.5;
    const suggestedTarget = Math.ceil((currentWeight + suggestedImprovement) / roundingFactor) * roundingFactor;

    return suggestedTarget;
  }, []);

  // Function to get the current weight from the most recent workout for the selected exercise
  const getCurrentWeight = useCallback((exerciseName: ExerciseName) => {
    if (!exerciseName || workouts.length === 0) return null;

    // Filter workouts for the selected exercise
    const exerciseWorkouts = workouts.filter(w => w.exercise === exerciseName);
    if (exerciseWorkouts.length === 0) return null;

    // Sort by date (most recent first)
    exerciseWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return the weight from the most recent workout's first working set
    const mostRecentWorkout = exerciseWorkouts[0];
    const workingSet = mostRecentWorkout.series.find(s => s.type === 'workingSet');
    return workingSet?.weight || null;
  }, [workouts]);

  // Update goals progress when workouts change
  useEffect(() => {
    if (workouts.length > 0 && goals.length > 0) {
      // Recalculer les objectifs sans modifier l'état si rien n'a changé
      const updatedGoals = goals.map(goal => {
        const currentWeight = getCurrentWeight(goal.exercise);
        if (currentWeight) {
          const progress = Math.min(Math.round((currentWeight / goal.target) * 100), 100);
          return { ...goal, current: currentWeight, progress };
        }
        return goal;
      });

      // Ne mettre à jour l'état que si quelque chose a réellement changé
      if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
        setGoals(updatedGoals);

        // Sauvegarder les objectifs mis à jour dans AsyncStorage
        try {
          AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
        } catch (error) {
          console.error(t('errorSavingWorkouts'), error);
        }
      }
    }
  }, [workouts, goals, getCurrentWeight]);

  const monthlyProgress = calculateMonthlyProgress(workouts);
  const trainingFrequency = calculateTrainingFrequency(workouts, selectedPeriod);
  const bestProgressExercise = getBestProgressExercise(workouts);
  const totalSets = calculateTotalSets(workouts);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Adapter les workouts pour MuscleRestState
  const adaptedWorkouts = workouts.map(workout => {
    const workingSet = workout.series.find(s => s.type === 'workingSet');
    return {
      id: workout.id,
      exercise: workout.exercise,
      muscleGroup: workout.muscleGroup,
      weight: workingSet?.weight || 0,
      reps: workingSet?.reps || 0,
      sets: workout.series.length,
      date: workout.date,
      rpe: workingSet?.rpe
    } as WorkoutForRestState;
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Header title={t('stats.title')} showBackButton={false} />
      <ScrollView style={styles.content} ref={scrollViewRef}>
        <KpiMotivation
          fadeAnim={fadeAnim}
          bestProgressExercise={bestProgressExercise}
          monthlyProgress={monthlyProgress}
          trainingFrequency={trainingFrequency}
          totalSets={totalSets}
          totalWorkouts={workouts.length}
        />

        <StatsExerciseList
          selectedMuscle={selectedMuscle}
          setSelectedMuscle={setSelectedMuscle}
          selectedExercise={selectedExercise}
          setSelectedExercise={setSelectedExercise}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          exerciseOptions={exerciseOptions}
          onExerciseSelect={(exercise) => {
            handleSelectExercise(exercise as ExerciseName);
            router.push({
              pathname: '/components/exerciseDetails',
              params: { exercise }
            });
          }}
          onMuscleSelect={(muscleGroup) => {
            setSelectedMuscle(muscleGroup);
            if (graphsSectionRef.current) {
              graphsSectionRef.current.measureLayout(
                findNodeHandle(scrollViewRef.current) as number,
                (_, y) => {
                  scrollViewRef.current?.scrollTo({ y, animated: true });
                },
                () => console.error('Failed to measure layout')
              );
            }
          }}
        />

        <StatsGoals
          fadeAnim={fadeAnim}
          goals={goals}
          setGoals={setGoals}
          workouts={workouts}
          getCurrentWeight={getCurrentWeight}
        />

        <StatsMuscleDistribution
          fadeAnim={fadeAnim}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          graphsSectionRef={graphsSectionRef}
        />

        <StatsMuscleRestState
          fadeAnim={fadeAnim}
          workouts={adaptedWorkouts}
        />

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{t('selectExerciseForGoal')}</Text>

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('searchExercise')}
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView style={styles.exerciseList}>
                {exerciseOptions
                  .filter(ex => {
                    const exerciseKey = ex as ExerciseName;
                    return exerciseKey in predefinedExercisesByKey && ex.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map((ex, index) => {
                    const exerciseKey = ex as ExerciseName;
                    if (!(exerciseKey in predefinedExercisesByKey)) {
                      return null;
                    }
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.exerciseOption}
                        onPress={() => {
                          setNewGoalExercise(exerciseKey);
                          setShowExerciseSelector(false);

                          // Auto-populate current weight and suggest target
                          const currentWeight = getCurrentWeight(exerciseKey);
                          if (currentWeight !== null) {
                            setNewGoalCurrent(currentWeight.toString());

                            // Update suggested target
                            const target = suggestTargetWeight(currentWeight);
                            if (target !== null) {
                              setSuggestedTarget(target);
                            }
                          }
                        }}
                      >
                        <Text style={styles.exerciseOptionText}>{ex}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowExerciseSelector(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
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
