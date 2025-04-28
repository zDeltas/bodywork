import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
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
  const { theme } = useTheme();
  const styles = useStyles();

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
    acc[date] = { marked: true, dotColor: theme.colors.primary };
    if (date === selectedDate) {
      acc[date].selected = true;
    }
    return acc;
  }, {} as { [key: string]: { marked?: boolean; dotColor?: string; selected?: boolean } });

  // Ajouter la date d'aujourd'hui si elle n'est pas déjà marquée
  const today = new Date().toISOString().split('T')[0];
  if (!markedDates[today]) {
    markedDates[today] = { dotColor: theme.colors.primary };
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
              key={theme.colors.background.main}
              theme={{
                backgroundColor: theme.colors.background.card,
                calendarBackground: theme.colors.background.card,
                textSectionTitleColor: theme.colors.text.secondary,
                textSectionTitleDisabledColor: theme.colors.border.default,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.text.primary,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text.primary,
                textDisabledColor: theme.colors.text.disabled,
                dotColor: theme.colors.primary,
                selectedDotColor: theme.colors.text.primary,
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text.primary,
                indicatorColor: theme.colors.primary,
                textDayFontFamily: theme.typography.fontFamily.regular,
                textMonthFontFamily: theme.typography.fontFamily.semiBold,
                textDayHeaderFontFamily: theme.typography.fontFamily.regular,
                textDayFontSize: theme.typography.fontSize.base,
                textMonthFontSize: theme.typography.fontSize.lg,
                textDayHeaderFontSize: theme.typography.fontSize.md
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg
    },
    calendarSection: {
      marginBottom: theme.spacing.base
    },
    calendarContainer: {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.background.card,
      ...theme.shadows.md
    },
    dateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      marginBottom: theme.spacing.base,
      marginTop: theme.spacing.sm
    },
    dateHeaderText: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary
    },
    workoutsContainer: {
      marginTop: theme.spacing.sm
    },
    emptyState: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      alignItems: 'center',
      ...theme.shadows.sm
    },
    emptyStateText: {
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.disabled,
      marginBottom: theme.spacing.base
    },
    startButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      ...theme.shadows.primary
    },
    startButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    workoutCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.base,
      ...theme.shadows.sm,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary
    },
    workoutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm
    },
    workoutTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary
    },
    workoutDate: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.disabled
    },
    workoutMuscle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.primary,
      marginBottom: theme.spacing.md
    },
    workoutDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    workoutDetail: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary
    }
  });
};
