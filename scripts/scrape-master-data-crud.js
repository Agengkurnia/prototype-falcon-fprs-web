/**
 * Playwright scraper — verifikasi CRUD Master Data (fokus: Daftar Harga edit)
 * Jalankan: node scripts/scrape-master-data-crud.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://127.0.0.1:5500';
const RESULTS = [];

function record(module, test, pass, detail) {
    RESULTS.push({ module, test, pass, detail });
    const icon = pass ? '✓' : '✗';
    console.log(`  ${icon} [${module}] ${test}${detail ? ' — ' + detail : ''}`);
}

async function waitLayout(page) {
    await page.waitForFunction(() => window.layoutInitialized === true, { timeout: 15000 });
    await page.waitForTimeout(800);
}

async function testDaftarHarga(page) {
    const mod = 'Daftar Harga';
    const url = `${BASE}/Views/FPRS/MasterData/DaftarHarga/index.html`;

    await page.goto(url, { waitUntil: 'networkidle' });
    await waitLayout(page);

    const modalExists = await page.locator('#modalForm').count();
    record(mod, 'Modal #modalForm ada di DOM', modalExists > 0,
        modalExists === 0 ? 'Modal hilang — edit/tambah akan crash' : null);

    const saveExposed = await page.evaluate(() => typeof window.saveItem === 'function');
    record(mod, 'window.saveItem tersedia', saveExposed,
        !saveExposed ? 'Tombol Simpan modal akan ReferenceError' : null);

    await page.evaluate(() => {
        localStorage.setItem('md_daftar_harga', JSON.stringify([
            { id: 1, nama: 'Inc Pajak', isDefault: true, isInclusiveTax: true }
        ]));
        location.reload();
    });
    await waitLayout(page);

    const editBtn = page.locator('.btn-action-edit').first();
    const editCount = await editBtn.count();
    record(mod, 'Tombol edit ada di tabel', editCount > 0);

    if (editCount > 0 && modalExists > 0) {
        let consoleError = null;
        page.on('pageerror', err => { consoleError = err.message; });

        await editBtn.click();
        await page.waitForTimeout(500);

        const modalVisible = await page.locator('#modalForm.show, #modalForm[style*="display: block"]').count();
        const modalOpen = modalVisible > 0 || await page.locator('.modal-backdrop').count() > 0;
        record(mod, 'Klik edit membuka modal', modalOpen, consoleError || (!modalOpen ? 'Modal tidak tampil' : null));

        const namaVal = await page.inputValue('#inputNama');
        record(mod, 'Field nama terisi saat edit', namaVal === 'Inc Pajak', `didapat: "${namaVal}"`);

        if (saveExposed) {
            await page.fill('#inputNama', 'Inc Pajak Updated');
            await page.click('#modalForm .btn-success');
            await page.waitForTimeout(600);
            const stored = await page.evaluate(() => {
                const d = JSON.parse(localStorage.getItem('md_daftar_harga') || '[]');
                return d.find(r => r.id === 1);
            });
            record(mod, 'Simpan edit memperbarui localStorage', stored?.nama === 'Inc Pajak Updated',
                stored ? `nama="${stored.nama}"` : 'data tidak ditemukan');
        }
    }
}

async function scanAllModalModules(page) {
    const modules = [
        { name: 'Alasan', path: 'Alasan/index.html', modal: '#modalForm', save: 'saveItem' },
        { name: 'Akun', path: 'Akun/index.html', modal: '#modalForm', save: 'saveItem' },
        { name: 'Brand', path: 'Brand/index.html', modal: '#modalBrand', save: 'saveItem' },
        { name: 'Divisi', path: 'Divisi/index.html', modal: '#modalDivisi', save: 'saveItem' },
        { name: 'Grup Pelanggan', path: 'GrupPelanggan/index.html', modal: '#modalForm', save: 'saveItem' },
        { name: 'Kategori Produk', path: 'KategoriProduk/index.html', modal: '#modalForm', save: 'saveItem' },
        { name: 'Konfigurasi Akses', path: 'KonfigurasiAkses/index.html', modal: '#modalForm', save: 'saveItem' },
        { name: 'Metode Pembayaran', path: 'MetodePembayaran/index.html', modal: '#modalForm', save: 'saveItem' },
        { name: 'Pajak', path: 'Pajak/index.html', modal: '#modalForm', save: 'saveItem' },
        { name: 'Posisi', path: 'Posisi/index.html', modal: '#modalForm', save: 'saveItem' },
        { name: 'Unit', path: 'Unit/index.html', modal: '#modalUnit', save: 'saveUnit' },
        { name: 'Waktu Pembayaran', path: 'WaktuPembayaran/index.html', modal: '#modalForm', save: 'saveItem' },
    ];

    console.log('\n--- Scan semua modul modal ---');
    for (const m of modules) {
        await page.goto(`${BASE}/Views/FPRS/MasterData/${m.path}`, { waitUntil: 'domcontentloaded' });
        await waitLayout(page);
        const modalOk = await page.locator(m.modal).count() > 0;
        const saveOk = await page.evaluate(fn => typeof window[fn] === 'function', m.save);
        record(m.name, `Modal ${m.modal}`, modalOk, modalOk ? null : 'HILANG');
        record(m.name, `window.${m.save}`, saveOk, saveOk ? null : 'Tidak diekspos');
    }
}

(async () => {
    console.log('Falcon Master Data — Playwright CRUD Scraper\n');

    const browser = await chromium.launch({
        headless: true,
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
    const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        locale: 'id-ID'
    });
    const page = await context.newPage();

    try {
        await page.goto(BASE, { timeout: 5000 });
    } catch (e) {
        console.error('\nERROR: Server tidak berjalan di port 5500.');
        console.error('Jalankan: npx -y http-server -p 5500 -c-1');
        process.exit(1);
    }

    console.log('--- Daftar Harga (detail) ---');
    await testDaftarHarga(page);
    await scanAllModalModules(page);

    const failed = RESULTS.filter(r => !r.pass).length;
    const passed = RESULTS.filter(r => r.pass).length;

    const reportPath = path.join(__dirname, '..', 'scripts', 'scrape-master-data-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), passed, failed, results: RESULTS }, null, 2));

    console.log(`\n=== Ringkasan: ${passed} passed, ${failed} failed ===`);
    console.log(`Laporan: ${reportPath}`);

    await browser.close();
    process.exit(failed > 0 ? 1 : 0);
})();
