import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryPie, VictoryScatter, VictoryLabel, VictoryBar, VictoryGroup, VictoryTooltip } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subMonths, format, parseISO, differenceInDays, startOfMonth, endOfMonth, addDays, getWeek, getYear, startOfWeek, endOfWeek, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import MuscleMap from '@/app/components/MuscleMap';

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
  if (progress > 0) return '#4ade80'; // Vert pour progression positive
  if (progress < 0) return '#f87171'; // Rouge pour régression
  return '#94a3b8'; // Gris pour stagnation
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
    { x: 'Sem 4', y: 115 },
  ],
  bench: [
    { x: 'Sem 1', y: 80 },
    { x: 'Sem 2', y: 85 },
    { x: 'Sem 3', y: 90 },
    { x: 'Sem 4', y: 95 },
  ],
  deadlift: [
    { x: 'Sem 1', y: 120 },
    { x: 'Sem 2', y: 125 },
    { x: 'Sem 3', y: 130 },
    { x: 'Sem 4', y: 135 },
  ],
};

const muscleGroups = [
  { name: 'Pectoraux', value: 30, color: '#FF6B6B' },
  { name: 'Dos', value: 25, color: '#4ECDC4' },
  { name: 'Jambes', value: 35, color: '#45B7D1' },
  { name: 'Épaules', value: 10, color: '#96CEB4' },
];

const goals = [
  { exercise: 'Squat', current: 120, target: 140, progress: 85 },
  { exercise: 'Développé couché', current: 100, target: 120, progress: 60 },
  { exercise: 'Soulevé de terre', current: 150, target: 180, progress: 70 },
];

