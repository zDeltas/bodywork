import React from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';
import Button from '@/app/components/ui/Button';
import useGoogleAuth from '@/app/hooks/useGoogleAuth';
import { useAuth } from '@/app/contexts/AuthContext';

export default function MyAccountScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const { loading, error, signIn, isAuthenticated, user } = useGoogleAuth();
  const { signOut, isLoading: authLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('[MyAccount] Sign out error:', error);
    }
  };

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
        {!isAuthenticated ? (
          <View style={styles.messageContainer}>
            <Text variant="heading" style={styles.messageTitle}>
              {t('profile.auth.title')}
            </Text>
            <Text variant="body" style={styles.messageText}>
              {t('profile.auth.description')}
            </Text>

            <View style={{ height: theme.spacing.xl }} />

            <Button 
              title={t('profile.auth.continueWithGoogle')} 
              onPress={signIn}
              variant="secondary"
              disabled={loading}
            />

            {loading && (
              <View style={{ marginTop: theme.spacing.md }}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text variant="caption" style={styles.loadingText}>
                  Connexion en cours...
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text variant="caption" style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.profileContainer}>
            {user?.picture && (
              <Image 
                source={{ uri: user.picture }} 
                style={styles.profilePicture}
              />
            )}
            
            <Text variant="heading" style={styles.userName}>
              {user?.name || 'Utilisateur'}
            </Text>
            
            <Text variant="body" style={styles.userEmail}>
              {user?.email}
            </Text>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text variant="caption" style={styles.statusText}>
                Connecté avec Google
              </Text>
            </View>

            <View style={{ height: theme.spacing.xl }} />

            <Button 
              title="Se déconnecter"
              onPress={handleSignOut}
              variant="outline"
              disabled={authLoading}
            />

            {authLoading && (
              <View style={{ marginTop: theme.spacing.md }}>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            )}
          </View>
        )}
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
      marginBottom: theme.spacing.lg,
    },
    loadingText: {
      textAlign: 'center',
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
    errorContainer: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.text.accent,
    },
    errorText: {
      color: theme.colors.text.warning,
      textAlign: 'center',
    },
    profileContainer: {
      flex: 1,
      alignItems: 'center',
      paddingTop: theme.spacing['3xl'],
      paddingHorizontal: theme.spacing.xl,
    },
    profilePicture: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: theme.spacing.lg,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    userName: {
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    userEmail: {
      textAlign: 'center',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      marginTop: theme.spacing.sm,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.success,
      marginRight: theme.spacing.sm,
    },
    statusText: {
      color: theme.colors.text.secondary,
    },
  });
};
