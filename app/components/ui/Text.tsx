import React from 'react';
import { Platform, StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';

export interface TextProps extends RNTextProps {
  variant?: 'heading' | 'subheading' | 'body' | 'caption';
  color?: string;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

const Text = React.forwardRef<RNText, TextProps>((props, ref) => {
  const { theme } = useTheme();
  const { variant = 'body', style, color, weight = 'regular', ...rest } = props;

  const getTextStyle = () => {
    switch (variant) {
      case 'heading':
        return styles.heading;
      case 'subheading':
        return styles.subheading;
      case 'caption':
        return styles.caption;
      default:
        return styles.body;
    }
  };

  const getFontWeight = () => {
    switch (weight) {
      case 'medium':
        return Platform.OS === 'ios' ? '500' : '400';
      case 'semibold':
        return Platform.OS === 'ios' ? '600' : '500';
      case 'bold':
        return Platform.OS === 'ios' ? '700' : '600';
      default:
        return Platform.OS === 'ios' ? '400' : '300';
    }
  };

  return (
    <RNText
      ref={ref}
      style={[
        getTextStyle(),
        {
          color: color || theme.colors.text.primary,
          fontWeight: getFontWeight(),
        },
        style,
      ]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  heading: {
    fontSize: Platform.OS === 'ios' ? 24 : 22,
    lineHeight: Platform.OS === 'ios' ? 32 : 30,
    marginBottom: Platform.OS === 'ios' ? 8 : 6,
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
  },
  subheading: {
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    lineHeight: Platform.OS === 'ios' ? 24 : 22,
    marginBottom: Platform.OS === 'ios' ? 6 : 4,
    letterSpacing: Platform.OS === 'ios' ? -0.3 : 0,
  },
  body: {
    fontSize: Platform.OS === 'ios' ? 16 : 14,
    lineHeight: Platform.OS === 'ios' ? 24 : 22,
    letterSpacing: Platform.OS === 'ios' ? -0.2 : 0,
  },
  caption: {
    fontSize: Platform.OS === 'ios' ? 14 : 12,
    lineHeight: Platform.OS === 'ios' ? 20 : 18,
    color: '#666',
    letterSpacing: Platform.OS === 'ios' ? -0.1 : 0,
  },
});

export default Text;
