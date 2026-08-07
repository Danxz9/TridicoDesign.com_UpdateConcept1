const assert = require('node:assert/strict');
const test = require('node:test');

const {
  checkShopSvgPrivacy,
  getSvgPrivacyViolations,
  stripSvgMetadata
} = require('../tools/check-shop-svg-privacy');

test('shop SVG metadata cleaner removes provenance without changing visible markup', () => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg"><metadata>Canva editable design: https://www.canva.com/d/example</metadata><path d="M0 0h1v1z"/></svg>';
  const cleaned = stripSvgMetadata(source);
  const lineBasedSource = '<svg>\n  <metadata>Canva editable design: https://www.canva.com/d/example</metadata>\n  <path d="M0 0h1v1z"/>\n</svg>\n';

  assert.equal(cleaned, '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h1v1z"/></svg>');
  assert.equal(stripSvgMetadata(lineBasedSource), '<svg>\n  <path d="M0 0h1v1z"/>\n</svg>\n');
  assert.deepEqual(getSvgPrivacyViolations(source), ['embedded metadata', 'Canva URL']);
  assert.deepEqual(getSvgPrivacyViolations(cleaned), []);
});

test('published shop SVGs contain no embedded provenance metadata or Canva URLs', () => {
  assert.deepEqual(checkShopSvgPrivacy(), []);
});
