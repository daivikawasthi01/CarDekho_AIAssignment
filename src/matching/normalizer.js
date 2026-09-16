/**
 * Product Normalizer Engine
 * Extracts brand, canonical pack size, and clean descriptive text from raw product titles.
 */

// Brand Dictionary with Alias Mappings
const BRAND_ALIASES = {
    'maggi': 'maggi',
    'nestle maggi': 'maggi',
    'nestle': 'nestle',
    'amul': 'amul',
    'tata': 'tata',
    'tata salt': 'tata',
    'tata sampann': 'tata',
    'aashirvaad': 'aashirvaad',
    'ashirvad': 'aashirvaad',
    'fortune': 'fortune',
    'coca-cola': 'coca-cola',
    'coca cola': 'coca-cola',
    'coke': 'coca-cola',
    'pepsi': 'pepsi',
    'britannia': 'britannia',
    'parle': 'parle',
    'parle-g': 'parle',
    'parleg': 'parle',
    'lays': 'lays',
    'lay\'s': 'lays',
    'kurkure': 'kurkure',
    'bingo': 'bingo',
    'mother dairy': 'mother dairy',
    'nandini': 'nandini',
    'epigamia': 'epigamia',
    'kellogg\'s': 'kelloggs',
    'kelloggs': 'kelloggs',
    'dettol': 'dettol',
    'surf excel': 'surf excel',
    'vim': 'vim',
    'tempayy': 'tempayy',
    'saffola': 'saffola',
    'sunfeast': 'sunfeast',
    'haldiram\'s': 'haldirams',
    'haldiram': 'haldirams',
    'cadbury': 'cadbury',
    'oreo': 'oreo',
    'tropicana': 'tropicana',
    'real': 'real'
};

// Marketing filler terms to strip from product titles
const MARKETING_NOISE_REGEX = /\b(combo pack|super saver|value pack|family pack|promo pack|buy \d+ get \d+ free|pack of \d+|pack of|pouch|carton|jar|bottle|box|poly-pack|poly pack|promotional offer|special offer|free|off|rs\.?|₹|best price)\b/gi;

/**
 * Extract canonical pack size from text or variant string.
 * Examples:
 * - "70 g x 12" -> 840 g (isMultiPack: true)
 * - "1.2 kg" -> 1200 g
 * - "500 ml" -> 500 ml
 * - "1 L" -> 1000 ml
 * - "10 Pcs" -> 10 pcs
 */
function parseCanonicalSize(text, variantText = '') {
    const combined = `${text} ${variantText}`.toLowerCase();

    // 1. Multipack pattern: e.g. "70 g x 12", "12 x 70g", "6 x 70 g", "70g * 12"
    const multiMatch = combined.match(/(\d+(?:\.\d+)?)\s*(g|gm|gram|grams|ml|l|ltr|liter|litres|litre)\s*[x*×]\s*(\d+)/i) ||
                       combined.match(/(\d+)\s*[x*×]\s*(\d+(?:\.\d+)?)\s*(g|gm|gram|grams|ml|l|ltr|liter|litres|litre)/i);

    if (multiMatch) {
        let singleVal, unitStr, count;

        if (/^(g|gm|gram|grams|ml|l|ltr|liter|litres|litre)$/i.test(multiMatch[2])) {
            singleVal = parseFloat(multiMatch[1]);
            unitStr = multiMatch[2].toLowerCase();
            count = parseInt(multiMatch[3], 10);
        } else {
            count = parseInt(multiMatch[1], 10);
            singleVal = parseFloat(multiMatch[2]);
            unitStr = multiMatch[3].toLowerCase();
        }

        let canonicalUnit = 'g';
        let totalVal = singleVal * count;

        if (['l', 'ltr', 'liter', 'litres', 'litre'].includes(unitStr)) {
            canonicalUnit = 'ml';
            totalVal *= 1000;
        } else if (['ml'].includes(unitStr)) {
            canonicalUnit = 'ml';
        } else if (['kg', 'kilo'].includes(unitStr)) {
            canonicalUnit = 'g';
            totalVal *= 1000;
        }

        return {
            raw: multiMatch[0],
            value: totalVal,
            unit: canonicalUnit,
            isMultiPack: true,
            packCount: count,
            formatted: `${totalVal} ${canonicalUnit}`
        };
    }

    // 2. Standard Single Volume/Weight: e.g. "1.2 kg", "500 ml", "1 ltr", "250g"
    const singleMatch = combined.match(/(\d+(?:\.\d+)?)\s*(kg|kilo|g|gm|gram|grams|ml|l|ltr|liter|litres|litre|pcs|pc|pieces|pack|units)\b/i);

    if (singleMatch) {
        let val = parseFloat(singleMatch[1]);
        const unitStr = singleMatch[2].toLowerCase();
        let canonicalUnit = 'g';

        if (['kg', 'kilo'].includes(unitStr)) {
            val *= 1000;
            canonicalUnit = 'g';
        } else if (['g', 'gm', 'gram', 'grams'].includes(unitStr)) {
            canonicalUnit = 'g';
        } else if (['l', 'ltr', 'liter', 'litres', 'litre'].includes(unitStr)) {
            val *= 1000;
            canonicalUnit = 'ml';
        } else if (['ml'].includes(unitStr)) {
            canonicalUnit = 'ml';
        } else if (['pcs', 'pc', 'pieces', 'pack', 'units'].includes(unitStr)) {
            canonicalUnit = 'pcs';
        }

        return {
            raw: singleMatch[0],
            value: Math.round(val),
            unit: canonicalUnit,
            isMultiPack: false,
            formatted: `${Math.round(val)} ${canonicalUnit}`
        };
    }

    // 3. Fallback count in variant text
    const countMatch = variantText.match(/(\d+)\s*(pcs|pc|pieces|eggs)/i);
    if (countMatch) {
        const val = parseInt(countMatch[1], 10);
        return {
            raw: countMatch[0],
            value: val,
            unit: 'pcs',
            isMultiPack: false,
            formatted: `${val} pcs`
        };
    }

    return {
        raw: '',
        value: 0,
        unit: 'unknown',
        isMultiPack: false,
        formatted: 'Unknown Size'
    };
}

