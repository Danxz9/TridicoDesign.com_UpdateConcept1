const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..');

const requiredAssets = [
  'assets/images/shop/vehicle/custom-cut-vehicle-decal-kit-v1.png',
  'assets/images/shop/vehicle/consumer-accent-stripe-kit-v1.png',
  'assets/images/shop/vehicle/specialty-color-accent-vinyl-v1.png',
  'assets/images/work/work-slots/old/fleet-parts-truck/01-01-perf-cjd-delaware-2.jpg'
];

const missing = requiredAssets.filter(asset => !fs.existsSync(path.join(repoRoot, asset)));

if (missing.length) {
  throw new Error('Vehicle shop image verification failed. Missing:\n' + missing.map(asset => '- ' + asset).join('\n'));
}

console.log('Verified ' + requiredAssets.length + ' approved vehicle-shop visual assets.');
console.log('The storefront intentionally uses original concept imagery and labeled installed-work proof; it does not generate universal SKU mockups.');
