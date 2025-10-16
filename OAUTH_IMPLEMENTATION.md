# 🔐 Implémentation OAuth Google - Documentation Technique

> Documentation basée sur le code réel implémenté

## 📋 Configuration actuelle

### App.json
```json
{
  "expo": {
    "scheme": "gainizi",
    "android": {
      "package": "com.dlb.gainizi",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "gainizi", "host": "auth" }],
          "category": ["BROWSABLE", "DEFAULT"]
        },
        {
          "action": "VIEW",
          "data": [{
            "scheme": "com.googleusercontent.apps.202346023206-thoo1qgqt788cbrk7sg1v97nammhouc3",
            "path": "/oauth2redirect/google"
          }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "extra": {
      "backendUrl": "https://api.gainizi.com/auth/google",
      "googleOAuth": {
        "androidClientId": "202346023206-thoo1qgqt788cbrk7sg1v97nammhouc3.apps.googleusercontent.com"
      }
    }
  }
}
```

### Google Cloud Console
- **Client ID** : `202346023206-thoo1qgqt788cbrk7sg1v97nammhouc3.apps.googleusercontent.com`
- **Type** : **Android** (OAuth client Android natif)
- **Package name** : `com.dlb.gainizi`
- **SHA-1** : `46:CC:C2:AF:04:48:15:2B:11:A5:7A:72:DC:B2:6E:7D:1E:C3:0B:89`
- **Redirect URI** : `com.googleusercontent.apps.202346023206-thoo1qgqt788cbrk7sg1v97nammhouc3:/oauth2redirect/google`

> ⚠️ **Important** : C'est un client OAuth **Android**, pas Web !  
> Le code utilise `androidClientId` dans la config et le redirect URI suit le format Android natif.  
> Nécessite un build APK/AAB (ne fonctionne pas dans Expo Go).

## 🏗️ Architecture implémentée

### 1. Hook principal - `useGoogleAuth.ts`

```typescript
// Mode actuel : MODE TEST (pas de backend)
export function useGoogleAuth(): UseGoogleAuthResult {
  // Configuration expo-auth-session
  const [request, response, promptAsync] = Google.useAuthRequest(
    requestConfig, 
    getDiscoveryDocument()
  );

  // Décodage direct de l'ID token Google (JWT)
  const decodeGoogleIdToken = (idToken: string) => {
    const parts = idToken.split('.');
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    return {
      id: payload.sub,        // Google user ID
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
  };

  // Création de tokens mock pour le test
  const createMockTokens = async (googleAuthResult: GoogleAuthResult) => {
    const user = decodeGoogleIdToken(googleAuthResult.idToken);
    
    return {
      accessToken: googleAuthResult.idToken,  // Réutilisé pour le test
      refreshToken: `refresh_${idToken.substring(0, 20)}`,
      user: user
    };
  };

  // Sauvegarde via AuthContext
  await authSignIn(mockTokens.accessToken, mockTokens.refreshToken, mockTokens.user);
}
```

### 2. Contexte d'authentification - `AuthContext.tsx`

```typescript
export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);

  // Vérification session au démarrage
  const checkSession = async () => {
    const tokens = await TokenStorageService.getTokens();
    const storedUser = await TokenStorageService.getUser();
    
    if (tokens && storedUser) {
      setIsAuthenticated(true);
      setUser(storedUser);
    }
  };

  // Connexion utilisateur
  const signIn = async (accessToken: string, refreshToken: string, user: StoredUser) => {
    await TokenStorageService.saveTokens(accessToken, refreshToken);
    await TokenStorageService.saveUser(user);
    setIsAuthenticated(true);
    setUser(user);
  };

  // Déconnexion
  const signOut = async () => {
    await TokenStorageService.clearAll();
    setIsAuthenticated(false);
    setUser(null);
  };
}
```

### 3. Stockage sécurisé - `tokenStorage.ts`

```typescript
// Utilise Expo SecureStore (Android Keystore)
export class TokenStorageService {
  // Sauvegarde tokens
  static async saveTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync('auth_access_token', accessToken);
    await SecureStore.setItemAsync('auth_refresh_token', refreshToken);
  }

  // Sauvegarde user
  static async saveUser(user: StoredUser) {
    await SecureStore.setItemAsync('auth_user', JSON.stringify(user));
  }

  // Récupération
  static async getTokens(): Promise<AuthTokens | null> {
    const accessToken = await SecureStore.getItemAsync('auth_access_token');
    const refreshToken = await SecureStore.getItemAsync('auth_refresh_token');
    return (accessToken && refreshToken) ? { accessToken, refreshToken } : null;
  }

  static async getUser(): Promise<StoredUser | null> {
    const userJson = await SecureStore.getItemAsync('auth_user');
    return userJson ? JSON.parse(userJson) : null;
  }

  // Nettoyage
  static async clearAll() {
    await SecureStore.deleteItemAsync('auth_access_token');
    await SecureStore.deleteItemAsync('auth_refresh_token');
    await SecureStore.deleteItemAsync('auth_user');
  }
}
```

