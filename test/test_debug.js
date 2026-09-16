const { normalizeProduct } = require('../src/matching/normalizer');
const { matchListings, computeDescriptorSimilarity } = require('../src/matching/matcher');

const b1 = normalizeProduct({ id: 'b1', title: 'Maggi 2-Minute Instant Masala Noodles 70 g x 12', price: 168, store: 'blinkit' });
const i1 = normalizeProduct({ id: 'i1', title: 'Nestle Maggi 2-Min Masala Noodles Pack of 12 (840g)', price: 162, store: 'instamart' });

console.log('Normalized B1:', b1);
console.log('Normalized I1:', i1);

console.log('Sim score:', computeDescriptorSimilarity(b1.cleanDescriptor, i1.cleanDescriptor));
