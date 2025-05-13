import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { useAuth } from '@/app/hooks/useAuth';
import Header from '@/app/components/layout/Header';
import Text from '@/app/components/ui/Text';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  subLabel?: string;
  variant?: 'primary' | 'secondary' | 'default';
}

const SettingItem = ({ icon, label, onPress, subLabel, variant = 'default' }: SettingItemProps) => {
  const { theme } = useTheme();
  const styles = useStyles();

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.text.secondary;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        variant === 'primary' && styles.settingItemPrimary,
        variant === 'secondary' && styles.settingItemSecondary,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={styles.settingInfo}>
        <Ionicons name={icon} size={24} color={getIconColor()} />
        {subLabel ? (
          <View>
            <Text
              style={[
                styles.settingLabel,
                variant === 'primary' && styles.settingLabelPrimary,
                variant === 'secondary' && styles.settingLabelSecondary,
              ]}
            >
              {label}
            </Text>
            <Text style={styles.settingSubLabel}>{subLabel}</Text>
          </View>
        ) : (
          <Text
            style={[
              styles.settingLabel,
              variant === 'primary' && styles.settingLabelPrimary,
              variant === 'secondary' && styles.settingLabelSecondary,
            ]}
          >
            {label}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={getIconColor()} />
    </TouchableOpacity>
  );
};

function ProfileScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [showInstagramModal, setShowInstagramModal] = useState(false);
  const { signInWithGoogle, signInWithApple, signOut, user } = useAuth();

  const openInstagram = async (useApp: boolean) => {
    const instagramUrl = 'instagram://user?username=gainiziapp';
    const webUrl = 'https://www.instagram.com/gainiziapp/';

    try {
      if (useApp) {
        const canOpen = await Linking.canOpenURL(instagramUrl);
        if (canOpen) {
          await Linking.openURL(instagramUrl);
        } else {
          await Linking.openURL(webUrl);
        }
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Could not open Instagram');
    }
    setShowInstagramModal(false);
  };

  const handleSignIn = async (method: 'google' | 'apple' | 'email') => {
    try {
      switch (method) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'apple':
          await signInWithApple();
          break;
        case 'email':
          // TODO: Implement email sign in
          break;
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Authentication failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('profile.title')} showBackButton={true} onBack={() => router.back()} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.auth.title')}</Text>
          <Text style={styles.sectionDescription}>{t('profile.auth.description')}</Text>

          {!user ? (
            <>
              <SettingItem
                icon="logo-google"
                label={t('profile.auth.continueWithGoogle')}
                onPress={() => handleSignIn('google')}
                variant="primary"
              />
              <SettingItem
                icon="logo-apple"
                label={t('profile.auth.continueWithApple')}
                onPress={() => handleSignIn('apple')}
                variant="primary"
              />
              <SettingItem
                icon="mail-outline"
                label={t('profile.auth.continueWithEmail')}
                onPress={() => handleSignIn('email')}
                variant="primary"
              />
            </>
          ) : (
            <>
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              <SettingItem
                icon="log-out-outline"
                label={t('profile.auth.signOut')}
                onPress={signOut}
                variant="secondary"
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
          <SettingItem
            icon="person-outline"
            label={t('profile.myAccount')}
            onPress={() => router.push('/screens/my-account')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.challenges.title')}</Text>
          <SettingItem
            icon="trophy-outline"
            label={t('profile.challenges.title')}
            onPress={() => router.push('/screens/gamification')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.social')}</Text>
          <SettingItem
            icon="logo-instagram"
            label={t('profile.instagram')}
            subLabel={t('profile.instagramHandle')}
            onPress={() => setShowInstagramModal(true)}
          />
          <SettingItem
            icon="share-social-outline"
            label={t('profile.share')}
            onPress={() => {
              /* TODO: Implement share functionality */
            }}
          />
          <SettingItem
            icon="star-outline"
            label={t('profile.rate')}
            onPress={() => {
              /* TODO: Implement rating functionality */
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
          <SettingItem
            icon="settings-outline"
            label={t('profile.appSettings')}
            onPress={() => router.push('/screens/settings')}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showInstagramModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInstagramModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.instagramModal.title')}</Text>
            <Text style={styles.modalMessage}>{t('profile.instagramModal.message')}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowInstagramModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text.secondary }]}>
                  {t('profile.instagramModal.later')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => openInstagram(true)}
              >
                <Text style={styles.modalButtonText}>{t('profile.instagramModal.follow')}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    contentContainer: {
      paddingBottom: 100,
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
    sectionDescription: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.lg,
      fontFamily: theme.typography.fontFamily.regular,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    settingItemPrimary: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      borderBottomWidth: 0,
      padding: theme.spacing.md,
    },
    settingItemSecondary: {
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
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
    settingLabelPrimary: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    settingLabelSecondary: {
      color: theme.colors.text.secondary,
    },
    settingSubLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.md,
      fontFamily: theme.typography.fontFamily.regular,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    modalMessage: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },
    modalButtons: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    modalButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 120,
    },
    modalButtonPrimary: {
      backgroundColor: theme.colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    modalButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary,
    },
    userInfo: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.md,
    },
    userEmail: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
    },
  });
};

export default ProfileScreen;
