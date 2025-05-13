import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { StatsCardSkeleton } from '@/app/components/ui/SkeletonComponents';
import { Button } from '@/app/components/ui/Button';

interface ContactModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ContactModal({ isVisible, onClose }: ContactModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!contactForm.name.trim()) {
      errors.name = t('contact.errors.nameRequired');
    }
    if (!contactForm.email.trim()) {
      errors.email = t('contact.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = t('contact.errors.emailInvalid');
    }
    if (!contactForm.message.trim()) {
      errors.message = t('contact.errors.messageRequired');
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...contactForm,
          to: 'mon-adresse@example.com'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      Alert.alert(t('common.success'), t('contact.success'));
      onClose();
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      Alert.alert(t('common.error'), t('contact.error'));
    } finally {
      setIsSending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <BlurView intensity={20} style={styles.modalContainer}>
      {isLoading ? (
        <View style={styles.modalContent}>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </View>
      ) : (
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t('contact.title')}</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('contact.name')}</Text>
            <TextInput
              style={[styles.input, formErrors.name && styles.inputError]}
              value={contactForm.name}
              onChangeText={(text) => setContactForm(prev => ({ ...prev, name: text }))}
              placeholder={t('contact.namePlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
            />
            {formErrors.name && (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('contact.email')}</Text>
            <TextInput
              style={[styles.input, formErrors.email && styles.inputError]}
              value={contactForm.email}
              onChangeText={(text) => setContactForm(prev => ({ ...prev, email: text }))}
              placeholder={t('contact.emailPlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formErrors.email && (
              <Text style={styles.errorText}>{formErrors.email}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('contact.message')}</Text>
            <TextInput
              style={[styles.textArea, formErrors.message && styles.inputError]}
              value={contactForm.message}
              onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
              placeholder={t('contact.messagePlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {formErrors.message && (
              <Text style={styles.errorText}>{formErrors.message}</Text>
            )}
          </View>

          <View style={styles.modalButtons}>
            <Button
              variant="secondary"
              title={t('common.cancel')}
              onPress={onClose}
              disabled={isSending}
              style={styles.modalButton}
            />
            <Button
              variant="primary"
              title={isSending ? undefined : t('contact.send')}
              onPress={handleSubmit}
              disabled={isSending}
              style={styles.modalButton}
              icon={isSending ? <ActivityIndicator size="small" color={theme.colors.text.primary} /> : undefined}
            />
          </View>
        </View>
      )}
    </BlurView>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    modalContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg
    },
    modalContent: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '90%',
      maxWidth: 500,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      ...theme.shadows.lg
    },
    modalTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center'
    },
    formGroup: {
      marginBottom: theme.spacing.md
    },
    label: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    input: {
      backgroundColor: theme.colors.background.main,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      fontFamily: theme.typography.fontFamily.regular
    },
    textArea: {
      backgroundColor: theme.colors.background.main,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      fontFamily: theme.typography.fontFamily.regular,
      minHeight: 100
    },
    inputError: {
      borderColor: theme.colors.error
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.regular
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.lg
    },
    modalButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
};
