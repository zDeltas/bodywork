import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Calendar, Dumbbell, TrendingUp } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';

interface EmptyStateProps {
  type: 'loading' | 'error' | 'noWorkouts';
  selectedDate?: string;
}

const EmptyState: React.FC<EmptyStateProps> = React.memo(({ type, selectedDate }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const getContent = () => {
    switch (type) {
      case 'loading':
        return {
          icon: <TrendingUp size={48} color={theme.colors.text.disabled} />,
          title: t('common.loading'),
          subtitle: 'Chargement de vos entraînements...',
        };
      case 'error':
        return {
          icon: <Dumbbell size={48} color={theme.colors.text.disabled} />,
          title: t('common.errorLoadingWorkouts'),
          subtitle: 'Impossible de charger vos données',
        };
      case 'noWorkouts':
        return {
          icon: <Calendar size={48} color={theme.colors.text.disabled} />,
          title: 'Aucun entraînement',
          subtitle: selectedDate 
            ? 'Aucun entraînement pour cette date'
            : 'Commencez votre premier entraînement !',
        };
      default:
        return {
          icon: <Dumbbell size={48} color={theme.colors.text.disabled} />,
          title: 'Aucune donnée',
          subtitle: '',
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {content.icon}
      </View>
      <Text variant="heading" style={styles.title}>{content.title}</Text>
      <Text variant="body" style={styles.subtitle}>{content.subtitle}</Text>
      
      {type === 'noWorkouts' && (
        <Text variant="caption" style={styles.hint}>
          Appuyez sur le bouton + pour créer votre premier entraînement
        </Text>
      )}
    </View>
  );
});

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.xl,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.background.input,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.base,
    },
    title: {
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    hint: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.base,
    },
  });
};

EmptyState.displayName = 'EmptyState';

export default EmptyState;
