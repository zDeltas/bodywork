import React from 'react';
import { ScrollView, StyleSheet, ImageBackground, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import useAuth from '@/app/hooks/useAuth';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import AuthView from '@/app/components/account/AuthView';
import ProfileView from '@/app/components/account/ProfileView';
import LoadingView from '@/app/components/account/LoadingView';

export default function MyAccountScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const { isAuthenticated, user, isLoading, signOut } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  // No redirect: show AuthView inline when not authenticated

  // Format user creation date
  const formatMemberSince = (dateString: string | undefined) => {
    if (!dateString) return 'Récemment';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      showSuccess('Vous êtes déconnecté.');
    } catch (error) {
      showError('Erreur lors de la déconnexion.');
    }
  };

  // Handle profile edit
  const handleEditProfile = () => {
    // TODO: Navigate to profile edit screen
    showSuccess('Fonctionnalité en cours de développement');
  };

  // Handle settings
  const handleSettings = () => {
    // TODO: Navigate to settings screen
    showSuccess('Fonctionnalité en cours de développement');
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Full cover background for unauthenticated state (outside SafeAreaView) */}
      {!isAuthenticated && !isLoading && (
        <ImageBackground
          source={require('../../assets/images/auth/download.jpg')}
          style={styles.bg}
          resizeMode="cover"
          imageStyle={styles.bgImage}
        >
          <View style={styles.bgOverlay} />
        </ImageBackground>
      )}

      <SafeAreaView style={[styles.container, (!isAuthenticated && !isLoading) && styles.containerAuth]}>
        {isAuthenticated ? (
          <Header 
            title={t('profile.myAccount')} 
            showBackButton={true} 
            onBack={() => router.back()} 
          />
        ) : (
          <TouchableOpacity style={styles.backOverlayBtn} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
        )}

        {isLoading ? (
          <LoadingView message="Chargement de votre profil..." />
        ) : isAuthenticated ? (
          <ScrollView 
            style={styles.content} 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <ProfileView
              visible={isAuthenticated}
              user={user}
              isLoading={isLoading}
              onLogout={handleLogout}
              onEditProfile={handleEditProfile}
              onSettings={handleSettings}
              formatMemberSince={formatMemberSince}
            />
          </ScrollView>
        ) : (
          <AuthView visible={!isAuthenticated} />
        )}
      </SafeAreaView>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    containerAuth: {
      backgroundColor: 'transparent',
    },
    bg: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    bgImage: {
      width: '100%',
      height: '100%',
    },
    bgOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    content: {
      flex: 1,
      zIndex: 1,
    },
    backOverlayBtn: {
      position: 'absolute',
      top: 12,
      left: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    contentContainer: {
      flexGrow: 1,
      padding: theme.spacing.md,
    },
    authContentContainer: {
      flexGrow: 1,
      padding: 0,
    },
  });
};
