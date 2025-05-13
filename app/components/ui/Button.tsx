import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useDynamicStyles } from '@/app/theme/dynamicComponents';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'icon';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
  children,
}) => {
  const { buttons } = useDynamicStyles();

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
        };
      default:
        return {};
    }
  };

  const buttonStyles = [buttons[variant], getSizeStyles(), disabled && buttons.disabled, style];

  const getTextStyle = (): TextStyle => {
    if (variant === 'icon') {
      return {};
    }
    return buttons[`${variant}Text` as keyof typeof buttons] as TextStyle;
  };

  const textStyles = [getTextStyle(), textStyle];

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={buttonStyles}>
      {icon && icon}
      {title && <Text style={textStyles}>{title}</Text>}
      {children}
    </TouchableOpacity>
  );
};

export default Button;
