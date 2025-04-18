import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { Plus } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
  rpe?: number; // Rate of Perceived Exertion (optional for backward compatibility)
}

export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
    const saveWorkouts = async () => {
      try {
        await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des séances:', error);
      }
    };

    saveWorkouts();
  }, [workouts]);

  const markedDates = workouts.reduce((acc, workout) => {
    const date = new Date(workout.date).toISOString().split('T')[0];
    acc[date] = { marked: true, dotColor: '#6366f1' };
    if (date === selectedDate) {
      acc[date].selected = true;
    }
    return acc;
  }, {} as { [key: string]: { marked?: boolean; dotColor?: string; selected?: boolean } });

  // Ajouter la date d'aujourd'hui si elle n'est pas déjà marquée
  const today = new Date().toISOString().split('T')[0];
  if (!markedDates[today]) {
    markedDates[today] = { dotColor: '#6366f1' };
  }
  if (today === selectedDate) {
    markedDates[today].selected = true;
  } else {
    markedDates[today].marked = true;
  }

  // Assurez-vous que la date sélectionnée est toujours marquée comme selected
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = { selected: true };
  }

  const selectedDateWorkouts = workouts.filter(workout =>
    new Date(workout.date).toISOString().split('T')[0] === selectedDate
  );

  if (!fontsLoaded) {
    return null;
  }

  // Formater la date pour affichage
  const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push({
            pathname: '/workout/new',
            params: { selectedDate }
          })}
        >
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.calendarSection}>
          <View style={styles.calendarContainer}>
            <Calendar
              theme={{
                backgroundColor: '#1a1a1a',
                calendarBackground: '#1a1a1a',
                textSectionTitleColor: '#9ca3af',
                textSectionTitleDisabledColor: '#4b5563',
                selectedDayBackgroundColor: '#6366f1',
                selectedDayTextColor: '#fff',
                todayTextColor: '#6366f1',
                dayTextColor: '#fff',
                textDisabledColor: '#444',
                dotColor: '#6366f1',
                selectedDotColor: '#fff',
                arrowColor: '#6366f1',
                monthTextColor: '#fff',
                indicatorColor: '#6366f1',
                textDayFontFamily: 'Inter-Regular',
                textMonthFontFamily: 'Inter-SemiBold',
                textDayHeaderFontFamily: 'Inter-Regular',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
              markedDates={markedDates}
              onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
              enableSwipeMonths={true}
              hideExtraDays={false}
              showWeekNumbers={false}
              disableArrowLeft={false}
              disableArrowRight={false}
            />
          </View>
        </View>

        <View style={styles.dateHeader}>
          <Text style={styles.dateHeaderText}>{capitalizedDate}</Text>
        </View>

        {selectedDateWorkouts.length === 0 ? (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.emptyState}
          >
            <Text style={styles.emptyStateText}>Aucune séance enregistrée ce jour</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push({
                pathname: '/workout/new',
                params: { selectedDate }
              })}
            >
              <Text style={styles.startButtonText}>Commencer une séance</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.workoutsContainer}>
            {selectedDateWorkouts.map((workout) => (
              <Animated.View
                key={workout.id}
                style={styles.workoutCard}
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
              >
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutTitle}>{workout.exercise}</Text>
                  <Text style={styles.workoutDate}>
                    {new Date(workout.date).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.workoutMuscle}>{workout.muscleGroup}</Text>
                <View style={styles.workoutDetails}>
                  <Text style={styles.workoutDetail}>Poids: {workout.weight}kg</Text>
                  <Text style={styles.workoutDetail}>Répétitions: {workout.reps}</Text>
                  <Text style={styles.workoutDetail}>Séries: {workout.sets}</Text>
                  {workout.rpe && workout.rpe > 0 && (
                    <Text style={styles.workoutDetail}>RPE: {workout.rpe}</Text>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
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
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
    padding: 20
  },
  calendarSection: {
    marginBottom: 16,
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 16,
    marginTop: 8,
  },
  dateHeaderText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  workoutsContainer: {
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
    borderRadius: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
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
