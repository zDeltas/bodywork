import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/app/hooks/useTranslation';
import { router } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import KpiMotivation from '@/app/components/stats/KpiMotivation';
import { Workout } from '@/types/common';
import StatsGoals from '@/app/components/stats/StatsGoals';
import StatsMuscleDistribution from '@/app/components/stats/StatsMuscleDistribution';
import MuscleRestState from '@/app/components/muscles/MuscleRestState';
import Header from '@/app/components/layout/Header';
import useStats from '@/app/hooks/useStats';
import useGoals from '@/app/hooks/useGoals';
import useExercises from '@/app/hooks/useExercises';
import { ChartSkeleton } from '@/app/components/ui/SkeletonComponents';
import ExerciseSearchModal from '@/app/components/stats/ExerciseSearchModal';
import { Search } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';

type Period = '7d' | '14d' | '1m' | '3m';

export default function StatsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');
  const [showExerciseModal, setShowExerciseModal] = useState(false);


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
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);


  const handleOpenExerciseModal = useCallback(() => {
    setShowExerciseModal(true);
  }, []);

  const handleCloseExerciseModal = useCallback(() => {
    setShowExerciseModal(false);
  }, []);

  const handleExerciseSelect = useCallback((exercise: any) => {
    setShowExerciseModal(false);
    router.push({
      pathname: '/screens/ExerciseDetails',
      params: { exercise: exercise.key }
    });
  }, [router]);


  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('stats.title')} showBackButton={true} onBack={() => router.back()} />
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
          totalSets={statsData.workouts.reduce(
            (total: number, workout: Workout) => total + workout.series.length,
            0
          )}
          totalWorkouts={statsData.workouts.length}
        />

        <View style={styles.exerciseSearchSection}>
          <TouchableOpacity
            style={styles.exerciseSearchButton}
            onPress={handleOpenExerciseModal}
            activeOpacity={0.7}
          >
            <Search color={theme.colors.primary} size={24} />
            <Text variant="body" style={styles.exerciseSearchText}>
              {t('stats.searchByExercise')}
            </Text>
          </TouchableOpacity>
        </View>

        <View ref={graphsSectionRef}>
          <StatsGoals fadeAnim={fadeAnim} />

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
              <MuscleRestState fadeAnim={fadeAnim} workouts={statsData.workouts} />
            </>
          )}
        </View>
      </ScrollView>

      <ExerciseSearchModal
        visible={showExerciseModal}
        onClose={handleCloseExerciseModal}
        onExerciseSelect={handleExerciseSelect}
      />
    </SafeAreaView>
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
    exerciseSearchSection: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md
    },
    exerciseSearchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.card,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    },
    exerciseSearchText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginLeft: theme.spacing.md,
      fontSize: theme.typography.fontSize.lg
    }
  });
};
