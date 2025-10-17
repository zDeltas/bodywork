import Constants from 'expo-constants';

// Centralized configuration access
export const Config = {
  // API Backend unique (localhost en dev, distant en prod)
  apiBaseUrl:
    (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (__DEV__ ? 'http://192.168.1.125:8080' : 'https://api.gainizi.com'),

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
  
  // Log configuration au démarrage
  console.log('[Config] Configuration loaded:');
  console.log(`[Config] - Client ID: ${Config.googleAndroidClientId ? '✅ Configured' : '❌ Missing'}`);
  console.log(`[Config] - API Base URL: ${Config.apiBaseUrl}`);
  console.log(`[Config] - Environment: ${__DEV__ ? 'Development' : 'Production'}`);
}
