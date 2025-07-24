import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { WorkoutDateUtils } from '@/types/workout';

interface WeeklyCalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  markedDates: Record<string, { marked?: boolean; dotColor?: string }>;
}

interface DayInfo {
  date: string;
  dayNumber: number;
  dayLetter: string;
  isSelected: boolean;
  isMarked: boolean;
  isToday: boolean;
}

export default function WeeklyCalendar({
  selectedDate,
  onDateSelect,
  markedDates
}: WeeklyCalendarProps) {
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const selected = new Date(selectedDate);
    const dayOfWeek = selected.getDay();
    const monday = new Date(selected);
    monday.setDate(selected.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    return monday;
  });

  const slideAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  // Configuration des jours selon la langue
  const dayConfig = {
    fr: {
      letters: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      names: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    },
    en: {
      letters: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      names: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }
  };

  const config = dayConfig[language as keyof typeof dayConfig] || dayConfig.en;

  /**
   * Navigue vers aujourd'hui
   */
  const goToToday = () => {
    const today = new Date();
    const todayString = WorkoutDateUtils.getDatePart(today.toISOString());
    onDateSelect(todayString);
    
    // Recalculer le début de la semaine pour aujourd'hui
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    setCurrentWeekStart(monday);
  };

  /**
   * Génère les informations pour les 7 jours de la semaine
   */
  const getWeekDays = (): DayInfo[] => {
    const days: DayInfo[] = [];
    const today = new Date();
    const todayString = WorkoutDateUtils.getDatePart(today.toISOString());

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      
      const dateString = WorkoutDateUtils.getDatePart(date.toISOString());
      const isSelected = dateString === selectedDate;
      const isMarked = markedDates[dateString]?.marked || false;
      const isToday = dateString === todayString;

      days.push({
        date: dateString,
        dayNumber: date.getDate(),
        dayLetter: config.letters[i],
        isSelected,
        isMarked,
        isToday
      });
    }

    return days;
  };

  /**
   * Navigue vers la semaine précédente
   */
  const goToPreviousWeek = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() - 7);
      setCurrentWeekStart(newWeekStart);
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };

  /**
   * Navigue vers la semaine suivante
   */
  const goToNextWeek = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() + 7);
      setCurrentWeekStart(newWeekStart);
      
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true
      }).start(() => {
        setIsAnimating(false);
      });
    });
  };

  const weekDays = getWeekDays();

  return (
    <View style={styles.container}>
      {/* En-tête avec navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={goToPreviousWeek}
          disabled={isAnimating}
        >
          <ChevronLeft size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.weekTitle}>
            {t('calendar.weekOf')} {currentWeekStart.getDate()} {t(`calendar.months.${currentWeekStart.getMonth()}` as any)}
          </Text>
          
          <TouchableOpacity
            style={styles.todayButton}
            onPress={goToToday}
          >
            <Calendar size={16} color={theme.colors.primary} />
            <Text style={styles.todayButtonText}>{t('calendar.today')}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={goToNextWeek}
          disabled={isAnimating}
        >
          <ChevronRight size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Calendrier hebdomadaire */}
      <Animated.View
        style={[
          styles.calendarContainer,
          {
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-50, 0, 50]
              })
            }]
          }
        ]}
      >
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dayContainer,
              day.isSelected && styles.selectedDay,
              day.isToday && !day.isSelected && styles.todayDay
            ]}
            onPress={() => onDateSelect(day.date)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayLetter,
                day.isSelected && styles.selectedDayText,
                day.isToday && !day.isSelected && styles.todayDayText
              ]}
            >
              {day.dayLetter}
            </Text>
            
            <Text
              style={[
                styles.dayNumber,
                day.isSelected && styles.selectedDayText,
                day.isToday && !day.isSelected && styles.todayDayText
              ]}
            >
              {day.dayNumber}
            </Text>
            
            {day.isMarked && (
              <View
                style={[
                  styles.markedDot,
                  { backgroundColor: markedDates[day.date]?.dotColor || theme.colors.primary }
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      margin: theme.spacing.sm,
      ...theme.shadows.md
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.base
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center'
    },
    navButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.base
    },
    weekTitle: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs
    },
    todayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.base,
      borderWidth: 1,
      borderColor: theme.colors.primary
    },
    todayButtonText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
      marginLeft: theme.spacing.xs
    },
    calendarContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    dayContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 60,
      borderRadius: theme.borderRadius.base,
      position: 'relative'
    },
    selectedDay: {
      backgroundColor: theme.colors.primary,
      transform: [{ scale: 1.1 }]
    },
    todayDay: {
      backgroundColor: theme.colors.background.main,
      borderWidth: 2,
      borderColor: theme.colors.primary
    },
    dayLetter: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: 2
    },
    dayNumber: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary
    },
    selectedDayText: {
      color: theme.colors.background.main
    },
    todayDayText: {
      color: theme.colors.primary
    },
    markedDot: {
      position: 'absolute',
      bottom: 4,
      width: 6,
      height: 6,
      borderRadius: 3
    }
  });
}; 