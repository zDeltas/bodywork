import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useAuth from '@/app/hooks/useAuth';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import Text from '@/app/components/ui/Text';
import AnimatedAuthCard from '@/app/components/auth/AnimatedAuthCard';
import PasswordStrengthIndicator from '@/app/components/auth/PasswordStrengthIndicator';
import { AuthValidator } from '@/app/utils/authValidation';
import { ArrowLeft, Mail, Eye, EyeOff, Lock, User, CheckCircle } from 'lucide-react-native';

type AuthMode = 'signup' | 'login' | 'magic';

const EmailAuthScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signInWithEmail, signInWithPassword, signUpWithPassword, resetPassword, isLoading } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState<'email' | 'password' | 'reset' | null>(null);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const styles = useStyles();

  // Reset errors when switching modes
  useEffect(() => {
    setEmailError('');
    setPasswordError('');
    setPassword('');
  }, [authMode]);

  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate email
    const emailValidation = AuthValidator.validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password for login/signup
    if (authMode !== 'magic') {
      const passwordValidation = AuthValidator.validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error || '');
        isValid = false;
      } else {
        setPasswordError('');
      }
    }

    return isValid;
  };

  const handleMagicLink = async () => {
    if (!validateForm()) return;
    
    setSubmitting('email');
    try {
      const result = await signInWithEmail(email.trim());
      if (result.sent) {
        showSuccess('Email envoyé ! Vérifiez votre boîte de réception.');
        router.push('/screens/auth/CheckEmailScreen');
      } else {
        showError(result.error || 'Erreur lors de l\'envoi de l\'email');
      }
    } catch (error) {
      showError('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSubmitting(null);
    }
  };

  const handlePasswordAuth = async () => {
    if (!validateForm()) return;
    
    setSubmitting('password');
    try {
      const result = authMode === 'login' 
        ? await signInWithPassword(email.trim(), password)
        : await signUpWithPassword(email.trim(), password);
        
      if (result.success) {
        showSuccess(authMode === 'login' ? 'Connexion réussie !' : 'Compte créé avec succès !');
        router.replace('/(tabs)');
      } else {
        showError(result.error || 'Erreur lors de l\'authentification');
      }
    } catch (error) {
      showError('Erreur lors de l\'authentification');
    } finally {
      setSubmitting(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showError('Veuillez entrer votre email');
      return;
    }
    
    const emailValidation = AuthValidator.validateEmail(email);
    if (!emailValidation.isValid) {
      showError(emailValidation.error || 'Email invalide');
      return;
    }
    
    setSubmitting('reset');
    try {
      const result = await resetPassword(email.trim());
      if (result.sent) {
        showSuccess('Email de réinitialisation envoyé !');
      } else {
        showError(result.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      showError('Erreur lors de l\'envoi');
    } finally {
      setSubmitting(null);
    }
  };

  const getButtonText = () => {
    switch (authMode) {
      case 'signup': return 'CRÉER MON COMPTE';
      case 'login': return 'SE CONNECTER';
      case 'magic': return 'ENVOYER LE LIEN MAGIQUE';
    }
  };

  const getTitle = () => {
    switch (authMode) {
      case 'signup': return 'Créer votre compte';
      case 'login': return 'Bon retour !';
      case 'magic': return 'Connexion rapide';
    }
  };

  const getSubtitle = () => {
    switch (authMode) {
      case 'signup': return 'Rejoignez la communauté Bodywork';
      case 'login': return 'Connectez-vous à votre compte';
      case 'magic': return 'Recevez un lien de connexion par email';
    }
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
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedAuthCard visible={true} style={styles.content}>
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{getTitle()}</Text>
                <Text style={styles.subtitle}>{getSubtitle()}</Text>
              </View>

              {/* Auth Mode Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, authMode === 'signup' && styles.tabActive]}
                  onPress={() => setAuthMode('signup')}
                >
                  <User size={16} color={authMode === 'signup' ? theme.colors.primary : 'rgba(255,255,255,0.6)'} />
                  <Text style={[styles.tabText, authMode === 'signup' && styles.tabTextActive]}>
                    Inscription
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.tab, authMode === 'login' && styles.tabActive]}
                  onPress={() => setAuthMode('login')}
                >
                  <Lock size={16} color={authMode === 'login' ? theme.colors.primary : 'rgba(255,255,255,0.6)'} />
                  <Text style={[styles.tabText, authMode === 'login' && styles.tabTextActive]}>
                    Connexion
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.tab, authMode === 'magic' && styles.tabActive]}
                  onPress={() => setAuthMode('magic')}
                >
                  <Mail size={16} color={authMode === 'magic' ? theme.colors.primary : 'rgba(255,255,255,0.6)'} />
                  <Text style={[styles.tabText, authMode === 'magic' && styles.tabTextActive]}>
                    Lien magique
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <View style={[styles.inputWrapper, emailError && styles.inputError]}>
                    <Mail size={20} color={emailError ? '#ef4444' : 'rgba(255,255,255,0.6)'} />
                    <TextInput
                      style={styles.input}
                      placeholder="votre@email.com"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {email && !emailError && (
                      <CheckCircle size={20} color={theme.colors.success || theme.colors.primary} />
                    )}
                  </View>
                  {emailError ? (
                    <Text style={styles.errorText}>{emailError}</Text>
                  ) : null}
                </View>

                {/* Password Input (not for magic link) */}
                {authMode !== 'magic' && (
                  <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, passwordError && styles.inputError]}>
                      <Lock size={20} color={passwordError ? '#ef4444' : 'rgba(255,255,255,0.6)'} />
                      <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff size={20} color="rgba(255,255,255,0.6)" />
                        ) : (
                          <Eye size={20} color="rgba(255,255,255,0.6)" />
                        )}
                      </TouchableOpacity>
                    </View>
                    {passwordError ? (
                      <Text style={styles.errorText}>{passwordError}</Text>
                    ) : null}
                    
                    {/* Password Strength Indicator for signup */}
                    {authMode === 'signup' && (
                      <PasswordStrengthIndicator 
                        password={password} 
                        visible={password.length > 0} 
                      />
                    )}
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  style={[styles.actionButton, (submitting || isLoading) && styles.actionButtonDisabled]}
                  onPress={authMode === 'magic' ? handleMagicLink : handlePasswordAuth}
                  disabled={submitting || isLoading}
                >
                  {submitting ? (
                    <ActivityIndicator color="#1a1a1a" size="small" />
                  ) : (
                    <Text style={styles.actionButtonText}>{getButtonText()}</Text>
                  )}
                </TouchableOpacity>

                {/* Forgot Password Link */}
                {authMode === 'login' && (
                  <TouchableOpacity 
                    style={styles.forgotPasswordContainer}
                    onPress={handleForgotPassword}
                    disabled={submitting === 'reset'}
                  >
                    {submitting === 'reset' ? (
                      <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
                    ) : (
                      <Text style={styles.forgotPasswordText}>
                        Mot de passe oublié ?
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
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
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
      justifyContent: 'center',
      minHeight: 600,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize.xxl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#ffffff',
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xs,
      marginBottom: theme.spacing.xl,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
    },
    tabActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    tabText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: 'rgba(255, 255, 255, 0.6)',
    },
    tabTextActive: {
      color: theme.colors.primary,
    },
    formContainer: {
      gap: theme.spacing.lg,
    },
    inputContainer: {
      gap: theme.spacing.sm,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    inputError: {
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    input: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: '#ffffff',
    },
    errorText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: '#ef4444',
      marginLeft: theme.spacing.md,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      minHeight: 56,
    },
    actionButtonDisabled: {
      opacity: 0.6,
    },
    actionButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semibold,
      color: '#1a1a1a',
      letterSpacing: 0.5,
    },
    forgotPasswordContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    forgotPasswordText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: 'rgba(255, 255, 255, 0.8)',
      textDecorationLine: 'underline',
    },
  });
};

export default EmailAuthScreen;
