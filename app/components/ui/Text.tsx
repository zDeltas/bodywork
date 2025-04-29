import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface TextProps extends RNTextProps {
  variant?: 'heading' | 'subheading' | 'body' | 'caption';
  color?: string;
}

const Text = React.forwardRef<RNText, TextProps>((props, ref) => {
  const { theme } = useTheme();
  const { variant = 'body', style, color, ...rest } = props;

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

  return (
    <RNText
      ref={ref}
      style={[
        getTextStyle(),
        { color: color || theme.colors.text.primary },
        style,
      ]}
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    color: '#666',
  },
});

export default Text; 
