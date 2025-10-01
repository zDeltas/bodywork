import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useAuth from '@/app/hooks/useAuth';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import { validateEmail } from '@/app/utils/authValidation';
import Text from '@/app/components/ui/Text';
import AnimatedAuthCard from '@/app/components/auth/AnimatedAuthCard';
import { ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react-native';

const ForgotPasswordScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const styles = useStyles();

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      showError('Veuillez entrer une adresse email valide');
      return;
    }

    setSubmitting(true);
    try {
      const result = await resetPassword(email.trim());
      if (result.sent) {
        setEmailSent(true);
        showSuccess('Email de réinitialisation envoyé !');
      } else {
        showError(result.error || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      showError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setEmail('');
  };

  if (emailSent) {
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
              onPress={handleBackToLogin}
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

            {/* Success Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.title}>Email envoyé !</Text>
              <Text style={styles.subtitle}>
                Nous avons envoyé un lien de réinitialisation à :
              </Text>
              <Text style={styles.emailText}>{email}</Text>
              <Text style={styles.description}>
                Cliquez sur le lien dans l'email pour créer un nouveau mot de passe. 
                Le lien expire dans 15 minutes.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleBackToLogin}
              >
                <Text style={styles.primaryButtonText}>
                  RETOUR À LA CONNEXION
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleTryAgain}
              >
                <Text style={styles.secondaryButtonText}>
                  ESSAYER AVEC UN AUTRE EMAIL
                </Text>
              </TouchableOpacity>
            </View>

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                Vous ne trouvez pas l'email ? Vérifiez votre dossier spam ou courrier indésirable.
              </Text>
            </View>
          </AnimatedAuthCard>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
            onPress={handleBackToLogin}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedAuthCard visible={true} style={styles.content}>
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Mot de passe oublié ?</Text>
                <Text style={styles.subtitle}>
                  Pas de problème ! Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </Text>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Adresse email</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color="rgba(255, 255, 255, 0.6)" />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="votre@email.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      editable={!submitting}
                    />
                  </View>
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  style={[styles.resetButton, submitting && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#1a1a1a" size="small" />
                  ) : (
                    <>
                      <Send size={20} color="#1a1a1a" />
                      <Text style={styles.resetButtonText}>
                        ENVOYER LE LIEN DE RÉINITIALISATION
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Back to Login Link */}
              <View style={styles.backToLoginContainer}>
                <TouchableOpacity onPress={handleBackToLogin}>
                  <Text style={styles.backToLoginText}>
                    Retour à la connexion
                  </Text>
                </TouchableOpacity>
              </View>
            </AnimatedAuthCard>
          </ScrollView>
        </KeyboardAvoidingView>
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
    keyboardContainer: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    content: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xl,
      justifyContent: 'center',
    },
    iconContainer: {
      alignItems: 'center',
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
    titleContainer: {
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
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
    },
    messageContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl * 2,
    },
    emailText: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.semibold,
      color: theme.colors.primary,
      marginVertical: theme.spacing.lg,
      textAlign: 'center',
    },
    description: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      lineHeight: 22,
      paddingHorizontal: theme.spacing.md,
    },
    formContainer: {
      marginBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.xl,
    },
    inputLabel: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: theme.spacing.sm,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      gap: theme.spacing.sm,
    },
    textInput: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: '#ffffff',
    },
    resetButton: {
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
    resetButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semibold,
      color: '#1a1a1a',
      letterSpacing: 0.5,
    },
    buttonContainer: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 56,
    },
    primaryButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semibold,
      color: '#1a1a1a',
      letterSpacing: 0.5,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
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
      paddingHorizontal: theme.spacing.md,
    },
    helpText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      lineHeight: 20,
    },
    backToLoginContainer: {
      alignItems: 'center',
      paddingTop: theme.spacing.lg,
    },
    backToLoginText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
  });
};

export default ForgotPasswordScreen;
