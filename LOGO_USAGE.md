# Utilisation des Logos Yatou

## Logos Disponibles

L'application Yatou dispose de 5 variantes de logos dans le dossier `assets/logos/` :

- `Logo yatou-01.png` - Logo principal (recommandé)
- `Logo yatou-02.png` - Variante secondaire
- `Logo yatou-03.png` - Variante tertiaire
- `Logo yatou-04.png` - Variante quaternaire
- `Logo yatou-06.png` - Variante quinaire

## Configuration de l'Application

### app.json
- **Icône de l'application** : `Logo yatou-01.png`
- **Favicon web** : `Logo yatou-01.png`
- **Splash screen** : `Logo yatou-01.png` avec fond rouge (#DC2626)

## Composant YatouLogo

### Utilisation de base
```tsx
import YatouLogo from '@/components/YatouLogo';

// Logo simple
<YatouLogo />

// Logo sans texte
<YatouLogo showText={false} />

// Différentes tailles
<YatouLogo size="small" />
<YatouLogo size="medium" />
<YatouLogo size="large" />

// Différentes variantes
<YatouLogo variant="01" />
<YatouLogo variant="02" />
<YatouLogo variant="03" />
<YatouLogo variant="04" />
<YatouLogo variant="06" />
```

### Props disponibles
- `size`: 'small' | 'medium' | 'large' (défaut: 'medium')
- `showText`: boolean (défaut: true)
- `variant`: '01' | '02' | '03' | '04' | '06' (défaut: '01')
- `style`: StyleSheet (optionnel)

## Emplacements actuels

1. **TopBar** : Logo petit sans texte
2. **Écran d'accueil** : Logo petit sans texte dans le header
3. **Écran de profil** : Logo grand sans texte avec titre et sous-titre
4. **Splash screen** : Logo principal avec fond rouge

## Constantes

Les logos sont centralisés dans `app/constants/logos.ts` :

```tsx
import { YatouLogos, LogoVariants, LogoVariant } from '@/app/constants/logos';
```

## Recommandations

- Utilisez le logo principal (`01`) pour la plupart des cas d'usage
- Utilisez les variantes pour des contextes spécifiques ou pour éviter la répétition
- Le logo sans texte est recommandé pour les espaces restreints
- Le logo avec texte est recommandé pour l'identification de la marque



