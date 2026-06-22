const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://127.0.0.1:5501';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Wait until NO swal2-popup is visible in DOM (handles auto-close chains)
async function waitNoSwal(page, ms = 8000) {
    try { await page.waitForSelector('.swal2-popup', { state: 'detached', timeout: ms }); } catch (_) {}
}

async function clickSwalConfirm(page) {
    await page.waitForSelector('.swal2-confirm', { state: 'visible', timeout: 8000 });
    // Short pause for Swal animation to settle (SweetAlert2 animates ~300ms)
    await page.waitForTimeout(400);
    await page.evaluate(() => {
        const btn = document.querySelector('.swal2-confirm');
        if (btn) btn.click();
    });
}

async function run() {
    console.log('📸 Starting screenshot capture...');

    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true
    });
    const page = await context.newPage();

    // Listen to console logs inside the page
    page.on('console', msg => {
        console.log(`[PAGE CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });
    page.on('pageerror', err => {
        console.log(`[PAGE ERROR] ${err.stack}`);
    });

    try {
        // 1. Login Page
        await page.goto(`${BASE_URL}/Views/mobile/login.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        // Clear storage for fresh state
        await page.evaluate(() => localStorage.clear());
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'login.png') });
        console.log('✓ Captured login.png');

        // Fill form and login
        await page.fill('#usernameInput', 'AGENG.SUGIANTO');
        await page.fill('#passwordInput', 'canvasser');
        await page.click('#loginBtn');
        await page.waitForTimeout(1500); // Wait for auth simulation & redirect

        // Navigate manually to home to be safe
        await page.goto(`${BASE_URL}/Views/mobile/home.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);

        // 2. Home Page
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'home.png') });
        console.log('✓ Captured home.png');

        // 3. Dashboard Page
        await page.goto(`${BASE_URL}/Views/mobile/dasbor.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1500); // Wait for Chart.js animation
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dasbor.png') });
        console.log('✓ Captured dasbor.png');

        // 4. Visit List Page
        await page.goto(`${BASE_URL}/Views/mobile/visit_list.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'visit_list.png') });
        console.log('✓ Captured visit_list.png');

        // 5. Visit Detail Page (first outlet)
        await page.click('.visit-card'); // Click first outlet card
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'visit_detail.png') });
        console.log('✓ Captured visit_detail.png');

        // 6. Order Input / Sales Order Page
        await page.goto(`${BASE_URL}/Views/mobile/order_input.html?outletId=OL-10283`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'order_input.png') });
        console.log('✓ Captured order_input.png');

        // ── PRODUCT MODULE ────────────────────────────────────────────────────────

        // P-01: Katalog awal (state idle)
        await page.goto(`${BASE_URL}/Views/mobile/product_catalog.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForFunction(() => typeof Swal !== 'undefined', { timeout: 10000 });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_catalog.png') });
        console.log('✓ Captured product_catalog.png');

        // P-02: Proteksi — klik Sesuaikan sebelum check-in → SweetAlert "Akses Terkunci"
        const restockState = await page.evaluate(() => localStorage.getItem('restock_state'));
        console.log(`DEBUG: restock_state is currently: "${restockState}"`);
        const allStorage = await page.evaluate(() => JSON.stringify(localStorage));
        console.log(`DEBUG: localStorage: ${allStorage}`);
        const buttonCount = await page.locator('button:has-text("Sesuaikan")').count();
        console.log(`DEBUG: Found ${buttonCount} buttons with text "Sesuaikan"`);
        
        console.log('Clicking "Sesuaikan" button...');
        await page.click('button:has-text("Sesuaikan")');
        console.log('Clicked "Sesuaikan" button. Waiting for .swal2-popup...');
        
        await page.waitForSelector('.swal2-popup', { state: 'visible', timeout: 5000 });
        console.log('Found .swal2-popup!');
        await page.waitForTimeout(400); // biarkan animasi Swal selesai
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_catalog_locked.png') });
        console.log('✓ Captured product_catalog_locked.png');
        await clickSwalConfirm(page); // OK
        await waitNoSwal(page);

        // P-03: Check-in GPS
        // Flow: Swal loading (showConfirmButton:false, auto-replace) → Swal sukses (timer:1800, auto-close)
        await page.click('button:has-text("Check-in GPS")');
        await waitNoSwal(page, 10000); // tunggu kedua Swal auto-close selesai (~1500+1800ms)
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_catalog_checkedin.png') });
        console.log('✓ Captured product_catalog_checkedin.png');

        // P-04: Dialog kamera Foto Nota
        await page.click('button:has-text("Foto Nota")');
        await page.waitForSelector('.swal2-popup', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(400); // animasi Swal selesai
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_catalog_camera_dialog.png') });
        console.log('✓ Captured product_catalog_camera_dialog.png');

        // P-05: Klik "Ambil Foto"
        // Flow: Swal kamera tutup → Swal loading (auto-replace) → Swal sukses (timer:1800, auto-close)
        await clickSwalConfirm(page); // Ambil Foto — force:true menghindari "not stable"
        await waitNoSwal(page, 10000); // tunggu loading + sukses auto-close (~1500+1800ms)
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_catalog_restocking.png') });
        console.log('✓ Captured product_catalog_restocking.png');

        // P-06: Bottom sheet input stok terbuka
        await page.click('button:has-text("Sesuaikan")');
        await page.waitForSelector('#stockSheet.show', { timeout: 5000 });
        await page.waitForTimeout(350); // slide-up animation (0.28s)
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_stock_sheet.png') });
        console.log('✓ Captured product_stock_sheet.png');

        // P-07: Input stok terisi sebelum simpan
        await page.fill('#inputKarton', '40');
        await page.fill('#inputBox', '2');
        await page.fill('#inputPcs', '2');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_stock_sheet_filled.png') });
        console.log('✓ Captured product_stock_sheet_filled.png');

        // P-08: Simpan → toast "Stok berhasil dimasukkan" (timer:1500, auto-close) → katalog
        await page.click('button:has-text("Simpan Penyesuaian")');
        await page.waitForSelector('#stockSheet.show', { state: 'detached', timeout: 3000 });
        await waitNoSwal(page, 3000); // toast auto-close
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_catalog_adjusted.png') });
        console.log('✓ Captured product_catalog_adjusted.png');

        // P-09: Navigasi ke restock_review
        await page.click('#restockContainer button:has-text("Tinjau")');
        await page.waitForURL('**/restock_review.html', { timeout: 8000 });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'restock_review.png') });
        console.log('✓ Captured restock_review.png');

        // P-10: Review + catatan terisi
        await page.fill('#notesInput', 'Ada bonus 2 Pcs Chil*Kid dari distributor');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'restock_review_notes.png') });
        console.log('✓ Captured restock_review_notes.png');

        // P-11: Dialog konfirmasi submit
        await page.click('button:has-text("Kirim Laporan Kulakan")');
        await page.waitForSelector('.swal2-popup', { state: 'visible', timeout: 5000 });
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'restock_submit_confirm.png') });
        console.log('✓ Captured restock_submit_confirm.png');

        // P-12 prep: "Ya, Kirim" → Swal loading (auto-close 2200ms) → Swal sukses (punya confirm OK)
        await clickSwalConfirm(page); // Ya, Kirim
        await waitNoSwal(page, 5000); // tunggu Swal loading auto-close (~2200ms)
        // Swal sukses muncul — tidak auto-close, punya tombol OK
        await page.waitForSelector('.swal2-popup', { state: 'visible', timeout: 5000 });
        await clickSwalConfirm(page); // OK
        await page.waitForURL('**/product_catalog.html', { timeout: 8000 });

        // P-12: Katalog post-submit
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_catalog_post_submit.png') });
        console.log('✓ Captured product_catalog_post_submit.png');

        // P-13: History sheet
        await page.click('button[onclick="openHistorySheet()"]');
        await page.waitForSelector('#historySheet.show', { timeout: 5000 });
        await page.waitForTimeout(400); // slide-up animation
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'product_history_sheet.png') });
        console.log('✓ Captured product_history_sheet.png');
        await page.click('#historySheet .bottom-sheet-close');
        await page.waitForSelector('#historySheet.show', { state: 'detached', timeout: 3000 });

        // ── END PRODUCT MODULE ────────────────────────────────────────────────────

        // 7. Invoice List Page
        await page.goto(`${BASE_URL}/Views/mobile/invoice_list.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'invoice_list.png') });
        console.log('✓ Captured invoice_list.png');

        // 8. Invoice Detail Page
        await page.click('.invoice-card'); // Click first invoice card
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'invoice_detail.png') });
        console.log('✓ Captured invoice_detail.png');

        // 9. Collection List Page
        await page.goto(`${BASE_URL}/Views/mobile/collection_list.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'collection_list.png') });
        console.log('✓ Captured collection_list.png');

        // 10. Collection Input Page
        await page.click('.customer-card'); // Click first collection card
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'collection_input.png') });
        console.log('✓ Captured collection_input.png');

        // 11. Outlet List Page
        await page.goto(`${BASE_URL}/Views/mobile/outlet_list.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'outlet_list.png') });
        console.log('✓ Captured outlet_list.png');

        // 12. Outlet Detail Page
        await page.click('.outlet-card'); // Click first outlet
        await page.waitForTimeout(1500); // Let Leaflet map render
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'outlet_detail.png') });
        console.log('✓ Captured outlet_detail.png');

        // 13. Target Page
        await page.goto(`${BASE_URL}/Views/mobile/target.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000); // Let Chart.js render
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'target.png') });
        console.log('✓ Captured target.png');

        // 14. Sync Status Page
        await page.goto(`${BASE_URL}/Views/mobile/sync_detail.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'sync_detail.png') });
        console.log('✓ Captured sync_detail.png');

        // 15. Profil Page
        await page.goto(`${BASE_URL}/Views/mobile/profil.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'profil.png') });
        console.log('✓ Captured profil.png');

    } catch (err) {
        console.error('❌ Error capturing screenshots:', err);
        try {
            console.log('Current URL at error:', page.url());
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'error_screenshot.png') });
            console.log('Saved error_screenshot.png');
        } catch (e) {
            console.error('Could not capture error screenshot:', e);
        }
    } finally {
        await browser.close();
        console.log('🎮 Done capturing all screenshots!');
    }
}

run();
