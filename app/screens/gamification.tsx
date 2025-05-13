import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';

function GamificationScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('profile.challenges.title')}
        showBackButton={true}
        onBack={() => router.back()}
      />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Défis en cours</Text>
          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Ionicons name="fitness-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.challengeName}>Défi de la semaine</Text>
            </View>
            <View style={styles.challengeProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
              <Text style={styles.progressText}>3/5 séances</Text>
            </View>
          </View>

          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Ionicons name="barbell-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.challengeName}>Force maximale</Text>
            </View>
            <View style={styles.challengeProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '40%' }]} />
              </View>
              <Text style={styles.progressText}>2/5 objectifs</Text>
            </View>
          </View>

          <View style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.challengeName}>Régularité</Text>
            </View>
            <View style={styles.challengeProgress}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '80%' }]} />
              </View>
              <Text style={styles.progressText}>4/5 semaines</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récompenses</Text>
          <View style={styles.badgesContainer}>
            <View style={styles.badgeItem}>
              <View style={[styles.badgeIcon, { backgroundColor: theme.colors.background.card }]}>
                <Ionicons name="trophy-outline" size={32} color={theme.colors.text.secondary} />
              </View>
              <Text style={styles.badgeLabel}>{t('profile.challenges.comingSoon')}</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={[styles.badgeIcon, { backgroundColor: theme.colors.background.card }]}>
                <Ionicons name="star-outline" size={32} color={theme.colors.text.secondary} />
              </View>
              <Text style={styles.badgeLabel}>{t('profile.challenges.comingSoon')}</Text>
            </View>
            <View style={styles.badgeItem}>
              <View style={[styles.badgeIcon, { backgroundColor: theme.colors.background.card }]}>
                <Ionicons name="flame-outline" size={32} color={theme.colors.text.secondary} />
              </View>
              <Text style={styles.badgeLabel}>{t('profile.challenges.comingSoon')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    challengeCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    challengeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md
    },
    challengeName: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.md
    },
    challengeProgress: {
      marginTop: theme.spacing.sm
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.background.main,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full
    },
    progressText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      textAlign: 'right'
    },
    badgesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.lg
    },
    badgeItem: {
      alignItems: 'center'
    },
    badgeIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    badgeLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular
    }
  });
};

export default GamificationScreen;
