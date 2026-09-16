/**
 * Blinkit Scraper Module
 * Uses Playwright with System Google Chrome for live website extraction.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const config = require('../config');
const { getMockDataForQuery } = require('./mockFixtures');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function scrapeBlinkit(query, options = {}) {
    if (options.useMock) {
        console.log(`[BlinkitScraper] Using Mock Fixture mode for query: "${query}"`);
        return getMockDataForQuery(query).blinkit;
    }

    let browser = null;
    let listings = [];

    try {
        console.log(`[BlinkitScraper] Launching Chrome live browser for query: "${query}"...`);
        
        const launchOptions = {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        };

        if (fs.existsSync(CHROME_PATH)) {
            launchOptions.executablePath = CHROME_PATH;
        }

        browser = await chromium.launch(launchOptions);

        const context = await browser.newContext({
            geolocation: { latitude: config.LOCATION.latitude, longitude: config.LOCATION.longitude },
            permissions: ['geolocation'],
            userAgent: config.USER_AGENT,
            viewport: { width: 1440, height: 900 }
        });

        const page = await context.newPage();

        // Listen for XHR layout search response JSON
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
            console.log(`[BlinkitScraper] Intercepted ${snippets.length} live snippets from Blinkit`);
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
        console.error(`[BlinkitScraper] Exception: ${err.message}`);
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }

    if (listings.length === 0) {
        console.warn(`[BlinkitScraper] Live scrape yielded 0 items. Falling back to Mock Fixtures.`);
        return getMockDataForQuery(query).blinkit;
    }

    return listings;
}

module.exports = {
    scrapeBlinkit
};
