import { BaseApiClient } from './BaseApiClient';
import { Config } from '@/app/utils/config';
import { FeedbackPayload, FeedbackResponse } from '../feedback/types';

/**
 * Client API spécifique pour le feedback
 * Utilise Config.apiBaseUrl (localhost:8080 en dev, api distant en prod)
 */
class FeedbackApiClientImpl extends BaseApiClient {
  protected baseUrl = Config.apiBaseUrl;
  protected serviceName = 'FeedbackAPI';

  /**
   * Envoyer un feedback
   * Gère automatiquement la validation et le parsing de la réponse
   */
  async sendFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
    console.log('[FeedbackAPI] 📤 Sending feedback...');
    console.log('[FeedbackAPI] Backend URL:', this.baseUrl);
    console.log('[FeedbackAPI] Payload:', {
      score: payload.score,
      hasLiked: !!payload.liked,
      hasMissing: !!payload.missing,
      hasSuggestion: !!payload.suggestion,
      hasEmail: !!payload.contact_email,
      consent: payload.consent_contact,
    });

    const response = await this.post('/api/feedback', payload, {
      skipAuth: false, // Inclut le token JWT si disponible
    });

    console.log('[FeedbackAPI] 📨 Response received');
    console.log('[FeedbackAPI] Status:', response.status);
    console.log('[FeedbackAPI] OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Backend error: ${response.status}`;
      console.error('[FeedbackAPI] ❌ Backend error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data: FeedbackResponse = await response.json();
    console.log('[FeedbackAPI] ✅ Feedback sent successfully:', {
      id: data.id,
      message: data.message,
    });

    return data;
  }
}

export const FeedbackApiClient = new FeedbackApiClientImpl();
