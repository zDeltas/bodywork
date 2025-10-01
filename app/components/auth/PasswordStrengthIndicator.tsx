import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import { AuthValidator } from '@/app/utils/authValidation';

interface PasswordStrengthIndicatorProps {
  password: string;
  visible: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  visible
}) => {
  const { theme } = useTheme();
  const styles = useStyles();

  if (!visible || !password) return null;

  const strength = AuthValidator.validatePasswordStrength(password);
  const strengthColor = AuthValidator.getPasswordStrengthColor(strength.score);
  const strengthText = AuthValidator.getPasswordStrengthText(strength.score);

  return (
    <View style={styles.container}>
      {/* Strength Bar */}
      <View style={styles.strengthBarContainer}>
        <View style={styles.strengthBarBackground}>
          <View 
            style={[
              styles.strengthBarFill,
              { 
                width: `${(strength.score / 4) * 100}%`,
                backgroundColor: strengthColor
              }
            ]} 
          />
        </View>
        <Text style={[styles.strengthText, { color: strengthColor }]}>
          {strengthText}
        </Text>
      </View>

      {/* Feedback */}
      {strength.feedback.length > 0 && (
        <View style={styles.feedbackContainer}>
          {strength.feedback.slice(0, 3).map((feedback, index) => (
            <Text key={index} style={styles.feedbackText}>
              • {feedback}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
    },
    strengthBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    strengthBarBackground: {
      flex: 1,
      height: 4,
      backgroundColor: theme.colors.background.input,
      borderRadius: 2,
      marginRight: theme.spacing.sm,
      overflow: 'hidden',
    },
    strengthBarFill: {
      height: '100%',
      borderRadius: 2,
      transition: 'width 0.3s ease',
    },
    strengthText: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.medium,
      minWidth: 60,
    },
    feedbackContainer: {
      marginTop: theme.spacing.xs,
    },
    feedbackText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs / 2,
      fontFamily: theme.typography.fontFamily.regular,
    },
  });
};

export default PasswordStrengthIndicator;
