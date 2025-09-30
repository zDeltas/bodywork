import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from '@/app/components/ui/Modal';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import useSnackbar from '@/app/hooks/useSnackbar';
import { enqueueFeedback } from '@/app/services/feedback';
import { storageService } from '@/app/services';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import NetInfo from '@react-native-community/netinfo';

export type FeedbackModalProps = {
  visible: boolean;
  onClose: () => void;
};

const MAX_TEXT = 500;

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showSuccess, showError, showWarning } = useSnackbar();

  const [score, setScore] = useState<number>(5);
  const [liked, setLiked] = useState('');
  const [missing, setMissing] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [consent, setConsent] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  const isValidEmail = (val: string) => /.+@.+\..+/.test(val.trim());
  const scoreColor = score <= 6 ? theme.colors.error : score <= 8 ? theme.colors.warning : theme.colors.success;

  const LIKED_CHIPS = useMemo(() => [
    t('feedback.chips.liked.ui'),
    t('feedback.chips.liked.performance'),
    t('feedback.chips.liked.features'),
    t('feedback.chips.liked.simplicity'),
  ], [t]);
  const MISSING_CHIPS = useMemo(() => [
    t('feedback.chips.missing.stats'),
    t('feedback.chips.missing.exercises'),
    t('feedback.chips.missing.customization'),
    t('feedback.chips.missing.export'),
  ], [t]);

  const addChip = (target: 'liked' | 'missing', value: string) => {
    if (target === 'liked') {
      if (!liked.includes(value)) setLiked(prev => (prev ? `${prev}${prev.endsWith(' ') ? '' : ' '}${value}` : value));
    } else {
      if (!missing.includes(value)) setMissing(prev => (prev ? `${prev}${prev.endsWith(' ') ? '' : ' '}${value}` : value));
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const net = await NetInfo.fetch();
      const app_version = Constants.expoConfig?.version || '';
      const device = `${Platform.OS} ${Platform.Version ?? ''}`;
      await enqueueFeedback({
        score,
        liked: liked || undefined,
        missing: missing || undefined,
        suggestion: suggestion || undefined,
        contact_email: contactEmail || undefined,
        consent_contact: !!consent,
        app_version,
        device,
      });
      if (!net.isConnected) {
        showWarning?.(t('feedback.offlineQueued'));
      } else {
        showSuccess?.(t('feedback.sentSuccess'));
      }
      try { await storageService.clearFeedbackPendingPrompt(); } catch {}
      // Reset form and close
      setScore(7); setLiked(''); setMissing(''); setSuggestion(''); setContactEmail(''); setConsent(false);
      onClose();
    } catch (e) {
      showError?.(t('feedback.failedQueued'));
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title={t('feedback.title')}>
      <View style={{ gap: theme.spacing.lg }}>
        {/* Score */}
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={{ color: theme.colors.text.secondary }}>
            {t('feedback.score')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
            {Array.from({ length: 11 }).map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setScore(i)}
                style={{
                  width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: score === i ? theme.colors.primary : theme.colors.background.card,
                  borderWidth: score === i ? 0 : 1,
                  borderColor: theme.colors.border?.default || 'transparent'
                }}
              >
                <Text style={{ color: score === i ? theme.colors.background.main : theme.colors.text.primary }}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ color: scoreColor, marginTop: theme.spacing.xs }}>{score <= 6 ? t('feedback.scoreLabelLow') : score <= 8 ? t('feedback.scoreLabelMid') : t('feedback.scoreLabelHigh')}</Text>
        </View>

        {/* Liked */}
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={{ color: theme.colors.text.secondary }}>
            {t('feedback.liked')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {LIKED_CHIPS.map((c) => (
              <TouchableOpacity key={c} onPress={() => addChip('liked', c)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: theme.colors.background.card, borderWidth: 1, borderColor: theme.colors.border?.default || 'transparent' }}>
                <Text style={{ color: theme.colors.text.secondary }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ backgroundColor: theme.colors.background.button, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border.default || 'transparent' }}>
            <TextInput
              value={liked}
              onChangeText={(v) => v.length <= MAX_TEXT && setLiked(v)}
              placeholder={t('feedback.optional')}
              style={{ color: theme.colors.text.primary, minHeight: 60 }}
              placeholderTextColor={theme.colors.text.secondary}
              multiline
            />
          </View>
          <Text style={{ alignSelf: 'flex-end', color: theme.colors.text.secondary }}>{liked.length}/{MAX_TEXT}</Text>
        </View>

        {/* Missing */}
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={{ color: theme.colors.text.secondary }}>
            {t('feedback.missing')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
            {MISSING_CHIPS.map((c) => (
              <TouchableOpacity key={c} onPress={() => addChip('missing', c)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: theme.colors.background.card, borderWidth: 1, borderColor: theme.colors.border?.default || 'transparent' }}>
                <Text style={{ color: theme.colors.text.secondary }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ backgroundColor: theme.colors.background.button, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border.default || 'transparent' }}>
            <TextInput
              value={missing}
              onChangeText={(v) => v.length <= MAX_TEXT && setMissing(v)}
              placeholder={t('feedback.optional')}
              style={{ color: theme.colors.text.primary, minHeight: 60 }}
              placeholderTextColor={theme.colors.text.secondary}
              multiline
            />
          </View>
          <Text style={{ alignSelf: 'flex-end', color: theme.colors.text.secondary }}>{missing.length}/{MAX_TEXT}</Text>
        </View>

        {/* Suggestion */}
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={{ color: theme.colors.text.secondary }}>{t('feedback.suggestion')}</Text>
          <View style={{ backgroundColor: theme.colors.background.button, borderRadius: theme.borderRadius.md, padding: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border.default || 'transparent' }}>
            <TextInput
              value={suggestion}
              onChangeText={(v) => v.length <= MAX_TEXT && setSuggestion(v)}
              placeholder={t('feedback.optional')}
              style={{ color: theme.colors.text.primary, minHeight: 60 }}
              placeholderTextColor={theme.colors.text.secondary}
              multiline
            />
          </View>
          <Text style={{ alignSelf: 'flex-end', color: theme.colors.text.secondary }}>{suggestion.length}/{MAX_TEXT}</Text>
        </View>

        {/* Contact */}
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={{ color: theme.colors.text.secondary }}>{t('feedback.email')}</Text>
          <View style={{ backgroundColor: theme.colors.background.button, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs, borderWidth: 1, borderColor: theme.colors.border.default || 'transparent' }}>
            <TextInput
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="email@example.com"
              style={{ color: theme.colors.text.primary, minHeight: 40 }}
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {!!contactEmail && !isValidEmail(contactEmail) && (
            <Text style={{ color: theme.colors.error }}>
              {t('feedback.emailInvalid')}
            </Text>
          )}
          <Text style={{ color: theme.colors.text.secondary }}>
            {t('feedback.emailHint')}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Switch value={!!consent} onValueChange={setConsent} />
          <Text style={{ flex: 1 }}>
            {t('feedback.consent')}
          </Text>
        </View>

        <TouchableOpacity
          disabled={submitting || (!!contactEmail && !isValidEmail(contactEmail))}
          onPress={handleSubmit}
          style={[{ backgroundColor: theme.colors.text.primary, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.lg, alignItems: 'center' }, (submitting || (!!contactEmail && !isValidEmail(contactEmail))) && { opacity: 0.6 }]}
        >
          {submitting ? (
            <ActivityIndicator color={theme.colors.background.main} />
          ) : (
            <Text style={{ color: theme.colors.background.main, fontFamily: theme.typography.fontFamily.semiBold }}>{t('feedback.send')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default FeedbackModal;