### 4. Écrans UI

#### `my-account.tsx`
```typescript
export default function MyAccountScreen() {
  const { loading, error, signIn, isAuthenticated, user } = useGoogleAuth();
  const { signOut } = useAuth();

  // Affichage conditionnel selon l'état
  if (!isAuthenticated) {
    return (
      <Button
        title="Continuer avec Google"
        onPress={signIn}
        loading={loading}
      />
    );
  }

  return (
    <View>
      <Image source={{ uri: user.picture }} />
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
      <Button title="Se déconnecter" onPress={signOut} />
    </View>
  );
}
```

#### `profile.tsx` (onglet)
```typescript
function ProfileScreen() {
  const { isAuthenticated, user } = useAuth();

  const displayName = isAuthenticated && user?.name ? user.name : 'Mon compte';
  const displayStatus = isAuthenticated && user?.email ? user.email : 'Non connecté';

  return (
    <SettingItem
      icon={user?.picture ? <Image source={{ uri: user.picture }} /> : <Icon />}
      label={displayName}
      subLabel={displayStatus}
      onPress={() => router.push('/screens/my-account')}
    />
  );
}
```

## 🔄 Flux d'authentification complet

```
1. USER clique "Continuer avec Google"
   ↓
2. useGoogleAuth.signIn() appelé
   ↓
3. promptAsync() → Ouvre Google OAuth dans navigateur
   ↓
4. USER sélectionne compte Google
   ↓
5. Google redirige vers app avec ID token
   ↓
6. useEffect détecte la réponse
   ↓
7. decodeGoogleIdToken() extrait les infos du JWT
   {
     id: "google_user_id",
     email: "user@gmail.com",
     name: "John Doe",
     picture: "https://..."
   }
   ↓
8. createMockTokens() crée tokens test
   {
     accessToken: idToken (réutilisé),
     refreshToken: "refresh_...",
     user: {...}
   }
   ↓
9. authSignIn() sauvegarde dans SecureStore
   ↓
10. AuthContext met à jour isAuthenticated = true
   ↓
11. UI se met à jour automatiquement
    - my-account.tsx affiche les infos user
    - profile.tsx affiche nom + email
   ↓
12. Session persiste après fermeture app
```

## 🧪 Mode actuel : TEST (sans backend)

### Ce qui fonctionne
✅ OAuth Google avec expo-auth-session  
✅ Décodage JWT de l'ID token  
✅ Extraction des infos utilisateur  
✅ Stockage sécurisé (Android Keystore)  
✅ Persistance de session  
✅ UI dynamique (profile + my-account)  
✅ Logs détaillés pour debugging  

### Limitations (mode test)
⚠️ Pas de validation backend de l'ID token  
⚠️ Access token = ID token Google (pas de JWT custom)  
⚠️ Refresh token fictif (pas fonctionnel)  
⚠️ User ID = Google sub (pas ID en base de données)  

### Pourquoi ça fonctionne quand même
L'ID token Google est un JWT valide qui contient :
- `sub` : ID unique Google de l'utilisateur
- `email` : Email vérifié
- `name` : Nom complet
- `picture` : URL photo de profil
- `exp` : Date d'expiration
- `iss` : "https://accounts.google.com"

On peut donc l'utiliser temporairement pour identifier l'utilisateur sans backend.

## 🔧 Configuration Google Cloud Console

### Obtenir le SHA-1 pour Android

```bash
# Pour debug keystore (développement)
cd android
./gradlew signingReport

# Chercher dans l'output :
# Variant: debug
# Config: debug
# SHA1: 46:CC:C2:AF:04:48:15:2B:11:A5:7A:72:DC:B2:6E:7D:1E:C3:0B:89
```

### Créer le client OAuth Android dans Google Console

