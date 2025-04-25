import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTranslation } from '@/hooks/useTranslation';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

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
    acc[date] = { marked: true, dotColor: colors.primary };
    if (date === selectedDate) {
      acc[date].selected = true;
    }
    return acc;
  }, {} as { [key: string]: { marked?: boolean; dotColor?: string; selected?: boolean } });

  // Ajouter la date d'aujourd'hui si elle n'est pas déjà marquée
  const today = new Date().toISOString().split('T')[0];
  if (!markedDates[today]) {
    markedDates[today] = { dotColor: colors.primary };
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('appTitle')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.calendarSection}>
          <View style={styles.calendarContainer}>
            <Calendar
              theme={{
                backgroundColor: colors.background.card,
                calendarBackground: colors.background.card,
                textSectionTitleColor: colors.text.secondary,
                textSectionTitleDisabledColor: colors.border.default,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.text.primary,
                todayTextColor: colors.primary,
                dayTextColor: colors.text.primary,
                textDisabledColor: colors.text.disabled,
                dotColor: colors.primary,
                selectedDotColor: colors.text.primary,
                arrowColor: colors.primary,
                monthTextColor: colors.text.primary,
                indicatorColor: colors.primary,
                textDayFontFamily: typography.fontFamily.regular,
                textMonthFontFamily: typography.fontFamily.semiBold,
                textDayHeaderFontFamily: typography.fontFamily.regular,
                textDayFontSize: typography.fontSize.base,
                textMonthFontSize: typography.fontSize.lg,
                textDayHeaderFontSize: typography.fontSize.md
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
    backgroundColor: colors.background.main
  },
  header: {
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary
  },
  content: {
    flex: 1,
    padding: spacing.lg
  },
  calendarSection: {
    marginBottom: spacing.base
  },
  calendarContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    ...theme.shadows.md
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.base,
    marginTop: spacing.sm
  },
  dateHeaderText: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary
  },
  workoutsContainer: {
    marginTop: spacing.sm
  },
  emptyState: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...theme.shadows.sm
  },
  emptyStateText: {
    fontFamily: typography.fontFamily.regular,
    color: colors.text.disabled,
    marginBottom: spacing.base
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
    ...theme.shadows.primary
  },
  startButtonText: {
    color: colors.text.primary,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.base
  },
  workoutCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...theme.shadows.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  workoutTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary
  },
  workoutDate: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.disabled
  },
  workoutMuscle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.primary,
    marginBottom: spacing.md
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  workoutDetail: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary
  }
});
