import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, ScrollView, TextInput, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Removed LinearGradient in favor of full-screen background image
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import useAuth from '@/app/hooks/useAuth';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import { validateEmail } from '@/app/utils/authValidation';
import Text from '@/app/components/ui/Text';
import AnimatedAuthCard from '@/app/components/auth/AnimatedAuthCard';
import { ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';

const LoginScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signInWithPassword, signUpWithPassword, signInWithGoogle, signInWithApple, signInWithEmail, isLoading } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  
  const params = useLocalSearchParams<{ mode?: string }>();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(params?.mode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState<'password' | 'google' | 'apple' | 'magic' | null>(null);
  
  const styles = useStyles();

  const handlePasswordLogin = async () => {
    if (!validateEmail(email)) {
      showError('Veuillez entrer une adresse email valide');
      return;
    }
    
    if (!password.trim()) {
      showError('Veuillez entrer votre mot de passe');
      return;
    }

    setSubmitting('password');
    try {
      const result = authMode === 'login'
        ? await signInWithPassword(email.trim(), password)
        : await signUpWithPassword(email.trim(), password);
      if (result.success) {
        showSuccess(authMode === 'login' ? 'Connexion réussie !' : 'Compte créé avec succès !');
        router.replace('/(tabs)');
      } else {
        showError(result.error || (authMode === 'login' ? 'Erreur lors de la connexion' : 'Erreur lors de la création du compte'));
      }
    } catch (error) {
      showError(authMode === 'login' ? 'Erreur lors de la connexion' : 'Erreur lors de la création du compte');
    } finally {
      setSubmitting(null);
    }
  };

  const handleMagicLinkLogin = async () => {
    if (!validateEmail(email)) {
      showError('Veuillez entrer une adresse email valide');
      return;
    }

    setSubmitting('magic');
    try {
      const result = await signInWithEmail(email.trim());
      if (result.sent) {
        showSuccess('Lien de connexion envoyé !');
        router.push('/screens/auth/CheckEmailScreen');
      } else {
        showError(result.error || 'Erreur lors de l\'envoi du lien');
      }
    } catch (error) {
      showError('Erreur lors de l\'envoi du lien');
    } finally {
      setSubmitting(null);
    }
  };

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

  const handleForgotPassword = () => {
    router.push('/screens/auth/ForgotPasswordScreen');
  };

  const handleSignUpRedirect = () => {
    router.push('/screens/auth/WelcomeScreen');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ImageBackground
        source={require('../../../assets/images/auth/download.jpg')}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={styles.bgImage}
      >
        <View style={styles.bgOverlay} />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
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
                <Text style={styles.title}>Bon retour !</Text>
                <Text style={styles.subtitle}>
                  Connectez-vous à votre compte pour continuer votre progression
                </Text>
              </View>

              {/* Login Form */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
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

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mot de passe</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[styles.textInput, styles.passwordInput]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Votre mot de passe"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        secureTextEntry={!showPassword}
                        autoComplete="current-password"
                        editable={!submitting}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="rgba(255, 255, 255, 0.6)" />
                        ) : (
                          <Eye size={20} color="rgba(255, 255, 255, 0.6)" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity 
                  style={styles.forgotPasswordContainer}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>
                    Mot de passe oublié ?
                  </Text>
                </TouchableOpacity>

                {/* Primary Button (Login / Signup) */}
                <TouchableOpacity
                  style={[styles.loginButton, submitting && styles.buttonDisabled]}
                  onPress={handlePasswordLogin}
                  disabled={!!submitting}
                >
                  {submitting === 'password' ? (
                    <ActivityIndicator color="#1a1a1a" size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>{authMode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}</Text>
                  )}
                </TouchableOpacity>

                {/* Magic Link Button */}
                <TouchableOpacity
                  style={[styles.magicLinkButton, submitting && styles.buttonDisabled]}
                  onPress={handleMagicLinkLogin}
                  disabled={!!submitting}
                >
                  {submitting === 'magic' ? (
                    <ActivityIndicator color="rgba(255, 255, 255, 0.8)" size="small" />
                  ) : (
                    <>
                      <Mail size={18} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.magicLinkButtonText}>
                        RECEVOIR UN LIEN DE CONNEXION
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialButtonsContainer}>
                {/* Google Sign-In */}
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton, submitting && styles.buttonDisabled]}
                  onPress={handleGoogleSignIn}
                  disabled={!!submitting}
                >
                  {submitting === 'google' ? (
                    <ActivityIndicator color="#1a1a1a" size="small" />
                  ) : (
                    <>
                      <AntDesign name="google" size={18} color="#1a1a1a" />
                      <Text style={styles.googleButtonText}>Google</Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Apple Sign-In */}
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton, submitting && styles.buttonDisabled]}
                  onPress={handleAppleSignIn}
                  disabled={!!submitting}
                >
                  {submitting === 'apple' ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={20} color="#ffffff" />
                      <Text style={styles.appleButtonText}>Apple</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Mode Toggle Link */}
              {authMode === 'login' ? (
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpPrompt}>Pas encore de compte ?</Text>
                  <TouchableOpacity onPress={() => setAuthMode('signup')}>
                    <Text style={styles.signUpLink}>Créer un compte</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpPrompt}>Vous avez déjà un compte ?</Text>
                  <TouchableOpacity onPress={() => setAuthMode('login')}>
                    <Text style={styles.signUpLink}>Se connecter</Text>
                  </TouchableOpacity>
                </View>
              )}
            </AnimatedAuthCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
      
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
    bg: {
      flex: 1,
    },
    bgImage: {
      width: '100%',
      height: '100%',
    },
    bgOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
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
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl * 2,
    },
    title: {
      fontSize: theme.typography.fontSize.xxl,
      fontFamily: theme.typography.fontFamily.bold,
      color: '#ffffff',
      marginBottom: theme.spacing.md,
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
    formContainer: {
      marginBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.lg,
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
    passwordContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
    },
    eyeButton: {
      padding: theme.spacing.xs,
    },
    forgotPasswordContainer: {
      alignItems: 'flex-end',
      marginBottom: theme.spacing.lg,
    },
    forgotPasswordText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      minHeight: 56,
    },
    loginButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semibold,
      color: '#1a1a1a',
      letterSpacing: 0.5,
    },
    magicLinkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.lg,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      gap: theme.spacing.sm,
      minHeight: 56,
    },
    magicLinkButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semibold,
      color: 'rgba(255, 255, 255, 0.8)',
      letterSpacing: 0.5,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: theme.spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dividerText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.6)',
      marginHorizontal: theme.spacing.lg,
    },
    socialButtonsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
      minHeight: 56,
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
    googleButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semibold,
      color: '#1a1a1a',
    },
    appleButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semibold,
      color: '#ffffff',
    },
    signUpContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    signUpPrompt: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    signUpLink: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semibold,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
  });
};

export default LoginScreen;
