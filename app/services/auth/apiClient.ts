import { TokenStorageService } from './tokenStorage';
import { Config } from '@/app/utils/config';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export class ApiClient {
  private static isRefreshing = false;
  private static refreshPromise: Promise<string | null> | null = null;

  static async fetch(url: string, options: RequestOptions = {}): Promise<Response> {
    const { skipAuth, ...fetchOptions } = options;

    if (skipAuth) {
      return fetch(url, fetchOptions);
    }

    const accessToken = await TokenStorageService.getAccessToken();
    const headers = new Headers(fetchOptions.headers);

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401 && !skipAuth) {
      console.log('[ApiClient] Token expired, attempting refresh...');

      const newToken = await this.refreshAccessToken();

      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      } else {
        console.error('[ApiClient] Token refresh failed, user needs to re-authenticate');
      }
    }

    return response;
  }

  private static async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private static async performRefresh(): Promise<string | null> {
    try {
      const refreshToken = await TokenStorageService.getRefreshToken();

      if (!refreshToken) {
        console.error('[ApiClient] No refresh token available');
        return null;
      }

      if (!Config.backendUrl) {
        console.error('[ApiClient] Backend URL not configured');
        return null;
      }

      const refreshUrl = Config.backendUrl.replace('/auth/google', '/auth/refresh');
      const response = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('[ApiClient] Refresh failed:', response.status);
        await TokenStorageService.clearAll();
        return null;
      }

      const data = await response.json();
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data;

      if (!newAccessToken || !newRefreshToken) {
        console.error('[ApiClient] Invalid refresh response');
        return null;
      }

      await TokenStorageService.saveTokens(newAccessToken, newRefreshToken);
      console.log('[ApiClient] Token refreshed successfully');

      return newAccessToken;
    } catch (error) {
      console.error('[ApiClient] Token refresh error:', error);
      await TokenStorageService.clearAll();
      return null;
    }
  }

  static async get(url: string, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: 'GET' });
  }

  static async post(url: string, body?: any, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async put(url: string, body?: any, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async delete(url: string, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(url, { ...options, method: 'DELETE' });
  }
}
