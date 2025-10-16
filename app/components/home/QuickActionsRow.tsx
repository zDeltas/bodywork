import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export interface QuickActionItem {
  key: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
}

interface Props {
  actions: QuickActionItem[];
  orientation?: 'row' | 'column';
}

const QuickActionsRow: React.FC<Props> = ({ actions, orientation = 'row' }) => {
  const styles = useStyles(orientation);

  if (!actions || actions.length === 0) return null;

  return (
    <View style={styles.container}>
      {actions.map(({ key, label, Icon, onPress }) => (
        <TouchableOpacity key={key} style={styles.action} onPress={onPress} activeOpacity={0.8}>
          <View style={styles.iconWrap}>
            <Icon size={18} color={styles.iconColor.color} />
          </View>
          <Text variant="caption" style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const useStyles = (orientation: 'row' | 'column') => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flexDirection: orientation === 'column' ? 'column' : 'row',
      gap: theme.spacing.sm,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      justifyContent: orientation === 'column' ? 'flex-start' : 'space-between',
    },
    action: {
      flex: orientation === 'column' ? undefined : 1,
      width: orientation === 'column' ? '100%' : undefined,
      backgroundColor: theme.colors.background.card,
      borderRadius: 12,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      alignItems: orientation === 'column' ? 'center' : 'center',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      ...theme.shadows.sm,
    },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 0,
      marginRight: theme.spacing.sm,
    },
    iconColor: {
      color: theme.colors.primary,
    },
    label: {
      color: theme.colors.text.primary,
    },
  });
};

export default React.memo(QuickActionsRow);
