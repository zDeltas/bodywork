import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, Heart } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import BaseCard from '@/app/components/home/BaseCard';

interface PhilosophyCardProps {
  quote: string;
  author?: string;
}

const PhilosophyCard: React.FC<PhilosophyCardProps> = ({ quote, author }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <BaseCard
      title={t('home.emotional.philosophy')}
      icon={<Sparkles size={24} color={theme.colors.primary} />}
      headerRight={<Heart size={20} color={theme.colors.secondary} />}
      style={styles.container}
    >
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
    </BaseCard>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    quoteContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
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
      fontFamily: theme.typography.fontFamily.regular,
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
      fontFamily: theme.typography.fontFamily.semiBold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
};

export default React.memo(PhilosophyCard);
