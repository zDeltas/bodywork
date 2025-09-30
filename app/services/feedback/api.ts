import { getSupabaseClient } from '@/app/services/supabase';
import { FeedbackPayload } from './types';

/**
 * Insert-only API. No reads.
 */
export async function sendFeedback(payload: FeedbackPayload): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    console.log('[Feedback] sendFeedback -> inserting', {
      hasPayload: !!payload,
      score: payload?.score,
      consent: payload?.consent_contact,
      hasLiked: !!payload?.liked,
      hasMissing: !!payload?.missing,
      hasSuggestion: !!payload?.suggestion,
      hasEmail: !!payload?.contact_email,
    });
    const { error } = await supabase.from('feedback').insert([payload]);
    if (error) {
      console.warn('[Feedback] sendFeedback -> insert error', {
        code: (error as any)?.code,
        message: error.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      });
      throw error;
    }
    console.log('[Feedback] sendFeedback -> success');
  } catch (e: any) {
    console.warn('[Feedback] sendFeedback -> exception', { message: e?.message });
    throw e;
  }
}

/**
 * Debug utility: fetch all feedback rows and log them.
 */
export async function fetchAndLogAllFeedback(): Promise<void> {
  console.log("here");
  const supabase = getSupabaseClient();
  try {
    console.log('[Feedback] fetchAll -> start');
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[Feedback] fetchAll -> error', {
        code: (error as any)?.code,
        message: error.message,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
      });
      return;
    }
    console.log('[Feedback] fetchAll -> rows', { count: data?.length ?? 0 });
    if (Array.isArray(data)) {
      data.forEach((row, idx) => {
        console.log(`[Feedback] row#${idx + 1}`, row);
      });
    }
  } catch (e: any) {
    console.warn('[Feedback] fetchAll -> exception', { message: e?.message });
  }
}
