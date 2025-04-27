import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryScatter, VictoryTooltip } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

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

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main,
    },
    header: {
      paddingTop: theme.spacing.xl * 2,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background.card,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: theme.spacing.base,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    filterSection: {
      marginBottom: theme.spacing.base,
    },
    filterLabel: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: theme.spacing.xs,
    },
    filterButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      marginRight: theme.spacing.sm,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    filterText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    filterTextActive: {
      color: theme.colors.text.primary,
    },
    chartTypeSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: theme.spacing.base,
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.full,
      padding: theme.spacing.xs,
    },
    chartTypeButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
    },
    chartTypeButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    chartTypeText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
    },
    chartTypeTextActive: {
      color: theme.colors.text.primary,
    },
    chartContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
  });
};

export default function ExerciseDetailsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams();
  const exerciseName = params.exercise as string;
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('1m');
  const [selectedChartType, setSelectedChartType] = useState<'1rm' | 'volume' | 'reps'>('1rm');

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

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }] }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
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
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: { fill: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: { fill: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm },
                }}
              />
              {exerciseData.length > 0 && (
                <>
                  <VictoryLine
                    data={exerciseData}
                    style={{
                      data: { stroke: theme.colors.primary, strokeWidth: 3 },
                    }}
                  />
                  <VictoryScatter
                    data={exerciseData}
                    size={5}
                    style={{
                      data: { fill: theme.colors.primary },
                    }}
                    labels={({ datum }) => `${datum.y}kg`}
                    labelComponent={
                      <VictoryTooltip
                        style={{ fill: theme.colors.text.primary }}
                        flyoutStyle={{ fill: theme.colors.background.card, stroke: 'none' }}
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
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: { fill: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: { fill: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm },
                }}
              />
              {volumeData.length > 0 && (
                <>
                  <VictoryLine
                    data={volumeData}
                    style={{
                      data: { stroke: theme.colors.info, strokeWidth: 3 },
                    }}
                  />
                  <VictoryScatter
                    data={volumeData}
                    size={5}
                    style={{
                      data: { fill: theme.colors.info },
                    }}
                    labels={({ datum }) => `${datum.y}kg`}
                    labelComponent={
                      <VictoryTooltip
                        style={{ fill: theme.colors.text.primary }}
                        flyoutStyle={{ fill: theme.colors.background.card, stroke: 'none' }}
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
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: { fill: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: { fill: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm },
                }}
              />
              {repsData.length > 0 && (
                <>
                  <VictoryLine
                    data={repsData}
                    style={{
                      data: { stroke: theme.colors.success, strokeWidth: 3 },
                    }}
                  />
                  <VictoryScatter
                    data={repsData}
                    size={5}
                    style={{
                      data: { fill: theme.colors.success },
                    }}
                    labels={({ datum }) => `${datum.y} reps`}
                    labelComponent={
                      <VictoryTooltip
                        style={{ fill: theme.colors.text.primary }}
                        flyoutStyle={{ fill: theme.colors.background.card, stroke: 'none' }}
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
