import type { FeedbackPayload } from './index';

export async function fetchAndLogAllFeedback(): Promise<void> {
  try {
    console.log('[Feedback] fetchAndLogAllFeedback: no remote API configured. Nothing to fetch.');
  } catch (e) {
    console.warn('[Feedback] fetchAndLogAllFeedback failed:', e);
  }
}

export async function sendFeedback(_payload: FeedbackPayload): Promise<void> {
  console.log('[Feedback] sendFeedback called (stub)');
}
