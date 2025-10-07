import React, { useEffect, useState, useMemo } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { LineChart, Heart, Ruler, ListPlus, Plus } from 'lucide-react-native';
import Header from '@/app/components/layout/Header';
import { useHomeData } from '@/app/hooks/useHomeData';
import EmptyState from '@/app/components/history/EmptyState';
import Text from '@/app/components/ui/Text';
import {
  PhilosophyCard,
  DisciplineCard,
  PrideCard,
  MotivationCard,
  ConfidenceCard,
  EmotionalActionButton
} from '@/app/components/home/emotional';
import QuickActionsRow from '@/app/components/home/QuickActionsRow';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const { data: homeData, loading, error } = useHomeData();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Citations inspirantes avec rotation
  const inspirationalQuotes = useMemo(() => [
    { text: t('quotes.strength'), author: 'Nelson Mandela' },
    { text: t('quotes.discipline'), author: 'Jim Rohn' },
    { text: t('quotes.progress'), author: 'Tony Robbins' },
    { text: t('quotes.consistency'), author: 'Dwayne Johnson' },
    { text: t('quotes.mindset'), author: 'Carol Dweck' },
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
            <LineChart size={24} color={theme.colors.text.secondary} />
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
            <LineChart size={24} color={theme.colors.text.secondary} />
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
      {/* Header avec icône stats */}
      <Header
        title={t('common.appTitle')}
        rightComponent={
          <View style={styles.headerIcons}>
            <LineChart
              size={24}
              color={theme.colors.primary}
              onPress={handleStatsPress}
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

          {/* Pilier 2: Semaine → Discipline → Satisfaction */}
          <DisciplineCard
            weekProgress={homeData.weeklyStats.progressPercentage}
            streak={homeData.weeklyStats.streak}
            sessionsCompleted={homeData.weeklyStats.sessionsCompleted}
            targetSessions={homeData.weeklyGoal.targetSessions}
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

          {/* Pilier 4: Objectif → Défi → Motivation */}
          <MotivationCard
            currentSessions={homeData.weeklyGoal.currentSessions}
            targetSessions={homeData.weeklyGoal.targetSessions}
            weeklyGoal={homeData.weeklyGoal.description}
          />

          {/* Pilier 5: Routine → Personnalisation → Confiance + Récompense → Résultats → Plaisir */}
          <ConfidenceCard
            totalRoutines={homeData.routineStats?.total || 0}
            customRoutines={homeData.routineStats?.custom || 0}
            totalWorkouts={homeData.totalWorkouts || 0}
            averageRating={homeData.averageRating}
            onCreateRoutine={handleCreateRoutine}
          />

          {/* Bouton d'action émotionnel principal */}
          <EmotionalActionButton
            hasActiveSession={homeData.hasActiveSession || false}
            onPress={handleStartSession}
            userMood={userMood}
          />

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
                  onPress: () => router.push('/screens/measurements'),
                },
                {
                  key: 'stats',
                  label: t('stats.title'),
                  Icon: LineChart,
                  onPress: () => router.push('/screens/stats'),
                },
                {
                  key: 'addExercise',
                  label: t('home.viewExercise'),
                  Icon: ListPlus,
                  onPress: () => router.push('/screens/exercise-selection'),
                },
                {
                  key: 'newRoutine',
                  label: t('routines.title'),
                  Icon: Plus,
                  onPress: () => router.push('/screens/routines/new'),
                },
              ]}
            />
          </View>

          {/* Espace final pour le scroll */}
          <View style={styles.bottomSpacing} />
        </Animated.View>
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
      alignItems: 'center',
    },
    welcomeSection: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      marginBottom: theme.spacing.md,
    },
    welcomeText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.xl,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    moodText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.medium,
      textAlign: 'center',
    },
    quickActionsSection: {
      marginTop: theme.spacing.xl,
      paddingTop: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.background.input,
    },
    sectionTitle: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.medium,
      fontSize: theme.typography.fontSize.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bottomSpacing: {
      height: theme.spacing.xl * 2,
    }
  });
};
