import { View, StyleSheet, Text } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCallback, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import MuscleMap from '@/app/components/MuscleMap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';

SplashScreen.preventAutoHideAsync();

interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
}

export default function MuscleMapScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const params = useLocalSearchParams();
  const selectedDate = params.selectedDate as string || new Date().toISOString().split('T')[0];

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          const allWorkouts = JSON.parse(storedWorkouts);
          const filteredWorkouts = allWorkouts.filter((workout: Workout) =>
            new Date(workout.date).toISOString().split('T')[0] === selectedDate
          );
          setWorkouts(filteredWorkouts);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des séances:', error);
      }
    };

    loadWorkouts();
  }, [selectedDate]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>Muscle Map</Text>
      </View>

      <View style={styles.content}>
        <MuscleMap workouts={workouts} />

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Intensité des muscles travaillés</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#6366f1' }]} />
              <Text style={styles.legendText}>Intense</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#818cf8' }]} />
              <Text style={styles.legendText}>Modéré</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#c7d2fe' }]} />
              <Text style={styles.legendText}>Léger</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
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
  },
  content: {
    flex: 1,
    padding: 20,
  },
  legend: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  legendTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
});
