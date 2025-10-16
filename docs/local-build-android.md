# Build Android en local (sans EAS)

Ce guide explique comment construire et lancer l’app Android en local, en utilisant Expo Prebuild + Android Studio/Gradle, sans passer par EAS.

## 1) Prérequis
- Android Studio (incluant SDK Platform, Platform Tools, Build-Tools)
- JDK 17 (Android Gradle Plugin récent requiert Java 17)
- Variables d’environnement configurées (Windows):
  - ANDROID_HOME = C:\Users\<votre_utilisateur>\AppData\Local\Android\Sdk
  - Ajouter au PATH: %ANDROID_HOME%\platform-tools et %ANDROID_HOME%\tools
- Yarn/Node installés

## 2) Installer les dépendances JS
```
yarn install
```

## 3) Prébuild (générer les projets natifs)
Le prébuild crée le dossier `android/` à partir de la config Expo.

- Via script pratique:
```
yarn prebuild:android
```
- Ou manuellement:
```
npx expo prebuild --platform android
```

Notes importantes:
- Le fichier `app.json` doit contenir votre schéma (scheme) et, idéalement, le package Android (applicationId). Exemple:
```
{
  "expo": {
    "scheme": "gainizi",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "gainizi", "host": "auth" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ],
      "package": "com.votreorganisation.gainizi" // À définir par vous
    },
    "extra": {
      "googleOAuth": { "androidClientId": "<votre_client_id>.apps.googleusercontent.com" },
      "backendUrl": "https://votre-backend.exemple.com/auth/google"
    }
  }
}
```
- Adaptez `android.package` pour qu’il corresponde à celui configuré dans le client OAuth Android côté Google Cloud.

## 4) Lancer depuis Android Studio
1. Ouvrez Android Studio.
2. Ouvrez le dossier `android/` généré.
3. Sélectionnez une cible (émulateur ou appareil) et lancez l’exécution (Run ▶).

## 5) Construire avec Gradle (ligne de commande)
Après le prébuild:

- Debug APK:
```
cd android
./gradlew assembleDebug    # macOS/Linux
gradlew.bat assembleDebug  # Windows
```
L’APK sera disponible dans `android/app/build/outputs/apk/debug/`.

- Installer directement (si un appareil est connecté):
```
cd android
./gradlew installDebug     # macOS/Linux
gradlew.bat installDebug   # Windows
```

## 6) Google OAuth (client Android) en local
Votre client OAuth Android (Google Cloud) valide 2 éléments:
- packageName (android.package)
- Empreinte SHA‑1 du certificat de signature

Cas courants:
- Build Debug local: signé par le `debug.keystore` (empreinte SHA‑1 par défaut d’Android Studio). Vous devez AJOUTER cette empreinte SHA‑1 au client OAuth Android dans Google Cloud (en plus de votre empreinte release) pour que la connexion fonctionne en debug.
- Build Release local: utilisez votre keystore release. Son SHA‑1 doit correspondre à celui configuré dans Google Cloud.

Obtenir le SHA‑1 du keystore (Windows, Java 17):
```
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```
Ajoutez la valeur SHA‑1 obtenue dans Google Cloud Console ➜ Credentials ➜ votre client OAuth Android ➜ Fingerprints.

Rappels pour notre app:
- Le flux Google utilise un schéma natif `gainizi://auth` (pas `exp://`).
- Expo Go n’est pas compatible pour ce flux Android (redirection exp:// rejetée). Utilisez un build local (debug/release) ou un Dev Client.

## 7) Démarrage Metro et connexion à l’app
Même avec un build natif, le JavaScript peut être chargé depuis Metro en développement:
```
yarn start
```
Assurez-vous que l’app Android connecte bien à votre serveur Metro (même réseau, ports ouverts).

## 8) Variantes utiles
- Clean du build Android:
```
cd android
./gradlew clean            # macOS/Linux
gradlew.bat clean          # Windows
```
- Re-générer natifs après changement de config Expo (app.json):
```
npx expo prebuild --platform android --clean
```

## 9) Dépannage
- Erreur Google « access blocked / invalid_request » avec `redirect_uri` en `exp://…`:
  - Vous lancez via Expo Go ou avec proxy. Utilisez un build natif local (debug) et notre schéma `gainizi://auth`.
- « Package name » invalide dans Google: vérifiez que `android.package` dans `app.json` correspond au client OAuth Android.
- SHA‑1 invalide: ajoutez le SHA‑1 debug OU signez avec le keystore release dont le SHA‑1 est déjà déclaré.
- Emulateur sans Google Play Services: utilisez un device ou un image système avec Google APIs.

## 10) Résumé rapide (Windows)
1) `yarn install`
2) Configurer `app.json` ➜ `expo.android.package` et `extra.googleOAuth.androidClientId`
3) `yarn prebuild:android`
4) `cd android && gradlew.bat assembleDebug` (ou ouvrir dans Android Studio et Run)
5) Lancer Metro `yarn start` si vous développez
6) Tester Google Sign‑In ➜ Profil ➜ Mon compte ➜ Continuer avec Google
