import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { User, Edit3, Settings, LogOut, Calendar, Mail, ShieldCheck } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';
import AnimatedAuthCard from '@/app/components/auth/AnimatedAuthCard';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';

interface ProfileViewProps {
  visible: boolean;
  user: any;
  isLoading?: boolean;
  onLogout: () => void;
  onEditProfile: () => void;
  onSettings: () => void;
  formatMemberSince: (dateString: string | undefined) => string;
}

export default function ProfileView({ 
  visible, 
  user, 
  isLoading = false,
  onLogout, 
  onEditProfile, 
  onSettings,
  formatMemberSince 
}: ProfileViewProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <AnimatedAuthCard visible={visible}>
      {/* User Profile Header */}
      <View style={styles.userHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <User size={32} color={theme.colors.text.primary} />
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
          </Text>
          <View style={styles.userDetails}>
            <Mail size={14} color={theme.colors.text.secondary} />
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <View style={styles.userDetails}>
            <Calendar size={14} color={theme.colors.text.secondary} />
            <Text style={styles.memberSince}>
              Membre depuis {formatMemberSince(user?.created_at)}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={onEditProfile}
          disabled={isLoading}
        >
          <Edit3 size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Account Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <ShieldCheck size={16} color={theme.colors.success} />
          <Text style={styles.statusText}>Compte vérifié</Text>
        </View>
      </View>

      {/* Profile Actions */}
      <View style={styles.actionsContainer}>
        {/* Edit Profile */}
        <TouchableOpacity 
          style={styles.actionItem}
          onPress={onEditProfile}
          disabled={isLoading}
        >
          <View style={styles.actionIcon}>
            <Edit3 size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Modifier le profil</Text>
            <Text style={styles.actionSubtitle}>Nom, photo, préférences</Text>
          </View>
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity 
          style={styles.actionItem}
          onPress={onSettings}
          disabled={isLoading}
        >
          <View style={styles.actionIcon}>
            <Settings size={20} color={theme.colors.text.secondary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Paramètres</Text>
            <Text style={styles.actionSubtitle}>Notifications, confidentialité</Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity 
          style={[styles.actionItem, styles.logoutAction]}
          onPress={onLogout}
          disabled={isLoading}
        >
          <View style={styles.actionIcon}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <LogOut size={20} color="#ef4444" />
            )}
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: '#ef4444' }]}>Se déconnecter</Text>
            <Text style={styles.actionSubtitle}>Fermer la session</Text>
          </View>
        </TouchableOpacity>
      </View>
    </AnimatedAuthCard>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatarContainer: {
      marginRight: theme.spacing.md,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    userDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.xs,
    },
    userEmail: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
    },
    memberSince: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
    },
    editButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
    },
    statusContainer: {
      marginBottom: theme.spacing.xl,
    },
    statusItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
    },
    statusText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.success,
    },
    actionsContainer: {
      gap: theme.spacing.sm,
    },
    actionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.surface,
    },
    logoutAction: {
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: '#ef4444',
      backgroundColor: 'transparent',
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    actionSubtitle: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
    },
  });
};
