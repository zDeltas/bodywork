import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { translations } from '@/translations';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

const MotivationalQuote: React.FC = React.memo(() => {
  const { language } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  // Récupérer le tableau de citations depuis les translations (t() ne gère que les strings)
  const quotes = React.useMemo(() => {
    const arr = (translations as any)?.[language]?.home?.motivationalQuotes;
    if (Array.isArray(arr) && arr.length > 0) return arr as string[];
    // Fallback sur EN si indisponible
    const fallback = (translations as any)?.en?.home?.motivationalQuotes;
    return Array.isArray(fallback) ? (fallback as string[]) : [];
  }, [language]);
  const randomQuote = React.useMemo(() => {
    if (!quotes || quotes.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }, [quotes]);

  // Mémoriser le composant pour éviter les re-renders inutiles
  const quoteContent = React.useMemo(() => (
    <Text variant="body" style={styles.quoteText}>
      {randomQuote}
    </Text>
  ), [randomQuote, styles.quoteText]);

  if (!randomQuote) return null;

  return (
    <View style={styles.container}>
      <View style={styles.quoteContainer}>
        <Sparkles size={20} color={theme.colors.primary} style={styles.icon} />
        {quoteContent}
      </View>
    </View>
  );
})

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    quoteContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.card,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: 16,
      gap: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    icon: {
      opacity: 0.8,
    },
    quoteText: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.text.primary,
      fontStyle: 'italic',
      lineHeight: 22,
    },
  });
};

MotivationalQuote.displayName = 'MotivationalQuote';

export default React.memo(MotivationalQuote);
