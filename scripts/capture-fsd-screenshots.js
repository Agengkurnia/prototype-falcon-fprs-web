/**
 * Capture screenshot UI untuk FSD Generate.
 *
 * Prasyarat:
 *   npx http-server -p 5500 -c-1
 *   node scripts/capture-fsd-screenshots.js
 *
 * Opsi:
 *   --module=master-produk   Hanya satu modul
 *   --base=http://127.0.0.1:5500
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const REGISTRY = path.join(ROOT, 'lib', 'fsd', 'module-registry.json');
const DEFAULT_OUT = path.join(ROOT, 'wwwroot', 'document', 'FSD', 'FalconWebPortal', 'screenshots');
const { updateScreenshotCache } = require('../lib/fsd/fsd-cache');

const args = process.argv.slice(2);
const baseArg = args.find(a => a.startsWith('--base='));
const moduleArg = args.find(a => a.startsWith('--module='));
const BASE = baseArg ? baseArg.split('=')[1] : 'http://127.0.0.1:5500';
const ONLY_MODULE = moduleArg ? moduleArg.split('=')[1] : null;

async function checkServer() {
    try {
        const res = await fetch(BASE);
        return res.ok;
    } catch {
        return false;
    }
}

async function waitReady(page) {
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(
        () => document.querySelector('#app-content') || document.body,
        { timeout: 15000 },
    );
    await page.waitForTimeout(800);
}

async function capture(page, outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, fullPage: false });
    console.log('  OK', path.basename(outPath));
}

async function captureModule(browser, mod) {
    const outDir = path.join(ROOT, mod.screenshotDir || 'wwwroot/document/FSD/FalconWebPortal/screenshots');
    fs.mkdirSync(outDir, { recursive: true });

    const shots = mod.screenshots || [];
    if (!shots.length) {
        console.log(`Skip ${mod.id} (no screenshots registry)`);
        return;
    }

    console.log(`\n[${mod.id}] ${mod.label}`);

    const indexUrl = `${BASE}/${mod.htmlPath.replace(/\\/g, '/')}`;
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
    const captured = [];

    try {
        await page.goto(indexUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await waitReady(page);

        const mainShot = shots[0];
        await capture(page, path.join(outDir, mainShot));
        captured.push(mainShot);

        if (mod.type === 'modal') {
            const tambahBtn = page.locator('button.btn-success, a.btn-success').first();
            if (await tambahBtn.count()) {
                await tambahBtn.click({ timeout: 5000 }).catch(() => {});
                await page.waitForTimeout(600);
                const modalShot = shots.find(s => s.includes('modal_tambah') || s.includes('modal'));
                if (modalShot) {
                    await capture(page, path.join(outDir, modalShot));
                    captured.push(modalShot);
                }
            }
        }

        if (mod.formPath) {
            const formUrl = `${BASE}/${mod.formPath.replace(/\\/g, '/')}`;
            await page.goto(formUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await waitReady(page);
            const addShot = shots.find(s => s.includes('_add') || s.includes('add'));
            if (addShot) {
                await capture(page, path.join(outDir, addShot));
                captured.push(addShot);
            }
        }

        if (captured.length) {
            updateScreenshotCache(ROOT, mod, captured);
        }
    } catch (err) {
        console.warn(`  WARN ${mod.id}: ${err.message}`);
    } finally {
        await page.close();
    }
}

async function main() {
    if (!await checkServer()) {
        console.error(`Server tidak reachable di ${BASE}`);
        console.error('Jalankan: npx http-server -p 5500 -c-1');
        process.exit(1);
    }

    const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
    let modules = registry.modules.filter(m => m.enabled !== false);
    if (ONLY_MODULE) modules = modules.filter(m => m.id === ONLY_MODULE);

    console.log(`Capture ${modules.length} modul -> ${DEFAULT_OUT}`);

    const browser = await chromium.launch({ headless: true });
    try {
        for (const mod of modules) {
            await captureModule(browser, mod);
        }
    } finally {
        await browser.close();
    }

    console.log('\nSelesai.');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
