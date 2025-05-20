import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';

interface FloatButtonActionProps {
  icon: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const FloatButtonAction: React.FC<FloatButtonActionProps> = ({ icon, onPress, style }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: theme.colors.primary }, style]}
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  }
});

export default FloatButtonAction; 
