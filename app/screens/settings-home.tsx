import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, View, StyleSheet } from 'react-native';
import { ChevronRight, Sparkles, CheckCircle, Circle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import Header from '@/app/components/layout/Header';
import Modal from '@/app/components/ui/Modal';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useHaptics from '@/app/hooks/useHaptics';
import { storageService } from '@/app/services';

export default function SettingsHomeScreen() {
  const { theme } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const haptics = useHaptics();

  const [profileLoading, setProfileLoading] = useState(true);
  const [showPhilosophyCard, setShowPhilosophyCard] = useState<boolean>(true);
  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false);

  // Load onboarding profile flag
  useEffect(() => {
    (async () => {
      try {
        const profile = await storageService.getOnboardingProfile();
        setShowPhilosophyCard(profile?.showPhilosophyCard ?? true);
      } catch {}
      setProfileLoading(false);
    })();
  }, []);

  const openPhilosophyModal = () => {
    setShowPhilosophyModal(true);
    haptics.impactLight();
  };

  const handleSelectPhilosophy = async (enabled: boolean) => {
    try {
      const profile = await storageService.getOnboardingProfile();
      const updated = { ...(profile || {}), showPhilosophyCard: enabled } as any;
      await storageService.setOnboardingProfile(updated);
      setShowPhilosophyCard(enabled);
      setShowPhilosophyModal(false);
      haptics.impactLight();
    } catch (e) {
      Alert.alert(t('common.error'), (e as Error)?.message || 'Failed to update setting');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('settings.title')} showBackButton={true} onBack={() => router.back()} />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>

          {/* Philosophy card visibility (only setting on this screen) */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Sparkles size={24} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>{t('onboarding.appSettings.philosophyToggle')}</Text>
            </View>
            <TouchableOpacity style={styles.settingControl} onPress={openPhilosophyModal} disabled={profileLoading}>
              {profileLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Text style={styles.settingValue}>
                  {showPhilosophyCard ? t('common.enabled') : t('common.disabled')}
                </Text>
              )}
              <ChevronRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Philosophy visibility modal */}
      <Modal
        visible={showPhilosophyModal}
        onClose={() => setShowPhilosophyModal(false)}
        title={t('onboarding.appSettings.philosophyToggle')}
        showCloseButton
      >
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectPhilosophy(true)}>
            {showPhilosophyCard ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('common.enabled')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.modalOption}>
          <TouchableOpacity style={styles.modalOptionButton} onPress={() => handleSelectPhilosophy(false)}>
            {!showPhilosophyCard ? (
              <CheckCircle size={20} color={theme.colors.primary} />
            ) : (
              <Circle size={20} color={theme.colors.text.secondary} />
            )}
            <Text style={styles.modalOptionText}>{t('common.disabled')}</Text>
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
      backgroundColor: theme.colors.background.main,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.md,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingLabel: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.md,
      fontFamily: theme.typography.fontFamily.regular,
    },
    settingControl: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingValue: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily.regular,
    },
    modalOption: {
      width: '100%',
      marginTop: theme.spacing.sm,
    },
    modalOptionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
    },
    modalOptionText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
    },
  });
};
