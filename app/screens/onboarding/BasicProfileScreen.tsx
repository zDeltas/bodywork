import React from 'react';
import { View, StyleSheet } from 'react-native';
import { User, Ruler, Weight, Heart } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import OnboardingLayout from '@/app/components/onboarding/OnboardingLayout';
import OnboardingInput from '@/app/components/onboarding/OnboardingInput';
import GenderSelector from '@/app/components/onboarding/GenderSelector';
import BiologicalSexSelector from '@/app/components/onboarding/BiologicalSexSelector';
import DatePicker from '@/app/components/onboarding/DatePicker';
import { useOnboarding } from '@/app/hooks/useOnboarding';

const BasicProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  
  const {
    profile,
    currentStep,
    errors,
    updateBasicProfile,
    nextStep,
    previousStep,
  } = useOnboarding();

  const handleDateChange = (date: Date) => {
    updateBasicProfile({ birthDate: date.toISOString() });
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={8}
      title={t('onboarding.basicProfile.title')}
      subtitle={t('onboarding.basicProfile.subtitle')}
      showBackButton={true}
      onBack={previousStep}
      onNext={nextStep}
      footerType="single"
    >
      <OnboardingInput
        label={t('onboarding.basicProfile.name')}
        value={profile.name}
        onChangeText={(text) => updateBasicProfile({ name: text })}
        placeholder={t('onboarding.basicProfile.namePlaceholder')}
        error={errors.name}
        icon={<User size={20} color={theme.colors.text.secondary} />}
      />

      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
          {t('onboarding.basicProfile.gender')}
        </Text>
        <Text style={[styles.fieldDescription, { color: theme.colors.text.secondary }]}>
          {t('onboarding.basicProfile.genderDescription')}
        </Text>
        <GenderSelector
          value={profile.gender}
          onValueChange={(gender) => updateBasicProfile({ gender })}
        />
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.biologicalSexHeader}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
            {t('onboarding.basicProfile.biologicalSex')}
          </Text>
        </View>
        <Text style={[styles.fieldDescription, { color: theme.colors.text.secondary }]}>
          {t('onboarding.basicProfile.biologicalSexDescription')}
        </Text>
        <BiologicalSexSelector
          value={profile.biologicalSex}
          onValueChange={(biologicalSex) => updateBasicProfile({ biologicalSex })}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={[styles.fieldLabel, { color: theme.colors.text.primary }]}>
          {t('onboarding.basicProfile.birthDate')}
        </Text>
        <DatePicker
          value={profile.birthDate ? new Date(profile.birthDate) : null}
          onValueChange={handleDateChange}
          placeholder={t('onboarding.basicProfile.birthDate')}
        />
        {errors.birthDate && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {errors.birthDate}
          </Text>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <OnboardingInput
            label={t('onboarding.basicProfile.height')}
            value={profile.height.toString()}
            onChangeText={(text) => updateBasicProfile({ height: parseInt(text) || 0 })}
            placeholder={t('onboarding.basicProfile.heightPlaceholder')}
            keyboardType="numeric"
            error={errors.height}
            icon={<Ruler size={20} color={theme.colors.text.secondary} />}
          />
        </View>
        
        <View style={styles.halfWidth}>
          <OnboardingInput
            label={t('onboarding.basicProfile.weight')}
            value={profile.weight.toString()}
            onChangeText={(text) => updateBasicProfile({ weight: parseInt(text) || 0 })}
            placeholder={t('onboarding.basicProfile.weightPlaceholder')}
            keyboardType="numeric"
            error={errors.weight}
            icon={<Weight size={20} color={theme.colors.text.secondary} />}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    fieldContainer: {
      marginBottom: theme.spacing.lg,
    },
    fieldLabel: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginBottom: theme.spacing.sm,
    },
    fieldDescription: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      marginBottom: theme.spacing.sm,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    },
    biologicalSexHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    halfWidth: {
      flex: 1,
    },
    errorText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      marginTop: theme.spacing.xs,
    },
  });
};

export default BasicProfileScreen;
