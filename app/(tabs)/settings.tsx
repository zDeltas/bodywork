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
          <ActivityIndicator size="large" color="#fd8f09" />
          <Text style={styles.loadingText}>{t('loadingSettings')}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('preferences')}</Text>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="body-outline" size={24} color="#fd8f09" />
                <Text style={styles.settingLabel}>{t('gender')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.settingControl} 
                onPress={toggleGender}
              >
                <Text style={styles.settingValue}>
                  {settings.gender === 'male' ? t('male') : t('female')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="scale-outline" size={24} color="#fd8f09" />
                <Text style={styles.settingLabel}>{t('weightUnit')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.settingControl} 
                onPress={toggleWeightUnit}
              >
                <Text style={styles.settingValue}>{settings.weightUnit.toUpperCase()}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={24} color="#fd8f09" />
                <Text style={styles.settingLabel}>{t('language')}</Text>
              </View>
              <TouchableOpacity 
                style={styles.settingControl} 
                onPress={toggleLanguage}
              >
                <Text style={styles.settingValue}>
                  {settings.language === 'en' ? t('english') : t('french')}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
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
                <Ionicons name="information-circle-outline" size={24} color="#fd8f09" />
                <Text style={styles.settingLabel}>{t('about')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
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
                  onPress={() => Linking.openURL('https://github.com')}
                >
                  <Ionicons name="logo-github" size={20} color="#fd8f09" />
                  <Text style={styles.aboutLinkText}>GitHub</Text>
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
    backgroundColor: '#121212',
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fd8f09',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#999',
    marginRight: 10,
  },
  aboutContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  aboutContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  aboutVersion: {
    fontSize: 16,
    color: '#999',
    marginBottom: 15,
  },
  aboutDescription: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  aboutDivider: {
    height: 1,
    backgroundColor: '#333',
    width: '100%',
    marginVertical: 20,
  },
  aboutDeveloper: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 15,
  },
  aboutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  aboutLinkText: {
    fontSize: 16,
    color: '#fd8f09',
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fd8f09',
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
