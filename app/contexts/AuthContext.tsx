import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { getSupabaseClient } from '@/app/services/supabase';

export type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: import('@supabase/supabase-js').User | null;
  accessToken?: string;
  signInWithEmail: (email: string) => Promise<{ sent: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ started: boolean; error?: string }>;
  signInWithApple: () => Promise<{ started: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ sent: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  signInWithEmail: async () => ({ sent: false, error: 'not-initialized' }),
  signInWithPassword: async () => ({ success: false, error: 'not-initialized' }),
  signUpWithPassword: async () => ({ success: false, error: 'not-initialized' }),
  signInWithGoogle: async () => ({ started: false, error: 'not-initialized' }),
  signInWithApple: async () => ({ started: false, error: 'not-initialized' }),
  resetPassword: async () => ({ sent: false, error: 'not-initialized' }),
  refreshSession: async () => undefined,
  signOut: async () => undefined,
});

const REDIRECT_URI = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI || 'myapp://auth/callback';

// Ensure WebBrowser can conclude pending sessions (Expo recommendation)
if (Platform.OS !== 'web') {
  try {
    WebBrowser.maybeCompleteAuthSession();
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  // Initial session fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setUser(data.session?.user ?? null);
        setAccessToken(data.session?.access_token);
      } catch {}
      setIsLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // Subscribe to auth state changes
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Handle deep links (magic link / oauth) and pass to Supabase if needed
  useEffect(() => {
    const handler = async (event: Linking.EventType) => {
      if (typeof event === 'string') return; // web fallback
      const url = 'url' in event ? event.url : undefined;
      if (!url) return;
      // Supabase will handle session exchange automatically if opened via its hosted callback.
      // For safety we just refresh the session after a short delay.
      setTimeout(() => {
        void refreshSession();
      }, 250);
    };

    const sub = Linking.addEventListener('url', handler as any);
    return () => {
      // @ts-expect-error: RN types differ by version
      sub?.remove?.();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: REDIRECT_URI,
        },
      });
      if (error) return { sent: false, error: error.message };
      return { sent: true };
    } catch (e: any) {
      return { sent: false, error: e?.message ?? 'unknown-error' };
    }
  }, [supabase]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message ?? 'unknown-error' };
    }
  }, [supabase]);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: REDIRECT_URI,
        },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message ?? 'unknown-error' };
    }
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URI,
          scopes: 'openid email profile',
        },
      });
      if (error) return { started: false, error: error.message };

      // On native, Supabase does not auto-open the browser. Open the URL ourselves.
      if (Platform.OS !== 'web' && data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
        // After returning from the browser, refresh session
        await refreshSession();
      }

      return { started: true };
    } catch (e: any) {
      return { started: false, error: e?.message ?? 'unknown-error' };
    }
  }, [supabase, refreshSession]);

  const signInWithApple = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: REDIRECT_URI,
          scopes: 'name email',
        },
      });
      if (error) return { started: false, error: error.message };

      // On native, Supabase does not auto-open the browser. Open the URL ourselves.
      if (Platform.OS !== 'web' && data?.url) {
        await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
        // After returning from the browser, refresh session
        await refreshSession();
      }

      return { started: true };
    } catch (e: any) {
      return { started: false, error: e?.message ?? 'unknown-error' };
    }
  }, [supabase, refreshSession]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: REDIRECT_URI,
      });
      if (error) return { sent: false, error: error.message };
      return { sent: true };
    } catch (e: any) {
      return { sent: false, error: e?.message ?? 'unknown-error' };
    }
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setAccessToken(data.session?.access_token);
    } catch {}
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(undefined);
    } catch {}
  }, [supabase]);

  const value: AuthContextValue = useMemo(() => ({
    isLoading,
    isAuthenticated: !!user,
    user,
    accessToken,
    signInWithEmail,
    signInWithPassword,
    signUpWithPassword,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    refreshSession,
    signOut,
  }), [isLoading, user, accessToken, signInWithEmail, signInWithPassword, signUpWithPassword, signInWithGoogle, signInWithApple, resetPassword, refreshSession, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
