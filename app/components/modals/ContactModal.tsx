import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { StatsCardSkeleton } from '@/app/components/ui/SkeletonComponents';
import { Button } from '@/app/components/ui/Button';
import Modal from '@/app/components/ui/Modal';

interface ContactModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ContactModal({ isVisible, onClose }: ContactModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async () => {
    // Validation
    const errors = {
      name: !contactForm.name ? t('contact.errors.nameRequired') : '',
      email: !contactForm.email ? t('contact.errors.emailRequired') : '',
      message: !contactForm.message ? t('contact.errors.messageRequired') : ''
    };

    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      return;
    }

    setIsSending(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert(t('contact.success'), t('contact.success'));
      onClose();
    } catch (error) {
      Alert.alert(t('contact.error'), t('contact.error'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      onClose={onClose}
      title={t('contact.title')}
      showCloseButton={true}
    >
      {isLoading ? (
        <View style={styles.modalContent}>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </View>
      ) : (
        <View style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('contact.name')}</Text>
            <TextInput
              style={[styles.input, formErrors.name && styles.inputError]}
              value={contactForm.name}
              onChangeText={(text) => setContactForm((prev) => ({ ...prev, name: text }))}
              placeholder={t('contact.namePlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
            />
            {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('contact.email')}</Text>
            <TextInput
              style={[styles.input, formErrors.email && styles.inputError]}
              value={contactForm.email}
              onChangeText={(text) => setContactForm((prev) => ({ ...prev, email: text }))}
              placeholder={t('contact.emailPlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {formErrors.email && <Text style={styles.errorText}>{formErrors.email}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t('contact.message')}</Text>
            <TextInput
              style={[styles.textArea, formErrors.message && styles.inputError]}
              value={contactForm.message}
              onChangeText={(text) => setContactForm((prev) => ({ ...prev, message: text }))}
              placeholder={t('contact.messagePlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {formErrors.message && <Text style={styles.errorText}>{formErrors.message}</Text>}
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
              icon={
                isSending ? (
                  <ActivityIndicator size="small" color={theme.colors.text.primary} />
                ) : undefined
              }
            />
          </View>
        </View>
      )}
    </Modal>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    modalContent: {
      padding: theme.spacing.lg,
    },
    formGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    input: {
      backgroundColor: theme.colors.background.main,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      fontFamily: theme.typography.fontFamily.regular,
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
      minHeight: 100,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    modalButton: {
      minWidth: 100,
    },
  });
};
