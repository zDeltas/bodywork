#!/usr/bin/env node

/**
 * Script de vérification de la configuration Google OAuth
 * Usage: node scripts/verify-oauth-config.js
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark(condition) {
  return condition ? '✅' : '❌';
}

// Lecture de app.json
function readAppJson() {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  try {
    const content = fs.readFileSync(appJsonPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log(`Erreur lors de la lecture de app.json: ${error.message}`, 'red');
    return null;
  }
}

// Vérifications
function verifyConfiguration() {
  log('\n🔍 Vérification de la configuration Google OAuth\n', 'cyan');

  const appJson = readAppJson();
  if (!appJson) {
    return;
  }

  const checks = [];

  // 1. Package name
  const packageName = appJson.expo?.android?.package;
  const packageNameOk = packageName === 'com.dlb.gainizi';
  checks.push({
    name: 'Package name',
    ok: packageNameOk,
    value: packageName,
    expected: 'com.dlb.gainizi',
  });

  // 2. Scheme
  const scheme = appJson.expo?.scheme;
  const schemeOk = !!scheme;
  checks.push({
    name: 'App scheme',
    ok: schemeOk,
    value: scheme,
    expected: 'Un scheme configuré (ex: gainizi)',
  });

  // 3. Client ID Android
  const androidClientId = appJson.expo?.extra?.googleOAuth?.androidClientId;
  const clientIdOk = !!androidClientId && androidClientId.includes('.apps.googleusercontent.com');
  checks.push({
    name: 'Google Android Client ID',
    ok: clientIdOk,
    value: androidClientId || 'Non configuré',
    expected: 'XXX.apps.googleusercontent.com',
  });

  // 4. Intent filters
  const intentFilters = appJson.expo?.android?.intentFilters;
  const intentFiltersOk = !!intentFilters && intentFilters.length > 0;
  checks.push({
    name: 'Intent filters Android',
    ok: intentFiltersOk,
    value: intentFilters ? `${intentFilters.length} configuré(s)` : 'Aucun',
    expected: 'Au moins 1 intent filter',
  });

  // 5. expo-auth-session plugin
  const plugins = appJson.expo?.plugins || [];
  const hasWebBrowser = plugins.includes('expo-web-browser');
  checks.push({
    name: 'Plugin expo-web-browser',
    ok: hasWebBrowser,
    value: hasWebBrowser ? 'Installé' : 'Manquant',
    expected: 'Présent dans les plugins',
  });

  // Affichage des résultats
  log('📋 Résultats des vérifications:\n', 'blue');

  checks.forEach((check) => {
    const status = checkMark(check.ok);
    const color = check.ok ? 'green' : 'red';
    
    log(`${status} ${check.name}`, color);
    log(`   Valeur actuelle: ${check.value}`, 'reset');
    if (!check.ok) {
      log(`   Valeur attendue: ${check.expected}`, 'yellow');
    }
    console.log('');
  });

  // Résumé
  const passedChecks = checks.filter((c) => c.ok).length;
  const totalChecks = checks.length;
  const allPassed = passedChecks === totalChecks;

  log('\n' + '='.repeat(50), 'cyan');
  if (allPassed) {
    log(`\n🎉 Tous les checks sont passés (${passedChecks}/${totalChecks})`, 'green');
    log('\n✅ Configuration correcte pour Google OAuth', 'green');
  } else {
    log(`\n⚠️  ${passedChecks}/${totalChecks} checks passés`, 'yellow');
    log('\n❌ Configuration incomplète', 'red');
  }
  log('\n' + '='.repeat(50), 'cyan');

  // Instructions supplémentaires
  if (!allPassed) {
    log('\n📝 Actions à effectuer:\n', 'blue');
    
    if (!packageNameOk) {
      log('1. Dans app.json, définissez:', 'yellow');
      log('   "android": { "package": "com.dlb.gainizi" }', 'reset');
    }
    
    if (!clientIdOk) {
      log('2. Dans app.json, ajoutez votre Client ID Android:', 'yellow');
      log('   "extra": {', 'reset');
      log('     "googleOAuth": {', 'reset');
      log('       "androidClientId": "VOTRE_CLIENT_ID.apps.googleusercontent.com"', 'reset');
      log('     }', 'reset');
      log('   }', 'reset');
    }
    
    if (!hasWebBrowser) {
      log('3. Installez expo-web-browser:', 'yellow');
      log('   yarn add expo-web-browser', 'reset');
      log('   Puis ajoutez "expo-web-browser" dans "plugins" de app.json', 'reset');
    }
    
    log('\n4. Après les modifications, relancez:', 'yellow');
    log('   npx expo prebuild --clean', 'reset');
    log('   yarn android', 'reset');
  }

  // Informations pour Google Cloud Console
  log('\n🔐 Configuration requise dans Google Cloud Console:\n', 'cyan');
  log(`   Type de client: Android`, 'reset');
  log(`   Package name: ${packageName || 'com.dlb.gainizi'}`, 'reset');
  log(`   SHA-1 debug: 46:CC:C2:AF:04:48:15:2B:11:A5:7A:72:DC:B2:6E:7D:1E:C3:0B:89`, 'reset');
  log(`   Scopes requis: openid, profile, email`, 'reset');
  
  if (androidClientId && clientIdOk) {
    log(`\n   Redirect URI (auto-généré):`, 'reset');
    const clientIdPart = androidClientId.split('.apps.googleusercontent.com')[0];
    log(`   com.googleusercontent.apps.${clientIdPart}:/oauth2redirect/google`, 'green');
  }

  log('\n📚 Documentation complète:', 'blue');
  log('   TROUBLESHOOTING_OAUTH.md\n', 'reset');
}

// Exécution
verifyConfiguration();
