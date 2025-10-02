import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Target, Activity } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import OnboardingLayout from '@/app/components/onboarding/OnboardingLayout';
import RadioGroup from '@/app/components/onboarding/RadioGroup';
import { useOnboarding } from '@/app/hooks/useOnboarding';

const GoalsLevelScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  
  const {
    profile,
    currentStep,
    updateGoalsLevel,
    nextStep,
    previousStep,
  } = useOnboarding();

  const goalOptions = [
    {
      key: 'muscle_gain',
      label: t('onboarding.goalsLevel.muscleGain'),
      description: 'Développer votre masse musculaire et votre force'
    },
    {
      key: 'weight_loss',
      label: t('onboarding.goalsLevel.weightLoss'),
      description: 'Perdre du poids et améliorer votre composition corporelle'
    },
    {
      key: 'fitness',
      label: t('onboarding.goalsLevel.fitness'),
      description: 'Améliorer votre condition physique générale et votre santé'
    }
  ];

  const levelOptions = [
    {
      key: 'beginner',
      label: t('onboarding.goalsLevel.beginner'),
      description: 'Moins de 6 mois d\'expérience en musculation'
    },
    {
      key: 'intermediate',
      label: t('onboarding.goalsLevel.intermediate'),
      description: '6 mois à 2 ans d\'expérience régulière'
    },
    {
      key: 'advanced',
      label: t('onboarding.goalsLevel.advanced'),
      description: 'Plus de 2 ans d\'expérience et de connaissances'
    }
  ];

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={8}
      title={t('onboarding.goalsLevel.title')}
      subtitle={t('onboarding.goalsLevel.subtitle')}
      showBackButton={true}
      onBack={previousStep}
      onNext={nextStep}
      onSkip={nextStep}
      footerType="double"
      showSkipButton={true}
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target size={24} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {t('onboarding.goalsLevel.primaryGoal')}
          </Text>
        </View>
        <RadioGroup
          options={goalOptions}
          value={profile.primaryGoal}
          onValueChange={(value) => updateGoalsLevel({ primaryGoal: value as any })}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Activity size={24} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {t('onboarding.goalsLevel.fitnessLevel')}
          </Text>
        </View>
        <RadioGroup
          options={levelOptions}
          value={profile.fitnessLevel}
          onValueChange={(value) => updateGoalsLevel({ fitnessLevel: value as any })}
        />
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
  });
};

export default GoalsLevelScreen;
