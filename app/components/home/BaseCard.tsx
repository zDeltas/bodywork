import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

interface BaseCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerRight?: React.ReactNode;
  marginBottom?: boolean;
}

const BaseCard: React.FC<BaseCardProps> = ({
  children,
  onPress,
  style,
  title,
  subtitle,
  icon,
  headerRight,
  marginBottom = true
}) => {
  const { theme } = useTheme();
  const styles = useStyles();

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.container,
        marginBottom && styles.marginBottom,
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {/* Header standardisé */}
      {(title || icon || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            {title && (
              <View style={styles.headerTextContainer}>
                <Text variant="subheading" style={styles.title}>
                  {title}
                </Text>
                {subtitle && (
                  <Text variant="caption" style={styles.subtitle}>
                    {subtitle}
                  </Text>
                )}
              </View>
            )}
          </View>
          {headerRight && (
            <View style={styles.headerRight}>
              {headerRight}
            </View>
          )}
        </View>
      )}

      {/* Contenu de la carte */}
      <View style={styles.content}>
        {children}
      </View>
    </CardComponent>
  );
};

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: 24, // Radius Gainizi standardisé
      padding: theme.spacing.xl, // Padding standardisé
      marginHorizontal: theme.spacing.lg, // Marges horizontales standardisées
      ...theme.shadows.md, // Ombre standardisée
      borderWidth: 1,
      borderColor: theme.colors.background.input
    },
    marginBottom: {
      marginBottom: theme.spacing.lg // Marge bottom standardisée
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg // Espacement standardisé après header
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    iconContainer: {
      marginRight: theme.spacing.md // Espacement standardisé après icône
    },
    headerTextContainer: {
      flex: 1
    },
    title: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.xl // Taille de titre standardisée
    },
    subtitle: {
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs // Espacement standardisé entre titre et sous-titre
    },
    headerRight: {
      marginLeft: theme.spacing.md
    },
    content: {
      // Le contenu n'a pas de style par défaut pour laisser la flexibilité
    }
  });
};

BaseCard.displayName = 'BaseCard';

export default React.memo(BaseCard);
