import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

interface OnboardingFooterProps {
  type?: 'single' | 'double';
  onNext?: () => void;
  onSkip?: () => void;
  nextButtonText?: string;
  skipButtonText?: string;
  showSkipButton?: boolean;
  nextButtonDisabled?: boolean;
}

const OnboardingFooter: React.FC<OnboardingFooterProps> = ({
  type = 'single',
  onNext,
  onSkip,
  nextButtonText,
  skipButtonText,
  showSkipButton = false,
  nextButtonDisabled = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const defaultNextText = nextButtonText || t('onboarding.next');
  const defaultSkipText = skipButtonText || t('onboarding.skip');

  if (type === 'single') {
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: nextButtonDisabled 
                ? theme.colors.background.disabled 
                : theme.colors.primary,
            }
          ]}
          onPress={onNext}
          disabled={nextButtonDisabled}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.nextButtonText, 
            { 
              color: nextButtonDisabled 
                ? theme.colors.text.disabled 
                : theme.colors.text.onPrimary 
            }
          ]}>
            {defaultNextText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.footer}>
      <View style={styles.buttonRow}>
        {showSkipButton && (
          <TouchableOpacity
            style={[
              styles.skipButton,
              {
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.default,
              }
            ]}
            onPress={onSkip}
            activeOpacity={0.8}
          >
            <Text style={[styles.skipButtonText, { color: theme.colors.text.secondary }]}>
              {defaultSkipText}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            showSkipButton && styles.nextButtonInRow,
            {
              backgroundColor: nextButtonDisabled 
                ? theme.colors.background.disabled 
                : theme.colors.primary,
            }
          ]}
          onPress={onNext}
          disabled={nextButtonDisabled}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.nextButtonText, 
            { 
              color: nextButtonDisabled 
                ? theme.colors.text.disabled 
                : theme.colors.text.onPrimary 
            }
          ]}>
            {defaultNextText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      backgroundColor: theme.colors.background.main,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.default,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    skipButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    skipButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    nextButton: {
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    nextButtonInRow: {
      flex: 2,
    },
    nextButtonText: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
};

export default OnboardingFooter;
