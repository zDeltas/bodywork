#!/usr/bin/env node

/**
 * Script de validation de la configuration Google OAuth 2.0
 * Vérifie que tous les éléments requis sont en place
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const APP_JSON_PATH = path.join(ROOT_DIR, 'app.json');

console.log('🔍 Validation de la configuration Google OAuth 2.0...\n');

let hasErrors = false;
let hasWarnings = false;

// Vérification 1: app.json existe
if (!fs.existsSync(APP_JSON_PATH)) {
  console.error('❌ ERREUR: app.json introuvable');
  hasErrors = true;
  process.exit(1);
}

const appJson = JSON.parse(fs.readFileSync(APP_JSON_PATH, 'utf8'));
const expo = appJson.expo || {};

// Vérification 2: Scheme configuré
console.log('📱 Vérification du scheme...');
if (!expo.scheme) {
  console.error('❌ ERREUR: expo.scheme non configuré dans app.json');
  console.error('   Ajoutez: "scheme": "gainizi"');
  hasErrors = true;
} else {
  console.log(`✅ Scheme configuré: ${expo.scheme}`);
}

// Vérification 3: Package Android
console.log('\n📦 Vérification du package Android...');
if (!expo.android?.package) {
  console.error('❌ ERREUR: expo.android.package non configuré');
  console.error('   Ajoutez: "android": { "package": "com.votreorg.gainizi" }');
  hasErrors = true;
} else {
  console.log(`✅ Package Android: ${expo.android.package}`);
}

// Vérification 4: Intent filters
console.log('\n🔗 Vérification des intent filters...');
const intentFilters = expo.android?.intentFilters || [];
const hasAuthFilter = intentFilters.some(filter => {
  const data = filter.data || [];
  return data.some(d => d.scheme && d.host === 'auth');
});

if (!hasAuthFilter) {
  console.warn('⚠️  ATTENTION: Aucun intent filter pour l\'authentification détecté');
  console.warn('   Recommandé: ajouter un intent filter avec scheme et host="auth"');
  hasWarnings = true;
} else {
  console.log('✅ Intent filters configurés');
}

// Vérification 5: Google Client ID
console.log('\n🔑 Vérification du Google Client ID...');
const clientId = expo.extra?.googleOAuth?.androidClientId;
if (!clientId) {
  console.error('❌ ERREUR: Google Android Client ID manquant');
  console.error('   Ajoutez dans app.json:');
  console.error('   "extra": { "googleOAuth": { "androidClientId": "YOUR_ID.apps.googleusercontent.com" } }');
  hasErrors = true;
} else if (!clientId.includes('.apps.googleusercontent.com')) {
  console.error('❌ ERREUR: Format du Client ID invalide');
  console.error(`   Reçu: ${clientId}`);
  console.error('   Format attendu: XXXXXX.apps.googleusercontent.com');
  hasErrors = true;
} else if (clientId.includes('YOUR_CLIENT_ID') || clientId.includes('your')) {
  console.warn('⚠️  ATTENTION: Le Client ID semble être un placeholder');
  console.warn('   Remplacez par votre vrai Client ID depuis Google Cloud Console');
  hasWarnings = true;
} else {
  console.log(`✅ Google Client ID configuré: ${clientId.substring(0, 20)}...`);
}

// Vérification 6: Backend URL
console.log('\n🌐 Vérification du Backend URL...');
const backendUrl = expo.extra?.backendUrl;
if (!backendUrl) {
  console.error('❌ ERREUR: Backend URL manquant');
  console.error('   Ajoutez dans app.json:');
  console.error('   "extra": { "backendUrl": "https://your-backend.com/auth/google" }');
  hasErrors = true;
} else if (backendUrl.includes('example.com') || backendUrl.includes('your-backend')) {
  console.warn('⚠️  ATTENTION: Le Backend URL semble être un placeholder');
  console.warn('   Remplacez par votre vrai URL backend');
  hasWarnings = true;
} else if (!backendUrl.startsWith('https://')) {
  console.error('❌ ERREUR: Le Backend URL doit utiliser HTTPS');
  console.error(`   Reçu: ${backendUrl}`);
  hasErrors = true;
} else {
  console.log(`✅ Backend URL configuré: ${backendUrl}`);
}

// Vérification 7: Plugins
console.log('\n🔌 Vérification des plugins Expo...');
const plugins = expo.plugins || [];
const requiredPlugins = ['expo-secure-store', 'expo-web-browser', 'expo-router'];
const missingPlugins = requiredPlugins.filter(p => !plugins.includes(p));

if (missingPlugins.length > 0) {
  console.warn('⚠️  ATTENTION: Plugins manquants recommandés:');
  missingPlugins.forEach(p => console.warn(`   - ${p}`));
  hasWarnings = true;
} else {
  console.log('✅ Plugins requis présents');
}

// Vérification 8: Fichiers services
console.log('\n📄 Vérification des fichiers de services...');
const requiredFiles = [
  'app/services/auth/tokenStorage.ts',
  'app/services/auth/apiClient.ts',
  'app/contexts/AuthContext.tsx',
  'app/hooks/useGoogleAuth.ts',
  'app/utils/auth/google.ts',
  'app/utils/config.ts'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(ROOT_DIR, file)));

if (missingFiles.length > 0) {
  console.error('❌ ERREUR: Fichiers manquants:');
  missingFiles.forEach(f => console.error(`   - ${f}`));
  hasErrors = true;
} else {
  console.log('✅ Tous les fichiers de services présents');
}

// Vérification 9: Dependencies
console.log('\n📚 Vérification des dépendances...');
const packageJsonPath = path.join(ROOT_DIR, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'expo-auth-session',
    'expo-secure-store',
    'expo-web-browser'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !deps[dep]);
  
  if (missingDeps.length > 0) {
    console.error('❌ ERREUR: Dépendances manquantes:');
    missingDeps.forEach(dep => console.error(`   - ${dep}`));
    console.error('\n   Installez avec: yarn add ' + missingDeps.join(' '));
    hasErrors = true;
  } else {
    console.log('✅ Dépendances requises installées');
  }
}

// Résumé final
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.error('\n❌ VALIDATION ÉCHOUÉE - Des erreurs doivent être corrigées\n');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('\n⚠️  VALIDATION RÉUSSIE AVEC AVERTISSEMENTS\n');
  console.log('Vérifiez les avertissements ci-dessus avant de builder.');
  process.exit(0);
} else {
  console.log('\n✅ VALIDATION RÉUSSIE - Configuration complète!\n');
  console.log('Prochaines étapes:');
  console.log('1. Configurez votre Client OAuth Android dans Google Cloud Console');
  console.log('2. Ajoutez le SHA-1 de votre keystore dans Google Cloud Console');
  console.log('3. Créez un build natif: yarn prebuild:android');
  console.log('4. Testez l\'authentification: yarn android\n');
  process.exit(0);
}
