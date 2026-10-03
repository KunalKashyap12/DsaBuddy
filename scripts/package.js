import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ZIP_NAME = 'dsa-buddy-extension.zip';
const ZIP_PATH = path.join(ROOT_DIR, ZIP_NAME);

// Strict list of production files needed by Chrome Web Store
const REQUIRED_FILES = [
  'manifest.json',
  'PRIVACY_POLICY.md',
  'background/background.js',
  'content/content.js',
  'popup/index.html',
  'popup/popup.js',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function packageExtension() {
  console.log('=== Packaging DsaBuddy for Chrome Web Store Deployment ===\n');

  // 1. Clean previous dist and zip
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(ZIP_PATH)) {
    fs.rmSync(ZIP_PATH, { force: true });
  }

  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 2. Copy production files to dist/
  let totalRawSize = 0;
  for (const relPath of REQUIRED_FILES) {
    const srcPath = path.join(ROOT_DIR, relPath);
    const destPath = path.join(DIST_DIR, relPath);

    if (!fs.existsSync(srcPath)) {
      throw new Error(`Missing required deployment file: ${relPath}. Run "npm run build" first.`);
    }

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    const stat = fs.statSync(destPath);
    totalRawSize += stat.size;
    console.log(`✓ Staged ${relPath} (${formatBytes(stat.size)})`);
  }

  // 3. Compress into zip for Chrome Developer Dashboard upload
  console.log(`\nCompressing package into ${ZIP_NAME}...`);

  if (process.platform === 'win32') {
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${DIST_DIR}\\*' -DestinationPath '${ZIP_PATH}' -Force"`);
  } else {
    execSync(`cd "${DIST_DIR}" && zip -r "${ZIP_PATH}" ./*`);
  }

  if (fs.existsSync(ZIP_PATH)) {
    const zipStat = fs.statSync(ZIP_PATH);
    console.log(`\n🎉 Packaging Complete!`);
    console.log(`--------------------------------------------------`);
    console.log(`📁 Deployment Folder   : dist/ (${formatBytes(totalRawSize)})`);
    console.log(`📦 Chrome Web Store Zip: ${ZIP_NAME} (${formatBytes(zipStat.size)})`);
    console.log(`--------------------------------------------------`);
    console.log(`Next Steps for Deployment:`);
    console.log(`1. Upload "${ZIP_NAME}" to the Chrome Web Store Developer Dashboard.`);
    console.log(`2. Or click "Load unpacked" and select the "dist" folder in chrome://extensions to test.`);
  } else {
    throw new Error('Failed to create zip archive.');
  }
}

packageExtension().catch((err) => {
  console.error('\n❌ Packaging Failed:', err);
  process.exit(1);
});
