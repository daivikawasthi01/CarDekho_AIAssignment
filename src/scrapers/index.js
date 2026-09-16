/**
 * Unified Concurrent Scraper Entry Point
 * Executes Blinkit and Instamart scrapers in parallel.
 */

const { scrapeBlinkit } = require('./blinkitScraper');
const { scrapeInstamart } = require('./instamartScraper');

async function scrapeAllStores(query, options = {}) {
    const startTime = Date.now();
    console.log(`[ScraperManager] Initiating concurrent scrape for query: "${query}"...`);

    const [blinkitResult, instamartResult] = await Promise.allSettled([
        scrapeBlinkit(query, options),
        scrapeInstamart(query, options)
    ]);

    const blinkitListings = blinkitResult.status === 'fulfilled' ? blinkitResult.value : [];
    const instamartListings = instamartResult.status === 'fulfilled' ? instamartResult.value : [];
    const durationMs = Date.now() - startTime;

    console.log(`[ScraperManager] Concurrent scrape finished in ${durationMs}ms. Blinkit: ${blinkitListings.length}, Instamart: ${instamartListings.length}`);

    return {
        query,
        durationMs,
        blinkitListings,
        instamartListings
    };
}

module.exports = {
    scrapeAllStores
};
