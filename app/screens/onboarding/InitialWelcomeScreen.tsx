import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, NativeModules, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Dumbbell, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/app/hooks/useTheme';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { useSettings } from '@/app/hooks/useSettings';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

const getSystemLanguage = (): 'fr' | 'en' => {
  try {
    let locale = 'fr';

    try {
      const dtf = new Intl.DateTimeFormat();
      locale = dtf.resolvedOptions().locale;
    } catch (intlError) {
      console.log('Intl.DateTimeFormat non disponible, utilisation des NativeModules');

      if (Platform.OS === 'ios') {
        locale = NativeModules.SettingsManager?.settings?.AppleLocale || 
                 NativeModules.SettingsManager?.settings?.AppleLanguages?.[0] || 'fr';
      } else if (Platform.OS === 'android') {
        locale = NativeModules.I18nManager?.localeIdentifier || 'fr';
      }
    }

    const languageCode = locale.split('-')[0].toLowerCase();

    return languageCode === 'en' ? 'en' : 'fr';
  } catch (error) {
    console.log('Erreur lors de la détection de langue:', error);
    return 'fr';
  }
};


const InitialWelcomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { nextStep, previousStep, currentStep, updateProfile } = useOnboarding();
  const { updateSettings } = useSettings();
  const styles = useStyles();

  useEffect(() => {
    const systemLanguage = getSystemLanguage();
    updateSettings({ language: systemLanguage });
    updateProfile({ language: systemLanguage });
  }, [updateSettings, updateProfile]);

  const handleContinue = () => {
    nextStep();
  };

  return (
    <ImageBackground
      source={require('@/assets/images/auth/download.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={previousStep}
          >
            <ArrowLeft size={24} color={theme.colors.text.onPrimary} />
          </TouchableOpacity>
        )}

        <View style={styles.overlay} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Dumbbell size={48} color={theme.colors.primary} />
            </View>
            
            <Text style={[styles.title, { color: theme.colors.text.onPrimary }]}>
              {t('onboarding.initialWelcome.title')}
            </Text>
            
            <Text style={[styles.subtitle, { color: theme.colors.text.onPrimary }]}>
              {t('onboarding.initialWelcome.subtitle')}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: theme.colors.primary,
              }
            ]}
            onPress={handleContinue}
          >
            <Text style={[styles.continueButtonText, { color: theme.colors.text.onPrimary }]}>
              {t('onboarding.initialWelcome.buttonText')}
            </Text>
            <ArrowRight size={20} color={theme.colors.text.onPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    backgroundImage: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    container: {
      flex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Overlay sombre pour la lisibilité
    },
    goBackButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
      zIndex: 2,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      zIndex: 1,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: theme.borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      ...theme.shadows.lg,
    },
    title: {
      fontSize: theme.typography.fontSize['4xl'],
      fontFamily: theme.typography.fontFamily.bold,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.xl,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      alignItems: 'center',
      zIndex: 1,
    },
    continueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
      minWidth: 280,
      ...theme.shadows.lg,
    },
    continueButtonText: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
};

export default InitialWelcomeScreen;
