/**
 * Product Matcher Engine
 * Pairs Blinkit listings with Instamart listings based on hard brand & size gates
 * and fuzzy descriptor similarity scoring.
 */

const { normalizeProduct } = require('./normalizer');

/**
 * Token Set Jaccard Similarity + Fuzzy Distance
 */
function computeDescriptorSimilarity(desc1, desc2) {
    if (!desc1 && !desc2) return 1.0;
    if (!desc1 || !desc2) return 0.5;
    if (desc1 === desc2) return 1.0;

    const tokens1 = new Set(desc1.split(' ').filter(t => t.length >= 1));
    const tokens2 = new Set(desc2.split(' ').filter(t => t.length >= 1));

    if (tokens1.size === 0 || tokens2.size === 0) return 0.5;

    // Intersection & Union
    let intersection = 0;
    for (const t of tokens1) {
        if (tokens2.has(t)) intersection++;
    }

    const union = new Set([...tokens1, ...tokens2]).size;
    const jaccard = intersection / union;

    // Character Levenshtein Ratio on full text
    const levRatio = levenshteinRatio(desc1, desc2);

    // Weighted combination (60% Token Jaccard, 40% Levenshtein Ratio)
    return (0.6 * jaccard) + (0.4 * levRatio);
}

/**
 * Normalized Levenshtein similarity ratio between 0 and 1
 */
function levenshteinRatio(s1, s2) {
    const len1 = s1.length;
    const len2 = s2.length;
    if (len1 === 0 && len2 === 0) return 1.0;
    if (len1 === 0 || len2 === 0) return 0;

    const track = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
    for (let i = 0; i <= len1; i += 1) track[0][i] = i;
    for (let j = 0; j <= len2; j += 1) track[j][0] = j;

    for (let j = 1; j <= len2; j += 1) {
        for (let i = 1; i <= len1; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator // substitution
            );
        }
    }

    const dist = track[len2][len1];
    return 1 - (dist / Math.max(len1, len2));
}

/**
 * Core matching procedure
 */
function matchListings(rawBlinkitListings = [], rawInstamartListings = []) {
    // 1. Normalize all products
    const blinkitItems = rawBlinkitListings.map(normalizeProduct);
    const instamartItems = rawInstamartListings.map(normalizeProduct);

    const confidentMatches = [];
    const likelyMatches = [];
    
    const matchedBlinkitIds = new Set();
    const matchedInstamartIds = new Set();

    // 2. Candidate evaluation loop
    for (const bItem of blinkitItems) {
        let bestMatch = null;
        let highestScore = 0;

        for (const iItem of instamartItems) {
            if (matchedInstamartIds.has(iItem.id)) continue;

            // HARD GATE 1: Canonical Size Equality
            // If both items have valid size info, sizes MUST be identical.
            if (bItem.canonicalSize.unit !== 'unknown' && iItem.canonicalSize.unit !== 'unknown') {
                if (bItem.canonicalSize.unit !== iItem.canonicalSize.unit) continue;
                
                // Allow a tiny 5% tolerance for slight weight variations e.g. 500g vs 520g
                const diffRatio = Math.abs(bItem.canonicalSize.value - iItem.canonicalSize.value) / Math.max(bItem.canonicalSize.value, iItem.canonicalSize.value);
                if (diffRatio > 0.05) continue; // Size mismatch hard gate!
            }

            // HARD GATE 2: Brand Equality (if brands detected)
            if (bItem.brand && iItem.brand && bItem.brand !== iItem.brand) {
                continue; // Brand mismatch hard gate!
            }

            // Calculate descriptor similarity score
            const descSim = computeDescriptorSimilarity(bItem.cleanDescriptor, iItem.cleanDescriptor);

            const hasBrandMatch = bItem.brand && iItem.brand && bItem.brand === iItem.brand;
            const hasSizeMatch = bItem.canonicalSize.formatted === iItem.canonicalSize.formatted && bItem.canonicalSize.unit !== 'unknown';

            let finalScore = descSim;

            if (hasBrandMatch && hasSizeMatch) {
                // Perfect brand + size alignment: baseline confidence is high (0.80)
                finalScore = 0.80 + (0.20 * descSim);
            } else if (hasBrandMatch || hasSizeMatch) {
                finalScore = 0.65 + (0.30 * descSim);
            }

            if (finalScore > highestScore) {
                highestScore = finalScore;
                bestMatch = iItem;
            }
        }

        // Categorize based on score thresholds
        if (bestMatch && highestScore >= 0.65) {
            matchedBlinkitIds.add(bItem.id);
            matchedInstamartIds.add(bestMatch.id);

            const priceDiff = Math.abs(bItem.price - bestMatch.price);
            let cheaperStore = 'Equal';
            if (bItem.price < bestMatch.price) cheaperStore = 'Blinkit';
            else if (bestMatch.price < bItem.price) cheaperStore = 'Instamart';

            const matchObject = {
                id: `match_${bItem.id}_${bestMatch.id}`,
                confidenceScore: Math.round(highestScore * 100),
                blinkit: bItem,
                instamart: bestMatch,
                priceComparison: {
                    priceDiff: parseFloat(priceDiff.toFixed(2)),
                    cheaperStore: cheaperStore,
                    blinkitPrice: bItem.price,
                    instamartPrice: bestMatch.price,
                    savingsPercentage: Math.max(bItem.price, bestMatch.price) > 0 ? 
                        Math.round((priceDiff / Math.max(bItem.price, bestMatch.price)) * 100) : 0
                }
            };

            if (highestScore >= 0.80) {
                confidentMatches.push(matchObject);
            } else {
                likelyMatches.push(matchObject);
            }
        }
    }

    // 3. Unmatched items
    const blinkitOnly = blinkitItems.filter(item => !matchedBlinkitIds.has(item.id));
    const instamartOnly = instamartItems.filter(item => !matchedInstamartIds.has(item.id));

    return {
        confidentMatches,
        likelyMatches,
        unmatched: {
            blinkitOnly,
            instamartOnly
        },
        stats: {
            totalBlinkit: blinkitItems.length,
            totalInstamart: instamartItems.length,
            confidentCount: confidentMatches.length,
            likelyCount: likelyMatches.length,
            blinkitOnlyCount: blinkitOnly.length,
            instamartOnlyCount: instamartOnly.length
        }
    };
}

module.exports = {
    matchListings,
    computeDescriptorSimilarity
};
