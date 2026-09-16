/**
 * Swiggy Instamart Scraper Module
 * Features async retries with backoff, transparent error reporting, and Playwright Chromium automation.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const config = require('../config');
const { getMockDataForQuery } = require('./mockFixtures');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function scrapeInstamartSingleAttempt(query, location = config.DEFAULT_LOCATION) {
    let browser = null;
    let listings = [];

    try {
        const launchOptions = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars'
            ]
        };

        if (fs.existsSync(CHROME_PATH)) {
            launchOptions.executablePath = CHROME_PATH;
        }

        browser = await chromium.launch(launchOptions);

        const context = await browser.newContext({
            geolocation: { latitude: location.latitude, longitude: location.longitude },
            permissions: ['geolocation'],
            userAgent: config.USER_AGENT,
            viewport: { width: 1440, height: 900 }
        });

        const page = await context.newPage();

        let apiData = null;
        page.on('response', async (response) => {
            const url = response.url();
            if (url.includes('/api/instamart/') || url.includes('/dapi/instamart/') || url.includes('/search')) {
                try {
                    const ct = response.headers()['content-type'] || '';
                    if (ct.includes('json')) {
                        const json = await response.json();
                        if (json && (json.data || json.widgets)) {
                            apiData = json.data || json;
                        }
                    }
                } catch (e) {}
            }
        });

        const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: config.SCRAPER_TIMEOUT_MS });

        // Wait up to 5s for XHR data or DOM rendering
        await page.waitForTimeout(4000);

        if (apiData) {
            const nodes = [];
            function collectNodes(obj) {
                if (!obj || typeof obj !== 'object') return;
                if (obj.name && (obj.price || obj.offerPrice || obj.storePrice || obj.variations)) {
                    nodes.push(obj);
                }
                if (Array.isArray(obj)) {
                    obj.forEach(collectNodes);
                } else {
                    Object.values(obj).forEach(collectNodes);
                }
            }
            collectNodes(apiData);

            for (const node of nodes) {
                const title = node.name || node.displayName || node.title || '';
                let rawPrice = 0;
                let rawMrp = 0;

                if (typeof node.price === 'number') rawPrice = node.price;
                else if (node.price && typeof node.price === 'object') {
                    rawPrice = node.price.offerPrice || node.price.storePrice || node.price.mrp || 0;
                    rawMrp = node.price.mrp || rawPrice;
                } else if (node.offerPrice) rawPrice = node.offerPrice;

                const price = rawPrice > 1000 ? Math.round(rawPrice / 100) : rawPrice;
                const mrp = rawMrp > 1000 ? Math.round(rawMrp / 100) : (rawMrp || price);

                let variantText = node.quantity || node.variationTitle || node.grammage || '';
                if (!variantText && node.variations && node.variations[0]) {
                    variantText = node.variations[0].quantity || node.variations[0].displayQuantity || '';
                }

                const imageId = node.cloudinaryImageId || node.imageId || '';
                const imageUrl = imageId ? `https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/${imageId}` : '';

                if (title && price > 0) {
                    listings.push({
                        id: `i_${node.id || Math.random().toString(36).substr(2, 6)}`,
                        title: title,
                        variantText: variantText,
                        price: price,
                        mrp: mrp,
                        imageUrl: imageUrl,
                        inStock: true,
                        store: 'instamart'
                    });
                }
                if (listings.length >= config.MAX_RESULTS_PER_STORE) break;
            }
        }
    } catch (err) {
        throw new Error(`Instamart page navigation failed: ${err.message}`);
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }

    return listings;
}

/**
 * Main Scraper with Async Retry Logic & Transparent Status
 */
async function scrapeInstamart(query, options = {}) {
    if (options.useMock) {
        console.log(`[InstamartScraper] Explicit Mock Fixture requested for query: "${query}"`);
        const mockData = getMockDataForQuery(query).instamart;
        return {
            success: true,
            listings: mockData,
            error: null,
            attempts: 0,
            isMock: true
        };
    }

    const location = options.location || config.DEFAULT_LOCATION;
    const maxRetries = config.SCRAPER_MAX_RETRIES;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[InstamartScraper] Attempt ${attempt}/${maxRetries} for query: "${query}"...`);
            const listings = await scrapeInstamartSingleAttempt(query, location);

            if (listings.length > 0) {
                console.log(`[InstamartScraper] Attempt ${attempt} succeeded with ${listings.length} live items!`);
                return {
                    success: true,
                    listings: listings,
                    error: null,
                    attempts: attempt,
                    isMock: false
                };
            }
            lastError = 'Instamart bot challenge or 0 listings returned';
        } catch (err) {
            lastError = err.message;
            console.warn(`[InstamartScraper] Attempt ${attempt} failed: ${err.message}`);
        }

        // Backoff delay before retry
        if (attempt < maxRetries) {
            await new Promise(res => setTimeout(res, 1500 * attempt));
        }
    }

    // Transparent error reporting (No silent fake mock fallback!)
    console.warn(`[InstamartScraper] All ${maxRetries} attempts failed for "${query}". Reporting store status as unavailable.`);
    return {
        success: false,
        listings: [],
        error: `Swiggy Instamart live search unavailable for this location: ${lastError}`,
        attempts: maxRetries,
        isMock: false
    };
}

module.exports = {
    scrapeInstamart
};
