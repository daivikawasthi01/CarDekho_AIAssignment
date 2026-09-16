const { normalizeProduct, parseCanonicalSize } = require('../src/matching/normalizer');
const { matchListings } = require('../src/matching/matcher');
const assert = require('assert');

console.log('--- Testing Size Canonicalizer ---');
assert.strictEqual(parseCanonicalSize('Maggi Masala 70g x 12').formatted, '840 g');
assert.strictEqual(parseCanonicalSize('Amul Pasteurised Butter 500 g').formatted, '500 g');
assert.strictEqual(parseCanonicalSize('Coca Cola Soft Drink 1.25 L').formatted, '1250 ml');
assert.strictEqual(parseCanonicalSize('Farm Fresh Eggs 10 pcs').formatted, '10 pcs');
console.log('✅ Size Canonicalizer passed!');

console.log('--- Testing Product Matcher ---');
const rawBlinkit = [
    { id: 'b1', title: 'Maggi 2-Minute Instant Masala Noodles 70 g x 12', price: 168, mrp: 180, store: 'blinkit' },
    { id: 'b2', title: 'Amul Pasteurised Butter 500 g', price: 275, mrp: 275, store: 'blinkit' },
    { id: 'b3', title: 'Tata Salt Vacuum Evaporated 1 kg', price: 28, mrp: 28, store: 'blinkit' }
];

const rawInstamart = [
    { id: 'i1', title: 'Nestle Maggi 2-Min Masala Noodles Pack of 12 (840g)', price: 162, mrp: 180, store: 'instamart' },
    { id: 'i2', title: 'Amul Butter 500g Pouch', price: 275, mrp: 275, store: 'instamart' },
    { id: 'i3', title: 'Tata Salt Iodised 1kg', price: 28, mrp: 28, store: 'instamart' },
    { id: 'i4', title: 'Instamart Special Fresh Organic Bananas 1 kg', price: 50, mrp: 60, store: 'instamart' }
];

const result = matchListings(rawBlinkit, rawInstamart);
console.log('Match result stats:', result.stats);
assert.strictEqual(result.confidentMatches.length, 3, 'Should have 3 confident matches');
assert.strictEqual(result.unmatched.instamartOnly.length, 1, 'Should have 1 unmatched instamart listing');
assert.strictEqual(result.confidentMatches[0].priceComparison.cheaperStore, 'Instamart');
console.log('✅ Product Matcher passed!');
