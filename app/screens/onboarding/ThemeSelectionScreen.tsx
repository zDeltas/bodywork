import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { useSettings } from '@/app/hooks/useSettings';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import OnboardingLayout from '@/app/components/onboarding/OnboardingLayout';
import { Sun, Moon, Smartphone, Check } from 'lucide-react-native';
import { colors as darkColors } from '@/app/theme/theme';
import { colors as lightColors } from '@/app/theme/lightTheme';

interface ThemeOption {
  key: 'light' | 'dark' | 'system';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  preview: {
    background: string;
    card: string;
    text: string;
    accent: string;
  };
}

const ThemeSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { nextStep, previousStep, currentStep, updateProfile } = useOnboarding();
  const { settings, updateSettings } = useSettings();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(settings.theme || 'system');
  const styles = useStyles();

  const themeOptions: ThemeOption[] = [
    {
      key: 'system',
      title: t('onboarding.themeSelection.systemTheme'),
      description: t('onboarding.themeSelection.systemDescription'),
      icon: Smartphone,
      preview: {
        background: '',
        card: '',
        text: '',
        accent: ''
      }
    },
    {
      key: 'light',
      title: t('onboarding.themeSelection.lightTheme'),
      description: t('onboarding.themeSelection.lightDescription'),
      icon: Sun,
      preview: { background: '', card: '', text: '', accent: '' }
    },
    {
      key: 'dark',
      title: t('onboarding.themeSelection.darkTheme'),
      description: t('onboarding.themeSelection.darkDescription'),
      icon: Moon,
      preview: { background: '', card: '', text: '', accent: '' }
    }
  ];

  const handleThemeSelect = async (themeKey: 'light' | 'dark' | 'system') => {
    setSelectedTheme(themeKey);
    await updateSettings({ theme: themeKey });
  };

  const handleContinue = async () => {
    await updateSettings({ theme: selectedTheme });
    updateProfile({ theme: selectedTheme });
    nextStep();
  };

  const renderThemePreview = (option: ThemeOption, extraStyle?: any) => {
    const IconComponent = option.icon;
    const isSelected = selectedTheme === option.key;

    let cardBg = theme.colors.background.card;
    let primaryText = theme.colors.text.primary;
    let secondaryText = theme.colors.text.secondary;
    let iconBg = theme.colors.background.input;
    let iconColor = theme.colors.text.primary;

    if (option.key === 'light') {
      cardBg = lightColors.background.card;
      primaryText = lightColors.text.primary;
      secondaryText = lightColors.text.secondary;
      iconBg = lightColors.background.input;
      iconColor = lightColors.text.primary;
    } else if (option.key === 'dark') {
      cardBg = darkColors.background.card;
      primaryText = darkColors.text.primary;
      secondaryText = darkColors.text.secondary;
      iconBg = darkColors.background.input;
      iconColor = darkColors.text.primary;
    }

    const borderDefault = option.key === 'light'
      ? lightColors.border.default
      : option.key === 'dark'
      ? darkColors.border.default
      : theme.colors.border.default;

    return (
      <TouchableOpacity
        key={option.key}
        style={[
          styles.themeOption,
          extraStyle,
          {
            borderColor: isSelected ? theme.colors.primary : borderDefault,
            borderWidth: isSelected ? 2 : 1,
            backgroundColor: cardBg,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${option.title}`}
        accessibilityState={{ selected: isSelected }}
        onPress={() => handleThemeSelect(option.key)}
        activeOpacity={0.7}
      >
        {}
        {isSelected && (
          <View style={[styles.selectionIndicator, { backgroundColor: theme.colors.primary }]}> 
            <Check size={16} color={theme.colors.text.onPrimary} strokeWidth={2.5} />
          </View>
        )}

        {}
        <View style={styles.mainContent}>
          {}
          <View style={styles.contentContainer}>
            {}
            <View style={[styles.iconContainer, {
              backgroundColor: isSelected ? theme.colors.primary : iconBg,
              borderColor: isSelected ? theme.colors.primary : borderDefault,
            }]}>
              <IconComponent
                size={28}
                color={isSelected ? theme.colors.text.onPrimary : iconColor}
              />
            </View>

            {}
            <Text style={[styles.themeTitle, {
              color: primaryText,
              fontWeight: isSelected ? '700' : '600'
            }]}>
              {option.title}
            </Text>

            <Text style={[styles.themeDescription, { color: secondaryText }]}>
              {option.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={8}
      title={t('onboarding.themeSelection.title')}
      showBackButton={true}
      onBack={previousStep}
      onNext={handleContinue}
      nextButtonText={t('onboarding.continue')}
      footerType="single"
    >
      <View style={styles.themeList}>
        <View>
          {renderThemePreview(themeOptions[0], styles.themeOptionFull)}
        </View>

        <View style={styles.themeRow}>
          {themeOptions.slice(1, 3).map((opt) => renderThemePreview(opt, styles.themeOptionHalf))}
        </View>
      </View>
    </OnboardingLayout>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    themeList: {
      flex: 1,
    },
    themeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginTop: theme.spacing.lg,
    },
    themeOption: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },
    themeOptionHalf: {
      flexBasis: '48%',
      flexGrow: 0,
    },
    themeOptionFull: {
      width: '100%',
    },
    selectionIndicator: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      zIndex: 1,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mainContent: {
      flexShrink: 1,
    },
    contentContainer: {
      alignItems: 'center',
      paddingTop: 0,
      paddingBottom: 0,
      width: '100%',
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
    },
    themeTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    themeDescription: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      flexShrink: 1,
      alignSelf: 'stretch',
    },
    
  });
};

export default ThemeSelectionScreen;
