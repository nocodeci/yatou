#!/usr/bin/env node

/**
 * Script de validation pré-build pour les notifications push YATOU
 * Vérifie que toute la configuration est correcte avant de builder l'APK
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation de la configuration des notifications push YATOU...\n');

const errors = [];
const warnings = [];
let score = 0;
const maxScore = 10;

// 1. Vérifier app.json
console.log('📱 1. Vérification de app.json...');
try {
  const appJsonPath = path.join(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  // Vérifier Project ID EAS
  if (appJson.expo?.extra?.eas?.projectId) {
    console.log('   ✅ Project ID EAS configuré:', appJson.expo.extra.eas.projectId);
    score += 1;
  } else {
    errors.push('❌ Project ID EAS manquant dans app.json');
  }

  // Vérifier plugin notifications
  const hasNotificationPlugin = appJson.expo?.plugins?.some(plugin =>
    Array.isArray(plugin) && plugin[0] === 'expo-notifications'
  );

  if (hasNotificationPlugin) {
    console.log('   ✅ Plugin expo-notifications configuré');
    score += 1;
  } else {
    errors.push('❌ Plugin expo-notifications manquant dans app.json');
  }

  // Vérifier configuration Android
  if (appJson.expo?.android?.googleServicesFile) {
    console.log('   ✅ Google Services configuré pour Android');
    score += 1;
  } else {
    warnings.push('⚠️ Google Services non configuré (optionnel pour Expo Push)');
  }

  // Vérifier permissions Android
  const androidPermissions = appJson.expo?.android?.permissions || [];
  const hasVibrate = androidPermissions.includes('android.permission.VIBRATE');
  const hasBootCompleted = androidPermissions.includes('android.permission.RECEIVE_BOOT_COMPLETED');

  if (hasVibrate && hasBootCompleted) {
    console.log('   ✅ Permissions Android pour notifications configurées');
    score += 1;
  } else {
    warnings.push('⚠️ Permissions Android incomplètes pour notifications');
  }

  // Vérifier package Android
  if (appJson.expo?.android?.package) {
    console.log('   ✅ Package Android configuré:', appJson.expo.android.package);
    score += 0.5;
  } else {
    errors.push('❌ Package Android manquant dans app.json');
  }

} catch (error) {
  errors.push('❌ Impossible de lire app.json: ' + error.message);
}

// 2. Vérifier google-services.json
console.log('\n🔥 2. Vérification de google-services.json...');
try {
  const googleServicesPath = path.join(__dirname, '..', 'google-services.json');
  const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));

  if (googleServices.project_info?.project_id) {
    console.log('   ✅ Firebase Project configuré:', googleServices.project_info.project_id);
    score += 1;
  } else {
    warnings.push('⚠️ Firebase Project ID manquant');
  }

  if (googleServices.client?.[0]?.client_info?.android_client_info?.package_name) {
    const firebasePackage = googleServices.client[0].client_info.android_client_info.package_name;
    console.log('   ✅ Package Android configuré:', firebasePackage);

    // Vérifier la cohérence avec app.json
    const appJsonPath = path.join(__dirname, '..', 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    const appJsonPackage = appJson.expo?.android?.package;

    if (firebasePackage === appJsonPackage) {
      console.log('   ✅ Package ID cohérent entre app.json et Firebase');
      score += 1;
    } else {
      errors.push(`❌ Package ID incohérent: app.json (${appJsonPackage}) vs Firebase (${firebasePackage})`);
    }
  } else {
    warnings.push('⚠️ Package Android manquant dans google-services.json');
  }

} catch (error) {
  warnings.push('⚠️ google-services.json non trouvé ou invalide (utilisera Expo Push uniquement)');
}

// 3. Vérifier package.json
console.log('\n📦 3. Vérification des dépendances...');
try {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const requiredDeps = [
    'expo-notifications',
    'expo-device',
    'expo-constants'
  ];

  let allDepsPresent = true;
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep]) {
      console.log(`   ✅ ${dep} installé (${packageJson.dependencies[dep]})`);
    } else {
      errors.push(`❌ Dépendance manquante: ${dep}`);
      allDepsPresent = false;
    }
  });

  if (allDepsPresent) {
    score += 1;
  }

} catch (error) {
  errors.push('❌ Impossible de lire package.json: ' + error.message);
}

// 4. Vérifier les fichiers de services
console.log('\n🔧 4. Vérification des services...');
try {
  const notificationServicePath = path.join(__dirname, '..', 'app', 'services', 'notificationService.ts');

  if (fs.existsSync(notificationServicePath)) {
    const serviceContent = fs.readFileSync(notificationServicePath, 'utf8');

    // Vérifier les méthodes importantes
    const hasPushTokenRegistration = serviceContent.includes('registerForPushNotifications');
    const hasSendNotification = serviceContent.includes('sendNotificationToDriver');
    const hasNotificationHandler = serviceContent.includes('setNotificationHandler');

    if (hasPushTokenRegistration && hasSendNotification && hasNotificationHandler) {
      console.log('   ✅ Service de notifications complet');
      score += 1;
    } else {
      warnings.push('⚠️ Service de notifications incomplet');
    }
  } else {
    errors.push('❌ Service de notifications manquant');
  }

  // Vérifier AuthProvider
  const authProviderPath = path.join(__dirname, '..', 'components', 'AuthProvider.tsx');
  if (fs.existsSync(authProviderPath)) {
    console.log('   ✅ AuthProvider configuré');
    score += 1;
  } else {
    warnings.push('⚠️ AuthProvider manquant');
  }

} catch (error) {
  warnings.push('⚠️ Erreur lors de la vérification des services: ' + error.message);
}

// 5. Vérifier la structure de base de données
console.log('\n🗄️ 5. Vérification de la structure base de données...');
try {
  const apiServicePath = path.join(__dirname, '..', 'app', 'services', 'api.ts');

  if (fs.existsSync(apiServicePath)) {
    const apiContent = fs.readFileSync(apiServicePath, 'utf8');

    if (apiContent.includes('expo_push_token')) {
      console.log('   ✅ Références aux tokens push trouvées dans l\'API');
      score += 0.5;
    } else {
      warnings.push('⚠️ Aucune référence aux tokens push dans l\'API');
    }
  } else {
    warnings.push('⚠️ Service API manquant');
  }
} catch (error) {
  warnings.push('⚠️ Erreur lors de la vérification de l\'API: ' + error.message);
}

// Résultats finaux
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSULTATS DE LA VALIDATION');
console.log('='.repeat(60));

console.log(`\n📈 Score: ${score}/${maxScore} (${Math.round((score/maxScore)*100)}%)`);

if (errors.length > 0) {
  console.log('\n🚨 ERREURS CRITIQUES:');
  errors.forEach(error => console.log('   ' + error));
}

if (warnings.length > 0) {
  console.log('\n⚠️ AVERTISSEMENTS:');
  warnings.forEach(warning => console.log('   ' + warning));
}

// Recommandations
console.log('\n💡 RECOMMANDATIONS POUR LE BUILD:');

if (score >= 9) {
  console.log('✅ Configuration excellente ! Prêt pour le build de production.');
  console.log('   Commandes suggérées:');
  console.log('   npx eas build --platform android --profile production');
} else if (score >= 7) {
  console.log('⚠️ Configuration correcte mais améliorable. Build possible.');
  console.log('   Corrigez les avertissements pour une meilleure expérience.');
  console.log('   npx eas build --platform android --profile preview');
} else {
  console.log('❌ Configuration insuffisante. Corrigez les erreurs avant le build.');
  console.log('   Voir la documentation: NOTIFICATION_PUSH_DIAGNOSTIC.md');
}

// Tests post-build recommandés
console.log('\n🧪 TESTS RECOMMANDÉS APRÈS BUILD:');
console.log('   1. Installer l\'APK sur un appareil physique');
console.log('   2. Accepter les permissions de notifications');
console.log('   3. Tester les notifications locales');
console.log('   4. Vérifier les tokens en base de données');
console.log('   5. Tester l\'envoi/réception de notifications réelles');

// Code de sortie
const exitCode = errors.length > 0 ? 1 : 0;
console.log('\n🎯 Validation terminée.\n');

process.exit(exitCode);
