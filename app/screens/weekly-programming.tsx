import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Play, Target } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { router } from 'expo-router';
import { useHomeData } from '@/app/hooks/useHomeData';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import { format, startOfWeek, addDays, isSameDay, isAfter, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function WeeklyProgrammingScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  const { data: homeData, loading } = useHomeData();

  // Calculer les dates de la semaine (lundi à dimanche)
  const weekDates = useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 }); // 1 = lundi
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, []);

  // Obtenir le nom complet du jour
  const getDayName = (date: Date) => {
    return format(date, 'EEEE', { locale: fr });
  };

  // Obtenir la date formatée
  const getFormattedDate = (date: Date) => {
    return format(date, 'd MMM', { locale: fr });
  };

  // Obtenir le statut d'un jour
  const getDayStatus = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayRoutines = homeData.weeklyRoutines[dateKey] || [];
    const today = new Date();
    const isToday = isSameDay(date, today);
    const isPast = isAfter(today, endOfDay(date));

    if (dayRoutines.length === 0) {
      return { 
        type: 'rest', 
        color: theme.colors.text.secondary,
        label: t('home.weeklyRoutines.restDay')
      };
    }

    const completedCount = dayRoutines.filter(r => r.isCompleted).length;
    const totalCount = dayRoutines.length;

    if (completedCount === totalCount) {
      return { 
        type: 'completed', 
        color: theme.colors.success,
        label: `${completedCount}/${totalCount} terminées`
      };
    } else if (isPast && completedCount < totalCount) {
      return { 
        type: 'missed', 
        color: theme.colors.error,
        label: `${completedCount}/${totalCount} manquées`
      };
    } else if (isToday && completedCount < totalCount) {
      return { 
        type: 'today', 
        color: '#4CC9F0',
        label: `${totalCount} routine${totalCount > 1 ? 's' : ''} prévue${totalCount > 1 ? 's' : ''}`
      };
    } else {
      return { 
        type: 'planned', 
        color: theme.colors.text.secondary,
        label: `${totalCount} routine${totalCount > 1 ? 's' : ''} planifiée${totalCount > 1 ? 's' : ''}`
      };
    }
  };

  // Calculer les statistiques de la semaine
  const weekStats = useMemo(() => {
    const totalPlanned = homeData.weeklyTarget;
    const totalCompleted = homeData.completedThisWeek;
    const totalDuration = Object.values(homeData.weeklyRoutines)
      .flat()
      .reduce((sum, routine) => sum + routine.estimatedDuration, 0);
    
    return {
      totalPlanned,
      totalCompleted,
      totalDuration,
      completionRate: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0
    };
  }, [homeData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Programmation hebdomadaire" showBackButton />
        <View style={styles.loadingContainer}>
          <Text>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Programmation hebdomadaire" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Résumé de la semaine */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Target size={24} color="#4CC9F0" />
            <Text variant="subheading" style={styles.summaryTitle}>
              Résumé de la semaine
            </Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weekStats.totalCompleted}</Text>
              <Text style={styles.statLabel}>Terminées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weekStats.totalPlanned}</Text>
              <Text style={styles.statLabel}>Planifiées</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weekStats.totalDuration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weekStats.completionRate}%</Text>
              <Text style={styles.statLabel}>Réussite</Text>
            </View>
          </View>
        </View>

        {/* Planning jour par jour */}
        <View style={styles.dailyPlanningSection}>
          <Text variant="subheading" style={styles.sectionTitle}>
            Planning détaillé
          </Text>
          
          {weekDates.map((date, index) => {
            const dateKey = format(date, 'yyyy-MM-dd');
            const dayRoutines = homeData.weeklyRoutines[dateKey] || [];
            const status = getDayStatus(date);
            const isToday = isSameDay(date, new Date());

            return (
              <View 
                key={index} 
                style={[
                  styles.dayCard,
                  isToday && styles.todayCard
                ]}
              >
                <View style={styles.dayHeader}>
                  <View style={styles.dayInfo}>
                    <Text style={[styles.dayName, { color: status.color }]}>
                      {getDayName(date)}
                    </Text>
                    <Text style={styles.dayDate}>
                      {getFormattedDate(date)}
                    </Text>
                  </View>
                  
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
                    <Text style={[styles.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </View>

                {dayRoutines.length > 0 ? (
                  <View style={styles.routinesContainer}>
                    {dayRoutines.map((routine, routineIndex) => (
                      <View key={routine.id} style={styles.routineItem}>
                        <View style={styles.routineInfo}>
                          <Text style={styles.routineName}>{routine.name}</Text>
                          <View style={styles.routineMeta}>
                            <Clock size={14} color={theme.colors.text.secondary} />
                            <Text style={styles.routineMetaText}>
                              {routine.estimatedDuration} min
                            </Text>
                            <Text style={styles.routineMetaText}>•</Text>
                            <Text style={styles.routineMetaText}>
                              {routine.mainMuscleGroup}
                            </Text>
                          </View>
                        </View>
                        
                        {!routine.isCompleted && (
                          <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => router.push(`/screens/workout/session?routineId=${routine.id}`)}
                          >
                            <Play size={16} color="white" fill="white" />
                          </TouchableOpacity>
                        )}
                        
                        {routine.isCompleted && (
                          <View style={styles.completedIndicator}>
                            <Text style={styles.completedText}>✓</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.restDayContainer}>
                    <Text style={styles.restDayText}>
                      Jour de repos - Profitez-en pour récupérer ! 🌟
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Espace final */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
      flex: 1,
      padding: theme.spacing.lg
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    summaryCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: 24,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg
    },
    summaryTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    statItem: {
      alignItems: 'center',
      flex: 1
    },
    statNumber: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#4CC9F0',
      marginBottom: 4
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center'
    },
    dailyPlanningSection: {
      gap: theme.spacing.md
    },
    sectionTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: theme.spacing.md
    },
    dayCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: 16,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm
    },
    todayCard: {
      borderWidth: 2,
      borderColor: '#4CC9F0' + '30'
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md
    },
    dayInfo: {
      flex: 1
    },
    dayName: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      textTransform: 'capitalize',
      marginBottom: 2
    },
    dayDate: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg
    },
    statusText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular
    },
    routinesContainer: {
      gap: theme.spacing.md
    },
    routineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md
    },
    routineInfo: {
      flex: 1
    },
    routineName: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
      marginBottom: 4
    },
    routineMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs
    },
    routineMetaText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    },
    startButton: {
      backgroundColor: '#4CC9F0',
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm
    },
    completedIndicator: {
      backgroundColor: theme.colors.success,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center'
    },
    completedText: {
      color: 'white',
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.bold
    },
    restDayContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg
    },
    restDayText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
      textAlign: 'center'
    },
    bottomSpacing: {
      height: theme.spacing.xl
    }
  });
};
