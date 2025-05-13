import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Header from '@/app/components/layout/Header';
import { router } from 'expo-router';

export default function ContactScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      message: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t('contact.errors.nameRequired');
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.errors.emailRequired');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('contact.errors.emailInvalid');
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.errors.messageRequired');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), t('contact.success'));
      setFormData({ name: '', email: '', message: '' });
      setErrors({ name: '', email: '', message: '' });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), t('contact.error'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('contact.title')} showBackButton={true} onBack={() => router.back()} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('contact.name')}</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder={t('contact.namePlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              value={formData.name}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, name: text }));
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: '' }));
                }
              }}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('contact.email')}</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder={t('contact.emailPlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              value={formData.email}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, email: text }));
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('contact.message')}</Text>
            <TextInput
              style={[styles.input, styles.messageInput, errors.message ? styles.inputError : null]}
              placeholder={t('contact.messagePlaceholder')}
              placeholderTextColor={theme.colors.text.secondary}
              value={formData.message}
              onChangeText={(text) => {
                setFormData((prev) => ({ ...prev, message: text }));
                if (errors.message) {
                  setErrors((prev) => ({ ...prev, message: '' }));
                }
              }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            {errors.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSending}
          >
            {isSending ? (
              <ActivityIndicator color={theme.colors.text.primary} />
            ) : (
              <Text style={styles.submitButtonText}>{t('contact.send')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: theme.spacing.lg,
    },
    formContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      ...theme.shadows.md,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      fontFamily: theme.typography.fontFamily.regular,
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
    messageInput: {
      height: 120,
      paddingTop: theme.spacing.md,
    },
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.regular,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.bold,
    },
  });
};
