import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter, VictoryTheme, VictoryTooltip } from 'victory-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { Workout, WorkoutDateUtils } from '@/app/types/workout';
import Header from '@/app/components/Header';
import Text from '@/app/components/ui/Text';

interface ExerciseData {
  x: Date;
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
      backgroundColor: theme.colors.background.main
    },
    header: {
      paddingTop: theme.spacing.xl * 2,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      backgroundColor: theme.colors.background.card,
      flexDirection: 'row',
      alignItems: 'center'
    },
    backButton: {
      marginRight: theme.spacing.base
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg
    },
    filterSection: {
      marginBottom: theme.spacing.base
    },
    filterLabel: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: theme.spacing.xs
    },
    filterButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      marginRight: theme.spacing.sm
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary
    },
    filterText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    filterTextActive: {
      color: theme.colors.text.primary
    },
    chartTypeSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: theme.spacing.base,
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.full,
      padding: theme.spacing.xs
    },
    chartTypeButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full
    },
    chartTypeButtonActive: {
      backgroundColor: theme.colors.primary
    },
    chartTypeText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm
    },
    chartTypeTextActive: {
      color: theme.colors.text.primary
    },
    chartContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.lg
    },
    addButton: {
      marginLeft: 'auto',
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center'
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginHorizontal: theme.spacing.xs,
      alignItems: 'center'
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs
    },
    statValue: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    chartTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.base
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg
    },
    noDataText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text.secondary,
      textAlign: 'center'
    }
  });
};

