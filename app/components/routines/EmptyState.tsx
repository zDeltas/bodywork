import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import Button from '@/app/components/ui/Button';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { TranslationKey } from '@/translations';

type EmptyStateProps = {
  onCreateRoutine?: () => void;
  isFavoritesEmpty?: boolean;
};

const EmptyState = React.memo(({ onCreateRoutine, isFavoritesEmpty }: EmptyStateProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  const getTranslationKey = (key: string): TranslationKey => {
    const prefix = isFavoritesEmpty ? 'routines.noFavorites' : 'routines.emptyState';
    return `${prefix}.${key}` as TranslationKey;
  };

  return (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Text style={styles.emptyTitle}>
        {t(getTranslationKey('title'))}
      </Text>
      <Text style={styles.emptyText}>
        {t(getTranslationKey('description'))}
      </Text>
      {onCreateRoutine && !isFavoritesEmpty && (
        <Button
          style={styles.buttonContainer}
          onPress={onCreateRoutine}
          title={t(getTranslationKey('button'))}
          icon={<Plus size={20} color={theme.colors.text.primary} />}
        />
      )}
    </Animated.View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl * 2,
    padding: theme.spacing.lg
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base
  },
  emptyOrText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text.secondary,
    marginVertical: theme.spacing.lg
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs
  }
});

export default EmptyState; 
