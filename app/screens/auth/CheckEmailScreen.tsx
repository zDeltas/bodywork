import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useAuth from '@/app/hooks/useAuth';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import Text from '@/app/components/ui/Text';
import AnimatedAuthCard from '@/app/components/auth/AnimatedAuthCard';
import { ArrowLeft, Mail, RefreshCw, CheckCircle } from 'lucide-react-native';

const CheckEmailScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signInWithEmail, isLoading } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const styles = useStyles();

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    // Get email from route params or localStorage if needed
    // For now, we'll show a generic message
    setResending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showSuccess('Email renvoyé ! Vérifiez votre boîte de réception.');
      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      showError('Erreur lors du renvoi de l\'email');
    } finally {
      setResending(false);
    }
  };

  const handleBackToAuth = () => {
    router.back();
  };

  const handleOpenEmailApp = () => {
    // This would open the default email app on mobile
    showSuccess('Ouverture de votre application email...');
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackToAuth}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <AnimatedAuthCard visible={true} style={styles.content}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <CheckCircle size={48} color={theme.colors.primary} />
            </View>
          </View>

          {/* Title and Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.title}>Vérifiez votre email</Text>
            <Text style={styles.subtitle}>
              Nous avons envoyé un lien de connexion sécurisé à votre adresse email.
            </Text>
            <Text style={styles.description}>
              Cliquez sur le lien dans l'email pour vous connecter automatiquement. 
              Le lien expire dans 15 minutes.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleOpenEmailApp}
            >
              <Mail size={20} color="#1a1a1a" />
              <Text style={styles.primaryButtonText}>
                OUVRIR L'APPLICATION EMAIL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, (!canResend || resending) && styles.buttonDisabled]}
              onPress={handleResendEmail}
              disabled={!canResend || resending}
            >
              {resending ? (
                <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
              ) : (
                <>
                  <RefreshCw size={18} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.secondaryButtonText}>
                    {canResend ? 'RENVOYER L\'EMAIL' : `RENVOYER (${countdown}s)`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Vous ne trouvez pas l'email ?</Text>
            <Text style={styles.helpText}>
              • Vérifiez votre dossier spam ou courrier indésirable{'\n'}
              • Assurez-vous que l'adresse email est correcte{'\n'}
              • L'email peut prendre quelques minutes à arriver
            </Text>
          </View>

          {/* Back to Auth Link */}
          <TouchableOpacity 
            style={styles.backToAuthContainer}
            onPress={handleBackToAuth}
          >
            <Text style={styles.backToAuthText}>
              Utiliser une autre méthode de connexion
            </Text>
          </TouchableOpacity>
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
      alignItems: 'center',
    },
    iconContainer: {
      marginBottom: theme.spacing.xl,
    },
    iconBackground: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    messageContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl * 2,
    },
    title: {
      fontSize: theme.typography.fontSize.xxl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#ffffff',
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.medium,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      lineHeight: 24,
    },
    description: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
    },
    buttonContainer: {
      width: '100%',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.md,
      minHeight: 56,
    },
    primaryButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semibold,
      color: '#1a1a1a',
      letterSpacing: 0.5,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      gap: theme.spacing.sm,
      minHeight: 56,
    },
    secondaryButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semibold,
      color: 'rgba(255, 255, 255, 0.8)',
      letterSpacing: 0.5,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    helpContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    helpTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semibold,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    helpText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 20,
      textAlign: 'left',
    },
    backToAuthContainer: {
      paddingVertical: theme.spacing.md,
    },
    backToAuthText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
      textAlign: 'center',
    },
  });
};

export default CheckEmailScreen;
