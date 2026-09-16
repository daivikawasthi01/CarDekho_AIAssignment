/**
 * Blinkit Scraper Module
 * Features async retries with backoff, transparent error reporting, and Playwright Chromium automation.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const config = require('../config');
const { getMockDataForQuery } = require('./mockFixtures');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function scrapeBlinkitSingleAttempt(query, location = config.DEFAULT_LOCATION) {
    let browser = null;
    let listings = [];

    try {
        const launchOptions = {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
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

        const jsonPromise = new Promise((resolve) => {
            page.on('response', async (response) => {
                const url = response.url();
                if (url.includes('/v1/layout/search') || url.includes('/v5/search/products') || url.includes('/v6/search/products')) {
                    try {
                        const json = await response.json();
                        if (json && json.response && json.response.snippets) {
                            resolve(json.response.snippets);
                        }
                    } catch (e) {}
                }
            });
        });

        const searchUrl = `https://blinkit.com/s/?q=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: config.SCRAPER_TIMEOUT_MS });

        const snippets = await Promise.race([
            jsonPromise,
            new Promise(res => setTimeout(() => res(null), 6000))
        ]);

        if (snippets && snippets.length > 0) {
            for (const snippet of snippets) {
                const data = snippet.data;
                if (!data || !data.name || !data.name.text) continue;

                const title = data.name.text;
                const variantText = data.variant ? data.variant.text : '';
                const priceText = data.normal_price ? data.normal_price.text : (data.mrp ? data.mrp.text : '0');
                const mrpText = data.mrp ? data.mrp.text : priceText;

                const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
                const mrp = parseFloat(mrpText.replace(/[^0-9.]/g, '')) || price;
                const imageUrl = data.image ? data.image.url : '';
                const productId = data.identity ? data.identity.id : `b_${Math.random()}`;

                if (title && price > 0) {
                    listings.push({
                        id: `b_${productId}`,
                        title: title,
                        variantText: variantText,
                        price: price,
                        mrp: mrp,
                        imageUrl: imageUrl,
                        inStock: true,
                        store: 'blinkit'
                    });
                }

                if (listings.length >= config.MAX_RESULTS_PER_STORE) break;
            }
        }
    } catch (err) {
        throw new Error(`Blinkit scraper failed: ${err.message}`);
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }

    return listings;
}

/**
 * Main Scraper Entry Point with Retries
 */
async function scrapeBlinkit(query, options = {}) {
    if (options.useMock) {
        console.log(`[BlinkitScraper] Explicit Mock Fixture requested for query: "${query}"`);
        const mockData = getMockDataForQuery(query).blinkit;
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
            console.log(`[BlinkitScraper] Attempt ${attempt}/${maxRetries} for query: "${query}"...`);
            const listings = await scrapeBlinkitSingleAttempt(query, location);

            if (listings.length > 0) {
                console.log(`[BlinkitScraper] Attempt ${attempt} succeeded with ${listings.length} live items!`);
                return {
                    success: true,
                    listings: listings,
                    error: null,
                    attempts: attempt,
                    isMock: false
                };
            }
            lastError = '0 live listings returned from Blinkit layout endpoint';
        } catch (err) {
            lastError = err.message;
            console.warn(`[BlinkitScraper] Attempt ${attempt} failed: ${err.message}`);
        }

        if (attempt < maxRetries) {
            await new Promise(res => setTimeout(res, 1000 * attempt));
        }
    }

    return {
        success: false,
        listings: [],
        error: `Blinkit live search unavailable: ${lastError}`,
        attempts: maxRetries,
        isMock: false
    };
}

module.exports = {
    scrapeBlinkit
};
