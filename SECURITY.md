# 🔐 Sécurité - Yatou Delivery App

## Protection des Clés API

### Variables d'Environnement

Cette application utilise des variables d'environnement pour protéger les clés API sensibles.

#### Frontend (React Native)

1. **Fichier `.env`** (à créer localement, ne pas commiter)
```bash
GOOGLE_MAPS_API_KEY=votre_clé_google_maps_ici
SUPABASE_URL=votre_url_supabase_ici
SUPABASE_ANON_KEY=votre_clé_anon_supabase_ici
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_supabase_ici
```

2. **Installation des dépendances**
```bash
npm install react-native-dotenv
```

3. **Configuration Babel** (déjà configuré)
```javascript
// babel.config.js
module.exports = {
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
  ],
};
```

#### Backend (Node.js/Express)

1. **Fichier `.env`** dans le dossier `backend/`
```bash
GOOGLE_MAPS_API_KEY=votre_clé_google_maps_ici
SUPABASE_URL=votre_url_supabase_ici
SUPABASE_ANON_KEY=votre_clé_anon_supabase_ici
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_supabase_ici
PORT=3000
NODE_ENV=development
```

### Fichiers Protégés

Les fichiers suivants sont automatiquement ignorés par Git :
- `.env` (frontend)
- `backend/.env` (backend)
- `*.key`
- `*.pem`
- `*.p12`
- `*.jks`

### Bonnes Pratiques

1. **Ne jamais commiter** les fichiers `.env` contenant des clés réelles
2. **Utiliser des clés différentes** pour le développement et la production
3. **Restreindre les permissions** des clés API Google
4. **Surveiller l'utilisation** des clés API
5. **Régénérer les clés** si elles sont compromises

### Configuration Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez un projet existant
3. Activez les APIs nécessaires :
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Directions API
4. Créez des clés API avec des restrictions appropriées
5. Limitez l'utilisation par IP et par application

### Variables d'Environnement Requises

#### Frontend
- `GOOGLE_MAPS_API_KEY` : Clé API Google Maps

#### Backend
- `GOOGLE_MAPS_API_KEY` : Clé API Google Maps
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de service Supabase
- `PORT` : Port du serveur (défaut: 3000)
- `NODE_ENV` : Environnement (development/production)

### Démarrage Sécurisé

1. **Frontend**
```bash
# Copier l'exemple
cp env.example .env
# Éditer avec vos vraies clés
nano .env
# Démarrer l'application
npx expo start
```

2. **Backend**
```bash
cd backend
# Copier l'exemple
cp env.example .env
# Éditer avec vos vraies clés
nano .env
# Installer les dépendances
npm install
# Démarrer le serveur
npm start
```

### Vérification de la Sécurité

Pour vérifier que vos clés sont bien protégées :

```bash
# Vérifier que .env n'est pas dans Git
git status
# Ne devrait pas afficher .env

# Vérifier le contenu du .gitignore
cat .gitignore | grep .env
# Devrait afficher .env
```

### En Cas de Compromission

Si vos clés API sont compromises :

1. **Désactivez immédiatement** les clés dans Google Cloud Console
2. **Générez de nouvelles clés** avec des restrictions plus strictes
3. **Mettez à jour** tous les fichiers `.env`
4. **Vérifiez les logs** pour détecter un usage malveillant
5. **Contactez Google** si nécessaire

### Support

Pour toute question sur la sécurité, consultez :
- [Documentation Google Maps API](https://developers.google.com/maps/documentation)
- [Guide de sécurité Supabase](https://supabase.com/docs/guides/security)
- [Bonnes pratiques React Native](https://reactnative.dev/docs/security)
