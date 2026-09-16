/**
 * Global Configuration for Grocery Price Compare Application
 */

module.exports = {
    PORT: process.env.PORT || 3000,
    
    // Delivery Location Configuration ("Location of your choice")
    LOCATION: {
        city: 'Bengaluru',
        area: 'Koramangala 4th Block',
        pincode: '560034',
        latitude: 12.9352,
        longitude: 77.6245,
        displayText: 'Koramangala 4th Block, Bengaluru - 560034'
    },

    // Cache TTL in milliseconds (120 seconds = 2 mins)
    CACHE_TTL_MS: 120 * 1000,

    // Max listings to extract per store per query
    MAX_RESULTS_PER_STORE: 12,

    // Scraper Configuration
    SCRAPER_TIMEOUT_MS: 15000,
    
    // User Agent for Playwright automation context
    USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
};
