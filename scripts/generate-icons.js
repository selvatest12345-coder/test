/**
 * Run with: node scripts/generate-icons.js
 * Requires: npm install canvas (or use expo's asset tools)
 *
 * This script generates placeholder app icons for development.
 * For production, replace assets/icon.png with a 1024x1024 PNG.
 */

const fs = require('fs');
const path = require('path');

// SVG icon content for MultiChat AI
const svgContent = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="200" fill="#0A0A0F"/>
  <rect x="180" y="240" width="520" height="380" rx="40" fill="#10A37F" opacity="0.9"/>
  <rect x="220" y="310" width="520" height="380" rx="40" fill="#4285F4" opacity="0.85"/>
  <rect x="260" y="380" width="520" height="380" rx="40" fill="#CC785C" opacity="0.8"/>
  <text x="512" y="560" font-family="Arial" font-size="120" font-weight="bold" fill="white" text-anchor="middle">AI</text>
</svg>`;

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svgContent);
console.log('✓ Generated assets/icon.svg');
console.log('  Convert to PNG for production use:');
console.log('  - Use https://convertio.co/svg-png/ or similar');
console.log('  - Or use npx expo-image-utils');
