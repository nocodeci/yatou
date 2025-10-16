# Configuration Rapide Supabase - YATOU

## 🚀 Étapes pour connecter votre base de données

### 1. Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "New Project"
3. Donnez un nom à votre projet (ex: "yatou-delivery")
4. Créez un mot de passe fort pour la base de données
5. Choisissez une région (Europe pour la Côte d'Ivoire)
6. Cliquez sur "Create new project"

### 2. Récupérer vos clés API

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez :
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public key** (clé publique anonyme)

### 3. Configurer l'application

**Option A : Fichier .env.local (Recommandé)**
1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez :
```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

**Option B : Modification directe du code**
1. Ouvrez le fichier `app/config/supabase.ts`
2. Remplacez les valeurs par défaut :
```typescript
export const SUPABASE_CONFIG = {
  url: 'https://votre-projet.supabase.co',
  anonKey: 'votre-clé-anon',
};
```

### 4. Créer les tables dans Supabase

1. Allez dans **SQL Editor** dans votre projet Supabase
2. Exécutez le script SQL suivant :

```sql
-- Table des utilisateurs
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  name character varying NOT NULL,
  phone character varying,
  role character varying DEFAULT 'customer'::character varying CHECK (role::text = ANY (ARRAY['customer'::character varying, 'driver'::character varying, 'admin'::character varying]::text[])),
  default_pickup_address text,
  default_pickup_coordinates point,
  notification_preferences jsonb DEFAULT '{"sms": true, "push": true, "email": true}'::jsonb,
  language character varying DEFAULT 'fr'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Table des livreurs
CREATE TABLE public.drivers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  license_number character varying NOT NULL UNIQUE,
  vehicle_info jsonb NOT NULL,
  is_available boolean DEFAULT true,
  current_location point,
  rating numeric DEFAULT 0,
  total_deliveries integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT drivers_pkey PRIMARY KEY (id),
  CONSTRAINT drivers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Table des livraisons
CREATE TABLE public.deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  driver_id uuid,
  pickup_address text NOT NULL,
  pickup_coordinates point,
  delivery_address text NOT NULL,
  delivery_coordinates point NOT NULL,
  description text,
  weight numeric,
  dimensions jsonb,
  special_instructions text,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'confirmed'::character varying, 'picked_up'::character varying, 'in_transit'::character varying, 'delivered'::character varying, 'cancelled'::character varying]::text[])),
  estimated_price integer NOT NULL,
  final_price integer,
  estimated_duration integer,
  actual_duration integer,
  pickup_time timestamp with time zone,
  delivery_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT deliveries_pkey PRIMARY KEY (id),
  CONSTRAINT deliveries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT deliveries_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id)
);

-- Table des paiements
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  delivery_id uuid,
  amount integer NOT NULL,
  payment_method character varying NOT NULL CHECK (payment_method::text = ANY (ARRAY['cash'::character varying, 'mobile_money'::character varying, 'card'::character varying]::text[])),
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying]::text[])),
  transaction_id character varying,
  payment_details jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.deliveries(id)
);

-- Table des notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  delivery_id uuid,
  type character varying NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT notifications_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.deliveries(id)
);

-- Table des évaluations
CREATE TABLE public.ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  delivery_id uuid,
  user_id uuid,
  driver_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ratings_pkey PRIMARY KEY (id),
  CONSTRAINT ratings_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.deliveries(id),
  CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT ratings_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id)
);
```

### 5. Configurer les politiques de sécurité

1. Allez dans **Authentication** > **Policies**
2. Activez Row Level Security (RLS) pour chaque table
3. Créez les politiques suivantes :

```sql
-- Politique pour la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour la table drivers
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own info" ON public.drivers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own info" ON public.drivers
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour la table deliveries
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deliveries" ON public.deliveries
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = driver_id);

CREATE POLICY "Users can create deliveries" ON public.deliveries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers can update assigned deliveries" ON public.deliveries
  FOR UPDATE USING (auth.uid() = driver_id);
```

### 6. Redémarrer l'application

```bash
npx expo start --clear
```

### 7. Tester

1. Créez un nouveau compte dans l'application
2. Vérifiez dans Supabase > **Table Editor** > **users** que l'utilisateur a été créé
3. Si vous créez un compte livreur, vérifiez aussi la table **drivers**

## 🔧 Dépannage

### Erreur de connexion
- Vérifiez que les clés API sont correctes
- Vérifiez que le fichier `.env.local` est bien créé
- Redémarrez l'application après modification

### Erreur de permissions
- Vérifiez que RLS est activé et que les politiques sont créées
- Vérifiez que l'utilisateur est bien authentifié

### Erreur de table
- Vérifiez que toutes les tables ont été créées
- Vérifiez que les contraintes de clés étrangères sont correctes

## ✅ Vérification

Une fois configuré, vous devriez voir :
- Les utilisateurs créés dans la table `users`
- Les livreurs créés dans la table `drivers`
- Les données persistées entre les sessions
- Les messages de succès sans "(Simulation)"
