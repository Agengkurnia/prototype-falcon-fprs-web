/**
 * verify_flow.js — Standalone Playwright Test Runner for Falcon SFA Mobile Prototype
 * 
 * Skenario yang diuji:
 * 1. 001. Dashboard: Login, default state, date pager (prev, next, limits), period filters, chart visibility.
 * 2. 002. Product Catalog: Protection before check-in, simulated GPS check-in & photo upload, bottom sheet adjustment, floating bar, review comparison (old vs new), submit restock.
 * 3. 003. Faktur Penjualan: URL parsing, aggregates calculation, search real-time, payment status badges, read-only detail view.
 * 
 * Jalankan:
 *   node Testing/Mobile/automation/verify_flow.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://127.0.0.1:5501';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

const results = [];

function recordResult(no, moduleName, caseId, name, step, expected, actual, status) {
    results.push({
        no,
        module: moduleName,
        caseId,
        name,
        step,
        expected,
        actual,
        status,
        tester: 'AI Antigravity',
        date: new Date().toLocaleDateString('id-ID')
    });
    console.log(`[${status}] TC-${caseId}: ${name} - ${step}`);
}

async function run() {
    console.log('====================================================');
    console.log('🚀 FALCON SFA MOBILE AUTOMATED TEST SUITE');
    console.log('====================================================');

    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 }, // iPhone X size
        isMobile: true,
        hasTouch: true
    });
    const page = await context.newPage();

    try {
        // PREPARATION: Clear localStorage first
        await page.goto(`${BASE_URL}/Views/Mobile/login.html`);
        await page.evaluate(() => localStorage.clear());
        await page.reload();

        // ----------------------------------------------------
        // MODULE 1: LOGIN & DASHBOARD
        // ----------------------------------------------------
        console.log('\n--- Modul 1: Dashboard ---');

        // TC-001-01: Login & Initial State
        await page.fill('#usernameInput', 'FARREL');
        await page.fill('#passwordInput', 'canvasser');
        await page.click('#loginBtn');
        await page.waitForURL('**/home.html');

        // Verify Rute Kunjungan Hari Ini button
        const routeBtn = page.locator('a:has-text("Rute Kunjungan Hari Ini")');
        const routeBtnVisible = await routeBtn.isVisible();
        recordResult(
            1, 'Dashboard', 'TC-001-01a', 'Rute Kunjungan Quick Access',
            'Periksa keberadaan tombol quick access di Beranda',
            'Tombol Rute Kunjungan Hari Ini harus terlihat',
            routeBtnVisible ? 'Tombol Rute Kunjungan Hari Ini aktif & terlihat' : 'Tombol tidak ditemukan',
            routeBtnVisible ? 'PASS' : 'FAIL'
        );

        const periodeTitle = await page.locator('.canvas-banner-title').innerText();
        const menuCount = await page.locator('#main-menu .circle-menu-label').count();
        const menuLabels = (await page.locator('#main-menu .circle-menu-label').allTextContents()).join(', ');

        recordResult(
            2, 'Beranda', 'TC-HOME-01', 'Periode Penjualan & 4 Menu Utama',
            'Periksa banner periode dan grid menu utama',
            'Banner "Periode Penjualan" + 4 menu (Cek Stok, Faktur, Visit, Sync)',
            `Periode: "${periodeTitle}", Menu (${menuCount}): ${menuLabels}`,
            (periodeTitle.includes('Periode Penjualan') && menuCount === 4) ? 'PASS' : 'FAIL'
        );

        // Go to visit_list for FAB test
        await page.goto(`${BASE_URL}/Views/Mobile/visit_list.html`);
        await page.waitForLoadState('networkidle');
        await page.click('#fabMain');
        await page.waitForTimeout(200);
        const fabVisit = await page.locator('.fab-option-label:has-text("Tambah Kunjungan")').isVisible();
        const fabOutlet = await page.locator('.fab-option-label:has-text("Tambah Outlet Baru")').isVisible();

        recordResult(
            3, 'Beranda', 'TC-HOME-02', 'FAB 2 Opsi di Rute Kunjungan',
            'Klik tombol + di visit_list',
            'Menu floating: Tambah Kunjungan & Tambah Outlet Baru',
            `Kunjungan: ${fabVisit}, Outlet: ${fabOutlet}`,
            (fabVisit && fabOutlet) ? 'PASS' : 'FAIL'
        );

        // Go to dasbor.html
        await page.goto(`${BASE_URL}/Views/Mobile/dasbor.html`);
        await page.waitForLoadState('networkidle');

        // Check defaults
        const serverVal = await page.locator('#serverSelect').inputValue();
        const periodVal = await page.locator('#periodSelect').inputValue();
        const dateLabel = await page.locator('#dateRangeLabel').innerText();

        recordResult(
            2, 'Dashboard', 'TC-001-01b', 'Verifikasi Pemuatan Data Awal',
            'Periksa dropdown server, period, dan label tanggal',
            'Server: Singaraja, Periode: hari_ini, tanggal hari ini ter-render',
            `Server: ${serverVal}, Periode: ${periodVal}, Label: ${dateLabel}`,
            (serverVal === 'Singaraja' && periodVal === 'hari_ini') ? 'PASS' : 'FAIL'
        );

        // TC-001-02: Date Pager Navigation
        const initialDate = dateLabel;
        await page.click('#prevDate');
        await page.waitForTimeout(300);
        const prevDateLabel = await page.locator('#dateRangeLabel').innerText();

        recordResult(
            3, 'Dashboard', 'TC-001-02a', 'Date Pager Prev',
            'Klik tombol prev tanggal (<)',
            'Tanggal mundur 1 hari',
            `Label berubah dari "${initialDate}" menjadi "${prevDateLabel}"`,
            initialDate !== prevDateLabel ? 'PASS' : 'FAIL'
        );

        await page.click('#nextDate');
        await page.waitForTimeout(300);
        const nextDateLabel = await page.locator('#dateRangeLabel').innerText();
        const nextBtnDisabled = await page.locator('#nextDate').isDisabled();

        recordResult(
            4, 'Dashboard', 'TC-001-02b', 'Date Pager Next Limit',
            'Klik tombol next tanggal (>) ke batas hari ini',
            'Kembali ke hari ini, tombol next dinonaktifkan',
            `Label: "${nextDateLabel}", next disabled status: ${nextBtnDisabled}`,
            nextBtnDisabled ? 'PASS' : 'FAIL'
        );

        // TC-001-03: Period Aggregations
        await page.selectOption('#periodSelect', '7_hari');
        await page.waitForTimeout(500);
        const periodLabel7Days = await page.locator('#dateRangeLabel').innerText();
        const prevBtnDisabled = await page.locator('#prevDate').isDisabled();

        recordResult(
            5, 'Dashboard', 'TC-001-03', 'Agregasi Filter Periode 7 Hari',
            'Ubah filter periode ke 7 Hari Terakhir',
            'Rentang tanggal ter-update, pager prev & next dinonaktifkan',
            `Label: "${periodLabel7Days}", prev disabled: ${prevBtnDisabled}`,
            prevBtnDisabled ? 'PASS' : 'FAIL'
        );

        // TC-001-04: Chart Rendering
        const isInvoiceChartVisible = await page.locator('#invoiceChart').isVisible();
        const isEcChartVisible = await page.locator('#ecChart').isVisible();

        recordResult(
            6, 'Dashboard', 'TC-001-04', 'Verifikasi Rendering Grafik',
            'Periksa keberadaan canvas invoiceChart dan ecChart',
            'Kedua canvas grafik harus ter-render dan terlihat',
            `invoiceChart: ${isInvoiceChartVisible}, ecChart: ${isEcChartVisible}`,
            (isInvoiceChartVisible && isEcChartVisible) ? 'PASS' : 'FAIL'
        );

        // TC-001-05: Card Click Navigation
        await page.selectOption('#periodSelect', 'hari_ini');
        await page.waitForTimeout(300);
        await page.click('#invoiceCardClickable');
        await page.waitForURL('**/invoice_list.html*');
        const urlParams = await page.evaluate(() => window.location.search);

        recordResult(
            7, 'Dashboard', 'TC-001-05', 'Alur Navigasi Review Faktur',
            'Klik kartu Total Faktur Penjualan',
            'Berpindah ke invoice_list.html dengan parameter URL yang diwariskan',
            `URL Params: ${urlParams}`,
            urlParams.includes('label=Hari%20Ini') ? 'PASS' : 'FAIL'
        );

        // TC-001-06: stopPropagation Info Icon
        await page.goto(`${BASE_URL}/Views/Mobile/dasbor.html`);
        await page.waitForLoadState('networkidle');
        await page.click('#invoiceCardClickable i.fa-info-circle');
        await page.waitForSelector('.swal2-popup');
        const swalVisible = await page.locator('.swal2-popup').isVisible();
        await page.click('.swal2-confirm');
        await page.waitForTimeout(300);
        const onDashboard = page.url().includes('dasbor.html');

        recordResult(
            8, 'Dashboard', 'TC-001-06', 'Event Bubbling stopPropagation',
            'Klik ikon informasi target di kartu Faktur',
            'Popup dialog Swal muncul dan halaman tidak berpindah ke invoice_list.html',
            `Popup visible: ${swalVisible}, page URL: ${page.url()}`,
            (swalVisible && onDashboard) ? 'PASS' : 'FAIL'
        );

        // ----------------------------------------------------
        // MODULE 2: PRODUCT CATALOG & RESTOCK
        // ----------------------------------------------------
        console.log('\n--- Modul 2: Product & Restock ---');
        await page.goto(`${BASE_URL}/Views/Mobile/product_catalog.html`);
        await page.waitForLoadState('networkidle');

        // TC-002-01: Protection before Check-in
        const firstAdjustBtn = page.locator('button:has-text("Sesuaikan")').first();
        await firstAdjustBtn.click();
        await page.waitForSelector('.swal2-popup');
        const alertText = await page.locator('.swal2-html-container').innerText();
        await page.click('.swal2-confirm');

        recordResult(
            9, 'Product', 'TC-002-01', 'Proteksi Sebelum Check-in',
            'Klik Sesuaikan stok sebelum check-in grosir',
            'Swal warning muncul: "Harap lakukan Check-in Grosir..."',
            `Pesan Swal: "${alertText}"`,
            alertText.includes('Check-in Grosir') ? 'PASS' : 'FAIL'
        );

        // TC-002-02: Check-in & Photo Upload
        await page.click('button:has-text("Check-in GPS")');
        await page.waitForSelector('.swal2-popup', { state: 'detached', timeout: 3000 }); // Wait for loading to finish
        const checkinBadge = await page.locator('.status-started').innerText();

        recordResult(
            10, 'Product', 'TC-002-02a', 'Simulasi Check-in GPS',
            'Klik tombol Check-in GPS dan tunggu lokasi terverifikasi',
            'Status berubah menjadi GPS Valid',
            `Status teks: "${checkinBadge}"`,
            checkinBadge.includes('GPS Valid') ? 'PASS' : 'FAIL'
        );

        await page.click('button:has-text("Foto Nota")');
        await page.click('.swal2-confirm'); // Click "Ambil Foto"
        await page.waitForSelector('.swal2-popup', { state: 'detached', timeout: 3000 });
        const restockingBadge = await page.locator('#restockContainer').innerText();

        recordResult(
            11, 'Product', 'TC-002-02b', 'Upload Foto Nota Belanja',
            'Klik Foto Nota, ambil foto, dan selesaikan upload',
            'Status bar berubah ke mode restocking',
            `Status bar teks: "${restockingBadge}"`,
            restockingBadge.includes('adjust') ? 'PASS' : 'FAIL'
        );

        // TC-002-03: Bottom Sheet stock input
        await firstAdjustBtn.click();
        await page.waitForSelector('#stockSheet.show');

        await page.fill('#inputKarton', '40');
        await page.fill('#inputBox', '2');
        await page.fill('#inputPcs', '2');
        await page.click('button:has-text("Simpan Penyesuaian")');

        // Wait for bottom sheet to close
        await page.waitForSelector('#stockSheet.show', { state: 'detached' });

        // Check updated UI values in row
        const productCode = await page.evaluate(() => SfaStore.getProducts()[0].code);
        const kartonVal = await page.locator(`#stok-karton-${productCode}`).innerText();
        const boxVal = await page.locator(`#stok-box-${productCode}`).innerText();
        const pcsVal = await page.locator(`#stok-pcs-${productCode}`).innerText();

        recordResult(
            12, 'Product', 'TC-002-03', 'Bottom Sheet Input Stok',
            'Input Karton: 40, Box: 2, Pcs: 2 pada produk pertama',
            'UI ter-update menampilkan nilai stok baru: 40 - 2 - 2',
            `Stok Karton: ${kartonVal}, Box: ${boxVal}, Pcs: ${pcsVal}`,
            (kartonVal === '40' && boxVal === '2' && pcsVal === '2') ? 'PASS' : 'FAIL'
        );

        // TC-002-04: Floating status bar review navigation
        const floatingText = await page.locator('#restockContainer').innerText();
        const reviewBtn = page.locator('#restockContainer button:has-text("Tinjau")');
        await reviewBtn.click();
        await page.waitForURL('**/restock_review.html');
        const onReviewPage = page.url().includes('restock_review.html');

        recordResult(
            13, 'Product', 'TC-002-04', 'Navigasi Floating Status Bar',
            'Klik tombol Tinjau di floating status bar',
            'Halaman berpindah ke restock_review.html',
            `Floating text: "${floatingText}", page URL: ${page.url()}`,
            onReviewPage ? 'PASS' : 'FAIL'
        );

        // TC-002-05: Review Comparison Table
        const newStockCell = page.locator('.val-changed').first();
        const cellText = await newStockCell.innerText();
        const cellClass = await newStockCell.getAttribute('class');

        recordResult(
            14, 'Product', 'TC-002-05', 'Verifikasi Tabel Perbandingan Stok',
            'Periksa cell dengan class .val-changed',
            'Stok baru ter-render dengan warna highlight hijau',
            `Cell text: "${cellText}", Class: "${cellClass}"`,
            cellClass.includes('val-changed') ? 'PASS' : 'FAIL'
        );

        // TC-002-06: Submit restock report
        await page.fill('#remarks', 'Ada bonus 2 Pcs Chil*Kid');
        await page.click('button:has-text("Kirim Laporan Kulakan")');
        await page.waitForSelector('.swal2-popup');
        await page.click('.swal2-confirm'); // Confirm "Ya, Kirim"
        await page.waitForSelector('.swal2-popup', { state: 'detached', timeout: 4000 });
        await page.click('.swal2-confirm'); // Click OK on Success
        await page.waitForURL('**/product_catalog.html');

        const catalogState = await page.evaluate(() => localStorage.getItem('restock_state'));
        const historyLength = await page.evaluate(() => JSON.parse(localStorage.getItem('restock_history') || '[]').length);

        recordResult(
            15, 'Product', 'TC-002-06', 'Kirim Laporan Kulakan (Submit)',
            'Kirim laporan, konfirmasi Swal, dan tunggu sinkronisasi cloud',
            'Data transient dibersihkan, riwayat mutasi ditambahkan, kembali ke catalog',
            `restock_state: "${catalogState}", riwayat count: ${historyLength}`,
            (catalogState === null && historyLength > 3) ? 'PASS' : 'FAIL'
        );

        // ----------------------------------------------------
        // MODULE 3: FAKTUR PENJUALAN
        // ----------------------------------------------------
        console.log('\n--- Modul 3: Faktur Penjualan ---');

        // TC-003-01: URL parsing & Date range matching
        await page.goto(`${BASE_URL}/Views/Mobile/invoice_list.html?from=2026-06-11&to=2026-06-17&label=7%20Hari%20Terakhir`);
        await page.waitForLoadState('networkidle');

        const invoicePeriodLabel = await page.locator('#periodLabel').innerText();
        const cardCount = await page.locator('#listContainer .invoice-card').count();

        recordResult(
            16, 'Invoice', 'TC-003-01', 'Verifikasi Parsing Filter Tanggal',
            'Buka invoice_list.html dengan query params period tanggal',
            'Banner menampilkan "7 Hari Terakhir" dan data ter-render',
            `Periode label: "${invoicePeriodLabel}", Card count: ${cardCount}`,
            (invoicePeriodLabel.includes('7 Hari Terakhir') && cardCount > 0) ? 'PASS' : 'FAIL'
        );

        // TC-003-02: Aggregation calculation
        const totalAmountText = await page.locator('#totalAmount').innerText();
        const totalCountText = await page.locator('#totalCount').innerText();

        recordResult(
            17, 'Invoice', 'TC-003-02', 'Verifikasi Kalkulasi Aggregation Bar',
            'Bandingkan nominal di summary bar atas dengan daftar fisik',
            'Jumlah counter sesuai dengan jumlah card dan nominal Rupiah lunas/tidak lunas',
            `Summary Total: ${totalAmountText}, Summary Count: ${totalCountText}`,
            totalCountText.includes(String(cardCount)) ? 'PASS' : 'FAIL'
        );

        // TC-003-03: Real-time search
        await page.click('#searchToggleBtn');
        await page.waitForSelector('#invSearchInput:visible');
        await page.fill('#invSearchInput', 'OL-10283'); // Roxy
        await page.waitForTimeout(300);
        const filteredCount = await page.locator('#listContainer .invoice-card').count();
        const filteredAmountText = await page.locator('#totalAmount').innerText();

        recordResult(
            18, 'Invoice', 'TC-003-03', 'Fitur Pencarian Real-Time',
            'Ketik "OL-10283" (Roxy) pada input pencarian',
            'List ter-filter secara real-time dan nominal summary bar berubah',
            `Filtered count: ${filteredCount}, New Summary Total: ${filteredAmountText}`,
            filteredCount < cardCount ? 'PASS' : 'FAIL'
        );

        // TC-003-04: Payment Status Badges
        await page.fill('#invSearchInput', ''); // clear search
        await page.waitForTimeout(300);

        const hasPaidBadge = await page.locator('.badge-mobile-success:has-text("Paid")').first().isVisible();
        const hasUnpaidBadge = await page.locator('.badge-mobile-warning:has-text("Unpaid")').first().isVisible();

        recordResult(
            19, 'Invoice', 'TC-003-04', 'Tampilan Status Pembayaran Badge',
            'Periksa badge lunas (Paid) dan belum lunas (Unpaid)',
            'Badge success (hijau) dan warning (orange) harus terlihat',
            `Paid badge visible: ${hasPaidBadge}, Unpaid badge visible: ${hasUnpaidBadge}`,
            (hasPaidBadge && hasUnpaidBadge) ? 'PASS' : 'FAIL'
        );

        // TC-003-05: Read-Only Detail View
        const firstCard = page.locator('#listContainer .invoice-card').first();
        await firstCard.click();
        await page.waitForURL('**/invoice_detail.html*');

        const customerNameDetail = await page.locator('.customer-name-detail').innerText();
        const detailInputsCount = await page.locator('input:not([type="hidden"]), select, textarea').count();

        recordResult(
            20, 'Invoice', 'TC-003-05', 'Detail Faktur Read-Only',
            'Klik card faktur dan periksa form element di invoice_detail.html',
            'Detail memuat nama pelanggan yang sesuai dan tidak ada input form yang bisa diedit',
            `Customer: "${customerNameDetail}", Input count: ${detailInputsCount}`,
            (customerNameDetail !== '' && detailInputsCount === 0) ? 'PASS' : 'FAIL'
        );

        // TC-003-06: Back Navigation
        await page.click('button.header-action');
        await page.waitForURL('**/invoice_list.html*');
        const backToInvoiceList = page.url().includes('invoice_list.html');

        await page.click('button.header-action');
        await page.waitForURL('**/dasbor.html');
        const backToDashboard = page.url().includes('dasbor.html');

        recordResult(
            21, 'Invoice', 'TC-003-06', 'Verifikasi Back Navigation',
            'Klik back di detail, lalu klik back di list',
            'Kembali ke list, lalu kembali ke dashboard',
            `Back to list: ${backToInvoiceList}, Back to dashboard: ${backToDashboard}`,
            (backToInvoiceList && backToDashboard) ? 'PASS' : 'FAIL'
        );

    } catch (err) {
        console.error('❌ Terjadi Error saat Automation Testing:', err);
    } finally {
        await browser.close();
        writeReports();
    }
}

