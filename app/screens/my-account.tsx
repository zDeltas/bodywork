import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';
import { Wrench } from 'lucide-react-native';

function MyAccountScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('profile.myAccount')} showBackButton={true} onBack={() => router.back()} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.constructionContainer}>
          <Wrench size={64} color={theme.colors.primary} />
          <Text style={styles.constructionTitle}>{t('common.inConstruction')}</Text>
          <Text style={styles.constructionText}>{t('common.featureComingSoon')}</Text>
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
      flex: 1
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg
    },
    constructionContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl
    },
    constructionTitle: {
      fontSize: theme.typography.fontSize.xl,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily.bold,
      textAlign: 'center'
    },
    constructionText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.regular
    }
  });
};

export default MyAccountScreen;
