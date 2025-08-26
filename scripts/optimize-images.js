#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Démarrage de l\'optimisation des images...');

// Vérifier si ImageMagick est installé
function checkImageMagick() {
  try {
    execSync('magick --version', { stdio: 'ignore' });
    return true;
  } catch {
    try {
      execSync('convert --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}

// Optimiser une image PNG
function optimizePNG(inputPath, outputPath) {
  try {
    // Compression PNG avec ImageMagick
    execSync(`magick "${inputPath}" -strip -quality 85 "${outputPath}"`, { stdio: 'ignore' });
    
    // Alternative avec convert si magick n'est pas disponible
    if (!fs.existsSync(outputPath)) {
      execSync(`convert "${inputPath}" -strip -quality 85 "${outputPath}"`, { stdio: 'ignore' });
    }
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)}: ${(originalSize / 1024).toFixed(1)}KB → ${(optimizedSize / 1024).toFixed(1)}KB (${savings}% économisé)`);
    
    return true;
  } catch (error) {
    console.log(`⚠️  Impossible d'optimiser ${path.basename(inputPath)}: ${error.message}`);
    return false;
  }
}

// Convertir en WebP
function convertToWebP(inputPath, outputPath) {
  try {
    execSync(`magick "${inputPath}" -quality 85 "${outputPath}"`, { stdio: 'ignore' });
    
    if (!fs.existsSync(outputPath)) {
      execSync(`convert "${inputPath}" -quality 85 "${outputPath}"`, { stdio: 'ignore' });
    }
    
    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)} → WebP: ${(originalSize / 1024).toFixed(1)}KB → ${(webpSize / 1024).toFixed(1)}KB (${savings}% économisé)`);
    
    return true;
  } catch (error) {
    console.log(`⚠️  Impossible de convertir ${path.basename(inputPath)} en WebP: ${error.message}`);
    return false;
  }
}

// Traiter un dossier récursivement
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(item).toLowerCase();
      
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        const fileName = path.basename(item, ext);
        const dirName = path.dirname(fullPath);
        
        // Créer le dossier d'optimisation
        const optimizedDir = path.join(dirName, 'optimized');
        if (!fs.existsSync(optimizedDir)) {
          fs.mkdirSync(optimizedDir, { recursive: true });
        }
        
        // Optimiser l'image originale
        const optimizedPath = path.join(optimizedDir, `${fileName}-optimized${ext}`);
        optimizePNG(fullPath, optimizedPath);
        
        // Convertir en WebP
        const webpPath = path.join(optimizedDir, `${fileName}.webp`);
        convertToWebP(fullPath, webpPath);
      }
    }
  }
}

// Dossiers à traiter
const directories = [
  'assets/images',
  'assets/logos',
  'components'
];

// Vérifier ImageMagick
if (!checkImageMagick()) {
  console.log('⚠️  ImageMagick n\'est pas installé. Installation...');
  try {
    if (process.platform === 'darwin') {
      execSync('brew install imagemagick', { stdio: 'inherit' });
    } else if (process.platform === 'linux') {
      execSync('sudo apt-get install imagemagick', { stdio: 'inherit' });
    } else {
      console.log('❌ Veuillez installer ImageMagick manuellement depuis https://imagemagick.org/');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Erreur lors de l\'installation d\'ImageMagick:', error.message);
    process.exit(1);
  }
}

// Traiter chaque dossier
for (const dir of directories) {
  if (fs.existsSync(dir)) {
    console.log(`\n📁 Traitement du dossier: ${dir}`);
    processDirectory(dir);
  } else {
    console.log(`⚠️  Dossier non trouvé: ${dir}`);
  }
}

console.log('\n🎉 Optimisation des images terminée !');
console.log('💡 Les images optimisées sont dans les sous-dossiers "optimized"');
console.log('💡 Les versions WebP sont également disponibles');