/**
 * Extract brand from title
 */
function extractBrand(title) {
    const cleanLower = title.toLowerCase();
    const sortedBrands = Object.keys(BRAND_ALIASES).sort((a, b) => b.length - a.length);
    for (const alias of sortedBrands) {
        if (cleanLower.includes(alias)) {
            return BRAND_ALIASES[alias];
        }
    }
    return null;
}

/**
 * Clean descriptor text by stripping brand, pack size, and marketing noise.
 */
function extractCleanDescriptor(rawTitle, brand, sizeObj) {
    let text = rawTitle.toLowerCase();

    // Strip marketing noise
    text = text.replace(MARKETING_NOISE_REGEX, ' ');

    // Strip size raw string if present
    if (sizeObj && sizeObj.raw) {
        text = text.replace(sizeObj.raw.toLowerCase(), ' ');
    }

    // Strip all known brand aliases (e.g. nestle, maggi)
    const sortedBrands = Object.keys(BRAND_ALIASES).sort((a, b) => b.length - a.length);
    for (const alias of sortedBrands) {
        text = text.replace(new RegExp(`\\b${alias}\\b`, 'gi'), ' ');
    }

    // Normalize common descriptor abbreviations
    text = text.replace(/\bmin\b/g, 'minute')
               .replace(/\binst\b/g, 'instant')
               .replace(/\bpck\b/g, 'pack');

    // Clean punctuation and excess whitespace
    text = text.replace(/[^a-z0-9\s]/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();

    return text;
}

/**
 * Full Normalizer Entry Point
 */
function normalizeProduct(rawItem) {
    const rawTitle = rawItem.title || rawItem.name || '';
    const variantText = rawItem.variantText || rawItem.unit || rawItem.quantity || '';
    
    const brand = extractBrand(rawTitle);
    const size = parseCanonicalSize(rawTitle, variantText);
    const cleanDescriptor = extractCleanDescriptor(rawTitle, brand, size);

    return {
        id: rawItem.id || String(Math.random()),
        store: rawItem.store, // 'blinkit' | 'instamart'
        rawTitle: rawTitle,
        variantText: variantText,
        price: parseFloat(rawItem.price) || 0,
        mrp: parseFloat(rawItem.mrp) || parseFloat(rawItem.price) || 0,
        imageUrl: rawItem.imageUrl || '',
        inStock: rawItem.inStock !== false,
        brand: brand,
        canonicalSize: size,
        cleanDescriptor: cleanDescriptor
    };
}

module.exports = {
    normalizeProduct,
    parseCanonicalSize,
    extractBrand,
    extractCleanDescriptor
};
