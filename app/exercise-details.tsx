import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryScatter, VictoryTooltip } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';

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

// Fonction pour calculer le 1RM estimé avec la formule d'Epley
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

export default function ExerciseDetailsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const exerciseName = params.exercise as string;
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [selectedChartType, setSelectedChartType] = useState<'1rm' | 'volume' | 'reps'>('1rm');
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Load workouts from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load workouts
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          setWorkouts(JSON.parse(storedWorkouts));
        }
      } catch (error) {
        console.error(t('errorLoadingWorkouts'), error);
      }
    };

    loadData();
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
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3m':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6m':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    return workouts.filter(workout => 
      new Date(workout.date) >= startDate && workout.exercise === exerciseName
    );
  };

  // Calculer les données pour les graphiques
  const calculateChartData = () => {
    const filteredWorkouts = getFilteredWorkouts();
    
    const exerciseData: ExerciseData[] = [];
    const volumeData: ExerciseData[] = [];
    const repsData: ExerciseData[] = [];

    filteredWorkouts.forEach(workout => {
      // Données pour 1RM
      const estimated1RM = calculateEstimated1RM(workout.weight, workout.reps);
      exerciseData.push({
        x: formatDate(workout.date),
        y: estimated1RM
      });

      // Données de volume
      const volume = calculateVolume(workout.weight, workout.reps, workout.sets);
      volumeData.push({
        x: formatDate(workout.date),
        y: volume
      });

      // Données de répétitions
      repsData.push({
        x: formatDate(workout.date),
        y: workout.reps
      });
    });

    // Sort data by date
    exerciseData.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
    volumeData.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());
    repsData.sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

    return {
      exerciseData,
      volumeData,
      repsData
    };
  };

  const { exerciseData, volumeData, repsData } = calculateChartData();

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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{exerciseName}</Text>
      </Animated.View>

      <View style={styles.content}>
        {/* Filtres de période */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{t('period')}</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, selectedPeriod === '1m' && styles.filterButtonActive]}
              onPress={() => setSelectedPeriod('1m')}
            >
              <Text style={[styles.filterText, selectedPeriod === '1m' && styles.filterTextActive]}>1M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedPeriod === '3m' && styles.filterButtonActive]}
              onPress={() => setSelectedPeriod('3m')}
            >
              <Text style={[styles.filterText, selectedPeriod === '3m' && styles.filterTextActive]}>3M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, selectedPeriod === '6m' && styles.filterButtonActive]}
              onPress={() => setSelectedPeriod('6m')}
            >
              <Text style={[styles.filterText, selectedPeriod === '6m' && styles.filterTextActive]}>6M</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sélecteur de type de graphique */}
        <View style={styles.chartTypeSelector}>
          <TouchableOpacity
            style={[styles.chartTypeButton, selectedChartType === '1rm' && styles.chartTypeButtonActive]}
            onPress={() => setSelectedChartType('1rm')}
          >
            <Text style={[styles.chartTypeText, selectedChartType === '1rm' && styles.chartTypeTextActive]}>1RM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTypeButton, selectedChartType === 'volume' && styles.chartTypeButtonActive]}
            onPress={() => setSelectedChartType('volume')}
          >
            <Text style={[styles.chartTypeText, selectedChartType === 'volume' && styles.chartTypeTextActive]}>{t('volume')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTypeButton, selectedChartType === 'reps' && styles.chartTypeButtonActive]}
            onPress={() => setSelectedChartType('reps')}
          >
            <Text style={[styles.chartTypeText, selectedChartType === 'reps' && styles.chartTypeTextActive]}>{t('repetitions')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
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
              {exerciseData.length > 0 && (
                <>
                  <VictoryLine
                    data={exerciseData}
                    style={{
                      data: { stroke: '#fd8f09', strokeWidth: 3 },
                    }}
                  />
                  <VictoryScatter
                    data={exerciseData}
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

          {/* Graphique Volume */}
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
              {volumeData.length > 0 && (
                <>
                  <VictoryLine
                    data={volumeData}
                    style={{
                      data: { stroke: '#6C63FF', strokeWidth: 3 },
                    }}
                  />
                  <VictoryScatter
                    data={volumeData}
                    size={5}
                    style={{
                      data: { fill: '#6C63FF' },
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
              {repsData.length > 0 && (
                <>
                  <VictoryLine
                    data={repsData}
                    style={{
                      data: { stroke: '#4ade80', strokeWidth: 3 },
                    }}
                  />
                  <VictoryScatter
                    data={repsData}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
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
  chartContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
});
