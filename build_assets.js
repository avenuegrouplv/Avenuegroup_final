import fs from 'fs';
import path from 'path';

// This script implements the automated build process and image gallery configuration
// for Netlify static site engine compatibility.

const WEB_FILES = [
  'bojajumi-nomas-telpas-ka-atbildiba-ta-ir.webp',
  'drosibas-depozits-komercipasuma-nomas-liguma.webp',
  'iegadaties-dzivokli-bez-dzivokla-ipasuma-statusa.webp',
  'ka-pareiza-komercipasuma-apsaimniekosana-palielina-ta-vertibu.webp',
  'ka-samazinat-komercipasuma-uzturesanas-izmaksas.webp',
  'kad-ipasumu-apsaimniekot-pasam-un-kad-to-nedarit.webp',
  'kapec-labs-nomnieks-var-klut-par-problemu.webp',
  'kas-isti-ir-komercipasuma-apsaimniekosana.webp',
  'kas-notiek-ja-mainas-kopipasnieks.webp',
  'kas-obligati-jaieklauj-komercnomas-liguma.webp',
  'kas-regulari-japarbauda-komercipasuma-lai-izvairitos-no-remontiem.webp',
  'ko-darit-ja-komercipasumam-ir-vairaki-ipasnieki.webp',
  'komercipasuma-due-diligence.webp',
  'vienpuseja-nomas-liguma-izbeigsana.webp'
];

async function main() {
  console.log('--- STARTING IMAGE CONFIGURATION & COMPATIBILITY CHECK ---');

  const rootImagesDir = path.join(process.cwd(), 'images', 'noderigi', 'raksti');
  const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'noderigi', 'raksti');

  // Ensure directories exist
  fs.mkdirSync(rootImagesDir, { recursive: true });
  fs.mkdirSync(publicImagesDir, { recursive: true });

  console.log(`Ensured directory exists: ${rootImagesDir}`);
  console.log(`Ensured directory exists: ${publicImagesDir}`);

  // Copy images from root to both folders
  for (const file of WEB_FILES) {
    const srcPath = path.join(process.cwd(), file);
    const destRootPath = path.join(rootImagesDir, file);
    const destPublicPath = path.join(publicImagesDir, file);

    // If source exists in root, copy to both destinations
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destRootPath);
      fs.copyFileSync(srcPath, destPublicPath);
      console.log(`✓ Copied ${file} to root and public subfolders`);
    } else {
      // If not in root, see if it is in public already, and copy to root images
      if (fs.existsSync(destPublicPath)) {
        fs.copyFileSync(destPublicPath, destRootPath);
        console.log(`✓ Synchronized ${file} from public to root images`);
      } else if (fs.existsSync(destRootPath)) {
        fs.copyFileSync(destRootPath, destPublicPath);
        console.log(`✓ Synchronized ${file} from root images to public`);
      } else {
        console.warn(`⚠ Image file not found anywhere: ${file}`);
      }
    }
  }

  // If a dist folder exists, copy public images to dist/images to bypass any caching issues
  const distImagesDir = path.join(process.cwd(), 'dist', 'images');
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    fs.mkdirSync(distImagesDir, { recursive: true });
    
    const copyRecursiveSync = (src, dest) => {
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      const isDirectory = exists && stats.isDirectory();
      if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach((childItemName) => {
          copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };

    const publicImagesSrc = path.join(process.cwd(), 'public', 'images');
    if (fs.existsSync(publicImagesSrc)) {
      copyRecursiveSync(publicImagesSrc, distImagesDir);
      console.log(`✓ Copied public/images directly to dist/images for Netlify static engine compatibility`);
    }
  }

  console.log('--- IMAGE CONFIGURATION & COMPATIBILITY CHECK COMPLETE ---');
}

main().catch((err) => {
  console.error('Error during asset build:', err);
  process.exit(1);
});
