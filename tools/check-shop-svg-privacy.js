const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const shopImageRoot = path.join(repoRoot, 'assets', 'images', 'shop');

function listShopSvgFiles(directory = shopImageRoot) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return listShopSvgFiles(entryPath);
      return entry.isFile() && path.extname(entry.name).toLowerCase() === '.svg' ? [entryPath] : [];
    });
}

function stripSvgMetadata(source) {
  return source.replace(
    /(?:^[\t ]*<metadata\b[^>]*>[\s\S]*?<\/metadata\s*>[^\S\r\n]*(?:\r?\n)?|<metadata\b[^>]*>[\s\S]*?<\/metadata\s*>)/gim,
    ''
  );
}

function getSvgPrivacyViolations(source) {
  const violations = [];
  if (/<metadata\b/i.test(source)) violations.push('embedded metadata');
  if (/https?:\/\/(?:[\w-]+\.)*canva\.com(?:[/?#:]|$)/i.test(source)) violations.push('Canva URL');
  return violations;
}

function checkShopSvgPrivacy(directory = shopImageRoot) {
  return listShopSvgFiles(directory).flatMap(file => {
    const violations = getSvgPrivacyViolations(fs.readFileSync(file, 'utf8'));
    return violations.length ? [{ file, violations }] : [];
  });
}

function removeShopSvgMetadata(directory = shopImageRoot) {
  const changed = [];
  for (const file of listShopSvgFiles(directory)) {
    const source = fs.readFileSync(file, 'utf8');
    const cleaned = stripSvgMetadata(source);
    if (cleaned !== source) {
      fs.writeFileSync(file, cleaned);
      changed.push(file);
    }
  }
  return changed;
}

function main(argv = process.argv.slice(2)) {
  const supportedArgs = new Set(['--check', '--write']);
  const unsupportedArgs = argv.filter(arg => !supportedArgs.has(arg));
  if (unsupportedArgs.length) {
    throw new Error('Unsupported arguments: ' + unsupportedArgs.join(', '));
  }

  if (argv.includes('--write')) {
    const changed = removeShopSvgMetadata();
    console.log('Removed embedded metadata from ' + changed.length + ' shop SVG file(s).');
  }

  const violations = checkShopSvgPrivacy();
  if (violations.length) {
    console.error('Shop SVG privacy check failed:');
    for (const violation of violations) {
      console.error('- ' + path.relative(repoRoot, violation.file) + ': ' + violation.violations.join(', '));
    }
    process.exitCode = 1;
    return;
  }

  console.log('Shop SVG privacy check passed for ' + listShopSvgFiles().length + ' SVG file(s).');
}

if (require.main === module) main();

module.exports = {
  checkShopSvgPrivacy,
  getSvgPrivacyViolations,
  listShopSvgFiles,
  removeShopSvgMetadata,
  stripSvgMetadata
};
