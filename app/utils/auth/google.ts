import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Config } from '../config';

WebBrowser.maybeCompleteAuthSession();

export type GoogleAuthResult = {
  idToken?: string;
  accessToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
};

export function getRedirectUri() {
  return makeRedirectUri({
    native: `com.googleusercontent.apps.${Config.googleAndroidClientId.split('.apps.googleusercontent.com')[0]}:/oauth2redirect/google`,
  });
}

export function getAuthRequestConfig(scopes: string[] = ['openid', 'profile', 'email']) {

  const redirectUri = getRedirectUri();
  console.log('[GoogleAuth] ==========================================');
  console.log('[GoogleAuth] MODE: ANDROID');
  console.log('[GoogleAuth] Client ID:', Config.googleAndroidClientId);
  console.log('[GoogleAuth] Redirect URI:', redirectUri);
  console.log('[GoogleAuth] Scopes:', scopes.join(', '));
  console.log('[GoogleAuth] ==========================================');
  
  return {
    androidClientId: Config.googleAndroidClientId,
    redirectUri,
    scopes,
    usePKCE: false,
    extraParams: {
      prompt: 'select_account',
    },
  };
}
