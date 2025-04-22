import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from '@/hooks/useTranslation';

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

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: 'Aujourd\'hui'
};

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'],
  today: 'Today'
};


export default function WorkoutScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { t, language } = useTranslation();
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
        console.error(`${t('errorLoadingWorkouts')}`, error);
      }
    };

    loadWorkouts();
  }, []);

  useEffect(() => {
    const saveWorkouts = async () => {
      try {
        await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
      } catch (error) {
        console.error(`${t('errorSavingWorkouts')}`, error);
      }
    };

    saveWorkouts();
  }, [workouts]);

  const markedDates = workouts.reduce((acc, workout) => {
    const date = new Date(workout.date).toISOString().split('T')[0];
    acc[date] = { marked: true, dotColor: '#fd8f09' };
    if (date === selectedDate) {
      acc[date].selected = true;
    }
    return acc;
  }, {} as { [key: string]: { marked?: boolean; dotColor?: string; selected?: boolean } });

  // Ajouter la date d'aujourd'hui si elle n'est pas déjà marquée
  const today = new Date().toISOString().split('T')[0];
  if (!markedDates[today]) {
    markedDates[today] = { dotColor: '#fd8f09' };
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
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  LocaleConfig.defaultLocale = language;

  const formattedDate = new Date(selectedDate).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('appTitle')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.calendarSection}>
          <View style={styles.calendarContainer}>
            <Calendar
              theme={{
                backgroundColor: '#1a1a1a',
                calendarBackground: '#1a1a1a',
                textSectionTitleColor: '#9ca3af',
                textSectionTitleDisabledColor: '#4b5563',
                selectedDayBackgroundColor: '#fd8f09',
                selectedDayTextColor: '#fff',
                todayTextColor: '#fd8f09',
                dayTextColor: '#fff',
                textDisabledColor: '#444',
                dotColor: '#fd8f09',
                selectedDotColor: '#fff',
                arrowColor: '#fd8f09',
                monthTextColor: '#fff',
                indicatorColor: '#fd8f09',
                textDayFontFamily: 'Inter-Regular',
                textMonthFontFamily: 'Inter-SemiBold',
                textDayHeaderFontFamily: 'Inter-Regular',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
              markedDates={markedDates}
              onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
              enableSwipeMonths={true}
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
            <Text style={styles.emptyStateText}>{t('noWorkoutsToday')}</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push({
                pathname: '/workout/new',
                params: { selectedDate }
              })}
            >
              <Text style={styles.startButtonText}>{t('startWorkout')}</Text>
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
                    {new Date(workout.date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.workoutMuscle}>{workout.muscleGroup}</Text>
                <View style={styles.workoutDetails}>
                  <Text style={styles.workoutDetail}>{t('weight')}: {workout.weight}kg</Text>
                  <Text style={styles.workoutDetail}>{t('reps')}: {workout.reps}</Text>
                  <Text style={styles.workoutDetail}>{t('sets')}: {workout.sets}</Text>
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
  content: {
    flex: 1,
    padding: 20
  },
  calendarSection: {
    marginBottom: 16
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 16,
    marginTop: 8
  },
  dateHeaderText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff'
  },
  workoutsContainer: {
    marginTop: 8
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
    elevation: 3
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 16
  },
  startButton: {
    backgroundColor: '#fd8f09',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#fd8f09',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3
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
    borderLeftColor: '#fd8f09'
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
    color: '#fd8f09',
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
