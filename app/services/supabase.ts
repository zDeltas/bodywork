import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const extra = (Constants.expoConfig as any)?.extra || (Constants.manifest as any)?.extra || {};
  const SUPABASE_URL = extra.SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = extra.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase configuration: SUPABASE_URL and/or SUPABASE_ANON_KEY');
  }

  try {
    console.log('[Feedback] Supabase init', {
      hasUrl: !!SUPABASE_URL,
      anonKeyLen: typeof SUPABASE_ANON_KEY === 'string' ? SUPABASE_ANON_KEY.length : 0,
    });
  } catch {}

  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // RN/Expo: no URL parsing
    },
  });
  return client;
}
