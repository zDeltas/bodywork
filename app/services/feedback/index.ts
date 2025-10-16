export type FeedbackPayload = {
  score: number;
  liked?: string;
  missing?: string;
  suggestion?: string;
  contact_email?: string;
  consent_contact?: boolean;
  app_version?: string;
  device?: string;
};

export async function enqueueFeedback(payload: FeedbackPayload): Promise<void> {
  try {
    console.log('[Feedback] enqueueFeedback called with payload:', payload);
  } catch (e) {
    throw e;
  }
}

export default {
  enqueueFeedback,
};
