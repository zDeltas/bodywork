import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

export interface StoredUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class TokenStorageService {
  static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      ]);
      console.log('[TokenStorage] Tokens saved');
    } catch (error) {
      console.error('[TokenStorage] Failed to save tokens:', error);
      throw new Error('Failed to save authentication tokens');
    }
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('[TokenStorage] Failed to get access token:', error);
      return null;
    }
  }

  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('[TokenStorage] Failed to get refresh token:', error);
      return null;
    }
  }

  static async getTokens(): Promise<AuthTokens | null> {
    try {
      const [accessToken, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);

      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      
      return null;
    } catch (error) {
      console.error('[TokenStorage] Failed to get tokens:', error);
      return null;
    }
  }

  static async saveUser(user: StoredUser): Promise<void> {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      console.log('[TokenStorage] User info saved');
    } catch (error) {
      console.error('[TokenStorage] Failed to save user:', error);
      throw new Error('Failed to save user information');
    }
  }

  static async getUser(): Promise<StoredUser | null> {
    try {
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      
      if (userJson) {
        return JSON.parse(userJson);
      }
      
      return null;
    } catch (error) {
      console.error('[TokenStorage] Failed to get user:', error);
      return null;
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
      console.log('[TokenStorage] All auth data cleared');
    } catch (error) {
      console.error('[TokenStorage] Failed to clear auth data:', error);
      throw new Error('Failed to clear authentication data');
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      return tokens !== null;
    } catch (error) {
      return false;
    }
  }
}
