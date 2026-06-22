const { chromium } = require('playwright');
const path = require('path');

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

    const BASE_URL = 'http://127.0.0.1:5501';

    try {
        // 1. Login Page
        await page.goto(`${BASE_URL}/Views/mobile/login.html`, { waitUntil: 'domcontentloaded' });
        await page.evaluate(() => localStorage.clear());
        await page.fill('#usernameInput', 'AGENG.SUGIANTO');
        await page.fill('#passwordInput', 'canvasser');
        await page.click('#loginBtn');
        await page.waitForTimeout(1500);

        // Navigate to home
        await page.goto(`${BASE_URL}/Views/mobile/home.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Dasbor
        await page.goto(`${BASE_URL}/Views/mobile/dasbor.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        // Visit List
        await page.goto(`${BASE_URL}/Views/mobile/visit_list.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Visit Detail
        await page.click('.visit-card');
        await page.waitForTimeout(1000);

        // Order Input
        await page.goto(`${BASE_URL}/Views/mobile/order_input.html?outletId=OL-10283`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        // Product Catalog
        await page.goto(`${BASE_URL}/Views/mobile/product_catalog.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        // Read restock_state from localStorage
        const restockState = await page.evaluate(() => localStorage.getItem('restock_state'));
        console.log(`DEBUG: restock_state is currently: "${restockState}"`);

        // Check buttons
        const buttonCount = await page.locator('button:has-text("Sesuaikan")').count();
        console.log(`DEBUG: Found ${buttonCount} buttons with text "Sesuaikan"`);

        console.log('Clicking "Sesuaikan" button...');
        await page.click('button:has-text("Sesuaikan")');
        await page.waitForTimeout(1000);

        await page.screenshot({ path: path.join(__dirname, 'test_full_after_click.png') });
        console.log('Saved test_full_after_click.png');

        const isSwalVisible = await page.locator('.swal2-popup').isVisible();
        console.log(`DEBUG: Is swal2-popup visible? ${isSwalVisible}`);

    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await browser.close();
    }
}

run();
