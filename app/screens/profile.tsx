import React, { useState, useEffect, useMemo } from 'react';
import { Animated, Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Instagram, Share2, Star, ChevronRight, Ruler, ChartLine as LineChart, Image as ImageIcon, Settings, Dumbbell, Zap, Target, Award, TrendingUp, Flame } from 'lucide-react-native';
import Button from '@/app/components/ui/Button';
import { router } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { useAuth } from '@/app/contexts/AuthContext';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import useHaptics from '@/app/hooks/useHaptics';
import Modal from '@/app/components/ui/Modal';
import useWorkouts from '@/app/hooks/useWorkouts';
import { storageService } from '@/app/services/storage';
import { Routine } from '@/types/common';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

const StatCard = ({ icon, value, label, color }: StatCardProps) => {
  const { theme } = useTheme();
  const styles = useStyles();
  const scaleAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

type ProfileScreenProps = { showBackButton?: boolean };

function ProfileScreen({ showBackButton = true }: ProfileScreenProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { workouts } = useWorkouts();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const styles = useStyles();
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const haptics = useHaptics();
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Charger les routines
  useEffect(() => {
    const loadRoutines = async () => {
      const loadedRoutines = await storageService.getRoutines();
      setRoutines(loadedRoutines || []);
    };
    loadRoutines();
  }, []);

  // Calculer les statistiques
  const stats = useMemo(() => {
    // Grouper les workouts par date pour compter les sessions
    const sessionsByDate = new Map<string, boolean>();
    workouts.forEach(w => {
      const date = w.date.split('T')[0];
      sessionsByDate.set(date, true);
    });

    const totalSessions = sessionsByDate.size;
    
    // Sessions de cette semaine
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    const weekSessions = Array.from(sessionsByDate.keys()).filter(date => date >= weekAgoStr).length;

    // Calculer le streak (jours consécutifs)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sortedDates = Array.from(sessionsByDate.keys()).sort().reverse();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const sessionDate = new Date(sortedDates[i]);
      sessionDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return {
      totalSessions,
      weekSessions,
      totalRoutines: routines.length,
      streak
    };
  }, [workouts, routines]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  const openInstagram = async (useApp: boolean) => {
    const instagramUrl = 'instagram://user?username=gainiziapp';
    const webUrl = 'https://www.instagram.com/gainiziapp/';

    try {
      if (useApp) {
        const canOpen = await Linking.canOpenURL(instagramUrl);
        if (canOpen) {
          await Linking.openURL(instagramUrl);
        } else {
          await Linking.openURL(webUrl);
        }
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Could not open Instagram');
    }
    setShowInstagramModal(false);
  };

  const challengesMotivation = 'Lance-toi et relève de nouveaux défis !';
  const displayName = isAuthenticated && user?.name ? user.name : 'Mon compte';
  const displayStatus = isAuthenticated && user?.email ? user.email : t('profile.auth.notSignedIn');

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('profile.title')} showBackButton={showBackButton} onBack={showBackButton ? () => router.back() : undefined} />
      <Animated.ScrollView style={[styles.content, { opacity: fadeAnim }]} contentContainerStyle={styles.contentContainer}>
        {/* === CARTE PROFIL AMÉLIORÉE === */}
        <TouchableOpacity 
          style={styles.profileHeader}
          onPress={() => {
            haptics.impactLight();
            router.push('/screens/my-account');
          }}
          activeOpacity={0.7}
        >
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              {isAuthenticated && user?.picture ? (
                <Image 
                  source={{ uri: user.picture }} 
                  style={styles.avatarXLarge}
                />
              ) : (
                <View style={styles.avatarXLarge}>
                  <ImageIcon size={36} color={theme.colors.primary} />
                </View>
              )}
              {stats.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Flame size={14} color={theme.colors.warning} />
                  <Text style={styles.streakText}>{stats.streak}</Text>
                </View>
              )}
            </View>
            <View style={styles.profileHeaderInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileStatus}>{displayStatus}</Text>
              {stats.totalSessions > 0 && (
                <View style={styles.levelBadge}>
                  <Zap size={14} color={theme.colors.warning} />
                  <Text style={styles.levelText}>{t('profile.level')} {Math.floor(stats.totalSessions / 10) + 1}</Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        {/* === STATISTIQUES RAPIDES === */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Dumbbell size={22} color={theme.colors.primary} />}
            value={stats.weekSessions}
            label={t('profile.stats.thisWeek')}
            color={theme.colors.primary}
          />
          <StatCard
            icon={<Target size={22} color={theme.colors.success} />}
            value={stats.totalSessions}
            label={t('profile.stats.totalSessions')}
            color={theme.colors.success}
          />
          <StatCard
            icon={<Award size={22} color={theme.colors.warning} />}
            value={stats.totalRoutines}
            label={t('profile.stats.routines')}
            color={theme.colors.warning}
          />
        </View>

        {/* === MON PROFIL === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.myProfile')}</Text>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => {
              haptics.impactLight();
              router.push('/screens/profile-athlete');
            }}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
              <Dumbbell size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('profile.athleteProfile')}</Text>
              <Text style={styles.featureDesc}>{t('profile.athleteProfileDesc')}</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => {
              haptics.impactLight();
              router.push('/screens/measurements');
            }}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.success + '15' }]}>
              <Ruler size={24} color={theme.colors.success} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('measurements.title')}</Text>
              <Text style={styles.featureDesc}>{t('profile.measurementsDesc')}</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* === SUIVI & DÉFIS === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.trackingChallenges')}</Text>
          
          <TouchableOpacity 
            style={[styles.featureCard, styles.highlightCard]}
            onPress={() => {
              haptics.impactLight();
              router.push('/screens/stats');
            }}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
              <TrendingUp size={24} color={theme.colors.secondary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('stats.title')}</Text>
              <Text style={styles.featureDesc}>{t('profile.statsDesc')}</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.featureCard, styles.challengeCard]}
            onPress={() => {
              haptics.impactLight();
              router.push('/screens/gamification');
            }}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.warning + '15' }]}>
              <Trophy size={24} color={theme.colors.warning} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('profile.challenges.title')}</Text>
              <Text style={styles.featureDesc}>{challengesMotivation}</Text>
            </View>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* === SOCIAL === */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.social')}</Text>
          <View style={styles.socialRow}>
            <TouchableOpacity 
              style={styles.socialCard}
              onPress={() => {
                haptics.impactLight();
                setShowInstagramModal(true);
              }}
            >
              <Instagram size={28} color={"#E4405F"} />
              <Text style={styles.socialLabel}>{t('profile.instagram')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialCard}
              onPress={() => {
                haptics.impactLight();
                /* TODO: Implement share functionality */
              }}
            >
              <Share2 size={28} color={theme.colors.primary} />
              <Text style={styles.socialLabel}>{t('profile.share')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialCard}
              onPress={() => {
                haptics.impactLight();
                /* TODO: Implement rating functionality */
              }}
            >
              <Star size={28} color={theme.colors.warning} />
              <Text style={styles.socialLabel}>{t('profile.rate')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* === PARAMÈTRES === */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.settingsCard}
            onPress={() => {
              haptics.impactLight();
              router.push('/screens/settings');
            }}
          >
            <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.text.secondary + '10' }]}>
              <Settings size={24} color={theme.colors.text.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{t('profile.appSettings')}</Text>
              <Text style={styles.featureDesc}>{t('profile.appSettingsDesc')}</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      <Modal
        visible={showInstagramModal}
        onClose={() => setShowInstagramModal(false)}
        title={t('profile.instagramModal.title')}
        showCloseButton={true}
      >
        <Text style={styles.modalMessage}>{t('profile.instagramModal.message')}</Text>

        <View style={styles.modalButtons}>
          <Button
            variant="outline"
            onPress={() => setShowInstagramModal(false)}
            title={t('profile.instagramModal.later')}
            style={{ flex: 1 }}
          />
          <Button
            variant="primary"
            onPress={() => openInstagram(true)}
            title={t('profile.instagramModal.follow')}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
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
    contentContainer: {
      padding: theme.spacing.lg,
      paddingBottom: 100
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      marginBottom: theme.spacing.xl
    },
    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.lg
    },
    profileHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    avatarContainer: {
      position: 'relative'
    },
    avatarXLarge: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.background.main,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: theme.colors.primary + '30'
    },
    streakBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      gap: 2,
      borderWidth: 2,
      borderColor: theme.colors.background.main,
      ...theme.shadows.sm
    },
    streakText: {
      fontSize: 10,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.warning
    },
    profileHeaderInfo: {
      marginLeft: theme.spacing.lg,
      flex: 1
    },
    profileName: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs
    },
    profileStatus: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.warning + '15',
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      gap: theme.spacing.xs / 2,
      marginTop: theme.spacing.xs
    },
    levelText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.warning
    },
    statsGrid: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      ...theme.shadows.sm
    },
    statIconContainer: {
      width: 44,
      height: 44,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm
    },
    statValue: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs / 2
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      textAlign: 'center'
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background.main,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    section: {
      marginBottom: theme.spacing.xl * 1.5
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs
    },
    featureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm
    },
    highlightCard: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.secondary
    },
    challengeCard: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.warning,
      position: 'relative'
    },
    featureIconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center'
    },
    featureContent: {
      flex: 1,
      marginLeft: theme.spacing.md,
      marginRight: theme.spacing.sm
    },
    featureTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs / 2
    },
    featureDesc: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary
    },
    newBadge: {
      backgroundColor: theme.colors.warning,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md
    },
    newBadgeText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.background.card
    },
    socialRow: {
      flexDirection: 'row',
      gap: theme.spacing.md
    },
    socialCard: {
      flex: 1,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
      gap: theme.spacing.sm,
      ...theme.shadows.sm
    },
    socialLabel: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
      textAlign: 'center'
    },
    settingsCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm
    },
    sectionDescription: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.lg,
      fontFamily: theme.typography.fontFamily.regular
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    settingItemPrimary: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      borderBottomWidth: 0,
      padding: theme.spacing.md
    },
    settingItemSecondary: {
      backgroundColor: 'transparent',
      borderBottomWidth: 0
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    settingLabel: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.md,
      fontFamily: theme.typography.fontFamily.regular
    },
    settingLabelPrimary: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    settingLabelSecondary: {
      color: theme.colors.text.secondary
    },
    settingSubLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.md,
      fontFamily: theme.typography.fontFamily.regular
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg
    },
    modalContent: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center'
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      textAlign: 'center'
    },
    modalMessage: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xl,
      textAlign: 'center'
    },
    modalButtons: {
      width: '100%',
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md
    },
    userInfo: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md
    },
    userEmail: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular
    }
  });
};

export default ProfileScreen;
