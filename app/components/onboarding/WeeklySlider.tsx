import React from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

interface WeeklySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
}

const WeeklySlider: React.FC<WeeklySliderProps> = ({ 
  value, 
  onValueChange, 
  minimumValue = 1, 
  maximumValue = 7 
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: theme.colors.primary }]}>
          {value} {value === 1 ? t('onboarding.session') : t('onboarding.sessions')}
        </Text>
      </View>
      
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        value={value}
        onValueChange={onValueChange}
        step={1}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.border.default}
        thumbStyle={{
          backgroundColor: theme.colors.primary,
          width: 24,
          height: 24,
        }}
      />
      
      <View style={styles.labelsContainer}>
        <Text style={[styles.labelText, { color: theme.colors.text.secondary }]}>
          {minimumValue}
        </Text>
        <Text style={[styles.labelText, { color: theme.colors.text.secondary }]}>
          {maximumValue}
        </Text>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      width: '100%',
      gap: theme.spacing.sm,
    },
    valueContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    valueText: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
    },
    slider: {
      width: '100%',
      height: 40,
    },
    labelsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.xs,
    },
    labelText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
    },
  });
};

export default WeeklySlider;
