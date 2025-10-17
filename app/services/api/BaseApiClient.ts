import { TokenStorageService } from '../auth/tokenStorage';

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export abstract class BaseApiClient {
  protected abstract baseUrl: string;
  protected abstract serviceName: string;

  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  protected async fetch(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    const { skipAuth, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint);

    console.log(`[${this.serviceName}] Request to ${url}`);

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
      console.log(`[${this.serviceName}] Token expired, attempting refresh...`);

      const newToken = await this.refreshAccessToken();

      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        response = await fetch(url, {
          ...fetchOptions,
          headers,
        });
      } else {
        console.error(`[${this.serviceName}] Token refresh failed`);
      }
    }

    return response;
  }

  protected async get(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  protected async post(endpoint: string, body?: any, options: RequestOptions = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    if (body) {
      headers.set('Content-Type', 'application/json');
    }

    return this.fetch(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected async put(endpoint: string, body?: any, options: RequestOptions = {}): Promise<Response> {
    const headers = new Headers(options.headers);
    if (body) {
      headers.set('Content-Type', 'application/json');
    }

    return this.fetch(endpoint, {
      ...options,
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected async delete(endpoint: string, options: RequestOptions = {}): Promise<Response> {
    return this.fetch(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  private async refreshAccessToken(): Promise<string | null> {
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

  protected async performRefresh(): Promise<string | null> {
    try {
      const refreshToken = await TokenStorageService.getRefreshToken();

      if (!refreshToken) {
        console.error(`[${this.serviceName}] No refresh token available`);
        return null;
      }

      const response = await fetch(this.buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error(`[${this.serviceName}] Refresh failed:`, response.status);
        await TokenStorageService.clearTokens();
        return null;
      }

      const data = await response.json();
      const { accessToken, refreshToken: newRefreshToken } = data;

      if (accessToken) {
        await TokenStorageService.saveTokens(accessToken, newRefreshToken || refreshToken);
        console.log(`[${this.serviceName}] Token refreshed successfully`);
        return accessToken;
      }

      return null;
    } catch (error) {
      console.error(`[${this.serviceName}] Refresh error:`, error);
      return null;
    }
  }
}
