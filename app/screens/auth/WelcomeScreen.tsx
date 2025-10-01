import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useAuth from '@/app/hooks/useAuth';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import Text from '@/app/components/ui/Text';
import AnimatedAuthCard from '@/app/components/auth/AnimatedAuthCard';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const WelcomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signInWithGoogle, signInWithApple, signInWithEmail, isLoading } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [submitting, setSubmitting] = useState<'google' | 'apple' | 'email' | null>(null);
  const styles = useStyles();

  const handleGoogleSignIn = async () => {
    setSubmitting('google');
    try {
      const result = await signInWithGoogle();
      if (result.started) {
        showSuccess('Redirection vers Google...');
      } else {
        showError(result.error || 'Erreur lors de la connexion Google');
      }
    } catch (error) {
      showError('Erreur lors de la connexion Google');
    } finally {
      setSubmitting(null);
    }
  };

  const handleAppleSignIn = async () => {
    setSubmitting('apple');
    try {
      const result = await signInWithApple();
      if (result.started) {
        showSuccess('Redirection vers Apple...');
      } else {
        showError(result.error || 'Erreur lors de la connexion Apple');
      }
    } catch (error) {
      showError('Erreur lors de la connexion Apple');
    } finally {
      setSubmitting(null);
    }
  };

  const handleEmailSignIn = () => {
    router.push('/screens/auth/LoginScreen?mode=signup');
  };

  const handleLoginRedirect = () => {
    router.push('/screens/auth/LoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <AnimatedAuthCard visible={true} style={styles.content}>
          {/* App Logo and Branding */}
          <View style={styles.brandingContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Text style={styles.logoText}>💪</Text>
              </View>
              <Text style={styles.appName}>Bodywork</Text>
            </View>
            
            <Text style={styles.welcomeTitle}>
              Rejoignez-nous pour atteindre vos objectifs fitness
            </Text>
            <Text style={styles.welcomeSubtitle}>
              Suivez vos entraînements, progressez et partagez vos succès avec des millions d'athlètes passionnés
            </Text>
          </View>

          {/* Auth Buttons */}
          <View style={styles.authButtonsContainer}>
            {/* Google Sign-In */}
            <TouchableOpacity
              style={[styles.authButton, styles.googleButton]}
              onPress={handleGoogleSignIn}
              disabled={!!submitting}
            >
              {submitting === 'google' ? (
                <ActivityIndicator color="#1a1a1a" size="small" />
              ) : (
                <>
                  <AntDesign name="google" size={20} color="#1a1a1a" />
                  <Text style={[styles.authButtonText, styles.googleButtonText]}>
                    CONTINUER AVEC GOOGLE
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple Sign-In */}
            <TouchableOpacity
              style={[styles.authButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              disabled={!!submitting}
            >
              {submitting === 'apple' ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={22} color="#ffffff" />
                  <Text style={[styles.authButtonText, styles.appleButtonText]}>
                    CONTINUER AVEC APPLE
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Email Sign-In */}
            <TouchableOpacity
              style={[styles.authButton, styles.emailButton]}
              onPress={handleEmailSignIn}
              disabled={!!submitting}
            >
              <Mail size={20} color="#ffffff" />
              <Text style={[styles.authButtonText, styles.emailButtonText]}>
                S'INSCRIRE PAR E-MAIL
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <TouchableOpacity onPress={handleLoginRedirect}>
              <Text style={styles.loginText}>
                Vous voulez vous connecter ?
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedAuthCard>
      </LinearGradient>
    </SafeAreaView>
  );
};

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1a1a1a',
    },
    gradient: {
      flex: 1,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
      justifyContent: 'center',
    },
    brandingContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl * 2,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logoBackground: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    logoText: {
      fontSize: 32,
    },
    appName: {
      fontSize: theme.typography.fontSize.xxl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#ffffff',
      letterSpacing: 1,
    },
    welcomeTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.semibold,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 28,
    },
    welcomeSubtitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
    },
    authButtonsContainer: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    authButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      minHeight: 56,
      gap: theme.spacing.md,
    },
    googleButton: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    appleButton: {
      backgroundColor: '#000000',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    emailButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    googleIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#4285f4',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIconText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    authButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semibold,
      letterSpacing: 0.5,
    },
    googleButtonText: {
      color: '#1a1a1a',
    },
    appleButtonText: {
      color: '#ffffff',
    },
    emailButtonText: {
      color: '#ffffff',
    },
    loginContainer: {
      alignItems: 'center',
      paddingTop: theme.spacing.lg,
    },
    loginText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: 'rgba(255, 255, 255, 0.8)',
      textDecorationLine: 'underline',
    },
  });
};

export default WelcomeScreen;
