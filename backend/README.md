# Backend Yatou Delivery

Backend Node.js + Express avec Supabase pour l'application de livraison Yatou.

## 🚀 Fonctionnalités

- **Authentification** : Inscription, connexion, gestion des tokens JWT
- **Gestion des livraisons** : Création, suivi, annulation
- **Gestion des utilisateurs** : Profils, préférences, statistiques
- **Sécurité** : Middleware d'authentification, validation des données
- **Base de données** : Supabase avec PostgreSQL

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- Compte Supabase
- npm ou yarn

## ⚙️ Installation

1. **Cloner le projet**
```bash
cd backend
npm install
```

2. **Configuration des variables d'environnement**
```bash
cp env.example .env
```

3. **Configurer le fichier .env**
```env
# Configuration du serveur
PORT=3000
NODE_ENV=development

# Configuration Supabase
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_supabase

# Configuration JWT
JWT_SECRET=votre_secret_jwt_très_sécurisé
JWT_EXPIRES_IN=7d

# Configuration CORS
CORS_ORIGIN=http://localhost:8081
```

4. **Créer la base de données Supabase**
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
   - Copiez l'URL et les clés dans votre .env
   - Exécutez le script SQL dans `database/schema.sql`

## 🗄️ Configuration Supabase

1. **Créer un projet Supabase**
2. **Exécuter le script SQL** :
   - Allez dans l'éditeur SQL de Supabase
   - Copiez et exécutez le contenu de `database/schema.sql`

3. **Configurer les variables d'environnement** :
   - `SUPABASE_URL` : URL de votre projet
   - `SUPABASE_ANON_KEY` : Clé publique anonyme
   - `SUPABASE_SERVICE_ROLE_KEY` : Clé de service (privée)

## 🏃‍♂️ Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:3000`

## 📚 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour du profil

### Livraisons
- `POST /api/deliveries` - Créer une livraison
- `GET /api/deliveries` - Liste des livraisons
- `GET /api/deliveries/:id` - Détails d'une livraison
- `PATCH /api/deliveries/:id/status` - Mettre à jour le statut
- `DELETE /api/deliveries/:id` - Annuler une livraison

### Utilisateurs
- `GET /api/users/stats` - Statistiques utilisateur
- `GET /api/users/history` - Historique des livraisons
- `PUT /api/users/preferences` - Mettre à jour les préférences
- `PUT /api/users/change-password` - Changer le mot de passe

## 🔐 Authentification

Toutes les routes protégées nécessitent un token JWT dans le header :
```
Authorization: Bearer <votre_token_jwt>
```

## 📊 Structure de la base de données

### Tables principales :
- **users** : Utilisateurs de l'application
- **drivers** : Chauffeurs de livraison
- **deliveries** : Livraisons
- **payments** : Paiements
- **notifications** : Notifications
- **ratings** : Évaluations

## 🛠️ Développement

### Structure du projet
```
backend/
├── config/
│   └── supabase.js          # Configuration Supabase
├── middleware/
│   ├── auth.js              # Middleware d'authentification
│   └── errorHandler.js      # Gestion d'erreurs
├── routes/
│   ├── auth.js              # Routes d'authentification
│   ├── deliveries.js        # Routes des livraisons
│   └── users.js             # Routes des utilisateurs
├── database/
│   └── schema.sql           # Script de création des tables
├── server.js                # Serveur principal
├── package.json
└── README.md
```

### Ajouter une nouvelle route
1. Créer le fichier dans `routes/`
2. Importer dans `server.js`
3. Ajouter le middleware d'authentification si nécessaire

## 🔒 Sécurité

- **Helmet** : Headers de sécurité
- **CORS** : Configuration des origines autorisées
- **JWT** : Authentification par tokens
- **Validation** : Validation des données d'entrée
- **RLS** : Row Level Security dans Supabase

## 📝 Logs

Le serveur utilise Morgan pour les logs HTTP. En production, configurez un système de logging approprié.

## 🚀 Déploiement

### Variables d'environnement de production
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://votre-domaine.com
```

### Plateformes recommandées
- **Vercel** : Déploiement simple
- **Railway** : Intégration facile
- **Heroku** : Solution traditionnelle
- **DigitalOcean** : Contrôle total

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence ISC.

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

---

**Yatou Delivery Team** 🚚
