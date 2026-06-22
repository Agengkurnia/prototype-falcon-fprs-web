const { chromium } = require('playwright');

async function run() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true
    });
    const page = await context.newPage();

    page.on('console', msg => console.log(`[PAGE CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.stack}`));

    try {
        console.log('1. Navigating to Login...');
        await page.goto('http://127.0.0.1:5501/Views/mobile/login.html');
        await page.waitForLoadState('domcontentloaded');
        await page.evaluate(() => localStorage.clear());

        console.log('2. Logging in...');
        await page.fill('#usernameInput', 'AGENG.SUGIANTO');
        await page.fill('#passwordInput', 'canvasser');
        await page.click('#loginBtn');
        await page.waitForTimeout(2000);

        console.log('3. Navigating to Product Catalog...');
        await page.goto('http://127.0.0.1:5501/Views/mobile/product_catalog.html');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        const initialHtml = await page.innerHTML('#restockContainer');
        console.log('Initial HTML:\n', initialHtml.trim());

        console.log('4. Clicking Check-in GPS...');
        await page.click('button:has-text("Check-in GPS")');

        console.log('Waiting 4 seconds...');
        await page.waitForTimeout(4000);

        const afterCheckinHtml = await page.innerHTML('#restockContainer');
        console.log('HTML after Check-in:\n', afterCheckinHtml.trim());

        const state = await page.evaluate(() => localStorage.getItem('restock_state'));
        console.log('LocalStorage restock_state:', state);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
}

run();
