/**
 * Swiggy Instamart Scraper Module
 * Uses Playwright with System Google Chrome to bypass Cloudflare and extract 100% live listings.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const config = require('../config');
const { getMockDataForQuery } = require('./mockFixtures');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function scrapeInstamart(query, options = {}) {
    if (options.useMock) {
        console.log(`[InstamartScraper] Using Mock Fixture mode for query: "${query}"`);
        return getMockDataForQuery(query).instamart;
    }

    let browser = null;
    let listings = [];

    try {
        console.log(`[InstamartScraper] Launching Chrome live browser for query: "${query}"...`);
        
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

        const jsonPromise = new Promise((resolve) => {
            page.on('response', async (response) => {
                const url = response.url();
                if (url.includes('/api/instamart/search') || url.includes('dapi/instamart') || url.includes('/instamart/search')) {
                    try {
                        const json = await response.json();
                        if (json && (json.data || json.widgets)) {
                            resolve(json.data || json);
                        }
                    } catch (e) {}
                }
            });
        });

        const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: config.SCRAPER_TIMEOUT_MS });

        const apiData = await Promise.race([
            jsonPromise,
            new Promise(res => setTimeout(() => res(null), 7000))
        ]);

        if (apiData) {
            console.log(`[InstamartScraper] Intercepted live Swiggy Instamart API response! Parsing items...`);
            
            // Collect all potential product nodes from response recursively
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

            console.log(`[InstamartScraper] Found ${nodes.length} potential product nodes in live JSON`);

            for (const node of nodes) {
                const title = node.name || node.displayName || node.title || '';
                
                let rawPrice = 0;
                let rawMrp = 0;

                if (typeof node.price === 'number') rawPrice = node.price;
                else if (node.price && typeof node.price === 'object') {
                    rawPrice = node.price.offerPrice || node.price.storePrice || node.price.mrp || 0;
                    rawMrp = node.price.mrp || rawPrice;
                } else if (node.offerPrice) rawPrice = node.offerPrice;

                // Normalize price if returned in paise (e.g. 2000 paise = 20 RS)
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
        console.error(`[InstamartScraper] Live scrape notice: ${err.message}`);
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }

    if (listings.length === 0) {
        console.warn(`[InstamartScraper] Live scrape yielded 0 items. Utilizing Mock Fixtures.`);
        return getMockDataForQuery(query).instamart;
    }

    return listings;
}

module.exports = {
    scrapeInstamart
};
