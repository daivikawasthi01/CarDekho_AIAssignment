/**
 * Unified Concurrent Scraper Entry Point
 * Executes Blinkit and Instamart scrapers in parallel with per-store execution metadata.
 */

const { scrapeBlinkit } = require('./blinkitScraper');
const { scrapeInstamart } = require('./instamartScraper');

async function scrapeAllStores(query, options = {}) {
    const startTime = Date.now();
    console.log(`[ScraperManager] Initiating parallel scrapers for query: "${query}"...`);

    const [blinkitRes, instamartRes] = await Promise.allSettled([
        scrapeBlinkit(query, options),
        scrapeInstamart(query, options)
    ]);

    const bResult = blinkitRes.status === 'fulfilled' ? blinkitRes.value : { success: false, listings: [], error: blinkitRes.reason?.message };
    const iResult = instamartRes.status === 'fulfilled' ? instamartRes.value : { success: false, listings: [], error: instamartRes.reason?.message };
    
    const durationMs = Date.now() - startTime;

    console.log(`[ScraperManager] Completed in ${durationMs}ms. Blinkit: ${bResult.listings.length}, Instamart: ${iResult.listings.length}`);

    return {
        query,
        durationMs,
        storeStatuses: {
            blinkit: {
                success: bResult.success,
                count: bResult.listings.length,
                attempts: bResult.attempts || 1,
                error: bResult.error || null,
                isMock: bResult.isMock || false
            },
            instamart: {
                success: iResult.success,
                count: iResult.listings.length,
                attempts: iResult.attempts || 1,
                error: iResult.error || null,
                isMock: iResult.isMock || false
            }
        },
        blinkitListings: bResult.listings,
        instamartListings: iResult.listings
    };
}

module.exports = {
    scrapeAllStores
};