1. Aller sur https://console.cloud.google.com/apis/credentials
2. Créer des identifiants → ID client OAuth 2.0
3. Type d'application : **Android**
4. Nom : Gainizi Android
5. Package name : `com.dlb.gainizi`
6. SHA-1 : Coller le SHA-1 obtenu ci-dessus
7. Créer → Copier le Client ID
8. Coller dans `app.json` → `extra.googleOAuth.androidClientId`

## 🚀 Migration future vers backend

### Étape 1 : Créer endpoint backend

```typescript
// POST /auth/google
// Body: { idToken: "eyJhbGciOiJSUzI1NiIs..." }

app.post('/auth/google', async (req, res) => {
  const { idToken } = req.body;

  // 1. Valider l'ID token avec Google
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();

  // 2. Créer ou récupérer user en DB
  let user = await User.findOne({ googleId: payload.sub });
  if (!user) {
    user = await User.create({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    });
  }

  // 3. Générer JWT propres
  const accessToken = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

  // 4. Retourner
  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture
    }
  });
});
```

### Étape 2 : Modifier useGoogleAuth

```typescript
// Remplacer createMockTokens par :
const exchangeTokenWithBackend = async (googleAuthResult: GoogleAuthResult) => {
  const response = await fetch('https://api.gainizi.com/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: googleAuthResult.idToken })
  });

  const data = await response.json();
  
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user
  };
};
```

### Étape 3 : Implémenter refresh token

```typescript
// POST /auth/refresh
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  const payload = jwt.verify(refreshToken, REFRESH_SECRET);
  const user = await User.findById(payload.userId);
  
  const newAccessToken = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '15m' });
  
  res.json({ accessToken: newAccessToken });
});
```

## 🔒 Sécurité

### Actuellement (mode test)
- ✅ Tokens stockés dans Android Keystore (chiffrement hardware)
- ✅ Pas de tokens dans AsyncStorage
- ⚠️ ID token Google exposé comme access token
- ⚠️ Pas de validation côté serveur

### Avec backend (production)
- ✅ Validation ID token côté serveur
- ✅ JWT propres générés par backend
- ✅ User stocké en base de données
- ✅ Refresh tokens fonctionnels
- ✅ Access tokens courts (15 min)
- ✅ Logs d'authentification serveur

## 📦 Dépendances requises

```json
{
  "dependencies": {
    "expo-auth-session": "^5.5.2",
    "expo-secure-store": "^13.0.2",
    "expo-web-browser": "^13.0.3"
  }
}
```

## 🐛 Troubleshooting

### "No ID token received"
→ Vérifier que le Client ID est bien de type **Android** dans Google Console  
→ Vérifier le package name (`com.dlb.gainizi`) et SHA-1 dans Google Console  
→ Vérifier `extra.googleOAuth.androidClientId` dans app.json

### Session ne persiste pas
→ Vérifier les logs `[TokenStorage]`  
→ Vérifier que SecureStore fonctionne (nécessite appareil réel ou émulateur avec Play Services)

### Profile n'affiche pas l'utilisateur
→ Vérifier `[ProfileScreen]` logs  
→ `isAuthenticated` doit être `true`  
→ `user` doit contenir les données

### OAuth prompt ne s'ouvre pas
→ Vérifier que `expo-web-browser` est installé  
→ Vérifier les intent filters dans app.json  
→ Tester sur appareil réel (pas Expo Go)

## 📊 Logs de débogage

```
[GoogleAuth] Request config created
[GoogleAuth] 🔍 Decoding Google ID token...
[GoogleAuth] Decoded payload: { email, name, picture }
[GoogleAuth] 🧪 MODE TEST - Pas de backend
[GoogleAuth] ✅ User info extracted
[Auth] 🔐 SIGNING IN USER
[TokenStorage] Tokens saved securely
[Auth] ✅ SIGN IN SUCCESSFUL
[ProfileScreen] isAuthenticated: true
[ProfileScreen] user: { id, email, name }
```

## ✅ Résumé de l'implémentation

| Composant | Fichier | Status |
|-----------|---------|--------|
| Hook OAuth | `useGoogleAuth.ts` | ✅ Fonctionnel |
| Context auth | `AuthContext.tsx` | ✅ Fonctionnel |
| Storage sécurisé | `tokenStorage.ts` | ✅ SecureStore |
| Écran compte | `my-account.tsx` | ✅ UI complète |
| Onglet profil | `profile.tsx` | ✅ Dynamique |
| Config Google | `app.json` | ✅ Client ID configuré |
| Backend | - | ⏳ À implémenter |

---

**L'authentification Google fonctionne en mode test.**  
Backend requis pour production avec validation serveur et JWT propres.
