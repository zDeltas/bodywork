import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import OnboardingLayout from '@/app/components/onboarding/OnboardingLayout';
import { Shield, Target, TrendingUp, Zap } from 'lucide-react-native';

const DataExplanationScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { nextStep, previousStep, currentStep } = useOnboarding();
  const styles = useStyles();

  const features = [
    {
      icon: Target,
      title: t('onboarding.dataExplanation.personalizedGoals'),
      description: t('onboarding.dataExplanation.personalizedGoalsDesc')
    },
    {
      icon: TrendingUp,
      title: t('onboarding.dataExplanation.adaptedLevel'),
      description: t('onboarding.dataExplanation.adaptedLevelDesc')
    },
    {
      icon: Zap,
      title: t('onboarding.dataExplanation.smartRecommendations'),
      description: t('onboarding.dataExplanation.smartRecommendationsDesc')
    },
    {
      icon: Shield,
      title: t('onboarding.dataExplanation.secureData'),
      description: t('onboarding.dataExplanation.secureDataDesc')
    }
  ];

  const handleContinue = () => {
    nextStep();
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={8}
      title={t('onboarding.dataExplanation.title')}
      subtitle={t('onboarding.dataExplanation.subtitle')}
      showBackButton={true}
      onBack={previousStep}
      onNext={handleContinue}
      nextButtonText={t('onboarding.dataExplanation.startConfiguration')}
      footerType="single"
    >
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <View key={index} style={[styles.featureItem, { backgroundColor: theme.colors.background.card }]}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryLight }]}>
                <IconComponent size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.text.secondary }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={[styles.privacyNote, { backgroundColor: theme.colors.background.card }]}>
        <Shield size={20} color={theme.colors.success} />
        <Text style={[styles.privacyText, { color: theme.colors.text.secondary }]}>
          <Text style={{ color: theme.colors.success, fontFamily: theme.typography.fontFamily.semiBold }}>
            {t('onboarding.dataExplanation.privacyGuaranteed')}{' '}
          </Text>
          {t('onboarding.dataExplanation.privacyNote')}
        </Text>
      </View>

      <Text style={[styles.footerNote, { color: theme.colors.text.secondary }]}>
        {t('onboarding.dataExplanation.footerNote')}
      </Text>
    </OnboardingLayout>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    featuresContainer: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing['2xl'],
    },
    featureItem: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginBottom: theme.spacing.xs,
    },
    featureDescription: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.md,
    },
    privacyNote: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'flex-start',
      marginBottom: theme.spacing['2xl'],
    },
    privacyText: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
      marginLeft: theme.spacing.sm,
      flex: 1,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.md,
    },
    footerNote: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center',
      fontStyle: 'italic',
      marginTop: theme.spacing.md,
    },
  });
};

export default DataExplanationScreen;
