import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, Heart } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

interface PhilosophyCardProps {
  quote: string;
  author?: string;
}

const PhilosophyCard: React.FC<PhilosophyCardProps> = ({ quote, author }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Sparkles size={20} color={theme.colors.primary} />
        <Text variant="subheading" style={styles.headerText}>
          {t('home.emotional.philosophy')}
        </Text>
        <Heart size={18} color={theme.colors.secondary} />
      </View>
      
      <View style={styles.quoteContainer}>
        <Text variant="body" style={styles.quote}>
          "{quote}"
        </Text>
        {author && (
          <Text variant="caption" style={styles.author}>
            — {author}
          </Text>
        )}
      </View>
      
      <View style={styles.inspirationBadge}>
        <Text variant="caption" style={styles.inspirationText}>
          {t('home.emotional.inspiration')}
        </Text>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      justifyContent: 'center',
    },
    headerText: {
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semibold,
    },
    quoteContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    quote: {
      textAlign: 'center',
      fontStyle: 'italic',
      color: theme.colors.text.primary,
      lineHeight: 24,
      marginBottom: theme.spacing.sm,
    },
    author: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.medium,
    },
    inspirationBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      alignSelf: 'center',
    },
    inspirationText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
};

export default React.memo(PhilosophyCard);
