import Constants from 'expo-constants';

// Centralized configuration access
export const Config = {
  backendUrl:
    (Constants.expoConfig?.extra as any)?.backendUrl ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    '',
  googleAndroidClientId:
    ((Constants.expoConfig?.extra as any)?.googleOAuth?.androidClientId as string) ||
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    '',
};

export function assertConfig() {
  if (!Config.googleAndroidClientId) {
    console.warn(
      '[Auth] ⚠️  Missing Google Client ID. ' +
      'IMPORTANT: expo-auth-session requires a WEB OAuth client (not Android). ' +
      'Set extra.googleOAuth.androidClientId in app.json with your WEB client ID.'
    );
  }
  if (!Config.backendUrl) {
    console.warn(
      '[Auth] Missing backendUrl. Set extra.backendUrl in app.json or EXPO_PUBLIC_BACKEND_URL.'
    );
  }
  
  // Log configuration au démarrage
  console.log('[Auth] Configuration loaded:');
  console.log(`[Auth] - Client ID: ${Config.googleAndroidClientId ? '✅ Configured' : '❌ Missing'}`);
  console.log(`[Auth] - Backend URL: ${Config.backendUrl || '❌ Not configured (placeholder)'}`);
}
