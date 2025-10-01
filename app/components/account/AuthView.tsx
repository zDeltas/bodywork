import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { Mail } from 'lucide-react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Text from '@/app/components/ui/Text';
import AnimatedAuthCard from '@/app/components/auth/AnimatedAuthCard';
import { useTheme } from '@/app/hooks/useTheme';
import useAuth from '@/app/hooks/useAuth';
import { useSnackbar } from '@/app/hooks/useSnackbar';

interface AuthViewProps {
  visible: boolean;
}

export default function AuthView({ visible }: AuthViewProps) {
  const { theme } = useTheme();
  const styles = useStyles();
  const { signInWithGoogle, signInWithApple } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [submitting, setSubmitting] = useState<null | 'google' | 'apple'>(null);

  const handleAuthNavigation = (screen: string) => {
    switch (screen) {
      case 'email':
        router.push('/screens/auth/LoginScreen?mode=signup');
        break;
      case 'login':
        router.push('/screens/auth/LoginScreen');
        break;
      default:
        router.push('/screens/auth/LoginScreen');
    }
  };

  const handleGoogle = async () => {
    setSubmitting('google');
    try {
      const res = await signInWithGoogle();
      if (res.started) showSuccess('Redirection vers Google...');
      else showError(res.error || 'Erreur Google');
    } catch {
      showError('Erreur Google');
    } finally {
      setSubmitting(null);
    }
  };

  const handleApple = async () => {
    setSubmitting('apple');
    try {
      const res = await signInWithApple();
      if (res.started) showSuccess('Redirection vers Apple...');
      else showError(res.error || 'Erreur Apple');
    } catch {
      showError('Erreur Apple');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <AnimatedAuthCard visible={visible} style={styles.card}>
      <ImageBackground
        source={require('../../../assets/images/auth/download.jpg')}
        style={styles.background}
        resizeMode="cover"
        imageStyle={styles.backgroundImage}
      >
      <View style={styles.overlay} />
      {/* Welcome Section */}
      <View style={styles.welcomeContainer}>
        {/* App Logo and Branding */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Image source={require('../../../assets/images/icon.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>Bodywork</Text>
        </View>
        
        <Text style={styles.welcomeTitle}>
          Rejoignez-nous pour atteindre vos objectifs fitness
        </Text>
        <Text style={styles.welcomeSubtitle}>
          Connectez-vous pour synchroniser vos données et suivre votre progression
        </Text>
      </View>

      {/* Auth Buttons */}
      <View style={styles.authContainer}>
        {/* Google Sign-In */}
        <TouchableOpacity
          style={[styles.authButton, styles.googleButton]}
          onPress={handleGoogle}
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
          onPress={handleApple}
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
          onPress={() => handleAuthNavigation('email')}
        >
          <Mail size={20} color={theme.colors.text.primary} />
          <Text style={[styles.authButtonText, styles.emailButtonText]}>
            S'INSCRIRE PAR E-MAIL
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity 
          style={styles.loginLinkContainer}
          onPress={() => handleAuthNavigation('login')}
        >
          <Text style={styles.loginLinkText}>
            Déjà un compte ? Se connecter
          </Text>
        </TouchableOpacity>
      </View>
      </ImageBackground>
    </AnimatedAuthCard>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    card: {
      flex: 1,
      margin: 0,
      borderRadius: 0,
      overflow: 'hidden',
    },
    background: {
      flex: 1,
      borderRadius: 0,
      overflow: 'hidden',
      justifyContent: 'center',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    welcomeContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl * 2,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logoBackground: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: theme.colors.background.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    logoText: {
      fontSize: 32,
    },
    appName: {
      fontSize: theme.typography.fontSize.xxl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      letterSpacing: 1,
    },
    welcomeTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.semibold,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 28,
    },
    welcomeSubtitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
    },
    logoImage: {
      width: 40,
      height: 40,
      opacity: 0.9,
    },
    authContainer: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
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
      borderColor: theme.colors.border,
    },
    appleButton: {
      backgroundColor: '#000000',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emailButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      color: theme.colors.text.primary,
    },
    loginLinkContainer: {
      alignItems: 'center',
      paddingTop: theme.spacing.lg,
    },
    loginLinkText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
  });
};
