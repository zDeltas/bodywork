import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Scale, Activity } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import OnboardingLayout from '@/app/components/onboarding/OnboardingLayout';
import RadioGroup from '@/app/components/onboarding/RadioGroup';
import { useOnboarding } from '@/app/hooks/useOnboarding';

const AppSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  
  const {
    profile,
    currentStep,
    updateAppSettings,
    nextStep,
    previousStep,
    completeOnboarding,
  } = useOnboarding();

  const unitsOptions = [
    {
      key: 'metric',
      label: t('onboarding.appSettings.metric'),
      description: 'Kilogrammes et centimètres'
    },
    {
      key: 'imperial',
      label: t('onboarding.appSettings.imperial'),
      description: 'Livres et pouces'
    }
  ];

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={8}
      title={t('onboarding.appSettings.title')}
      subtitle={t('onboarding.appSettings.subtitle')}
      showBackButton={true}
      onBack={previousStep}
      onNext={completeOnboarding}
      nextButtonText={t('onboarding.finish')}
      footerType="single"
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Scale size={24} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {t('onboarding.appSettings.units')}
          </Text>
        </View>
        <RadioGroup
          options={unitsOptions}
          value={profile.units}
          onValueChange={(value) => updateAppSettings({ units: value as any })}
        />
      </View>

      {/* RPE Section - Only show for intermediate/advanced users */}
      {profile.fitnessLevel !== 'beginner' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Activity size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              {t('onboarding.appSettings.rpeTracking')}
            </Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
            {t('onboarding.appSettings.rpeDesc')}
          </Text>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              {
                backgroundColor: profile.enableRpe 
                  ? theme.colors.primary + '20'
                  : theme.colors.background.secondary,
                borderColor: profile.enableRpe 
                  ? theme.colors.primary
                  : theme.colors.border.default,
              }
            ]}
            onPress={() => updateAppSettings({ enableRpe: !profile.enableRpe })}
          >
            <View style={[
              styles.toggleIndicator,
              {
                backgroundColor: profile.enableRpe 
                  ? theme.colors.primary
                  : theme.colors.background.tertiary,
              }
            ]} />
            <Text style={[
              styles.toggleText,
              {
                color: profile.enableRpe 
                  ? theme.colors.primary
                  : theme.colors.text.secondary,
              }
            ]}>
              {profile.enableRpe ? t('common.enabled') : t('common.disabled')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    sectionDescription: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
      marginBottom: theme.spacing.md,
    },
    toggleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      gap: theme.spacing.sm,
    },
    toggleIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
    },
    toggleText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
    },
  });
};

export default AppSettingsScreen;
