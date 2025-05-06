import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { useCSVExport } from '@/hooks/useCSVExport';
import Header from '@/app/components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const { isExporting, exportWorkoutsToCSV } = useCSVExport();
  const styles = useStyles();
  const [showAbout, setShowAbout] = useState(false);

  const toggleWeightUnit = () => {
    const newUnit = settings.weightUnit === 'kg' ? 'lb' : 'kg';
    updateSettings({ weightUnit: newUnit as 'kg' | 'lb' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleGender = () => {
    const newGender = settings.gender === 'male' ? 'female' : 'male';
    updateSettings({ gender: newGender as 'male' | 'female' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleLanguage = () => {
    const newLanguage = settings.language === 'en' ? 'fr' : 'en';
    updateSettings({ language: newLanguage as 'en' | 'fr' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme as 'dark' | 'light' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleAbout = () => {
    setShowAbout(!showAbout);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('settings.title')} showBackButton={false} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('settings.loadingSettings')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="body-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.settingLabel}>{t('settings.gender')}</Text>
              </View>
              <TouchableOpacity
                style={styles.settingControl}
                onPress={toggleGender}
              >
                <Text style={styles.settingValue}>
                  {settings.gender === 'male' ? t('settings.male') : t('settings.female')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="scale-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.settingLabel}>{t('settings.weightUnit')}</Text>
              </View>
              <TouchableOpacity
                style={styles.settingControl}
                onPress={toggleWeightUnit}
              >
                <Text style={styles.settingValue}>{settings.weightUnit.toUpperCase()}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.settingLabel}>{t('settings.language')}</Text>
              </View>
              <TouchableOpacity
                style={styles.settingControl}
                onPress={toggleLanguage}
              >
                <Text style={styles.settingValue}>
                  {settings.language === 'en' ? t('settings.english') : t('settings.french')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="contrast-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.settingLabel}>{t('settings.theme')}</Text>
              </View>
              <TouchableOpacity
                style={styles.settingControl}
                onPress={toggleTheme}
              >
                <Text style={styles.settingValue}>
                  {settings.theme === 'dark' ? t('settings.dark') : t('settings.light')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.application')}</Text>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const result = await exportWorkoutsToCSV();
                if (!result.success) {
                  Alert.alert(t('common.error'), result.message);
                }
              }}
              disabled={isExporting}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="download-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.settingLabel}>{t('settings.exportData')}</Text>
              </View>
              {isExporting ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                Alert.alert(
                  t('settings.resetData'),
                  t('settings.resetDataConfirmation'),
                  [
                    {
                      text: t('common.cancel'),
                      style: 'cancel'
                    },
                    {
                      text: t('common.reset'),
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          // Afficher les données actuelles avant suppression
                          const workouts = await AsyncStorage.getItem('workouts');
                          const goals = await AsyncStorage.getItem('goals');
                          const measurements = await AsyncStorage.getItem('bodyMeasurements');
                          const favorites = await AsyncStorage.getItem('favoriteExercises');
                          const recent = await AsyncStorage.getItem('recentExercises');
                          const settings = await AsyncStorage.getItem('bodywork_settings');

                          console.log('Données avant suppression:');
                          console.log('Workouts:', workouts);
                          console.log('Goals:', goals);
                          console.log('Measurements:', measurements);
                          console.log('Favorites:', favorites);
                          console.log('Recent:', recent);
                          console.log('Settings:', settings);

                          // Supprimer TOUTES les données
                          await AsyncStorage.clear();

                          // Vérifier que les données ont bien été supprimées
                          const workoutsAfter = await AsyncStorage.getItem('workouts');
                          const goalsAfter = await AsyncStorage.getItem('goals');
                          const measurementsAfter = await AsyncStorage.getItem('bodyMeasurements');
                          const favoritesAfter = await AsyncStorage.getItem('favoriteExercises');
                          const recentAfter = await AsyncStorage.getItem('recentExercises');
                          const settingsAfter = await AsyncStorage.getItem('bodywork_settings');

                          console.log('Données après suppression:');
                          console.log('Workouts:', workoutsAfter);
                          console.log('Goals:', goalsAfter);
                          console.log('Measurements:', measurementsAfter);
                          console.log('Favorites:', favoritesAfter);
                          console.log('Recent:', recentAfter);
                          console.log('Settings:', settingsAfter);

                          // Forcer le rechargement des paramètres
                          updateSettings({
                            weightUnit: 'kg',
                            gender: 'male',
                            language: 'fr',
                            theme: 'dark'
                          });

                          Alert.alert(t('common.success'), t('settings.dataResetSuccess'));
                        } catch (error) {
                          console.error('Erreur lors de la réinitialisation:', error);
                          Alert.alert(t('common.error'), t('settings.errorResettingData'));
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
                <Text style={[styles.settingLabel, { color: theme.colors.error }]}>{t('settings.resetData')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingItem}
              onPress={toggleAbout}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
                <Text style={styles.settingLabel}>{t('settings.about')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {showAbout && (
            <BlurView intensity={20} style={styles.aboutContainer}>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutTitle}>{t('about.title')}</Text>
                <Text style={styles.aboutVersion}>{t('about.version')}</Text>
                <Text style={styles.aboutDescription}>
                  {t('about.description')}
                </Text>

                <View style={styles.aboutDivider} />

                <Text style={styles.aboutDeveloper}>{t('about.developer')}</Text>

                <TouchableOpacity
                  style={styles.aboutLink}
                  onPress={() => Linking.openURL('https://www.linkedin.com/in/damien-le-borgne-997b991a1/')}
                >
                  <Ionicons name="logo-linkedin" size={20} color={theme.colors.primary} />
                  <Text style={styles.aboutLinkText}>Linkedin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleAbout}
                >
                  <Text style={styles.closeButtonText}>{t('common.close')}</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Define styles using the current theme
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
      flex: 1,
      padding: theme.spacing.lg
    },
    section: {
      marginBottom: theme.spacing.xl
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.md
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
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
    settingControl: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    settingValue: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily.regular
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
    }
  });
};
