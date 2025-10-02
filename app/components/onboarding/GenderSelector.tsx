import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { User, Mars, Venus } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { Gender } from '@/types/onboarding';

interface GenderSelectorProps {
  value: Gender;
  onValueChange: (gender: Gender) => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ value, onValueChange }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const genderOptions: { key: Gender; label: string; icon: React.ReactNode }[] = [
    {
      key: 'male',
      label: t('onboarding.basicProfile.male'),
      icon: <Mars size={20} color={value === 'male' ? theme.colors.text.onPrimary : theme.colors.text.secondary} />
    },
    {
      key: 'female',
      label: t('onboarding.basicProfile.female'),
      icon: <Venus size={20} color={value === 'female' ? theme.colors.text.onPrimary : theme.colors.text.secondary} />
    },
    {
      key: 'other',
      label: t('onboarding.basicProfile.other'),
      icon: <User size={20} color={value === 'other' ? theme.colors.text.onPrimary : theme.colors.text.secondary} />
    }
  ];

  return (
    <View style={styles.container}>
      {genderOptions.map((option) => (
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

export default GenderSelector;
