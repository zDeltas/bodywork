import React, { useEffect, useMemo, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { LineChart, ListPlus, Plus, Ruler, SlidersHorizontal } from 'lucide-react-native';
import Header from '@/app/components/layout/Header';
import { useHomeData } from '@/app/hooks/useHomeData';
import EmptyState from '@/app/components/history/EmptyState';
import Text from '@/app/components/ui/Text';
import {  PhilosophyCard, PrideCard } from '@/app/components/home/emotional';
// Nouvelles cartes Gainizi
import PlanningAdherenceCard from '@/app/components/home/PlanningAdherenceCard';
import DailyRoutineCard from '@/app/components/home/DailyRoutineCard';
import WeeklyChallengeRoutinesCard from '@/app/components/home/WeeklyChallengeRoutinesCard';
import DayRoutinesModal from '@/app/components/home/DayRoutinesModal';
import QuickActionsRow from '@/app/components/home/QuickActionsRow';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const { data: homeData, loading, error } = useHomeData();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // État pour la modale des routines du jour
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedRoutines, setSelectedRoutines] = useState<any[]>([]);

  // Citations inspirantes avec rotation
  const inspirationalQuotes = useMemo(() => [
    { text: t('quotes.strength'), author: 'Nelson Mandela' },
    { text: t('quotes.discipline'), author: 'Jim Rohn' },
    { text: t('quotes.progress'), author: 'Tony Robbins' },
    { text: t('quotes.consistency'), author: 'Dwayne Johnson' },
    { text: t('quotes.mindset'), author: 'Carol Dweck' }
  ], [t]);

  const currentQuote = useMemo(() => {
    const today = new Date().getDate();
    return inspirationalQuotes[today % inspirationalQuotes.length];
  }, [inspirationalQuotes]);

  // Détection de l'humeur utilisateur basée sur les données
  const userMood = useMemo(() => {
    if (!homeData) return 'motivated';

    const { weeklyStats, lastSession } = homeData;
    const timeSinceLastSession = lastSession ?
      (Date.now() - new Date(lastSession.date).getTime()) / (1000 * 60 * 60 * 24) : 7;

    if (timeSinceLastSession > 3) return 'tired';
    if (weeklyStats.progressPercentage >= 80) return 'energetic';
    if (weeklyStats.streak >= 3) return 'focused';
    return 'motivated';
  }, [homeData]);


  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, [fadeAnim]);

  // Handlers émotionnels
  const handleLastSessionPress = () => {
    router.push('/(tabs)/history');
  };

  const handleStatsPress = () => {
    router.push('/screens/stats');
  };

  const handleStartSession = () => {
    // TODO: Vérifier s'il y a une session active
    router.push('/screens/workout/new');
  };

  const handleCreateRoutine = () => {
    router.push('/screens/routines/new');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title={t('common.appTitle')}
          rightComponent={
            <SlidersHorizontal
              size={24}
              color={theme.colors.primary}
              onPress={() => router.push('/screens/settings-home')}
            />
          }
        />
        <View style={styles.loadingContainer}>
          <EmptyState type="loading" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title={t('common.appTitle')}
          rightComponent={
            <SlidersHorizontal
              size={24}
              color={theme.colors.primary}
              onPress={() => router.push('/screens/settings-home')}
            />
          }
        />
        <View style={styles.errorContainer}>
          <EmptyState type="error" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('common.appTitle')}
        rightComponent={
          <View style={styles.headerIcons}>
            <SlidersHorizontal
              size={24}
              color={theme.colors.primary}
              onPress={() => router.push('/screens/settings-home')}
            />
          </View>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Salutation émotionnelle personnalisée */}
          <View style={styles.welcomeSection}>
            <Text variant="heading" style={styles.welcomeText}>
              {t('home.emotional.greeting', { name: homeData.userName || 'Champion' })}
            </Text>
            <Text variant="caption" style={styles.moodText}>
              {t(`home.emotional.mood.${userMood}`)} • {new Date().toLocaleDateString()}
            </Text>
          </View>

          {/* Pilier 1: Citation → Philosophie → Inspiration */}
          {homeData.showPhilosophyCard && (
            <PhilosophyCard
              quote={currentQuote.text}
              author={currentQuote.author}
            />
          )}

          {/* === NOUVELLES CARTES GAINIZI === */}
          
          {/* Routine du jour - Action immédiate */}
          <DailyRoutineCard
            hasRoutineToday={homeData.dailyRoutine.hasRoutineToday}
            routines={homeData.dailyRoutine.routines}
            isCompleted={homeData.dailyRoutine.isCompleted}
          />

          {/* Adhérence au planning - Tonalité calme et valorisante */}
          <PlanningAdherenceCard
            completedSessions={homeData.planningAdherence.completedSessions}
            plannedSessions={homeData.planningAdherence.plannedSessions}
            adherenceRate={homeData.planningAdherence.adherenceRate}
            streakWeeks={homeData.planningAdherence.streakWeeks}
            weeksAnalyzed={homeData.planningAdherence.weeksAnalyzed}
            stabilityMessage={homeData.planningAdherence.stabilityMessage}
            onPress={() => router.push('/screens/stats')}
          />

          {/* Défi hebdomadaire + Routines planifiées */}
          <WeeklyChallengeRoutinesCard
            weeklyRoutines={homeData.weeklyRoutines}
            weeklyTarget={homeData.weeklyTarget}
            completedThisWeek={homeData.completedThisWeek}
            weeklyChallenge={homeData.weeklyChallenge2}
            onDayPress={(date, routines) => {
              if (routines.length === 0) {
                // Jour de repos - pas d'action ou afficher message
                return;
              } else if (routines.length === 1) {
                // Une seule routine - démarrer directement
                router.push(`/screens/workout/session?routineId=${routines[0].id}`);
              } else {
                // Plusieurs routines - afficher la modale de sélection
                setSelectedDate(date);
                setSelectedRoutines(routines);
                setDayModalVisible(true);
              }
            }}
          />

          {/* Pilier 3: Dernière séance → Performance → Fierté */}
          {homeData.lastSession && (
            <PrideCard
              date={homeData.lastSession.date}
              duration={homeData.lastSession.duration}
              totalVolume={homeData.lastSession.totalVolume}
              muscleGroups={homeData.lastSession.muscleGroups}
              personalRecord={homeData.lastSession.personalRecord}
              onPress={handleLastSessionPress}
            />
          )}

          {/* Actions rapides - Accès pratique aux fonctionnalités */}
          <View style={styles.quickActionsSection}>
            <Text variant="body" style={styles.sectionTitle}>
              {t('home.quickAccess')}
            </Text>
            <QuickActionsRow
              orientation="column"
              actions={[
                {
                  key: 'measurements',
                  label: t('measurements.title'),
                  Icon: Ruler,
                  onPress: () => router.push('/screens/measurements')
                },
                {
                  key: 'stats',
                  label: t('stats.title'),
                  Icon: LineChart,
                  onPress: () => router.push('/screens/stats')
                },
                {
                  key: 'addExercise',
                  label: t('home.viewExercise'),
                  Icon: ListPlus,
                  onPress: () => router.push('/screens/exercise-selection')
                },
                {
                  key: 'newRoutine',
                  label: t('routines.title'),
                  Icon: Plus,
                  onPress: () => router.push('/screens/routines/new')
                }
              ]}
            />
          </View>

          {/* Espace final pour le scroll */}
          <View style={styles.bottomSpacing} />
        </Animated.View>
      </ScrollView>

      {/* Modale des routines du jour */}
      <DayRoutinesModal
        visible={dayModalVisible}
        onClose={() => setDayModalVisible(false)}
        date={selectedDate}
        routines={selectedRoutines}
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
    scrollContent: {
      paddingBottom: theme.spacing.xl * 2
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    welcomeSection: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      marginBottom: theme.spacing.md
    },
    welcomeText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.xl,
      textAlign: 'center',
      marginBottom: theme.spacing.xs
    },
    moodText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center'
    },
    quickActionsSection: {
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.background.input
    },
    sectionTitle: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    bottomSpacing: {
      height: theme.spacing.xl * 2
    }
  });
};