export default function StatsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedChartType, setSelectedChartType] = useState<'1rm' | 'volume' | 'reps'>('1rm');
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showMuscleGroupSelector, setShowMuscleGroupSelector] = useState(false);
  const [selectedRestView, setSelectedRestView] = useState<'front' | 'back'>('front');
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          setWorkouts(JSON.parse(storedWorkouts));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des séances:', error);
      }
    };

    loadWorkouts();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

    // Filtrer par groupe musculaire si sélectionné
    const muscleGroupFilteredWorkouts = selectedMuscleGroup 
      ? filteredWorkouts.filter(w => w.muscleGroup === selectedMuscleGroup)
      : filteredWorkouts;

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
  const uniqueExercises = Array.from(new Set(workouts.map(w => w.exercise)));

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} onLayout={onLayoutRootView}>
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
        <Text style={styles.title}>Analyse & Graphiques</Text>

        {/* Filtres de période */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Période:</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedPeriod === '1m' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedPeriod('1m');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.filterText, selectedPeriod === '1m' && styles.filterTextActive]}>1M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedPeriod === '3m' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedPeriod('3m');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.filterText, selectedPeriod === '3m' && styles.filterTextActive]}>3M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedPeriod === '6m' && styles.filterButtonActive]}
              onPress={() => {
                setSelectedPeriod('6m');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.filterText, selectedPeriod === '6m' && styles.filterTextActive]}>6M</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtres de groupe musculaire */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Groupe musculaire:</Text>
          <TouchableOpacity 
            style={styles.muscleGroupSelector}
            onPress={() => {
              setShowMuscleGroupSelector(!showMuscleGroupSelector);
              setShowExerciseSelector(false);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.selectorText}>
              {selectedMuscleGroup || 'Tous les groupes'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>

          {showMuscleGroupSelector && (
            <BlurView intensity={20} style={styles.selectorList}>
              <TouchableOpacity
                style={styles.selectorItem}
                onPress={() => {
                  setSelectedMuscleGroup(null);
                  setShowMuscleGroupSelector(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.selectorItemText}>Tous les groupes</Text>
              </TouchableOpacity>
              {Array.from(new Set(workouts.map(w => w.muscleGroup))).map((group) => (
                <TouchableOpacity
                  key={group}
                  style={styles.selectorItem}
                  onPress={() => {
                    setSelectedMuscleGroup(group);
                    setShowMuscleGroupSelector(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.selectorItemText}>{group}</Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          )}
        </View>
      </Animated.View>

      <View style={styles.content}>
        {/* Section Motivation avec animation */}
        <Animated.View 
          style={[
            styles.motivationCard,
            { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#fd8f09', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.motivationGradient}
          >
            <Text style={styles.motivationText}>
              {bestProgressExercise 
                ? `💪 Tu as progressé de ${bestProgressExercise.progress}% sur ${bestProgressExercise.exercise} !`
                : monthlyProgress > 0 
                  ? `💪 Tu as progressé de ${monthlyProgress}% ce mois-ci !`
                  : '💪 Continue tes efforts, la progression viendra !'}
            </Text>
            <View style={styles.motivationStats}>
              <View style={styles.motivationStat}>
                <Text style={styles.motivationStatValue}>{trainingFrequency}%</Text>
                <Text style={styles.motivationStatLabel}>Assiduité</Text>
              </View>
              <View style={styles.motivationStat}>
                <Text style={styles.motivationStatValue}>{totalSets}</Text>
                <Text style={styles.motivationStatLabel}>Séries</Text>
              </View>
              <View style={styles.motivationStat}>
                <Text style={styles.motivationStatValue}>{totalWorkouts}</Text>
                <Text style={styles.motivationStatLabel}>Séances</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Graphique de progression avec sélecteurs */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {selectedChartType === '1rm' && 'Progression du 1RM'}
              {selectedChartType === 'volume' && 'Volume par semaine'}
              {selectedChartType === 'reps' && 'Répétitions par séance'}
            </Text>
            <TouchableOpacity 
              style={styles.exerciseSelector}
              onPress={() => {
                setShowExerciseSelector(!showExerciseSelector);
                setShowMuscleGroupSelector(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.exerciseSelectorText}>
                {selectedExercise || 'Sélectionner un exercice'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Sélecteur de type de graphique */}
          <View style={styles.chartTypeSelector}>
            <TouchableOpacity
              style={[styles.chartTypeButton, selectedChartType === '1rm' && styles.chartTypeButtonActive]}
              onPress={() => {
                setSelectedChartType('1rm');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.chartTypeText, selectedChartType === '1rm' && styles.chartTypeTextActive]}>1RM</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chartTypeButton, selectedChartType === 'volume' && styles.chartTypeButtonActive]}
              onPress={() => {
                setSelectedChartType('volume');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.chartTypeText, selectedChartType === 'volume' && styles.chartTypeTextActive]}>Volume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chartTypeButton, selectedChartType === 'reps' && styles.chartTypeButtonActive]}
              onPress={() => {
                setSelectedChartType('reps');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.chartTypeText, selectedChartType === 'reps' && styles.chartTypeTextActive]}>Répétitions</Text>
            </TouchableOpacity>
          </View>

          {showExerciseSelector && (
            <BlurView intensity={20} style={styles.selectorList}>
              <TouchableOpacity
                style={styles.selectorItem}
                onPress={() => {
                  setSelectedExercise(null);
                  setShowExerciseSelector(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={styles.selectorItemText}>Tous les exercices</Text>
              </TouchableOpacity>
              {uniqueExercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise}
                  style={styles.selectorItem}
                  onPress={() => {
                    setSelectedExercise(exercise);
                    setShowExerciseSelector(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.selectorItemText}>{exercise}</Text>
                </TouchableOpacity>
              ))}
            </BlurView>
          )}

          {/* Graphique 1RM */}
          {selectedChartType === '1rm' && (
            <VictoryChart
              theme={VictoryTheme.material}
              width={Dimensions.get('window').width - 40}
              height={300}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              domainPadding={{ x: 20 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: '#666' },
                  tickLabels: { fill: '#fff', fontSize: 12 },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: '#666' },
                  tickLabels: { fill: '#fff', fontSize: 12 },
                }}
              />
              {selectedExercise && exerciseData[selectedExercise] && (
                <>
                  <VictoryLine
                    data={exerciseData[selectedExercise]}
                    style={{
                      data: { stroke: '#fd8f09', strokeWidth: 3 },
                    }}
                  />
                  <VictoryScatter
                    data={exerciseData[selectedExercise]}
                    size={5}
                    style={{
                      data: { fill: '#fd8f09' },
                    }}
                    labels={({ datum }) => `${datum.y}kg`}
                    labelComponent={
                      <VictoryTooltip
                        style={{ fill: '#fff' }}
                        flyoutStyle={{ fill: 'rgba(40, 40, 40, 0.9)', stroke: 'none' }}
                      />
                    }
                  />
                </>
              )}
            </VictoryChart>
          )}

          {/* Graphique Volume par semaine */}
          {selectedChartType === 'volume' && (
            <VictoryChart
              theme={VictoryTheme.material}
              width={Dimensions.get('window').width - 40}
              height={300}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              domainPadding={{ x: 20 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: '#666' },
                  tickLabels: { fill: '#fff', fontSize: 12 },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: '#666' },
                  tickLabels: { fill: '#fff', fontSize: 12 },
                }}
              />
              {volumeByWeekData['volume'] && (
                <VictoryBar
                  data={volumeByWeekData['volume']}
                  style={{
                    data: { 
                      fill: ({ datum }) => {
                        // Gradient effect based on value
                        const intensity = Math.min(1, datum.y / (Math.max(...volumeByWeekData['volume'].map(d => d.y)) * 0.8));
                        return `rgba(99, 102, 241, ${0.5 + intensity * 0.5})`;
                      },
                      width: 20
                    },
                  }}
                  labels={({ datum }) => `${Math.round(datum.y)}kg`}
                  labelComponent={
                    <VictoryTooltip
                      style={{ fill: '#fff' }}
                      flyoutStyle={{ fill: 'rgba(40, 40, 40, 0.9)', stroke: 'none' }}
                    />
                  }
                />
              )}
            </VictoryChart>
          )}

          {/* Graphique Répétitions */}
          {selectedChartType === 'reps' && (
            <VictoryChart
              theme={VictoryTheme.material}
              width={Dimensions.get('window').width - 40}
              height={300}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              domainPadding={{ x: 20 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: '#666' },
                  tickLabels: { fill: '#fff', fontSize: 12 },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: '#666' },
                  tickLabels: { fill: '#fff', fontSize: 12 },
                }}
              />
              {selectedExercise && repsByExerciseData[selectedExercise] && (
                <>
                  <VictoryLine
                    data={repsByExerciseData[selectedExercise]}
                    style={{
                      data: { stroke: '#4ade80', strokeWidth: 3 },
                    }}
                  />
                  <VictoryScatter
                    data={repsByExerciseData[selectedExercise]}
                    size={5}
                    style={{
                      data: { fill: '#4ade80' },
                    }}
                    labels={({ datum }) => `${datum.y} reps`}
                    labelComponent={
                      <VictoryTooltip
                        style={{ fill: '#fff' }}
                        flyoutStyle={{ fill: 'rgba(40, 40, 40, 0.9)', stroke: 'none' }}
                      />
                    }
                  />
                </>
              )}
            </VictoryChart>
          )}
        </View>

        {/* Objectifs et progression */}
        <Animated.View 
          style={[
            styles.chartContainer,
            { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
          ]}
        >
          <Text style={styles.chartTitle}>Objectifs</Text>

          {goals.map((goal, index) => (
            <View key={index} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.exercise}</Text>
                <Text style={styles.goalValues}>
                  <Text style={styles.goalCurrent}>{goal.current}kg</Text>
                  <Text style={styles.goalSeparator}> / </Text>
                  <Text style={styles.goalTarget}>{goal.target}kg</Text>
                </Text>
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
                  ? `Encore ${goal.target - goal.current}kg pour atteindre ton objectif`
                  : 'Objectif atteint ! 🎉'}
              </Text>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addGoalButton}
            onPress={() => {
              // Placeholder for adding a new goal
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
          >
            <Ionicons name="add-circle" size={20} color="#fd8f09" />
            <Text style={styles.addGoalText}>Ajouter un objectif</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Répartition des groupes musculaires avec animation */}
        <Animated.View 
          style={[
            styles.chartContainer,
            { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
          ]}
        >
          <Text style={styles.chartTitle}>Répartition des groupes musculaires</Text>
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
              labels: { fill: '#fff', fontSize: 12 },
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
          <Text style={styles.chartTitle}>État de repos des muscles</Text>
          <MuscleMap workouts={workouts} />
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#fd8f09',
  },
  filterText: {
    color: '#666',
    fontFamily: 'Inter-SemiBold',
  },
  filterTextActive: {
    color: '#fff',
  },
  muscleGroupSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectorText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginRight: 8,
  },
  selectorList: {
    position: 'absolute',
    top: 80,
    left: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 8,
    padding: 8,
    zIndex: 1000,
    maxHeight: 200,
  },
  selectorItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectorItemText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  motivationCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  motivationGradient: {
    padding: 20,
    borderRadius: 12,
  },
  motivationText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  motivationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  motivationStat: {
    alignItems: 'center',
  },
  motivationStatValue: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  motivationStatLabel: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    opacity: 0.8,
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 10,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 4,
  },
  chartTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  chartTypeButtonActive: {
    backgroundColor: '#fd8f09',
  },
  chartTypeText: {
    color: '#666',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  chartTypeTextActive: {
    color: '#fff',
  },
  exerciseSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exerciseSelectorText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginRight: 4,
  },
  goalItem: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  goalValues: {
    fontSize: 14,
  },
  goalCurrent: {
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  goalSeparator: {
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  goalTarget: {
    color: '#fd8f09',
    fontFamily: 'Inter-Bold',
  },
  goalProgressContainer: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  goalProgressLow: {
    backgroundColor: '#f87171',
  },
  goalProgressMedium: {
    backgroundColor: '#fbbf24',
  },
  goalProgressHigh: {
    backgroundColor: '#4ade80',
  },
  goalProgressText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  addGoalText: {
    color: '#fd8f09',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  statGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
  },
});
