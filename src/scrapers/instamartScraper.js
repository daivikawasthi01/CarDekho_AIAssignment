/**
 * Swiggy Instamart Scraper Module
 * Uses Playwright Chromium with fallback to mock fixtures if Cloudflare anti-bot blocks connection.
 */

const { chromium } = require('playwright');
const config = require('../config');
const { getMockDataForQuery } = require('./mockFixtures');

async function scrapeInstamart(query, options = {}) {
    if (options.useMock) {
        console.log(`[InstamartScraper] Using Mock Fixture mode for query: "${query}"`);
        return getMockDataForQuery(query).instamart;
    }

    let browser = null;
    let listings = [];

    try {
        console.log(`[InstamartScraper] Launching Playwright Chromium for query: "${query}"...`);
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        });

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
                if (url.includes('dapi/instamart') || url.includes('/api/instamart/search') || url.includes('instamart/search')) {
                    try {
                        const json = await response.json();
                        if (json && json.data) {
                            resolve(json.data);
                        }
                    } catch (e) {}
                }
            });
        });

        const searchUrl = `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodeURIComponent(query)}`;
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: config.SCRAPER_TIMEOUT_MS });

        const apiData = await Promise.race([
            jsonPromise,
            new Promise(res => setTimeout(() => res(null), 5000))
        ]);

        if (apiData && apiData.widgets) {
            console.log(`[InstamartScraper] Intercepted Swiggy Instamart API data!`);
            for (const widget of apiData.widgets) {
                if (widget.data) {
                    const items = widget.data.items || widget.data.nodes || [];
                    for (const item of items) {
                        const title = item.name || item.title || '';
                        const price = item.price ? item.price.storePrice || item.price.offerPrice : 0;
                        const mrp = item.price ? item.price.mrp : price;
                        const variantText = item.quantity || item.variationTitle || '';
                        const imageUrl = item.cloudinaryImageId ? `https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/${item.cloudinaryImageId}` : '';

                        if (title && price > 0) {
                            listings.push({
                                id: `i_${item.id || Math.random()}`,
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
        console.warn(`[InstamartScraper] Cloudflare/Live scrape yielded 0 items. Utilizing Mock Fixtures.`);
        return getMockDataForQuery(query).instamart;
    }

    return listings;
}

module.exports = {
    scrapeInstamart
};
