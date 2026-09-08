"use strict";

/**
 * Playwright — Motoris Stock Monitoring (multi-scenario + popup captures)
 * Run: npm run test:motoris-stock && npm run report:motoris-stock
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const config = require("./config");
const scenarios = require("./scenarios");
const { ensureAuth } = require("./auth");
const {
    createRecorder,
    waitForDashboardReady,
    waitForKpiReady,
    waitForApi,
    dismissBlockingOverlays,
    capturePopup,
    captureViewport,
    applyFilters,
    readKpiSnapshot,
    findAuditNomor,
    takeScenarioShots,
    waitForDataTableRows,
    parseNumericKpi,
    createApiTracker,
    isIgnorableConsoleError
} = require("./helpers");

async function runInteractions(page, scenario, record, shotDir) {
    const sid = scenario.id;
    const shots = [];

    // Motoris detail popup
    await dismissBlockingOverlays(page);
    await page.locator("#sectionBalance").scrollIntoViewIfNeeded();
    try {
        await waitForDataTableRows(page, "balanceTable", 1);
        const guid = await page.locator("#balanceTable tbody .btnMotorisDetail").first().getAttribute("data-guid");
        if (guid) {
            await page.evaluate((g) => window.MotorisStockPage.showMotorisDetail(g), guid);
            const file = path.join(shotDir, `${sid}-popup-motoris-detail.png`);
            await capturePopup(page, file);
            shots.push({ action: "Motoris detail popup", file });
            record(`${sid}-INT-01`, "Popup detail motoris", true, guid, { scenarioId: sid, screenshot: file });
            await dismissBlockingOverlays(page);
        } else {
            record(`${sid}-INT-01`, "Popup detail motoris", false, "no row", { scenarioId: sid });
        }
    } catch (err) {
        record(`${sid}-INT-01`, "Popup detail motoris", false, err.message, { scenarioId: sid });
    }

    // Audit outbound popup
    try {
        const nomorOut = await findAuditNomor(page, "outbound");
        if (nomorOut) {
            await page.evaluate((n) => window.MotorisStockPage.showAuditDetail(n), nomorOut);
            const file = path.join(shotDir, `${sid}-popup-audit-outbound.png`);
            await capturePopup(page, file);
            shots.push({ action: "Audit outbound popup", file });
            record(`${sid}-INT-02`, "Popup audit Outbound", true, nomorOut, { scenarioId: sid, screenshot: file });
            await dismissBlockingOverlays(page);
        } else {
            record(`${sid}-INT-02`, "Popup audit Outbound", false, "nomor tidak ditemukan", { scenarioId: sid });
        }
    } catch (err) {
        record(`${sid}-INT-02`, "Popup audit Outbound", false, err.message, { scenarioId: sid });
    }

    // Audit inbound popup
    try {
        const nomorIn = await findAuditNomor(page, "inbound");
        if (nomorIn) {
            await page.evaluate((n) => window.MotorisStockPage.showAuditDetail(n), nomorIn);
            const file = path.join(shotDir, `${sid}-popup-audit-inbound.png`);
            await capturePopup(page, file);
            shots.push({ action: "Audit inbound popup", file });
            record(`${sid}-INT-03`, "Popup audit Inbound", true, nomorIn, { scenarioId: sid, screenshot: file });
            await dismissBlockingOverlays(page);
        } else {
            record(`${sid}-INT-03`, "Popup audit Inbound", false, "nomor tidak ditemukan", { scenarioId: sid });
        }
    } catch (err) {
        record(`${sid}-INT-03`, "Popup audit Inbound", false, err.message, { scenarioId: sid });
    }

    // Chart drill-down provinsi → kota → back
    try {
        await page.locator("#sectionCharts").scrollIntoViewIfNeeded();
        await page.evaluate(() => {
            window.MotorisStockPage.drillProvinsi = "Kalimantan Barat";
            window.MotorisStockPage.loadWilayahChart();
        });
        await page.waitForTimeout(1500);
        let file = path.join(shotDir, `${sid}-chart-drill-city.png`);
        await page.locator("#chartBarSales").screenshot({ path: file, type: "png" });
        shots.push({ action: "Chart drill-down kota", file });
        record(`${sid}-INT-04`, "Chart drill-down Kalimantan Barat per kota", true, null, {
            scenarioId: sid,
            screenshot: file
        });

        await page.evaluate(() => document.getElementById("btnBackRegion").click());
        await page.waitForTimeout(1200);
        file = path.join(shotDir, `${sid}-chart-back-region.png`);
        await page.locator("#chartBarSales").screenshot({ path: file, type: "png" });
        shots.push({ action: "Chart back to regions", file });
        record(`${sid}-INT-05`, "Tombol Back to Regions", true, null, { scenarioId: sid, screenshot: file });
    } catch (err) {
        record(`${sid}-INT-04`, "Chart drill-down", false, err.message, { scenarioId: sid });
    }

    // Refresh toast
    try {
        await dismissBlockingOverlays(page);
        await page.evaluate(() => document.getElementById("btnRefresh").click());
        await page.waitForSelector(".swal2-popup", { timeout: 8000 });
        const file = path.join(shotDir, `${sid}-toast-refresh.png`);
        await capturePopup(page, file);
        shots.push({ action: "Refresh toast", file });
        record(`${sid}-INT-06`, "Tombol Refresh + notifikasi", true, null, { scenarioId: sid, screenshot: file });
        await dismissBlockingOverlays(page);
    } catch (err) {
        record(`${sid}-INT-06`, "Tombol Refresh + notifikasi", false, err.message, { scenarioId: sid });
    }

    // Export (header area)
    try {
        await dismissBlockingOverlays(page);
        await page.evaluate(() => window.scrollTo(0, 0));
        const [download] = await Promise.all([
            page.waitForEvent("download", { timeout: 60000 }),
            page.evaluate(() => document.getElementById("btnEkspor").click())
        ]);
        const file = path.join(shotDir, `${sid}-export.xlsx`);
        await download.saveAs(file);
        record(`${sid}-INT-07`, "Export Excel", /xlsx/i.test(download.suggestedFilename()), download.suggestedFilename(), {
            scenarioId: sid
        });
    } catch (err) {
        const errFile = path.join(shotDir, `${sid}-popup-export-error.png`);
        if (await page.locator(".swal2-popup").count()) {
            await capturePopup(page, errFile);
            shots.push({ action: "Export error popup", file: errFile });
        }
        record(`${sid}-INT-07`, "Export Excel", false, err.message, { scenarioId: sid, screenshot: errFile });
        await dismissBlockingOverlays(page);
    }

    // Section collapse toggle
    try {
        await dismissBlockingOverlays(page);
        await page.evaluate(() => document.querySelector('[data-bs-target="#sectionCharts"]').click());
        await page.waitForTimeout(500);
        const collapsed = !(await page.locator("#sectionCharts").isVisible());
        await page.evaluate(() => document.querySelector('[data-bs-target="#sectionCharts"]').click());
        await page.waitForTimeout(500);
        record(`${sid}-INT-08`, "Toggle collapse Charts section", collapsed, null, { scenarioId: sid });
    } catch (err) {
        record(`${sid}-INT-08`, "Toggle collapse Charts section", false, err.message, { scenarioId: sid });
    }

    return shots;
}

async function runScenario(page, scenario, record, shotDir, results) {
    console.log(`\n=== ${scenario.id}: ${scenario.title} ===`);
    const scenarioResult = {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        filters: scenario.filters,
        kpi: null,
        screenshots: [],
        interactions: [],
        dashboardMs: null,
        pass: true
    };

    try {
        await applyFilters(page, { reset: true });
        if (!scenario.filters.reset) {
            await applyFilters(page, scenario.filters);
        }

        await waitForKpiReady(page).catch(() => {});

        const kpi = await readKpiSnapshot(page);
        const motorisGuid = await page.evaluate(() => window.MotorisStockPage?.getFilter()?.pegawaiGuid || "");
        scenarioResult.kpi = { ...kpi, motorisGuid };

        const motorisOk =
            scenario.filters.motorisIndex == null || Boolean(motorisGuid);
        const dataOk =
            kpi.armada &&
            !/placeholder|Loading/i.test(kpi.armada) &&
            !/placeholder/i.test(kpi.faktur);
        record(
            `${scenario.id}-DATA`,
            `${scenario.title} — data ter-load`,
            dataOk && motorisOk,
            `motoris=${kpi.armada}, faktur=${kpi.faktur}`,
            { scenarioId: scenario.id }
        );
        if (!dataOk || !motorisOk) scenarioResult.pass = false;

        if (scenario.shots && scenario.shots.length) {
            const files = await takeScenarioShots(page, scenario.id, scenario.shots, shotDir);
            scenarioResult.screenshots = files.filter((f) => f.file).map((f) => ({
                label: f.key,
                file: f.file
            }));
        }

        if (scenario.measureDashboard) {
            const t0 = Date.now();
            try {
                const waitDash = page.waitForResponse(
                    (res) => res.url().includes("GtStockMotoris/GetDashboard") && res.ok(),
                    { timeout: 300000 }
                );
                await page.evaluate(() => window.MotorisStockPage.reloadAll());
                await waitDash;
            } catch (e) {
                // tetap catat waktu meski timeout
            }
            scenarioResult.dashboardMs = Date.now() - t0;
            const limit = 60000;
            const perfOk = scenarioResult.dashboardMs < limit;
            record(`${scenario.id}-PERF`, `${scenario.title} — GetDashboard`, perfOk, `${scenarioResult.dashboardMs} ms (limit ${limit} ms)`, {
                scenarioId: scenario.id
            });
            if (!perfOk) scenarioResult.pass = false;
        }

        if (scenario.interactions) {
            scenarioResult.interactions = await runInteractions(page, scenario, record, shotDir);
            const intIds = results.filter((r) => r.scenarioId === scenario.id && r.id.includes("-INT-") && !r.pass);
            if (intIds.length) scenarioResult.pass = false;
        }

        const cover = path.join(shotDir, `${scenario.id}-cover.png`);
        await captureViewport(page, cover);
        scenarioResult.screenshots.unshift({ label: "cover", file: cover });
    } catch (err) {
        scenarioResult.pass = false;
        scenarioResult.error = err.message;
        record(`${scenario.id}-ERR`, scenario.title, false, err.message, { scenarioId: scenario.id });
    }

    return scenarioResult;
}

async function run() {
    const results = [];
    const record = createRecorder(results);
    const consoleErrors = [];
    const shotDir = config.screenshotDir;
    fs.mkdirSync(shotDir, { recursive: true });

    const browser = await chromium.launch({ headless: config.headless });
    let context;
    let page;
    let apiTracker;

    const scenarioReports = [];

    try {
        ({ context, page } = await ensureAuth(browser, (p) => {
            apiTracker = createApiTracker(p);
        }));

        page.on("pageerror", (err) => {
            if (!isIgnorableConsoleError(err.message)) consoleErrors.push(err.message);
        });
        page.on("console", (msg) => {
            if (msg.type() === "error" && !isIgnorableConsoleError(msg.text())) {
                consoleErrors.push(msg.text());
            }
        });

        await waitForDashboardReady(page);
        record("TC-MS-001", "Login & buka dashboard", true, page.url());

        for (const scenario of scenarios) {
            const rep = await runScenario(page, scenario, record, shotDir, results);
            scenarioReports.push(rep);
        }

        apiTracker.assertAll(record);
        record(
            "TC-MS-CONSOLE",
            "Tidak ada error JS kritis di konsol",
            consoleErrors.length === 0,
            consoleErrors.slice(0, 2).join(" | ") || "clean"
        );
    } catch (err) {
        record("TC-MS-FATAL", "Eksekusi test", false, err.stack || String(err));
        if (page) {
            await page.screenshot({
                path: path.join(shotDir, "failure.png"),
                fullPage: false
            }).catch(() => {});
        }
        console.error(err);
    } finally {
        if (context) await context.close();
        await browser.close();
    }

    const passed = results.filter((r) => r.pass).length;
    const failed = results.filter((r) => !r.pass).length;
    const summary = {
        passed,
        failed,
        total: results.length,
        finishedAt: new Date().toISOString(),
        environment: {
            baseUrl: config.baseUrl,
            dashboardPath: config.dashboardPath,
            viewport: "1440x900"
        },
        scenarios: scenarioReports,
        results
    };
    fs.writeFileSync(config.resultsFile, JSON.stringify(summary, null, 2));

    console.log("\n--- Summary ---");
    console.log(`PASS: ${passed}  FAIL: ${failed}  TOTAL: ${results.length}`);
    console.log(`Scenarios: ${scenarioReports.filter((s) => s.pass).length}/${scenarioReports.length}`);
    console.log(`Results: ${config.resultsFile}`);

    process.exit(failed > 0 ? 1 : 0);
}

run();
