import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { VictoryLabel, VictoryPie } from 'victory-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays, format, getWeek, parseISO, startOfWeek, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import MuscleMap from '@/app/components/MuscleMap';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { predefinedExercises } from '@/app/workout/new';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

SplashScreen.preventAutoHideAsync();

interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  rpe?: number;
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

// Fonction pour obtenir une couleur en fonction de la progression
const getProgressColor = (progress: number): string => {
  if (progress > 0) return colors.success;
  if (progress < 0) return colors.error;
  return colors.text.secondary;
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

  const first1RM = calculateEstimated1RM(firstWorkout.weight, firstWorkout.reps);
  const last1RM = calculateEstimated1RM(lastWorkout.weight, lastWorkout.reps);

  return Math.round(((last1RM - first1RM) / first1RM) * 100);
};

// Données de démonstration
const sampleData: ExerciseDataSet = {
  squat: [
    { x: 'Sem 1', y: 100 },
    { x: 'Sem 2', y: 105 },
    { x: 'Sem 3', y: 110 },
    { x: 'Sem 4', y: 115 }
  ],
  bench: [
    { x: 'Sem 1', y: 80 },
    { x: 'Sem 2', y: 85 },
    { x: 'Sem 3', y: 90 },
    { x: 'Sem 4', y: 95 }
  ],
  deadlift: [
    { x: 'Sem 1', y: 120 },
    { x: 'Sem 2', y: 125 },
    { x: 'Sem 3', y: 130 },
    { x: 'Sem 4', y: 135 }
  ]
};

const muscleGroups = [
  { name: 'Pectoraux', value: 30, color: colors.error },
  { name: 'Dos', value: 25, color: colors.primary },
  { name: 'Jambes', value: 35, color: colors.success },
  { name: 'Épaules', value: 10, color: colors.text.accent }
];

// Initial goals data
const initialGoals = [
  { exercise: 'Squat', current: 120, target: 140, progress: 85 },
  { exercise: 'Développé couché', current: 100, target: 120, progress: 60 },
  { exercise: 'Soulevé de terre', current: 150, target: 180, progress: 70 }
];

// Define muscle group categories with their icons
const muscleGroupCategories = [
  { id: 'chest', icon: 'pectorals', color: colors.error },
  { id: 'back', icon: 'human-handsdown', color: colors.primary },
  { id: 'legs', icon: 'human-male', color: colors.success },
  { id: 'arms', icon: 'arm-flex', color: colors.text.accent },
  { id: 'shoulders', icon: 'human-male', color: colors.primaryLight },
  { id: 'core', icon: 'ab-testing', color: colors.primaryBorder },
  { id: 'cardio', icon: 'heart-pulse', color: colors.error },
  { id: 'other', icon: 'dumbbell', color: colors.text.secondary }
];

