import { BaseApiClient } from './BaseApiClient';
import { Config } from '@/app/utils/config';
import { StoredUser } from '../auth/tokenStorage';

export interface GoogleAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
}

class AuthApiClientImpl extends BaseApiClient {
  protected baseUrl = Config.apiBaseUrl;
  protected serviceName = 'AuthAPI';

  /**
   * Login avec Google ID Token
   * Échange le token Google contre des tokens backend
   */
  async loginWithGoogle(idToken: string): Promise<GoogleAuthResponse> {
    console.log('[AuthAPI] 📡 Exchanging Google token with backend...');
    console.log('[AuthAPI] Backend URL:', this.baseUrl);
    console.log('[AuthAPI] ID Token (first 50 chars):', idToken.substring(0, 50) + '...');

    const response = await this.post('/auth/google', { idToken }, { skipAuth: true });

    console.log('[AuthAPI] 📨 Response received');
    console.log('[AuthAPI] Status:', response.status);
    console.log('[AuthAPI] OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `Backend error: ${response.status}`;
      console.error('[AuthAPI] ❌ Backend error:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[AuthAPI] ✅ Backend response:', {
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
  }

  async refresh(refreshToken: string) {
    return this.post('/auth/refresh', { refreshToken }, { skipAuth: true });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getUserProfile() {
    return this.get('/auth/me');
  }
}

export const AuthApiClient = new AuthApiClientImpl();
