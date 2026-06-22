const { chromium } = require('playwright');
const path = require('path');

async function test() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true
    });
    const page = await context.newPage();

    page.on('console', msg => console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.stack}`));

    await page.goto('http://127.0.0.1:5501/Views/mobile/product_catalog.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    console.log('Clicking Sesuaikan button...');
    await page.click('button:has-text("Sesuaikan")');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(__dirname, 'test_after_click.png') });
    console.log('Saved test_after_click.png');

    await browser.close();
}

test();
