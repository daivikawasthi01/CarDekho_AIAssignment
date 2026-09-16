const { scrapeAllStores } = require('./src/scrapers');

async function testLiveAll() {
    console.log('Testing live scrapers for query: "Lays"...');
    const res = await scrapeAllStores('Lays');
    console.log('Results overview:');
    console.log('Blinkit count:', res.blinkitListings.length);
    console.log('Instamart count:', res.instamartListings.length);

    if (res.blinkitListings.length > 0) {
        console.log('Sample Blinkit item:', res.blinkitListings[0]);
    }
    if (res.instamartListings.length > 0) {
        console.log('Sample Instamart item:', res.instamartListings[0]);
    }
}

testLiveAll().catch(console.error);
