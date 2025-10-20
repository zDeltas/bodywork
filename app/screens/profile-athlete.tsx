import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, TrendingUp, Calendar, Dumbbell, User, Ruler as RulerIcon, Scale as ScaleIcon, Cake } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';
import Modal from '@/app/components/ui/Modal';
import useHaptics from '@/app/hooks/useHaptics';
import { storageService } from '@/app/services';
import { UserProfile, Gender } from '@/types/onboarding';
import RadioGroup from '@/app/components/onboarding/RadioGroup';
import GenderSelector from '@/app/components/onboarding/GenderSelector';
import WeeklySlider from '@/app/components/onboarding/WeeklySlider';
import useMeasurements from '@/app/hooks/useMeasurements';

export default function ProfileAthleteScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const haptics = useHaptics();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Hook measurements pour synchroniser taille et poids (lecture seule)
  const { measurements } = useMeasurements();

  // Modal states
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  // Synchroniser avec measurements quand ils changent
  useEffect(() => {
    if (userProfile && measurements) {
      const needsUpdate = 
        (measurements.height && measurements.height !== userProfile.height) ||
        (measurements.weight && measurements.weight !== userProfile.weight);
      
      if (needsUpdate) {
        setUserProfile(prev => ({
          ...prev!,
          height: measurements.height || prev!.height,
          weight: measurements.weight || prev!.weight
        }));
      }
    }
  }, [measurements.height, measurements.weight]);

  const loadProfile = async () => {
    try {
      const profile = await storageService.getOnboardingProfile();
      // Utiliser les valeurs de measurements si disponibles
      const syncedProfile = {
        ...profile,
        height: measurements.height || profile?.height,
        weight: measurements.weight || profile?.weight
      };
      setUserProfile(syncedProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updatedProfile = { ...userProfile, ...updates } as UserProfile;
      await storageService.setOnboardingProfile(updatedProfile);
      setUserProfile(updatedProfile);
      haptics.success();
    } catch (error) {
      console.error('Error updating profile:', error);
      haptics.error();
      Alert.alert(t('common.error'), t('common.errorMessage'));
    }
  };


  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title={t('profile.athleteProfile')} showBackButton onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('profile.athleteProfile')} showBackButton onBack={() => router.back()} />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Section Informations physiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.physicalInfo')}</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              haptics.impactLight();
              router.push('/screens/measurements?openHeight=1');
            }}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <RulerIcon size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('onboarding.basicProfile.height')}</Text>
                <Text style={styles.cardValue}>{userProfile?.height || '-'} cm</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              haptics.impactLight();
              router.push('/screens/measurements?openWeight=1');
            }}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                <ScaleIcon size={20} color={theme.colors.success} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('onboarding.basicProfile.weight')}</Text>
                <Text style={styles.cardValue}>{userProfile?.weight || '-'} kg</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              haptics.impactLight();
              setShowGenderModal(true);
            }}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary + '20' }]}>
                <User size={20} color={theme.colors.secondary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('onboarding.basicProfile.gender')}</Text>
                <Text style={styles.cardValue}>
                  {userProfile?.gender ? t(`onboarding.basicProfile.${userProfile.gender}`) : '-'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Cake size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('profile.age')}</Text>
                <Text style={styles.cardValue}>
                  {userProfile?.birthDate ? `${calculateAge(userProfile.birthDate)} ${t('profile.years')}` : '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Objectifs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.goals')}</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              haptics.impactLight();
              setShowGoalModal(true);
            }}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Target size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('onboarding.goalsLevel.primaryGoal')}</Text>
                <Text style={styles.cardValue}>
                  {userProfile?.primaryGoal
                    ? t(
                        `onboarding.goalsLevel.${
                          userProfile.primaryGoal === 'muscle_gain'
                            ? 'muscleGain'
                            : userProfile.primaryGoal === 'weight_loss'
                            ? 'weightLoss'
                            : 'fitness'
                        }`
                      )
                    : '-'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              haptics.impactLight();
              setShowLevelModal(true);
            }}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                <TrendingUp size={20} color={theme.colors.success} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('onboarding.goalsLevel.fitnessLevel')}</Text>
                <Text style={styles.cardValue}>
                  {userProfile?.fitnessLevel ? t(`onboarding.goalsLevel.${userProfile.fitnessLevel}`) : '-'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Entraînement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.training')}</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              haptics.impactLight();
              setShowWeeklyModal(true);
            }}
          >
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.secondary + '20' }]}>
                <Calendar size={20} color={theme.colors.secondary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('onboarding.workoutPrefs.weeklyWorkouts')}</Text>
                <Text style={styles.cardValue}>
                  {userProfile?.weeklyWorkouts
                    ? `${userProfile.weeklyWorkouts} ${
                        userProfile.weeklyWorkouts > 1 ? t('onboarding.sessions') : t('onboarding.session')
                      }`
                    : '-'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Dumbbell size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('onboarding.workoutPrefs.equipment')}</Text>
                <Text style={styles.cardValue}>
                  {userProfile?.availableEquipment && userProfile.availableEquipment.length > 0
                    ? userProfile.availableEquipment
                        .map((eq) => t(`onboarding.workoutPrefs.${eq}`))
                        .join(', ')
                    : '-'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
                <Target size={20} color={theme.colors.success} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{t('onboarding.workoutPrefs.priorityMuscles')}</Text>
                <Text style={styles.cardValue}>
                  {userProfile?.priorityMuscleGroups && userProfile.priorityMuscleGroups.length > 0
                    ? userProfile.priorityMuscleGroups
                        .slice(0, 3)
                        .map((muscle) => t(`onboarding.workoutPrefs.${muscle}`))
                        .join(', ')
                    : '-'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modales avec composants onboarding */}
      
      {/* Modal Genre */}
      <Modal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        title={t('onboarding.basicProfile.gender')}
        showCloseButton
      >
        <View style={styles.modalContent}>
          <GenderSelector
            value={userProfile?.gender || 'male'}
            onValueChange={(gender: Gender) => {
              updateProfile({ gender });
              setShowGenderModal(false);
            }}
          />
        </View>
      </Modal>

      {/* Modal Objectif */}
      <Modal
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title={t('onboarding.goalsLevel.primaryGoal')}
        showCloseButton
      >
        <View style={styles.modalContent}>
          <RadioGroup
            options={[
              { key: 'muscle_gain', label: t('onboarding.goalsLevel.muscleGain') },
              { key: 'weight_loss', label: t('onboarding.goalsLevel.weightLoss') },
              { key: 'fitness', label: t('onboarding.goalsLevel.fitness') }
            ]}
            value={userProfile?.primaryGoal || 'fitness'}
            onValueChange={(goal) => {
              updateProfile({ primaryGoal: goal as any });
              setShowGoalModal(false);
            }}
          />
        </View>
      </Modal>

      {/* Modal Niveau */}
      <Modal
        visible={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        title={t('onboarding.goalsLevel.fitnessLevel')}
        showCloseButton
      >
        <View style={styles.modalContent}>
          <RadioGroup
            options={[
              { key: 'beginner', label: t('onboarding.goalsLevel.beginner') },
              { key: 'intermediate', label: t('onboarding.goalsLevel.intermediate') },
              { key: 'advanced', label: t('onboarding.goalsLevel.advanced') }
            ]}
            value={userProfile?.fitnessLevel || 'beginner'}
            onValueChange={(level) => {
              updateProfile({ fitnessLevel: level as any });
              setShowLevelModal(false);
            }}
          />
        </View>
      </Modal>

      {/* Modal Séances/semaine */}
      <Modal
        visible={showWeeklyModal}
        onClose={() => setShowWeeklyModal(false)}
        title={t('onboarding.workoutPrefs.weeklyWorkouts')}
        showCloseButton
      >
        <View style={styles.modalContent}>
          <WeeklySlider
            value={userProfile?.weeklyWorkouts || 3}
            onValueChange={(value) => {
              updateProfile({ weeklyWorkouts: value });
              setShowWeeklyModal(false);
            }}
            minimumValue={1}
            maximumValue={7}
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
      backgroundColor: theme.colors.background.main,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl * 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    cardLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    cardValue: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
    },
    modalContent: {
      paddingTop: theme.spacing.sm,
      gap: theme.spacing.md,
    },
  });
};
