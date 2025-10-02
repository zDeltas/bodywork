import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Mars, Venus } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { BiologicalSex } from '@/types/onboarding';

interface BiologicalSexSelectorProps {
  value: BiologicalSex;
  onValueChange: (biologicalSex: BiologicalSex) => void;
}

const BiologicalSexSelector: React.FC<BiologicalSexSelectorProps> = ({ value, onValueChange }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const sexOptions: { key: BiologicalSex; label: string; icon: React.ReactNode }[] = [
    {
      key: 'male',
      label: t('onboarding.basicProfile.biologicalMale'),
      icon: <Mars size={20} color={value === 'male' ? theme.colors.text.onPrimary : theme.colors.text.secondary} />
    },
    {
      key: 'female',
      label: t('onboarding.basicProfile.biologicalFemale'),
      icon: <Venus size={20} color={value === 'female' ? theme.colors.text.onPrimary : theme.colors.text.secondary} />
    }
  ];

  return (
    <View style={styles.container}>
      {sexOptions.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.option,
            {
              backgroundColor: value === option.key ? theme.colors.primary : theme.colors.background.card,
              borderColor: value === option.key ? theme.colors.primary : theme.colors.border.default,
            }
          ]}
          onPress={() => onValueChange(option.key)}
        >
          {option.icon}
          <Text
            style={[
              styles.optionText,
              {
                color: value === option.key ? theme.colors.text.onPrimary : theme.colors.text.primary,
              }
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      gap: theme.spacing.xs,
    },
    optionText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
};

export default BiologicalSexSelector;