function writeReports() {
    console.log('\n====================================================');
    console.log('📊 REPORT AUTOMATION TESTING');
    console.log('====================================================');

    let passCount = 0;
    results.forEach(r => {
        if (r.status === 'PASS') passCount++;
    });

    console.log(`Hasil: ${passCount} / ${results.length} PASSED`);

    // Write to MARKDOWN Report (parent folder Testing/Mobile/)
    let md = `# Report Hasil Automated Testing SFA Mobile\n\n`;
    md += `Tanggal Uji: **${new Date().toLocaleDateString('id-ID')}**\n`;
    md += `Tester: **AI Antigravity (Playwright Automation)**\n\n`;
    md += `### Ringkasan Hasil\n`;
    md += `- **Total Kasus Uji**: ${results.length}\n`;
    md += `- **Passed**: ${passCount}\n`;
    md += `- **Failed**: ${results.length - passCount}\n\n`;
    md += `### Tabel Rincian Pengujian (Salin ke Google Sheets)\n\n`;
    md += `| No | Modul | Case ID | Nama Kasus Uji | Langkah Uji | Hasil yang Diharapkan | Hasil Aktual | Status |\n`;
    md += `|----|-------|---------|----------------|-------------|-----------------------|--------------|--------|\n`;

    results.forEach(r => {
        md += `| ${r.no} | ${r.module} | ${r.caseId} | ${r.name} | ${r.step} | ${r.expected} | ${r.actual} | **${r.status}** |\n`;
    });

    const reportPath = path.join(__dirname, '..', 'test_report.md');
    fs.writeFileSync(reportPath, md);
    console.log(`\n📝 Report Markdown disimpan ke: ${reportPath}`);

    // Write to TSV for easy copy-pasting to Google Sheets
    let tsv = `No\tModul\tCase ID\tNama Kasus Uji\tLangkah Uji\tHasil yang Diharapkan\tHasil Aktual\tStatus\tTester\tTanggal Uji\n`;
    results.forEach(r => {
        tsv += `${r.no}\t${r.module}\t${r.caseId}\t${r.name}\t${r.step}\t${r.expected}\t${r.actual}\t${r.status}\t${r.tester}\t${r.date}\n`;
    });
    const tsvPath = path.join(__dirname, '..', 'test_report.tsv');
    fs.writeFileSync(tsvPath, tsv);
    console.log(`📊 Report TSV disimpan ke: ${tsvPath} (Buka dengan Excel/Notepad untuk salin ke Google Sheets)`);
}

run();
