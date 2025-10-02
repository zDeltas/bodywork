import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dumbbell, Home, Building2, Zap, Heart, Cpu, Layers } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import OnboardingLayout from '@/app/components/onboarding/OnboardingLayout';
import WeeklySlider from '@/app/components/onboarding/WeeklySlider';
import CheckboxGroup from '@/app/components/onboarding/CheckboxGroup';
import { useOnboarding } from '@/app/hooks/useOnboarding';

const WorkoutPrefsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  
  const {
    profile,
    currentStep,
    errors,
    updateWorkoutPrefs,
    nextStep,
    previousStep,
    goToStep,
  } = useOnboarding();

  const equipmentOptions = [
    {
      key: 'gym',
      label: t('onboarding.workoutPrefs.gym'),
      icon: <Building2 size={20} color={theme.colors.primary} />
    },
    {
      key: 'home',
      label: t('onboarding.workoutPrefs.home'),
      icon: <Home size={20} color={theme.colors.primary} />
    },
    {
      key: 'limited',
      label: t('onboarding.workoutPrefs.limited'),
      icon: <Dumbbell size={20} color={theme.colors.primary} />
    }
  ];

  const muscleGroupOptions = [
    {
      key: 'legs',
      label: t('onboarding.workoutPrefs.legs'),
      icon: <Zap size={20} color={theme.colors.primary} />
    },
    {
      key: 'back',
      label: t('onboarding.workoutPrefs.back'),
      icon: <Layers size={20} color={theme.colors.primary} />
    },
    {
      key: 'arms',
      label: t('onboarding.workoutPrefs.arms'),
      icon: <Dumbbell size={20} color={theme.colors.primary} />
    },
    {
      key: 'chest',
      label: t('onboarding.workoutPrefs.chest'),
      icon: <Heart size={20} color={theme.colors.primary} />
    },
    {
      key: 'shoulders',
      label: t('onboarding.workoutPrefs.shoulders'),
      icon: <Cpu size={20} color={theme.colors.primary} />
    },
    {
      key: 'core',
      label: t('onboarding.workoutPrefs.core'),
      icon: <Zap size={20} color={theme.colors.primary} />
    },
    {
      key: 'full_body',
      label: t('onboarding.workoutPrefs.fullBody'),
      icon: <Layers size={20} color={theme.colors.primary} />
    }
  ];

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={8}
      title={t('onboarding.workoutPrefs.title')}
      subtitle={t('onboarding.workoutPrefs.subtitle')}
      showBackButton={true}
      onBack={previousStep}
      onNext={nextStep}
      onSkip={() => goToStep(currentStep + 1)}
      footerType="double"
      showSkipButton={true}
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Dumbbell size={24} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {t('onboarding.workoutPrefs.weeklyWorkouts')}
          </Text>
        </View>
        <WeeklySlider
          value={profile.weeklyWorkouts}
          onValueChange={(value) => updateWorkoutPrefs({ weeklyWorkouts: value })}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Building2 size={24} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {t('onboarding.workoutPrefs.equipment')}
          </Text>
        </View>
        <CheckboxGroup
          options={equipmentOptions}
          value={profile.availableEquipment}
          onValueChange={(value) => updateWorkoutPrefs({ availableEquipment: value as any })}
        />
        {errors.equipment && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.equipment}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Zap size={24} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {t('onboarding.workoutPrefs.priorityMuscles')}
          </Text>
        </View>
        <CheckboxGroup
          options={muscleGroupOptions}
          value={profile.priorityMuscleGroups}
          onValueChange={(value) => updateWorkoutPrefs({ priorityMuscleGroups: value as any })}
          maxSelections={3}
        />
        {errors.priorityMuscleGroups && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.priorityMuscleGroups}
          </Text>
        )}
        <Text style={[styles.helperText, { color: theme.colors.text.secondary }]}>
          Sélectionnez jusqu'à 3 groupes musculaires prioritaires
        </Text>
      </View>
    </OnboardingLayout>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    errorText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      marginTop: theme.spacing.sm,
    },
    helperText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      marginTop: theme.spacing.sm,
      fontStyle: 'italic',
    },
  });
};

export default WorkoutPrefsScreen;
