const { chromium } = require('playwright');
const fs = require('fs');

async function inspectSwiggyJson() {
    const browser = await chromium.launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: true
    });
    const page = await browser.newPage();

    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('instamart/search') || url.includes('/api/instamart/')) {
            console.log('Intercepted:', url);
            try {
                const text = await response.text();
                fs.writeFileSync('./swiggy_live_raw.json', text);
                console.log('SAVED swiggy_live_raw.json! Size:', text.length);
            } catch (e) {}
        }
    });

    await page.goto('https://www.swiggy.com/instamart/search?custom_back=true&query=lays', { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(3000);
    await browser.close();
}

inspectSwiggyJson().catch(console.error);
