import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/hooks/useTranslation';
import { Language, languages, getLanguageName } from '@/translations';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

export default function SettingsScreen() {
  const { settings, updateSettings, isLoading } = useSettings();
  const { t, language } = useTranslation();
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

  const toggleAbout = () => {
    setShowAbout(!showAbout);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loadingSettings')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('preferences')}</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="body-outline" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>{t('gender')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.settingControl} 
                onPress={toggleGender}
              >
                <Text style={styles.settingValue}>
                  {settings.gender === 'male' ? t('male') : t('female')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="scale-outline" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>{t('weightUnit')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.settingControl} 
                onPress={toggleWeightUnit}
              >
                <Text style={styles.settingValue}>{settings.weightUnit.toUpperCase()}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>{t('language')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.settingControl} 
                onPress={toggleLanguage}
              >
                <Text style={styles.settingValue}>
                  {settings.language === 'en' ? t('english') : t('french')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('application')}</Text>

            <TouchableOpacity 
              style={styles.settingItem} 
              onPress={toggleAbout}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.settingLabel}>{t('about')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {showAbout && (
            <BlurView intensity={20} style={styles.aboutContainer}>
              <View style={styles.aboutContent}>
                <Text style={styles.aboutTitle}>{t('aboutTitle')}</Text>
                <Text style={styles.aboutVersion}>{t('aboutVersion')}</Text>
                <Text style={styles.aboutDescription}>
                  {t('aboutDescription')}
                </Text>

                <View style={styles.aboutDivider} />

                <Text style={styles.aboutDeveloper}>{t('aboutDeveloper')}</Text>

                <TouchableOpacity
                  style={styles.aboutLink}
                  onPress={() => Linking.openURL('https://www.linkedin.com/in/damien-le-borgne-997b991a1/')}
                >
                  <Ionicons name="logo-linkedin" size={20} color={colors.primary} />
                  <Text style={styles.aboutLinkText}>Linkedin</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={toggleAbout}
                >
                  <Text style={styles.closeButtonText}>{t('close')}</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.background.card,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.main,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginLeft: spacing.md,
    fontFamily: typography.fontFamily.regular,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginRight: spacing.sm,
    fontFamily: typography.fontFamily.regular,
  },
  aboutContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  aboutContent: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
    ...theme.shadows.lg,
  },
  aboutTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  aboutVersion: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.regular,
  },
  aboutDescription: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    width: '100%',
    marginVertical: spacing.lg,
  },
  aboutDeveloper: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontFamily: typography.fontFamily.regular,
  },
  aboutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aboutLinkText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
  closeButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  closeButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
});
