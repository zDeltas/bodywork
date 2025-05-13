import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useTranslation } from '@/app/hooks/useTranslation';
import { router } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import KpiMotivation from '@/app/components/stats/KpiMotivation';
import { Workout } from '@/app/types/common';
import StatsExerciseList from '@/app/components/stats/StatsExerciseList';
import StatsGoals from '@/app/components/stats/StatsGoals';
import StatsMuscleDistribution from '@/app/components/stats/StatsMuscleDistribution';
import MuscleRestState from '@/app/components/muscles/MuscleRestState';
import Header from '@/app/components/layout/Header';
import useStats from '@/app/hooks/useStats';
import useGoals from '@/app/hooks/useGoals';
import useExercises from '@/app/hooks/useExercises';
import { ChartSkeleton } from '@/app/components/ui/SkeletonComponents';

type Period = '1m' | '3m' | '6m';

export default function StatsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('1m');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Fonts
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  });

  // Refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const graphsSectionRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Hooks
  const statsData = useStats(selectedPeriod);
  const { goals, setGoals, getCurrentWeight } = useGoals(statsData.workouts);
  const { loading: exercisesLoading } = useExercises();

  // Effects
  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }).start();
    }
  }, [fontsLoaded]);

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
          exerciseOptions={[]}
          onExerciseSelect={(exercise, exerciseKey) => {
            router.push({
              pathname: '/screens/ExerciseDetails',
              params: { exercise: exerciseKey }
            });
          }}
          onMuscleSelect={handleMuscleSelect}
        />

        <View ref={graphsSectionRef}>
          <StatsGoals
            fadeAnim={fadeAnim}
          />

          {exercisesLoading ? (
            <ChartSkeleton />
          ) : (
            <>
              <StatsMuscleDistribution
                fadeAnim={fadeAnim}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                graphsSectionRef={graphsSectionRef as React.RefObject<View>}
                muscleGroups={statsData.muscleDistribution}
              />
              <MuscleRestState
                fadeAnim={fadeAnim}
                workouts={statsData.workouts}
              />
            </>
          )}
        </View>
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
    }
  });
};
