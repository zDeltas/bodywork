import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import { getAuthRequestConfig, GoogleAuthResult } from '@/app/utils/auth/google';
import { assertConfig } from '@/app/utils/config';
import { useAuth } from '@/app/contexts/AuthContext';
import { StoredUser } from '@/app/services/auth/tokenStorage';

export type UseGoogleAuthResult = {
  loading: boolean;
  error?: string;
  signIn: () => Promise<void>;
  isAuthenticated: boolean;
  user: StoredUser | null;
};

export function useGoogleAuth(): UseGoogleAuthResult {
  assertConfig();

  const { signIn: authSignIn, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const requestConfig = useMemo(() => getAuthRequestConfig(), []);
  const [, response, promptAsync] = Google.useAuthRequest(requestConfig);

  const exchangeTokenWithBackend = useCallback(async (googleAuthResult: GoogleAuthResult) => {
    const { idToken } = googleAuthResult;
    if (!idToken) {
      throw new Error('No ID token received from Google');
    }

    console.log('========================================');
    console.log('[GoogleAuth] 📡 BACKEND EXCHANGE');
    console.log('========================================');
    console.log('[GoogleAuth] ID Token (first 50 chars):', idToken.substring(0, 50) + '...');
    console.log('[GoogleAuth] Backend URL: http://10.0.2.2:8080/auth/google');
    
    try {
      console.log('[GoogleAuth] 🚀 Starting fetch...');
      const response = await fetch('http://10.0.2.2:8080/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      console.log('[GoogleAuth] 📨 Response received');
      console.log('[GoogleAuth] Status:', response.status);
      console.log('[GoogleAuth] OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Backend error: ${response.status}`;
        console.error('[GoogleAuth] ❌ Backend error:', errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[GoogleAuth] ✅ Backend response:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        hasUser: !!data.user,
        userEmail: data.user?.email
      });

      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user as StoredUser,
      };
    } catch (error: any) {
      console.error('========================================');
      console.error('[GoogleAuth] ❌ BACKEND ERROR');
      console.error('========================================');
      console.error('[GoogleAuth] Error name:', error.name);
      console.error('[GoogleAuth] Error message:', error.message);
      console.error('[GoogleAuth] Error stack:', error.stack);
      
      if (error.message.includes('Network request failed')) {
        console.error('[GoogleAuth] 🔴 NETWORK FAILED - Backend not reachable');
        console.error('[GoogleAuth] Possible causes:');
        console.error('[GoogleAuth] - Backend Spring Boot not running on port 8080');
        console.error('[GoogleAuth] - Using emulator: Try http://10.0.2.2:8080');
        console.error('[GoogleAuth] - Using real device: Use PC IP address');
        throw new Error('Backend non accessible. Vérifiez que Spring Boot tourne sur le port 8080.');
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    const handleResponse = async () => {
      if (!response) return;
      
      console.log('========================================');
      console.log('[GoogleAuth] 📥 GOOGLE OAUTH RESPONSE RECEIVED');
      console.log('========================================');
      console.log('[GoogleAuth] Response type:', response.type);
      
      try {
        if (response.type === 'success') {
          console.log('[GoogleAuth] ✅ Google OAuth successful!');
          
          const { authentication } = response;
          const googleAuthResult: GoogleAuthResult = {
            idToken: (response.params as any)?.id_token || authentication?.idToken,
            accessToken: authentication?.accessToken,
            expiresIn: authentication?.expiresIn,
            tokenType: authentication?.tokenType,
            scope: (response.params as any)?.scope,
          };

          console.log('[GoogleAuth] ID Token found:', !!googleAuthResult.idToken);
          console.log('[GoogleAuth] Access Token found:', !!googleAuthResult.accessToken);

          if (!googleAuthResult.idToken) {
            console.error('[GoogleAuth] ❌ No ID token in response!');
            throw new Error('No ID token received from Google');
          }

          console.log('[GoogleAuth] 🚀 Calling exchangeTokenWithBackend...');
          const backendTokens = await exchangeTokenWithBackend(googleAuthResult);
          
          console.log('[GoogleAuth] 💾 Calling authSignIn...');
          await authSignIn(
            backendTokens.accessToken,
            backendTokens.refreshToken,
            backendTokens.user
          );

          console.log('[GoogleAuth] ✅ Sign in complete!');
          setError(undefined);
        } else if (response.type === 'error') {
          const errorMsg = response.error?.message || 'Authentication failed';
          console.error('[GoogleAuth] ❌ OAuth error:', errorMsg);
          setError(errorMsg);
        } else if (response.type === 'cancel') {
          console.log('[GoogleAuth] ⚠️ User cancelled OAuth');
          setError('Connexion annulée');
        }
      } catch (e: any) {
        console.error('========================================');
        console.error('[GoogleAuth] ❌ SIGN-IN ERROR');
        console.error('========================================');
        console.error('[GoogleAuth] Error message:', e.message);
        console.error('[GoogleAuth] Error stack:', e.stack);
        setError(e?.message || 'Failed to sign in with Google');
      } finally {
        setLoading(false);
        console.log('[GoogleAuth] ========================================');
      }
    };

    handleResponse();
  }, [response, exchangeTokenWithBackend, authSignIn]);

  const signIn = useCallback(async () => {
    setError(undefined);
    setLoading(true);

    try {
      if (Constants.appOwnership === 'expo') {
        setError(
          'La connexion Google nécessite un build natif. ' +
          'Expo Go ne supporte pas l\'authentification OAuth native Android.'
        );
        setLoading(false);
        return;
      }

      await promptAsync();
    } catch (e: any) {
      console.error('[GoogleAuth] Prompt error:', e.message);
      setError(e?.message || 'Unknown error');
      setLoading(false);
    }
  }, [promptAsync]);

  return { 
    loading, 
    error, 
    signIn,
    isAuthenticated,
    user,
  };
}

export default useGoogleAuth;
