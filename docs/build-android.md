# Construire l’app Android (EAS)

Ce guide donne les commandes pour builder et tester Android avec Expo Application Services (EAS).

## 0) Prérequis
- Node.js et Yarn installés
- Dépendances du projet installées: `yarn install`
- Compte Expo (gratuit) et EAS CLI

Installer EAS CLI:
- npm: `npm i -g eas-cli`
- ou Yarn: `yarn global add eas-cli`

Se connecter:
- `eas login`

Initialiser EAS dans le repo (si jamais non initialisé):
- `eas init`

## 1) Important: définir le package Android
EAS nécessite un identifiant de package Android dans `app.json`.
- Ouvrez `app.json` et ajoutez sous `expo.android`:

```json
{
  "expo": {
    "android": {
      "package": "votre.domaine.app"
    }
  }
}
```

Remarques:
- Choisissez un nom unique et stable (ex: `com.gainizi.app`).
- Le package doit correspondre à l’élément « packageName » de votre client OAuth Android côté Google (là où vous avez configuré votre SHA‑1).

## 2) Dev Client Android (recommandé pour tester Google OAuth Android)
Le flux Google OAuth de type Android nécessite une redirection native (`gainizi://auth`). Expo Go ne convient pas; utilisez un Build de Développement (Dev Client).

Commandes:
1. Build Dev Client Android (APK rapide):
   - `eas build --platform android --profile development`
2. Une fois le build terminé, téléchargez/installez l’APK sur l’appareil.
3. Lancez Metro: `yarn start`
4. Ouvrez le Dev Client et scannez le QR code pour charger votre app.

Si vous n’avez pas encore de profils EAS, créez un fichier `eas.json` avec ceci (optionnel mais pratique):

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "android": { "buildType": "apk" }
    },
    "preview": {
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  },
  "cli": { "version": ">= 7.0.0" }
}
```

Sans ce fichier, `eas init` peut en générer un pour vous.

## 3) Build d’une APK de test (sans Dev Client)
Utile pour partager une APK installable sans passer par le Play Store.
- `eas build --platform android --profile preview`
- Installez l’APK sur l’appareil et testez.

Note: Pour Google OAuth Android, assurez-vous:
- que `expo.scheme` = `"gainizi"` et l’intent filter sont configurés (déjà fait dans ce projet),
- que votre package + SHA‑1 sont bien enregistrés dans le client OAuth Android (Google Cloud),
- que `expo.extra.googleOAuth.androidClientId` est bien défini (déjà configuré ici),
- et que vous n’utilisez pas Expo Go pour ce flux.

## 4) Build de production (AAB pour Play Store)
- `eas build --platform android --profile production`
- Vous obtiendrez un AAB (Android App Bundle) prêt pour le Play Console.

Soumission Play Store (optionnel):
1. Configurez un service account JSON dans Play Console et reliez-le à EAS.
2. `eas submit --platform android --latest` (ou précisez le chemin vers le .aab)

## 5) Résumé des commandes
- Installer EAS CLI: `npm i -g eas-cli`
- Login: `eas login`
- Init (si besoin): `eas init`
- Dev Client (test OAuth): `eas build --platform android --profile development`
- APK test: `eas build --platform android --profile preview`
- Production (AAB): `eas build --platform android --profile production`
- Lancer Metro: `yarn start`

## 6) Dépannage rapide
- Erreur 400 invalid_request avec redirect_uri exp://: vous lancez via Expo Go. Utilisez un Dev Client ou un build autonome.
- Échec de connexion Google: vérifiez le package + SHA‑1 dans le client OAuth Android, et le `androidClientId` dans `app.json` ➜ `expo.extra.googleOAuth.androidClientId`.
- Problème de signature/keystore: laissez EAS gérer automatiquement, ou fournissez votre propre keystore si nécessaire (`eas credentials`).
