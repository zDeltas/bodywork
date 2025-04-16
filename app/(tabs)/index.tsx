import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Plus } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

interface Workout {
  id: string;
  muscleGroup: string;
  exercise: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
}

export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const params = useLocalSearchParams();
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

  const loadWorkouts = async () => {
    try {
      const savedWorkouts = await AsyncStorage.getItem('workouts');
      if (savedWorkouts) {
        setWorkouts(JSON.parse(savedWorkouts));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des workouts:', error);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, [params.refresh]);

  if (!fontsLoaded) {
    return null;
  }

  const today = new Date().toLocaleDateString();
  const todayWorkouts = workouts.filter(workout =>
    new Date(workout.date).toLocaleDateString() === today
  );

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/workout/new')}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Today's Workout</Text>
        {todayWorkouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No workouts recorded today</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push('/workout/new')}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          todayWorkouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutTitle}>{workout.exercise}</Text>
                <Text style={styles.workoutDate}>
                  {new Date(workout.date).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.workoutMuscle}>{workout.muscleGroup}</Text>
              <View style={styles.workoutDetails}>
                <Text style={styles.workoutDetail}>Weight: {workout.weight}kg</Text>
                <Text style={styles.workoutDetail}>Reps: {workout.reps}</Text>
                <Text style={styles.workoutDetail}>Sets: {workout.sets}</Text>
              </View>
            </View>
          ))
        )}

        {workouts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>All Workouts</Text>
            {workouts.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutTitle}>{workout.exercise}</Text>
                  <Text style={styles.workoutDate}>
                    {new Date(workout.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.workoutMuscle}>{workout.muscleGroup}</Text>
                <View style={styles.workoutDetails}>
                  <Text style={styles.workoutDetail}>Weight: {workout.weight}kg</Text>
                  <Text style={styles.workoutDetail}>Reps: {workout.reps}</Text>
                  <Text style={styles.workoutDetail}>Sets: {workout.sets}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a'
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a'
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff'
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1,
    padding: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 24
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center'
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16
  },
  startButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  startButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  workoutTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff'
  },
  workoutDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666'
  },
  workoutMuscle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6366f1',
    marginBottom: 12
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  workoutDetail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#fff'
  }
});
