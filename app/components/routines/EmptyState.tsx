import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

  const getTranslationKey = (key: string): TranslationKey => {
    const prefix = isFavoritesEmpty ? 'routines.noFavorites' : 'routines.emptyState';
    return `${prefix}.${key}` as TranslationKey;
  };

  return (
    <View style={styles.emptyContainer}>
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
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    padding: 16
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32
  },
  emptyOrText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginVertical: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 4
  }
});

export default EmptyState; 