export default function StatsScreen() {
  const { t } = useTranslation();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);
  const [recentExercises, setRecentExercises] = useState<string[]>([]);
  const [expandedMuscleGroup, setExpandedMuscleGroup] = useState<string | null>(null);
  const [goals, setGoals] = useState(initialGoals);
  const [exerciseOptions, setExerciseOptions] = useState<string[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Load workouts, favorites, recent exercises, and goals from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load workouts
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          const parsedWorkouts = JSON.parse(storedWorkouts);
          setWorkouts(parsedWorkouts);

          // Extract unique exercise names for the exercise selector
          const uniqueExercises = Array.from(new Set(parsedWorkouts.map((w: Workout) => w.exercise)));
          setExerciseOptions(uniqueExercises);
        }

        // Load favorite exercises
        const storedFavorites = await AsyncStorage.getItem('favoriteExercises');
        if (storedFavorites) {
          setFavoriteExercises(JSON.parse(storedFavorites));
        }

        // Load recent exercises
        const storedRecent = await AsyncStorage.getItem('recentExercises');
        if (storedRecent) {
          try {
            const parsed = JSON.parse(storedRecent);
            if (Array.isArray(parsed)) {
              // Assume elements are strings, consider adding validation if needed
              setRecentExercises(parsed as string[]);
            } else {
              console.warn('Stored recent exercises were not an array:', parsed);
              setRecentExercises([]);
            }
          } catch (parseError) {
            console.error('Error parsing recent exercises:', parseError);
            setRecentExercises([]);
          }
        }

        // Load goals
        const storedGoals = await AsyncStorage.getItem('goals');
        if (storedGoals) {
          setGoals(JSON.parse(storedGoals));
        }
      } catch (error) {
        console.error(t('errorLoadingWorkouts'), error);
      }
    };

    loadData();
  }, []);

  // Add or remove an exercise from favorites
  const toggleFavorite = async (exercise: string) => {
    try {
      let updatedFavorites;
      if (favoriteExercises.includes(exercise)) {
        // Remove from favorites
        updatedFavorites = favoriteExercises.filter(e => e !== exercise);
      } else {
        // Add to favorites
        updatedFavorites = [...favoriteExercises, exercise];
      }

      setFavoriteExercises(updatedFavorites);
      await AsyncStorage.setItem('favoriteExercises', JSON.stringify(updatedFavorites));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error(t('errorSavingWorkouts'), error);
    }
  };

  // Add an exercise to recent exercises
  const addToRecent = async (exercise: string) => {
    try {
      // Remove the exercise if it already exists to avoid duplicates
      const filteredRecent = recentExercises.filter(e => e !== exercise);

      // Add the exercise to the beginning of the array
      const updatedRecent = [exercise, ...filteredRecent].slice(0, 5); // Keep only the 5 most recent

      setRecentExercises(updatedRecent);
      await AsyncStorage.setItem('recentExercises', JSON.stringify(updatedRecent));
    } catch (error) {
      console.error(t('errorSavingWorkouts'), error);
    }
  };

  // Select an exercise and navigate to details view
  const handleSelectExercise = (exercise: string) => {
    addToRecent(exercise);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/exercise-details',
      params: { exercise }
    });
  };

  const getFilteredExercises = () => {
    if (!searchQuery.trim()) return uniqueExercises;

    return uniqueExercises.filter(exercise =>
      exercise.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  useEffect(() => {
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
  }, []);

  // Update goals progress when workouts change
  useEffect(() => {
    if (workouts.length > 0 && goals.length > 0) {
      updateGoalsProgress();
    }
  }, [workouts, updateGoalsProgress]);

  // Filtrer les séances selon la période sélectionnée
  const getFilteredWorkouts = () => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case '1m':
        startDate = subMonths(now, 1);
        break;
      case '3m':
        startDate = subMonths(now, 3);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    return workouts.filter(workout =>
      new Date(workout.date) >= startDate
    );
  };

  // Calculer les données pour les graphiques
  const calculateChartData = () => {
    const filteredWorkouts = getFilteredWorkouts();

    // Utiliser tous les workouts filtrés par période
    const muscleGroupFilteredWorkouts = filteredWorkouts;

    const exerciseData: ExerciseDataSet = {};
    const volumeByWeekData: ExerciseDataSet = {};
    const repsByExerciseData: ExerciseDataSet = {};
    const muscleGroups: { [key: string]: number } = {};
    let totalVolume = 0;
    let totalWorkouts = 0;
    let totalSets = 0;
    let personalRecords: { [key: string]: number } = {};

    // Organiser les données par semaine pour le graphique de volume
    const weeklyData: { [key: string]: { volume: number, workouts: Set<string> } } = {};

    muscleGroupFilteredWorkouts.forEach(workout => {
      // Données par exercice pour 1RM
      if (!exerciseData[workout.exercise]) {
        exerciseData[workout.exercise] = [];
      }
      const estimated1RM = calculateEstimated1RM(workout.weight, workout.reps);
      exerciseData[workout.exercise].push({
        x: formatDate(workout.date),
        y: estimated1RM
      });

      // Données de répétitions par exercice
      if (!repsByExerciseData[workout.exercise]) {
        repsByExerciseData[workout.exercise] = [];
      }
      repsByExerciseData[workout.exercise].push({
        x: formatDate(workout.date),
        y: workout.reps
      });

      // Volume par groupe musculaire
      const volume = calculateVolume(workout.weight, workout.reps, workout.sets);
      muscleGroups[workout.muscleGroup] = (muscleGroups[workout.muscleGroup] || 0) + volume;
      totalVolume += volume;
      totalSets += workout.sets;

      // Données de volume par semaine
      const workoutDate = new Date(workout.date);
      const weekStart = format(startOfWeek(workoutDate, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      if (!weeklyData[weekStart]) {
        weeklyData[weekStart] = { volume: 0, workouts: new Set() };
      }
      weeklyData[weekStart].volume += volume;
      weeklyData[weekStart].workouts.add(workout.date);

      // Records personnels
      if (!personalRecords[workout.exercise] || workout.weight > personalRecords[workout.exercise]) {
        personalRecords[workout.exercise] = workout.weight;
      }
    });

    // Convertir les données hebdomadaires en format pour VictoryChart
    Object.entries(weeklyData).forEach(([weekStart, data]) => {
      const weekLabel = `S${getWeek(new Date(weekStart))}`;
      if (!volumeByWeekData['volume']) {
        volumeByWeekData['volume'] = [];
      }
      volumeByWeekData['volume'].push({
        x: weekLabel,
        y: data.volume
      });
    });

    totalWorkouts = new Set(muscleGroupFilteredWorkouts.map(w => w.date)).size;

    return {
      exerciseData,
      volumeByWeekData,
      repsByExerciseData,
      muscleGroups: Object.entries(muscleGroups).map(([name, value], index) => ({
        name,
        value: Math.round(value),
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][index % 4]
      })),
      totalVolume,
      totalWorkouts,
      totalSets,
      personalRecords: Object.keys(personalRecords).length
    };
  };

  const {
    exerciseData,
    volumeByWeekData,
    repsByExerciseData,
    muscleGroups,
    totalVolume,
    totalWorkouts,
    totalSets,
    personalRecords
  } = calculateChartData();

  const monthlyProgress = calculateMonthlyProgress(workouts);

  // Calculer la progression par exercice pour des suggestions plus précises
  const calculateExerciseProgress = (exercise: string): { progress: number, exercise: string } | null => {
    if (!exerciseData[exercise] || exerciseData[exercise].length < 2) return null;

    const data = exerciseData[exercise];
    const first = data[0];
    const last = data[data.length - 1];

    const progressPercent = Math.round(((last.y - first.y) / first.y) * 100);

    return {
      progress: progressPercent,
      exercise: exercise
    };
  };

  // Trouver l'exercice avec la meilleure progression
  const getBestProgressExercise = (): { progress: number, exercise: string } | null => {
    const exercises = Object.keys(exerciseData);
    if (exercises.length === 0) return null;

    const progressData = exercises
      .map(exercise => calculateExerciseProgress(exercise))
      .filter(data => data !== null && data.progress > 0) as { progress: number, exercise: string }[];

    if (progressData.length === 0) return null;

    return progressData.reduce((max, current) =>
      current.progress > max.progress ? current : max
    );
  };

  const bestProgressExercise = getBestProgressExercise();

  // Calculer la fréquence d'entraînement
  const calculateTrainingFrequency = () => {
    const filteredWorkouts = getFilteredWorkouts();
    const uniqueDates = new Set(filteredWorkouts.map(w => w.date));
    const daysInPeriod = differenceInDays(
      new Date(),
      subMonths(new Date(), selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : 6)
    );
    return Math.round((uniqueDates.size / daysInPeriod) * 100);
  };

  const trainingFrequency = calculateTrainingFrequency();

  // Obtenir les exercices uniques pour le sélecteur
  // Combine exercises from workouts and predefined exercises
  const predefinedExercisesList = Object.values(predefinedExercises).flat();
  const uniqueExercises = Array.from(new Set([
    ...workouts.map(w => w.exercise),
    ...predefinedExercisesList
  ]));

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Function to get the current weight from the most recent workout for the selected exercise
  const getCurrentWeight = useCallback((exerciseName: string) => {
    if (!exerciseName || workouts.length === 0) return null;

    // Filter workouts for the selected exercise
    const exerciseWorkouts = workouts.filter(w => w.exercise === exerciseName);
    if (exerciseWorkouts.length === 0) return null;

    // Sort by date (most recent first)
    exerciseWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return the weight from the most recent workout
    return exerciseWorkouts[0].weight;
  }, [workouts]);

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

  // Function to update the progress of all goals based on the latest workout data
  const updateGoalsProgress = useCallback(() => {
    if (workouts.length === 0 || goals.length === 0) return;

    const updatedGoals = goals.map(goal => {
      // Get the current weight from the most recent workout for this exercise
      const currentWeight = getCurrentWeight(goal.exercise);

      if (currentWeight) {
        // Update the current weight and progress
        const progress = Math.min(Math.round((currentWeight / goal.target) * 100), 100);
        return { ...goal, current: currentWeight, progress };
      }

      return goal;
    });

    // Only update if there are changes
    if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
      setGoals(updatedGoals);

      // Save updated goals to AsyncStorage
      try {
        AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      } catch (error) {
        console.error(t('errorSavingWorkouts'), error);
      }
    }
  }, [workouts, goals, getCurrentWeight]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollViewContent}
      onLayout={onLayoutRootView}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('stats')}</Text>
      </View>

      {/* Section Motivation/KPI avec animation */}
      <Animated.View
        style={[
          styles.card,
          { marginHorizontal: spacing.lg },
          { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statGradient}
        >
          <Text 
            style={[styles.kpiLabel, { marginBottom: spacing.base, color: colors.text.primary, textAlign: 'left' }]}
          >
            {bestProgressExercise
              ? t('progressionText').replace('{progress}', bestProgressExercise.progress.toString()).replace('{exercise}', bestProgressExercise.exercise)
              : monthlyProgress > 0
                ? t('progressionTextMonth').replace('{progress}', monthlyProgress.toString())
                : t('progressionTextNone')}
          </Text>
          <View style={styles.kpiContainer}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{trainingFrequency}%</Text>
              <Text style={styles.kpiLabel}>{t('attendance')}</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{totalSets}</Text>
              <Text style={styles.kpiLabel}>{t('series')}</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{totalWorkouts}</Text>
              <Text style={styles.kpiLabel}>{t('sessions')}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Liste des exercices par groupe musculaire */}
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{t('allExercises')}</Text>
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
        </View>

        {/* Favorites section */}
        {favoriteExercises.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('favorites')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
              {favoriteExercises.map((exercise) => (
                <TouchableOpacity
                  key={`fav-${exercise}`}
                  style={styles.chip}
                  onPress={() => handleSelectExercise(exercise)}
                >
                  <Ionicons name="star" size={16} color={colors.primary} style={styles.chipIcon} />
                  <Text style={styles.chipText}>{exercise}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent exercises section */}
        {recentExercises.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('recentExercises')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
              {recentExercises.map((exercise) => (
                <TouchableOpacity
                  key={`recent-${exercise}`}
                  style={styles.chip}
                  onPress={() => handleSelectExercise(exercise)}
                >
                  <Ionicons name="time" size={16} color={colors.text.secondary} style={styles.chipIcon} />
                  <Text style={styles.chipText}>{exercise}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Muscle group categories */}
        <View style={styles.sectionContainer}>
          {muscleGroupCategories.map((category) => (
            <View key={category.id} style={styles.accordionContainer}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => {
                  setExpandedMuscleGroup(expandedMuscleGroup === category.id ? null : category.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.accordionHeaderContent}>
                  <View style={[styles.muscleGroupIcon, { backgroundColor: category.color }]}>
                    <MaterialCommunityIcons name={category.icon as any} size={20} color="#fff" />
                  </View>
                  <Text style={styles.accordionTitle}>{t(category.id)}</Text>
                </View>
                <Ionicons
                  name={expandedMuscleGroup === category.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>

              {expandedMuscleGroup === category.id && (
                <View style={styles.accordionContent}>
                  {(() => {
                    // Map muscle group categories to the corresponding keys in predefinedExercises
                    const muscleGroupMapping: { [key: string]: string } = {
                      'chest': 'Poitrine',
                      'back': 'Dos',
                      'legs': 'Jambes',
                      'shoulders': 'Epaules',
                      'arms': 'Biceps', // Note: This will only show biceps exercises, might need to combine with triceps
                      'core': 'Ceinture abdominale',
                      'cardio': '', // No direct mapping in predefinedExercises
                      'other': '' // No direct mapping in predefinedExercises
                    };

                    // Get predefined exercises for this muscle group
                    const muscleGroupKey = muscleGroupMapping[category.id];
                    let predefinedExercisesForGroup: string[] = [];

                    if (muscleGroupKey) {
                      if (category.id === 'arms') {
                        // Special case for arms - combine biceps and triceps
                        predefinedExercisesForGroup = [
                          ...(predefinedExercises['Biceps'] || []),
                          ...(predefinedExercises['Triceps'] || [])
                        ];
                      } else {
                        predefinedExercisesForGroup = predefinedExercises[muscleGroupKey as keyof typeof predefinedExercises] || [];
                      }
                    }

                    // Filter exercises based on search query
                    if (searchQuery) {
                      predefinedExercisesForGroup = predefinedExercisesForGroup.filter(exercise =>
                        exercise.toLowerCase().includes(searchQuery.toLowerCase())
                      );
                    }

                    if (predefinedExercisesForGroup.length === 0) {
                      return (
                        <View style={styles.noExercisesContainer}>
                          <Text style={styles.noExercisesText}>{t('noExercisesInGroup')}</Text>
                        </View>
                      );
                    }

                    return predefinedExercisesForGroup.map((exercise) => (
                      <TouchableOpacity
                        key={exercise}
                        style={styles.exerciseItem}
                        onPress={() => handleSelectExercise(exercise)}
                      >
                        <Text style={styles.exerciseItemText}>{exercise}</Text>
                        <TouchableOpacity
                          style={styles.favoriteButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            toggleFavorite(exercise);
                          }}
                        >
                          <Ionicons
                            name={favoriteExercises.includes(exercise) ? 'star' : 'star-outline'}
                            size={20}
                            color={favoriteExercises.includes(exercise) ? '#fd8f09' : '#999'}
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ));
                  })()}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* All exercises (if search is active) */}
        {searchQuery.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{t('searchResults')}</Text>
            {getFilteredExercises().map((exercise) => (
              <TouchableOpacity
                key={exercise}
                style={styles.exerciseItem}
                onPress={() => handleSelectExercise(exercise)}
              >
                <Text style={styles.exerciseItemText}>{exercise}</Text>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(exercise);
                  }}
                >
                  <Ionicons
                    name={favoriteExercises.includes(exercise) ? 'star' : 'star-outline'}
                    size={20}
                    color={favoriteExercises.includes(exercise) ? '#fd8f09' : '#999'}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Objectifs et progression */}
      <Animated.View
        style={[
          styles.chartContainer,
          { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
        ]}
      >
        <Text style={styles.chartTitle}>{t('goals')}</Text>

        {goals.length === 0 ? (
          <View style={styles.noGoalsContainer}>
            <Text style={styles.noGoalsText}>{t('noGoalsYet')}</Text>
          </View>
        ) : (
          goals.map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.exercise}</Text>
                <View style={styles.goalHeaderRight}>
                  <Text style={styles.goalValues}>
                    <Text style={styles.goalCurrent}>{goal.current}kg</Text>
                    <Text style={styles.goalSeparator}> / </Text>
                    <Text style={styles.goalTarget}>{goal.target}kg</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteGoalButton}
                    onPress={() => {
                      // Show confirmation dialog
                      Alert.alert(
                        t('deleteGoal'),
                        t('deleteGoalConfirmation').replace('{exercise}', goal.exercise),
                        [
                          {
                            text: t('cancel'),
                            style: 'cancel'
                          },
                          {
                            text: t('delete'),
                            style: 'destructive',
                            onPress: () => {
                              // Remove goal
                              const updatedGoals = goals.filter((_, i) => i !== index);
                              setGoals(updatedGoals);

                              // Save updated goals to AsyncStorage
                              try {
                                AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
                              } catch (error) {
                                console.error(t('errorSavingWorkouts'), error);
                              }

                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.goalProgressContainer}>
                <View
                  style={[
                    styles.goalProgressBar,
                    { width: `${goal.progress}%` },
                    goal.progress > 80 ? styles.goalProgressHigh :
                      goal.progress > 50 ? styles.goalProgressMedium :
                        styles.goalProgressLow
                  ]}
                />
              </View>

              <Text style={styles.goalProgressText}>
                {goal.progress < 100
                  ? t('goalRemaining').replace('{remaining}', (goal.target - goal.current).toString())
                  : t('goalAchieved')}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.addGoalButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/goal/new');
          }}
        >
          <Ionicons name="add-circle" size={20} color="#fd8f09" />
          <Text style={styles.addGoalText}>{t('addGoal')}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Répartition des groupes musculaires avec animation */}
      <Animated.View
        style={[
          styles.chartContainer,
          { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
        ]}
      >
        <View style={styles.chartTitleContainer}>
          <Text style={styles.chartTitle}>{t('muscleDistribution')}</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, selectedPeriod === '1m' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedPeriod('1m');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.filterText, selectedPeriod === '1m' && styles.filterTextActive]}>{t('oneMonth')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedPeriod === '3m' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedPeriod('3m');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.filterText, selectedPeriod === '3m' && styles.filterTextActive]}>{t('threeMonths')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedPeriod === '6m' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedPeriod('6m');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.filterText, selectedPeriod === '6m' && styles.filterTextActive]}>{t('sixMonths')}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <VictoryPie
          data={muscleGroups}
          x="name"
          y="value"
          colorScale={muscleGroups.map(g => g.color)}
          width={Dimensions.get('window').width - 40}
          height={300}
          innerRadius={70}
          labelRadius={100}
          style={{
            labels: { fill: '#fff', fontSize: 12 }
          }}
          labelComponent={
            <VictoryLabel
              style={{ fill: '#fff', fontSize: 12 }}
              text={({ datum }) => `${datum.name}\n${datum.value}kg`}
            />
          }
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.chartContainer,
          { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
        ]}
      >
        <Text style={styles.chartTitle}>{t('muscleRestState')}</Text>
        <MuscleMap workouts={workouts} />
      </Animated.View>

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
                .filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((ex, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exerciseOption}
                    onPress={() => {
                      setNewGoalExercise(ex);
                      setShowExerciseSelector(false);

                      // Auto-populate current weight and suggest target
                      const currentWeight = getCurrentWeight(ex);
                      if (currentWeight) {
                        setNewGoalCurrent(currentWeight.toString());

                        // Update suggested target
                        const target = suggestTargetWeight(currentWeight);
                        if (target) {
                          setSuggestedTarget(target);
                        }
                      }
                    }}
                  >
                    <Text style={styles.exerciseOptionText}>{ex}</Text>
                  </TouchableOpacity>
                ))}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: spacing.lg,
  },
  scrollViewContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  iconButton: {
    padding: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
  },
  periodButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  periodTextActive: {
    color: colors.text.primary,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...theme.shadows.md,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  kpiItem: {
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  kpiLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  chart: {
    height: 250,
    alignItems: 'center',
  },
  centeredLabel: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  centeredLabelTextValue: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  centeredLabelTextLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginTop: -spacing.xs,
  },
  muscleMapContainer: {
    height: 350,
    marginBottom: spacing.lg,
  },
  exerciseListContainer: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  listSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  viewAllText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
  },
  accordionContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muscleGroupIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accordionTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  accordionContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  exerciseItemText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  noExercisesContainer: {
    padding: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noExercisesText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: colors.background.button,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.base,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  goalItem: {
    marginBottom: spacing.lg,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  goalValues: {
    fontSize: typography.fontSize.sm,
    marginRight: spacing.sm,
  },
  deleteGoalButton: {
    padding: spacing.xs,
  },
  goalCurrent: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
  },
  goalSeparator: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
  },
  goalTarget: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  goalProgressContainer: {
    height: 8,
    backgroundColor: colors.background.button,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  goalProgressBar: {
    height: '100%',
    borderRadius: borderRadius.xs,
  },
  goalProgressLow: {
    backgroundColor: colors.error,
  },
  goalProgressMedium: {
    backgroundColor: colors.primary,
  },
  goalProgressHigh: {
    backgroundColor: colors.success,
  },
  goalProgressText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  addGoalText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    marginLeft: spacing.sm,
  },
  statsContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.xs,
  },
  statGradient: {
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
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
    elevation: 5,
  },
  modalContainer: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: spacing.base,
  },
  formLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  formInput: {
    backgroundColor: colors.background.input,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background.button,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginLeft: spacing.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base,
  },
  noGoalsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noGoalsText: {
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  exerciseSelectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  exerciseSelectorText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
  },
  weightInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
  },
  suggestedButtonText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.xs,
  },
  exerciseList: {
    maxHeight: 300,
    marginVertical: spacing.base,
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  exerciseOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  exerciseOptionText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.primary,
  },
  chipsContainer: {
    padding: spacing.sm,
  },
  chip: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.card,
    marginRight: spacing.sm,
  },
  chipIcon: {
    marginRight: spacing.sm,
  },
  chipText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.base,
  },
});
