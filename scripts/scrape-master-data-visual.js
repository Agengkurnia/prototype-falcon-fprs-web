/**
 * Falcon FPRS — Visual Scraper (mode Antigravity)
 * Browser terlihat, klik perlahan, screenshot tiap langkah.
 *
 * Jalankan:
 *   1. npx -y http-server -p 5500 -c-1
 *   2. node scripts/scrape-master-data-visual.js
 *
 * Opsi:
 *   --keep-open   Browser tetap terbuka sampai tekan Enter di terminal
 *   --module=X    Hanya demo modul tertentu (default: DaftarHarga)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const BASE = 'http://127.0.0.1:5500';
const SLOW_MO = 500;
const STEP_PAUSE = 900;

const args = process.argv.slice(2);
const KEEP_OPEN = args.includes('--keep-open');
const moduleArg = args.find(a => a.startsWith('--module='));
const TARGET_MODULE = moduleArg ? moduleArg.split('=')[1] : 'DaftarHarga';

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', `visual-${Date.now()}`);
let stepNum = 0;

function log(msg) {
    console.log(`\n🤖 ${msg}`);
}

async function snap(page, label) {
    stepNum++;
    const safe = label.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60);
    const file = path.join(SCREENSHOT_DIR, `${String(stepNum).padStart(2, '0')}-${safe}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`   📸 Screenshot: ${path.basename(file)}`);
    return file;
}

async function humanPause(page, ms = STEP_PAUSE) {
    await page.waitForTimeout(ms);
}

async function waitLayout(page) {
    await page.waitForFunction(() => window.layoutInitialized === true, { timeout: 20000 });
    await humanPause(page, 600);
}

async function highlightClick(page, locator, description) {
    log(description);
    const el = page.locator(locator).first();
    await el.waitFor({ state: 'visible', timeout: 8000 });
    await el.scrollIntoViewIfNeeded();
    await humanPause(page, 400);
    await el.click({ timeout: 8000 });
    await humanPause(page);
}

async function clickModalSimpan(page) {
    log('Klik Simpan');
    const btn = page.locator('#modalForm .modal-footer .btn-success');
    await btn.click({ force: true }).catch(() => {});
    await page.evaluate(() => {
        if (typeof window.saveItem === 'function') window.saveItem();
        else if (typeof window.saveUnit === 'function') window.saveUnit();
    });
    await humanPause(page, 1000);
}

async function checkServer() {
    try {
        const res = await fetch(BASE);
        return res.ok;
    } catch {
        return false;
    }
}

async function expandSidebarMenus(page, labels) {
    for (const label of labels) {
        const toggle = page.locator('.menu-item').filter({
            has: page.locator(`a.menu-toggle div, a.menu-toggle`).filter({ hasText: label })
        }).locator('a.menu-toggle').first();
        if (await toggle.count() > 0) {
            await toggle.click();
            await humanPause(page, 500);
        }
    }
}

async function navigateViaSidebar(page, menuText, parentGroups = ['Data Master', 'Produk']) {
    log(`Buka sidebar → ${parentGroups.join(' → ')} → ${menuText}`);
    await expandSidebarMenus(page, parentGroups);
    await snap(page, 'sidebar-expanded');

    const link = page.locator(`a.menu-link[href*="${menuText.replace(/\s/g, '')}"], a.menu-link`).filter({ hasText: menuText }).first();
    await link.waitFor({ state: 'attached', timeout: 10000 });
    log(`Klik menu "${menuText}"`);
    await page.evaluate((text) => {
        const a = [...document.querySelectorAll('a.menu-link')].find(el => el.textContent.includes(text));
        if (a) a.click();
    }, menuText);
    await waitLayout(page);
}

async function demoDaftarHarga(page) {
    log('=== DEMO: Daftar Harga — Add & Edit ===');
    if (!page.url().includes('DaftarHarga')) {
        await page.goto(`${BASE}/Views/FPRS/MasterData/DaftarHarga/index.html`, { waitUntil: 'networkidle' });
        await waitLayout(page);
    }
    await snap(page, 'daftar-harga-index-loaded');

    await page.evaluate(() => {
        localStorage.setItem('md_daftar_harga', JSON.stringify([
            { id: 1, nama: 'Inc Pajak', isDefault: true, isInclusiveTax: true },
            { id: 2, nama: 'Harga Normal', isDefault: false, isInclusiveTax: false }
        ]));
        location.reload();
    });
    await waitLayout(page);
    await snap(page, 'daftar-harga-table-with-data');

    // --- EDIT flow ---
    await highlightClick(page, '.btn-action-edit', 'Klik tombol Edit pada baris pertama');
    await page.waitForSelector('#modalForm.show, .modal-backdrop', { timeout: 5000 }).catch(() => {});
    await humanPause(page, 600);
    await snap(page, 'daftar-harga-edit-modal-open');

    const namaBefore = await page.inputValue('#inputNama');
    log(`Field nama terisi: "${namaBefore}"`);
    await page.fill('#inputNama', 'Inc Pajak (Visual Test)');
    await humanPause(page, 400);
    await snap(page, 'daftar-harga-edit-form-filled');

    await clickModalSimpan(page);
    await snap(page, 'daftar-harga-after-save');

    const updated = await page.evaluate(() => {
        const d = JSON.parse(localStorage.getItem('md_daftar_harga') || '[]');
        return d.find(r => r.id === 1);
    });
    console.log(`   ✅ localStorage id=1 nama: "${updated?.nama}"`);

    // --- ADD flow ---
    await highlightClick(page, 'button:has-text("Tambah Daftar Harga")', 'Klik Tambah Daftar Harga');
    await page.waitForSelector('#modalForm.show, .modal-backdrop', { timeout: 5000 }).catch(() => {});
    await humanPause(page, 500);
    await snap(page, 'daftar-harga-add-modal-open');

    await page.fill('#inputNama', 'Harga Visual Demo');
    await page.check('#inputInclusive');
    await humanPause(page, 400);
    await snap(page, 'daftar-harga-add-form-filled');

    await clickModalSimpan(page);
    await snap(page, 'daftar-harga-after-add');

    const count = await page.evaluate(() => JSON.parse(localStorage.getItem('md_daftar_harga') || '[]').length);
    console.log(`   ✅ Total record di localStorage: ${count}`);
}

async function demoGenericModal(page, config) {
    const { name, path: pagePath, modal, addBtnText, storageKey, seed, fillAdd } = config;
    log(`=== DEMO: ${name} ===`);
    await page.goto(`${BASE}/Views/FPRS/MasterData/${pagePath}`, { waitUntil: 'networkidle' });
    await waitLayout(page);

    if (seed) {
        await page.evaluate(([key, data]) => localStorage.setItem(key, JSON.stringify(data)), [storageKey, seed]);
        await page.reload({ waitUntil: 'networkidle' });
        await waitLayout(page);
    }

    await snap(page, `${name}-index`);

    const editBtn = page.locator('.btn-action-edit').first();
    if (await editBtn.count() > 0) {
        await highlightClick(page, '.btn-action-edit', `[${name}] Klik Edit`);
        await page.waitForSelector(`${modal}.show, .modal-backdrop`, { timeout: 5000 }).catch(() => {});
        await snap(page, `${name}-edit-modal`);
        await page.keyboard.press('Escape');
        await humanPause(page, 500);
    }

    if (addBtnText) {
        await highlightClick(page, `button:has-text("${addBtnText}")`, `[${name}] Klik Tambah`);
        await page.waitForSelector(`${modal}.show, .modal-backdrop`, { timeout: 5000 }).catch(() => {});
        if (fillAdd) await fillAdd(page);
        await snap(page, `${name}-add-modal`);
        await page.keyboard.press('Escape');
        await humanPause(page, 500);
    }
}

const MODAL_DEMOS = {
    Alasan: {
        name: 'Alasan', path: 'Alasan/index.html', modal: '#modalForm',
        addBtnText: 'Tambah Alasan', storageKey: 'md_alasan',
        seed: [{ id: 1, nama: 'Toko Tutup', deskripsi: 'Test', tipe: 'Kunjungan' }],
        fillAdd: async (p) => { await p.fill('#inputNama', 'Visual Test'); await p.selectOption('#inputTipe', 'Lainnya'); }
    },
    Brand: {
        name: 'Brand', path: 'Brand/index.html', modal: '#modalBrand',
        addBtnText: 'Tambah Brand', storageKey: 'md_brand',
        seed: [{ id: 1, nama: 'Prenagen', deskripsi: 'Test', totalProduk: 0 }],
        fillAdd: async (p) => { await p.fill('#inputNama', 'Brand Visual'); }
    },
    Unit: {
        name: 'Unit', path: 'Unit/index.html', modal: '#modalUnit',
        addBtnText: 'Tambah Unit', storageKey: 'md_unit',
        seed: [{ id: 1, nama: 'PCS', deskripsi: 'Pieces', uomPajak: 'PCS' }],
        fillAdd: async (p) => { await p.fill('#inputNama', 'BOX'); }
    }
};

async function waitForEnter() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question('\n⏸️  Tekan Enter untuk menutup browser... ', () => {
            rl.close();
            resolve();
        });
    });
}

(async () => {
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  Falcon FPRS — Visual Scraper (mode Antigravity)    ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`\nModul target: ${TARGET_MODULE}`);
    console.log(`Screenshot  : ${SCREENSHOT_DIR}`);

    if (!(await checkServer())) {
        console.error('\n❌ Server tidak berjalan di port 5500.');
        console.error('   Jalankan: npx -y http-server -p 5500 -c-1');
        process.exit(1);
    }

    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

    const browser = await chromium.launch({
        headless: false,
        slowMo: SLOW_MO,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--start-maximized'
        ]
    });

    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'id-ID',
        timezoneId: 'Asia/Jakarta'
    });

    await context.setExtraHTTPHeaders({
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
    });

    const page = await context.newPage();

    try {
        log('Buka halaman Home');
        await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
        await waitLayout(page);
        await snap(page, 'home-page');

        if (TARGET_MODULE === 'DaftarHarga') {
            try {
                await navigateViaSidebar(page, 'Daftar Harga');
                await snap(page, 'navigated-via-sidebar');
            } catch (navErr) {
                log(`Sidebar gagal (${navErr.message}) — navigasi langsung via URL`);
                await page.goto(`${BASE}/Views/FPRS/MasterData/DaftarHarga/index.html`, { waitUntil: 'networkidle' });
                await waitLayout(page);
            }
            await demoDaftarHarga(page);
        } else if (MODAL_DEMOS[TARGET_MODULE]) {
            await demoGenericModal(page, MODAL_DEMOS[TARGET_MODULE]);
        } else {
            log(`Navigasi ke modul ${TARGET_MODULE}`);
            await page.goto(`${BASE}/Views/FPRS/MasterData/${TARGET_MODULE}/index.html`, { waitUntil: 'networkidle' });
            await waitLayout(page);
            await snap(page, `${TARGET_MODULE}-index`);
            await highlightClick(page, '.btn-action-edit, button:has-text("Tambah")', 'Coba interaksi tombol aksi');
            await humanPause(page, 1000);
            await snap(page, `${TARGET_MODULE}-after-click`);
        }

        log('Demo selesai ✓');
        console.log(`\n📁 Semua screenshot disimpan di:\n   ${SCREENSHOT_DIR}`);

        if (KEEP_OPEN) {
            await waitForEnter();
        } else {
            log('Browser ditutup dalam 6 detik... (gunakan --keep-open untuk biarkan terbuka)');
            await humanPause(page, 6000);
        }
    } catch (err) {
        console.error('\n❌ Error:', err.message);
        await snap(page, 'error-state').catch(() => {});
        if (KEEP_OPEN) await waitForEnter();
    } finally {
        await browser.close();
    }
})();
