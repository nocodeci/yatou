const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Construction de l\'application pour les vraies notifications push...\n');

try {
  console.log('1️⃣ Configuration des credentials Android...');
  
  // Configurer les credentials Android
  execSync('eas credentials:configure --platform android', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n2️⃣ Construction de l\'application...');
  
  // Construire l'application
  execSync('eas build --platform android --profile preview', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('\n✅ Application construite avec succès !');
  console.log('\n📱 Prochaines étapes :');
  console.log('1. Téléchargez l\'APK depuis le dashboard EAS');
  console.log('2. Installez l\'APK sur un appareil Android physique');
  console.log('3. Ouvrez l\'application et connectez-vous en tant que livreur');
  console.log('4. Le token Expo Push sera automatiquement enregistré');
  console.log('5. Testez les vraies notifications push !\n');

} catch (error) {
  console.error('❌ Erreur lors de la construction:', error.message);
  console.log('\n🔧 Solutions alternatives :');
  console.log('1. Utilisez Expo Go pour tester les notifications locales');
  console.log('2. Configurez manuellement les credentials EAS');
  console.log('3. Construisez l\'application via le dashboard EAS\n');
}
