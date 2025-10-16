import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';

export default function MyAccountScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={t('profile.myAccount')} 
        showBackButton={true} 
        onBack={() => router.back()} 
      />
      
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.messageContainer}>
          <Text variant="heading" style={styles.messageTitle}>
            {t('profile.myAccount')}
          </Text>
          <Text variant="body" style={styles.messageText}>
            L'authentification a été supprimée du projet.
          </Text>
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
      backgroundColor: theme.colors.background.main,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      flexGrow: 1,
      padding: theme.spacing.lg,
    },
    messageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    messageTitle: {
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    messageText: {
      textAlign: 'center',
      color: theme.colors.text.secondary,
    },
  });
};
