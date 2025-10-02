import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, ArrowRight, ExternalLink, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { useOnboarding } from '@/app/hooks/useOnboarding';

const WelcomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  
  const { profile, completeOnboarding } = useOnboarding();

  // Debug: Log profile to check if name is available
  console.log('WelcomeScreen - Profile:', profile);
  console.log('WelcomeScreen - Profile name:', profile.name);

  const handleTutorialPress = () => {
    Linking.openURL('https://gainizi.fr');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color={theme.colors.success} />
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {t('onboarding.welcome.title', { name: profile.name })}
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {t('onboarding.welcome.subtitle')}
          </Text>
        </View>

        <View style={styles.motivationCard}>
          <Text style={[styles.motivationText, { color: theme.colors.text.secondary }]}>
            {t('onboarding.welcome.motivation')}
          </Text>
        </View>

        <View style={styles.tutorialCard}>
          <View style={styles.tutorialIcon}>
            <BookOpen size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.tutorialTitle, { color: theme.colors.text.primary }]}>
            {t('onboarding.welcome.tutorialTitle')}
          </Text>
          <Text style={[styles.tutorialDescription, { color: theme.colors.text.secondary }]}>
            {t('onboarding.welcome.tutorialDescription')}
          </Text>
          <TouchableOpacity
            style={[
              styles.tutorialButton,
              {
                borderColor: theme.colors.primary,
              }
            ]}
            onPress={handleTutorialPress}
          >
            <Text style={[styles.tutorialButtonText, { color: theme.colors.primary }]}>
              {t('onboarding.welcome.tutorialLink')}
            </Text>
            <ExternalLink size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            {
              backgroundColor: theme.colors.primary,
            }
          ]}
          onPress={completeOnboarding}
        >
          <Text style={[styles.startButtonText, { color: theme.colors.text.onPrimary }]}>
            {t('onboarding.welcome.startJourney')}
          </Text>
          <ArrowRight size={20} color={theme.colors.text.onPrimary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: theme.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    successIcon: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.lg,
    },
    motivationCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    tutorialCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    tutorialIcon: {
      marginBottom: theme.spacing.md,
    },
    tutorialTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    tutorialDescription: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
      marginBottom: theme.spacing.lg,
    },
    tutorialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      gap: theme.spacing.sm,
    },
    tutorialButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    motivationText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    footer: {
      padding: theme.spacing.lg,
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
      ...theme.shadows.md,
    },
    startButtonText: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
};

export default WelcomeScreen;