const ExerciseDetails = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const { exercise } = useLocalSearchParams<{ exercise: string }>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m'>('1m');
  const [selectedChartType, setSelectedChartType] = useState<'1rm' | 'volume' | 'reps'>('1rm');
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
  const [volumeData, setVolumeData] = useState<ExerciseData[]>([]);
  const [repsData, setRepsData] = useState<ExerciseData[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          const parsedWorkouts = JSON.parse(storedWorkouts) as Workout[];
          const filteredWorkouts = parsedWorkouts.filter(w => w.exercise === exercise);
          setWorkouts(filteredWorkouts);

          // Prepare chart data
          const oneRMData: ExerciseData[] = [];
          const volumeData: ExerciseData[] = [];
          const repsData: ExerciseData[] = [];

          // Sort workouts by date
          const sortedWorkouts = [...filteredWorkouts].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          sortedWorkouts.forEach(workout => {
            if (workout.series && workout.series.length > 0) {
              const workingSet = workout.series.find(s => s.type === 'workingSet') || workout.series[0];
              if (workingSet) {
                const date = new Date(workout.date);
                const estimated1RM = calculateEstimated1RM(workingSet.weight, workingSet.reps);
                const volume = calculateVolume(workingSet.weight, workingSet.reps, workout.series.length);

                oneRMData.push({ x: date, y: estimated1RM });
                volumeData.push({ x: date, y: volume });
                repsData.push({ x: date, y: workingSet.reps });
              }
            }
          });

          console.log('Exercise Data:', oneRMData);
          console.log('Volume Data:', volumeData);
          console.log('Reps Data:', repsData);

          setExerciseData(oneRMData);
          setVolumeData(volumeData);
          setRepsData(repsData);
        }
      } catch (error) {
        console.error('Error loading workouts:', error);
      }
    };

    loadWorkouts();
  }, [exercise]);

  // Get the first working set or the first series if no working set
  const latestWorkout = workouts[workouts.length - 1];
  const workingSet = latestWorkout?.series?.find(s => s.type === 'workingSet') || latestWorkout?.series?.[0];

  const estimated1RM = workingSet ? calculateEstimated1RM(workingSet.weight, workingSet.reps) : 0;
  const volume = workingSet && latestWorkout ? calculateVolume(workingSet.weight, workingSet.reps, latestWorkout.series.length) : 0;

  // Fonction pour obtenir le domaine Y approprié
  const getDomainY = (data: ExerciseData[]) => {
    if (data.length === 0) return { y: [0, 100] as [number, number] };

    const values = data.map(item => item.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // 10% padding

    return {
      y: [
        Math.max(0, Math.floor(min - padding)),
        Math.ceil(max + padding)
      ] as [number, number]
    };
  };

  // Format date for display in chart tooltip
  const formatTooltip = (datum: any) => {
    const date = new Date(datum.x);
    const formattedDate = format(date, 'dd/MM/yy', { locale: fr });
    return `${formattedDate}: ${datum.y}`;
  };

  // Fonction pour obtenir les données filtrées selon la période
  const getFilteredData = (data: ExerciseData[]) => {
    const now = new Date();
    const periodInMonths = parseInt(selectedPeriod);
    const cutoffDate = new Date(now.setMonth(now.getMonth() - periodInMonths));

    return data.filter(item => {
      const itemDate = new Date(item.x);
      return itemDate >= cutoffDate;
    });
  };

  // Fonction pour obtenir le format de date approprié selon la période
  const getDateFormat = () => {
    switch (selectedPeriod) {
      case '1m':
        return 'dd MMM';
      case '3m':
        return 'dd MMM';
      case '6m':
        return 'MMM yyyy';
      default:
        return 'dd MMM';
    }
  };

  // Fonction pour obtenir le nombre de ticks approprié selon la période
  const getTickCount = () => {
    switch (selectedPeriod) {
      case '1m':
        return 4;
      case '3m':
        return 6;
      case '6m':
        return 6;
      default:
        return 4;
    }
  };

  // Format date for display on X axis
  const formatDateForDisplay = (date: Date) => {
    return format(date, getDateFormat(), { locale: fr });
  };

  // Obtenir les données filtrées
  const filteredExerciseData = getFilteredData(exerciseData);
  const filteredVolumeData = getFilteredData(volumeData);
  const filteredRepsData = getFilteredData(repsData);

  console.log('Filtered Exercise Data:', filteredExerciseData);
  console.log('Filtered Volume Data:', filteredVolumeData);
  console.log('Filtered Reps Data:', filteredRepsData);

  // Obtenir les domaines Y
  const domainY1RM = getDomainY(filteredExerciseData);
  const domainYVolume = getDomainY(filteredVolumeData);
  const domainYReps = getDomainY(filteredRepsData);

  console.log('Domain Y 1RM:', domainY1RM);
  console.log('Domain Y Volume:', domainYVolume);
  console.log('Domain Y Reps:', domainYReps);

  // Obtenir la couleur appropriée pour le graphique
  const getChartColor = () => {
    switch (selectedChartType) {
      case '1rm':
        return theme.colors.primary;
      case 'volume':
        return theme.colors.info;
      case 'reps':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  // Fonction pour obtenir le titre du graphique
  const getChartTitle = () => {
    switch (selectedChartType) {
      case '1rm':
        return t('stats.oneRM');
      case 'volume':
        return t('stats.volumePerWeek');
      case 'reps':
        return t('stats.repsPerSession');
      default:
        return '';
    }
  };

  // Fonction pour obtenir l'unité de l'axe Y
  const getYAxisLabel = () => {
    switch (selectedChartType) {
      case '1rm':
        return 'kg';
      case 'volume':
        return 'kg';
      case 'reps':
        return t('stats.repetitions');
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={exercise}
        showBackButton={true}
      />

      <ScrollView style={styles.content}>
        {/* Statistiques principales */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('exerciseDetails.estimated_1rm')}</Text>
            <Text style={styles.statValue}>{estimated1RM} kg</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('stats.volume')}</Text>
            <Text style={styles.statValue}>{volume} kg</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('stats.repetitions')}</Text>
            <Text style={styles.statValue}>{workingSet?.reps || 0}</Text>
          </View>
        </View>

        {/* Filtres de période */}
        <View style={styles.filterSection}>
          <Text variant="subheading" style={styles.filterLabel}>{t('stats.period')}</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, selectedPeriod === '1m' && styles.filterButtonActive]}
              onPress={() => setSelectedPeriod('1m')}
            >
              <Text
                style={[styles.filterText, selectedPeriod === '1m' && styles.filterTextActive]}>{t('periods.oneMonth')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedPeriod === '3m' && styles.filterButtonActive]}
              onPress={() => setSelectedPeriod('3m')}
            >
              <Text
                style={[styles.filterText, selectedPeriod === '3m' && styles.filterTextActive]}>{t('periods.threeMonths')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedPeriod === '6m' && styles.filterButtonActive]}
              onPress={() => setSelectedPeriod('6m')}
            >
              <Text
                style={[styles.filterText, selectedPeriod === '6m' && styles.filterTextActive]}>{t('periods.sixMonths')}</Text>
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
            <Text
              style={[styles.chartTypeText, selectedChartType === 'volume' && styles.chartTypeTextActive]}>{t('stats.volume')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTypeButton, selectedChartType === 'reps' && styles.chartTypeButtonActive]}
            onPress={() => setSelectedChartType('reps')}
          >
            <Text
              style={[styles.chartTypeText, selectedChartType === 'reps' && styles.chartTypeTextActive]}>{t('stats.repetitions')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{getChartTitle()}</Text>

          {selectedChartType === '1rm' && filteredExerciseData.length > 0 && (
            <VictoryChart
              theme={VictoryTheme.material}
              width={Dimensions.get('window').width - 40}
              height={300}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              domainPadding={{ x: 20 }}
              domain={domainY1RM}
              scale={{ x: 'time' }}
            >
              <VictoryAxis
                label={t('common.date')}
                tickFormat={(date: number | Date) => formatDateForDisplay(new Date(date))}
                tickCount={getTickCount()}
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    angle: -45,
                    textAnchor: 'end'
                  },
                  axisLabel: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    padding: 30
                  }
                }}
              />
              <VictoryAxis
                dependentAxis
                label={getYAxisLabel()}
                tickCount={5}
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm
                  },
                  axisLabel: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    padding: 30
                  }
                }}
              />
              <VictoryLine
                data={filteredExerciseData}
                style={{
                  data: {
                    stroke: getChartColor(),
                    strokeWidth: 3
                  }
                }}
              />
              <VictoryScatter
                data={filteredExerciseData}
                size={5}
                style={{
                  data: { fill: getChartColor() }
                }}
                labels={formatTooltip}
                labelComponent={
                  <VictoryTooltip
                    style={{
                      fill: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.sm
                    }}
                    flyoutStyle={{
                      fill: theme.colors.background.card,
                      stroke: theme.colors.border.default,
                      strokeWidth: 1
                    }}
                    cornerRadius={theme.borderRadius.sm}
                    pointerLength={5}
                  />
                }
              />
            </VictoryChart>
          )}

          {selectedChartType === 'volume' && filteredVolumeData.length > 0 && (
            <VictoryChart
              theme={VictoryTheme.material}
              width={Dimensions.get('window').width - 40}
              height={300}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              domainPadding={{ x: 20 }}
              domain={domainYVolume}
              scale={{ x: 'time' }}
            >
              <VictoryAxis
                label={t('common.date')}
                tickFormat={(date: number | Date) => formatDateForDisplay(new Date(date))}
                tickCount={getTickCount()}
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    angle: -45,
                    textAnchor: 'end'
                  },
                  axisLabel: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    padding: 30
                  }
                }}
              />
              <VictoryAxis
                dependentAxis
                label={getYAxisLabel()}
                tickCount={5}
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm
                  },
                  axisLabel: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    padding: 30
                  }
                }}
              />
              <VictoryLine
                data={filteredVolumeData}
                style={{
                  data: {
                    stroke: getChartColor(),
                    strokeWidth: 3
                  }
                }}
              />
              <VictoryScatter
                data={filteredVolumeData}
                size={5}
                style={{
                  data: { fill: getChartColor() }
                }}
                labels={formatTooltip}
                labelComponent={
                  <VictoryTooltip
                    style={{
                      fill: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.sm
                    }}
                    flyoutStyle={{
                      fill: theme.colors.background.card,
                      stroke: theme.colors.border.default,
                      strokeWidth: 1
                    }}
                    cornerRadius={theme.borderRadius.sm}
                    pointerLength={5}
                  />
                }
              />
            </VictoryChart>
          )}

          {selectedChartType === 'reps' && filteredRepsData.length > 0 && (
            <VictoryChart
              theme={VictoryTheme.material}
              width={Dimensions.get('window').width - 40}
              height={300}
              padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
              domainPadding={{ x: 20 }}
              domain={domainYReps}
              scale={{ x: 'time' }}
            >
              <VictoryAxis
                label={t('common.date')}
                tickFormat={(date: number | Date) => formatDateForDisplay(new Date(date))}
                tickCount={getTickCount()}
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    angle: -45,
                    textAnchor: 'end'
                  },
                  axisLabel: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    padding: 30
                  }
                }}
              />
              <VictoryAxis
                dependentAxis
                label={getYAxisLabel()}
                tickCount={5}
                style={{
                  axis: { stroke: theme.colors.border.default },
                  tickLabels: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm
                  },
                  axisLabel: {
                    fill: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    padding: 30
                  }
                }}
              />
              <VictoryLine
                data={filteredRepsData}
                style={{
                  data: {
                    stroke: getChartColor(),
                    strokeWidth: 3
                  }
                }}
              />
              <VictoryScatter
                data={filteredRepsData}
                size={5}
                style={{
                  data: { fill: getChartColor() }
                }}
                labels={formatTooltip}
                labelComponent={
                  <VictoryTooltip
                    style={{
                      fill: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.sm
                    }}
                    flyoutStyle={{
                      fill: theme.colors.background.card,
                      stroke: theme.colors.border.default,
                      strokeWidth: 1
                    }}
                    cornerRadius={theme.borderRadius.sm}
                    pointerLength={5}
                  />
                }
              />
            </VictoryChart>
          )}

          {(!filteredExerciseData.length && !filteredVolumeData.length && !filteredRepsData.length) && (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>{t('common.noDataAvailable')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ExerciseDetails;
