/**
 * Express Backend Server for Grocery Price Compare Application
 * Handles API endpoints, TTL caching, scraping orchestration, and static UI delivery.
 */

const express = require('express');
const path = require('path');
const config = require('./config');
const SimpleTTLCache = require('./cache');
const { scrapeAllStores } = require('./scrapers');
const { matchListings } = require('./matching/matcher');

const app = express();
const cache = new SimpleTTLCache(config.CACHE_TTL_MS);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * GET /api/config
 * Returns current delivery location configuration
 */
app.get('/api/config', (req, res) => {
    res.json({
        success: true,
        location: config.DEFAULT_LOCATION,
        cacheTtlSeconds: config.CACHE_TTL_MS / 1000
    });
});

/**
 * GET /api/search?q=maggi&mock=true
 * Main search & comparison endpoint
 */
app.get('/api/search', async (req, res) => {
    const rawQuery = req.query.q || '';
    const query = String(rawQuery).trim().substring(0, 100); // Sanitize query length
    const useMock = req.query.mock === 'true' || process.env.USE_MOCK === 'true';

    if (!query) {
        return res.status(400).json({
            success: false,
            error: 'Query parameter "q" is required. Example: /api/search?q=maggi'
        });
    }

    const cacheKey = `${query}_${useMock ? 'mock' : 'live'}`;
    const cachedResponse = cache.get(cacheKey);

    if (cachedResponse) {
        console.log(`[API Server] Returning CACHED response for query: "${query}"`);
        return res.json({
            ...cachedResponse,
            isCached: true
        });
    }

    try {
        const scrapeStart = Date.now();
        const scrapeResults = await scrapeAllStores(query, { useMock });
        const scrapeDuration = Date.now() - scrapeStart;

        const matchStart = Date.now();
        const matchedOutput = matchListings(scrapeResults.blinkitListings, scrapeResults.instamartListings);
        const matchDuration = Date.now() - matchStart;

        const responsePayload = {
            success: true,
            isCached: false,
            query: query,
            storeStatuses: scrapeResults.storeStatuses,
            meta: {
                location: config.DEFAULT_LOCATION,
                fetchedAt: new Date().toISOString(),
                scrapeDurationMs: scrapeDuration,
                matchDurationMs: matchDuration,
                totalDurationMs: scrapeDuration + matchDuration,
                isMockFallback: useMock
            },
            matches: matchedOutput.confidentMatches,
            likelyMatches: matchedOutput.likelyMatches,
            unmatched: matchedOutput.unmatched,
            stats: matchedOutput.stats
        };

        // Cache valid scrape payload
        cache.set(cacheKey, responsePayload);

        res.json(responsePayload);
    } catch (err) {
        console.error(`[API Server] Search Error:`, err);
        res.status(500).json({
            success: false,
            error: 'Failed to process grocery price comparison search',
            message: err.message
        });
    }
});

// Start Express Server
app.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Grocery Price Compare Server is running on port ${config.PORT}`);
    console.log(`📍 Delivery Location: ${config.DEFAULT_LOCATION.displayText}`);
    console.log(`🔗 Web UI URL: http://localhost:${config.PORT}`);
    console.log(`=======================================================`);
});
