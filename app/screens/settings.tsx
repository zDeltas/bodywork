import React, { useEffect, useState } from 'react';
import { Animated, ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ChevronRight, Scale, Languages, SunMoon, Download, Trash2, Linkedin, Mail, CheckCircle, Circle } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSettings } from '@/app/hooks/useSettings';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { useCSVExport } from '@/app/hooks/useCSVExport';
import Header from '@/app/components/layout/Header';
import Modal from '@/app/components/ui/Modal';
import FeedbackModal from '@/app/components/feedback/FeedbackModal';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';
import { TranslationKey } from '@/translations';
import { StatsCardSkeleton } from '@/app/components/ui/SkeletonComponents';
import { storageService } from '@/app/services';
import useHaptics from '@/app/hooks/useHaptics';

export default function SettingsScreen() {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const { isExporting, exportWorkoutsToCSV } = useCSVExport();
  const styles = useStyles();
  const [showAbout, setShowAbout] = useState(false);
  const [showRpeModeModal, setShowRpeModeModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showWeightUnitModal, setShowWeightUnitModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const haptics = useHaptics();
  const fadeAnim = useState(new Animated.Value(0))[0];
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  // Auto-open feedback modal if pending prompt is scheduled
  useEffect(() => {
    (async () => {
      const state = await storageService.getFeedbackState();
      if (state?.pendingPrompt) {
        setShowFeedbackModal(true);
      }
    })();
  }, []);

  

  const openWeightUnitModal = () => {
    setShowWeightUnitModal(true);
    haptics.impactLight();
  };

  const openGenderModal = () => {
    setShowGenderModal(true);
    haptics.impactLight();
  };

  const openLanguageModal = () => {
    setShowLanguageModal(true);
    haptics.impactLight();
  };

  const openThemeModal = () => {
    setShowThemeModal(true);
    haptics.impactLight();
  };

  const openRpeModeModal = () => {
    setShowRpeModeModal(true);
    haptics.impactLight();
  };

  const handleSelectRpeMode = async (mode: 'ask' | 'never') => {
    await updateSettings({ rpeMode: mode });
    setShowRpeModeModal(false);
    haptics.impactLight();
  };

  const handleSelectGender = async (gender: 'male' | 'female') => {
    await updateSettings({ gender });
    setShowGenderModal(false);
    haptics.impactLight();
  };

  const handleSelectWeightUnit = async (unit: 'kg' | 'lb') => {
    await updateSettings({ weightUnit: unit });
    setShowWeightUnitModal(false);
    haptics.impactLight();
  };

  const handleSelectLanguage = async (lng: 'en' | 'fr') => {
    await updateSettings({ language: lng });
    setShowLanguageModal(false);
    haptics.impactLight();
  };

  const handleSelectTheme = async (mode: 'dark' | 'light') => {
    await updateSettings({ theme: mode });
    setShowThemeModal(false);
    haptics.impactLight();
  };

  const toggleAbout = () => {
    setShowAbout(!showAbout);
    haptics.impactLight();
  };

  const handleResetData = async () => {
    try {
      await storageService.resetAllData();

      Alert.alert(t('settings.resetDataSuccess' as TranslationKey), '', [{ text: 'OK' }]);

      await updateSettings(settings);
    } catch (error) {
      Alert.alert(
        t('settings.errorResettingData'),
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  const handleExportData = async () => {
    haptics.impactLight();
    const result = await exportWorkoutsToCSV();
    if (!result.success) {
      Alert.alert(t('common.error'), result.message);
    }
  };

  const openFeedbackModal = () => {
    setShowFeedbackModal(true);
    haptics.impactLight();
  };

  const closeFeedbackModal = async () => {
    setShowFeedbackModal(false);
    try { await storageService.clearFeedbackPendingPrompt(); } catch {}
  };



  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('settings.title')} showBackButton={true} onBack={() => router.back()} />
      {isLoading ? (
        <View style={styles.content}>
          <View style={styles.section}>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </View>
        </View>
      ) : (
        <Animated.ScrollView style={[styles.content, { opacity: fadeAnim }]} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
            
            <TouchableOpacity
              style={styles.featureCard}
              onPress={openRpeModeModal}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <User size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('settings.rpeMode')}</Text>
                <Text style={styles.featureDesc}>
                  {settings.rpeMode === 'never' ? t('settings.rpeNever') : t('settings.rpeAsk')}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={openGenderModal}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <User size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('settings.gender')}</Text>
                <Text style={styles.featureDesc}>
                  {settings.gender === 'male' ? t('settings.male') : t('settings.female')}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={openWeightUnitModal}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                <Scale size={24} color={theme.colors.success} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('settings.weightUnit')}</Text>
                <Text style={styles.featureDesc}>{settings.weightUnit.toUpperCase()}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={openLanguageModal}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Languages size={24} color={theme.colors.secondary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('settings.language')}</Text>
                <Text style={styles.featureDesc}>
                  {settings.language === 'en' ? t('settings.english') : t('settings.french')}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={openThemeModal}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.warning + '15' }]}>
                <SunMoon size={24} color={theme.colors.warning} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('settings.theme')}</Text>
                <Text style={styles.featureDesc}>
                  {settings.theme === 'dark' ? t('settings.dark') : t('settings.light')}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.application')}</Text>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={openFeedbackModal}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                <Mail size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>
                  {language === 'fr' ? 'Donner un avis' : 'Give Feedback'}
                </Text>
                <Text style={styles.featureDesc}>
                  {language === 'fr' ? 'Partager votre expérience' : 'Share your experience'}
                </Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featureCard, styles.highlightCard]}
              onPress={handleExportData}
              disabled={isExporting}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
                <Download size={24} color={theme.colors.secondary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('settings.exportData')}</Text>
                <Text style={styles.featureDesc}>{t('settings.exportToCSV')}</Text>
              </View>
              {isExporting ? (
                <ActivityIndicator size="small" color={theme.colors.secondary} />
              ) : (
                <ChevronRight size={20} color={theme.colors.text.tertiary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.featureCard, styles.dangerCard]}
              onPress={handleResetData}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.error + '15' }]}>
                <Trash2 size={24} color={theme.colors.error} />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: theme.colors.error }]}>
                  {t('settings.resetData')}
                </Text>
                <Text style={styles.featureDesc}>{t('settings.resetDataConfirmation')}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              onPress={toggleAbout}
              activeOpacity={0.7}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.text.secondary + '10' }]}>
                <Mail size={24} color={theme.colors.text.primary} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{t('settings.about')}</Text>
                <Text style={styles.featureDesc}>{t('about.version')}</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.text.tertiary} />
            </TouchableOpacity>

          </View>

          {showAbout && (
            <BlurView intensity={20} style={styles.aboutContainer}>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutTitle}>{t('about.title')}</Text>
                <Text style={styles.aboutVersion}>{t('about.version')}</Text>
                <Text style={styles.aboutDescription}>{t('about.description')}</Text>

                <View style={styles.aboutDivider} />

                <Text style={styles.aboutDeveloper}>{t('about.developer')}</Text>

                <TouchableOpacity
                  style={styles.aboutLink}
                  onPress={() =>
                    Linking.openURL('https://www.linkedin.com/in/damien-le-borgne-997b991a1/')
                  }
                >
                  <Linkedin size={20} color={theme.colors.primary} />
                  <Text style={styles.aboutLinkText}>Linkedin</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeButton} onPress={toggleAbout}>
                  <Text style={styles.closeButtonText}>{t('common.close')}</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
        </Animated.ScrollView>
      )}

      <Modal
        visible={showRpeModeModal}
        onClose={() => setShowRpeModeModal(false)}
        title={t('settings.rpeMode')}
        showCloseButton
      >
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectRpeMode('ask')}>
            {settings.rpeMode === 'ask' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('settings.rpeAsk')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectRpeMode('never')}>
            {settings.rpeMode === 'never' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('settings.rpeNever')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <FeedbackModal visible={showFeedbackModal} onClose={closeFeedbackModal} />

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        title={t('settings.gender')}
        showCloseButton
      >
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectGender('male')}>
            {settings.gender === 'male' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('settings.male')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectGender('female')}>
            {settings.gender === 'female' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('settings.female')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Weight Unit Selection Modal */}
      <Modal
        visible={showWeightUnitModal}
        onClose={() => setShowWeightUnitModal(false)}
        title={t('settings.weightUnit')}
        showCloseButton
      >
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectWeightUnit('kg')}>
            {settings.weightUnit === 'kg' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>KG</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectWeightUnit('lb')}>
            {settings.weightUnit === 'lb' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>LB</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t('settings.language')}
        showCloseButton
      >
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectLanguage('en')}>
            {settings.language === 'en' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('settings.english')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectLanguage('fr')}>
            {settings.language === 'fr' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('settings.french')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        title={t('settings.theme')}
        showCloseButton
      >
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectTheme('dark')}>
            {settings.theme === 'dark' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('settings.dark')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectTheme('light')}>
            {settings.theme === 'light' ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('settings.light')}</Text>
          </TouchableOpacity>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.main
    },
    loadingText: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular
    },
    content: {
      flex: 1
    },
    contentContainer: {
      padding: theme.spacing.lg,
      paddingBottom: 100
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
    dangerCard: {
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.error
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
    aboutContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg
    },
    aboutContent: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '90%',
      maxWidth: 500,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      ...theme.shadows.lg
    },
    aboutTitle: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs
    },
    aboutVersion: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fontFamily.regular
    },
    aboutDescription: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular
    },
    aboutDivider: {
      height: 1,
      backgroundColor: theme.colors.border.default,
      width: '100%',
      marginVertical: theme.spacing.lg
    },
    aboutDeveloper: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fontFamily.regular
    },
    aboutLink: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm
    },
    aboutLinkText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      marginLeft: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    closeButton: {
      marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md
    },
    closeButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    modalOption: {
      width: '100%',
      marginTop: theme.spacing.sm
    },
    modalOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md
    },
    modalOptionText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular
    }
  });
};

