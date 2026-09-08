"use strict";

const fs = require("fs");
const path = require("path");
const config = require("./config");

function createRecorder(results) {
    return function record(id, name, pass, detail, extra = {}) {
        const entry = {
            id,
            name,
            pass,
            detail: detail || null,
            at: new Date().toISOString(),
            scenarioId: extra.scenarioId || null,
            screenshot: extra.screenshot || null
        };
        results.push(entry);
        const icon = pass ? "PASS" : "FAIL";
        const suffix = detail ? ` — ${detail}` : "";
        console.log(`[${icon}] ${id} ${name}${suffix}`);
        return pass;
    };
}

function pngDimensions(buffer) {
    if (!buffer || buffer.length < 24) return { width: 1280, height: 720 };
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function imageTransformForDoc(buffer, maxWidth = 520) {
    const { width, height } = pngDimensions(buffer);
    const w = Math.min(maxWidth, width);
    const h = Math.round((height / width) * w);
    return { width: w, height: h };
}

async function captureViewport(page, filePath) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: filePath, fullPage: false, type: "png" });
    return filePath;
}

async function captureLocator(page, locator, filePath) {
    const el = typeof locator === "string" ? page.locator(locator) : locator;
    await el.waitFor({ state: "visible", timeout: 15000 });
    await el.screenshot({ path: filePath, type: "png" });
    return filePath;
}

async function capturePopup(page, filePath) {
    return captureLocator(page, ".swal2-popup", filePath);
}

async function applyFilters(page, filters = {}) {
    await dismissBlockingOverlays(page);

    if (filters.reset) {
        await page.evaluate(() => {
            const p = window.MotorisStockPage;
            window.jQuery("#filterRegion, #filterArea, #filterSales, #filterBrand").val("").trigger("change.select2");
            document.getElementById("filterDateStart").value = p.defaultStart;
            document.getElementById("filterDateEnd").value = p.defaultEnd;
        });
        await page.evaluate(() => window.MotorisStockPage.reloadAll());
        await waitForDashboardReady(page);
        return;
    }

    // Clear motoris/brand dari skenario sebelumnya
    await page.evaluate(() => {
        window.jQuery("#filterSales, #filterBrand").val("").trigger("change.select2");
    });

    if (filters.national) {
        await page.evaluate(() => {
            window.jQuery("#filterRegion, #filterArea").val("").trigger("change");
        });
        await waitForDashboardReady(page);
    }

    if (filters.region) {
        await setNativeSelect(page, "#filterRegion", filters.region);
        await waitForDashboardReady(page);
    }

    if (filters.area) {
        await page.waitForFunction(
            (areaName) => {
                const opts = [...document.querySelectorAll("#filterArea option")];
                return opts.some((o) => o.value === areaName || (o.textContent || "").trim() === areaName);
            },
            filters.area,
            { timeout: 30000 }
        ).catch(() => {});

        const areas = await page.$$eval("#filterArea option", (opts) =>
            opts.map((o) => ({ value: o.value, label: o.textContent.trim() })).filter((o) => o.value)
        );
        let areaVal = filters.area;
        const hit = areas.find((a) => a.value === areaVal || a.label === areaVal);
        if (!hit && areas.length) areaVal = areas[0].value;
        else if (hit) areaVal = hit.value;

        await setNativeSelect(page, "#filterArea", areaVal);
        await waitForDashboardReady(page);
    }

    if (filters.dateStart && filters.dateEnd) {
        await page.fill("#filterDateStart", filters.dateStart);
        await page.fill("#filterDateEnd", filters.dateEnd);
        await page.evaluate(() => {
            document.getElementById("filterDateEnd").dispatchEvent(new Event("change", { bubbles: true }));
        });
        await waitForDashboardReady(page);
    }

    if (filters.motorisIndex != null) {
        await page.waitForTimeout(600);
        const options = await page.$$eval("#filterSales option", (opts) =>
            opts.map((o) => ({ value: o.value, label: o.textContent.trim() })).filter((o) => o.value)
        );
        const pick = options[filters.motorisIndex];
        if (pick) {
            await setNativeSelect(page, "#filterSales", pick.value);
            await waitForDashboardReady(page);
        }
    }

    if (filters.brandIndex != null) {
        const options = await page.$$eval("#filterBrand option", (opts) =>
            opts.map((o) => ({ value: o.value, label: o.textContent.trim() })).filter((o) => o.value)
        );
        const pick = options[filters.brandIndex];
        if (pick) {
            await setNativeSelect(page, "#filterBrand", pick.value);
            await waitForDashboardReady(page);
        }
    }

    if (!filters.region && !filters.area && !filters.dateStart && filters.brandIndex == null && filters.motorisIndex == null) {
        await page.evaluate(() => window.MotorisStockPage.reloadAll());
        await waitForDashboardReady(page);
    }
}

async function readKpiSnapshot(page) {
    return {
        armada: await getKpiText(page, "#kpiArmada"),
        pelanggan: await getKpiText(page, "#kpiPelanggan"),
        faktur: await getKpiText(page, "#kpiFaktur"),
        kunjungan: await getKpiText(page, "#kpiKunjungan"),
        effCall: await getKpiText(page, "#kpiEffCall"),
        flowStokis: await getKpiText(page, "#flowStokis"),
        flowMotoris: await getKpiText(page, "#flowMotoris"),
        flowOutlet: await getKpiText(page, "#flowOutlet"),
        dateStart: await page.inputValue("#filterDateStart"),
        dateEnd: await page.inputValue("#filterDateEnd"),
        region: await page.locator("#filterRegion option:checked").textContent().catch(() => ""),
        area: await page.locator("#filterArea option:checked").textContent().catch(() => ""),
        motoris: await page.locator("#filterSales option:checked").textContent().catch(() => ""),
        brand: await page.locator("#filterBrand option:checked").textContent().catch(() => "")
    };
}

async function findAuditNomor(page, tipe) {
    return page.evaluate(async (wantTipe) => {
        const filter = window.MotorisStockPage.getFilter();
        for (let pageNum = 1; pageNum <= 40; pageNum++) {
            const params = new URLSearchParams(
                Object.assign({ page: String(pageNum), pageSize: "50" }, filter)
            );
            const res = await fetch(window.MotorisStockPage.API.history + "?" + params.toString(), {
                credentials: "same-origin"
            });
            const body = await res.json();
            const rows = (body.data || body).data || [];
            const hit = rows.find((r) => String(r.txtTipe || "").toLowerCase() === wantTipe.toLowerCase());
            if (hit && hit.txtNomorTransaksi) return hit.txtNomorTransaksi;
            if (!rows.length) break;
        }
        return null;
    }, tipe);
}

async function takeScenarioShots(page, scenarioId, shotKeys, shotDir) {
    const files = [];
    const base = path.join(shotDir, scenarioId);

    for (const key of shotKeys) {
        const file = `${base}-${key}.png`;
        try {
            if (key === "header-kpi") {
                await captureViewport(page, file);
            } else if (key === "stock-flow") {
                await page.locator(".flow-visual").scrollIntoViewIfNeeded();
                await captureLocator(page, ".card:has(.flow-visual)", file);
            } else if (key === "charts") {
                await page.locator("#sectionCharts").scrollIntoViewIfNeeded();
                await captureLocator(page, "#sectionCharts .card-body", file);
            } else if (key === "charts-brand") {
                await page.locator("#chartBrandContrib").scrollIntoViewIfNeeded();
                await captureLocator(page, "#sectionCharts .col-12.col-lg-5:has(#chartBrandContrib)", file);
            } else if (key === "balance-grid") {
                await page.locator("#sectionBalance").scrollIntoViewIfNeeded();
                await captureLocator(page, "#sectionBalance", file);
            } else if (key === "audit-grid") {
                await page.locator("#sectionAudit").scrollIntoViewIfNeeded();
                await captureLocator(page, "#sectionAudit", file);
            }
            if (fs.existsSync(file)) files.push({ key, file });
        } catch (err) {
            files.push({ key, file: null, error: err.message });
        }
    }
    return files;
}

async function waitForDashboardReady(page) {
    await page.waitForSelector("h4:has-text('Motoris Stock Monitoring')", { timeout: 60000 });
    await page.waitForFunction(() => {
        const el = document.querySelector("#lastUpdated");
        return el && !/Loading/i.test(el.textContent || "");
    }, { timeout: config.apiTimeoutMs });
}

async function waitForKpiReady(page) {
    await page.waitForFunction(() => {
        const kpi = document.querySelector("#kpiArmada");
        return kpi && !kpi.querySelector(".placeholder") && /\d/.test(kpi.textContent || "");
    }, { timeout: config.apiTimeoutMs });
}

async function waitForApi(page, fragment, action) {
    const predicate = (res) => res.url().includes(fragment) && res.request().method() === "GET";
    const wait = page.waitForResponse(predicate, { timeout: config.apiTimeoutMs });
    if (action) await action();
    const res = await wait;
    return res;
}

async function setNativeSelect(page, selector, value) {
    await page.selectOption(selector, value);
    await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        if (window.jQuery) {
            window.jQuery(sel).trigger("change");
        }
    }, selector);
}

async function getKpiText(page, selector) {
    return (await page.locator(selector).innerText()).trim();
}

async function isPlaceholderGone(page, selector) {
    const hasPlaceholder = await page.locator(`${selector} .placeholder`).count();
    return hasPlaceholder === 0;
}

function parseNumericKpi(text) {
    const digits = String(text || "").replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
}

async function collectRegionOptions(page) {
    return page.$$eval("#filterRegion option", (opts) =>
        opts.map((o) => ({ value: o.value, label: o.textContent.trim() }))
    );
}

async function waitForDataTableRows(page, tableId, minRows = 1) {
    await page.waitForFunction(
        ({ id, min }) => {
            const table = document.querySelector(`#${id}`);
            if (!table) return false;
            const rows = table.querySelectorAll("tbody tr");
            if (!rows.length) return false;
            const empty = rows[0].querySelector("td.dataTables_empty");
            if (empty) return false;
            return rows.length >= min;
        },
        { id: tableId, min: minRows },
        { timeout: config.apiTimeoutMs }
    );
}

async function dismissSwal(page) {
    await page.evaluate(() => {
        if (window.Swal) {
            if (typeof Swal.isVisible === "function" && Swal.isVisible()) {
                Swal.close();
            } else if (typeof Swal.getContainer === "function") {
                const el = Swal.getContainer();
                if (el) Swal.close();
            }
        }
    });
    await page.locator(".swal2-container").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
    await page.locator(".swal2-container").waitFor({ state: "detached", timeout: 5000 }).catch(() => {});
}

async function dismissBlockingOverlays(page) {
    await dismissSwal(page);
    await page.evaluate(() => {
        const modal = document.getElementById("globalDetailModal");
        if (!modal || !modal.classList.contains("show")) return;
        const closeBtn = modal.querySelector('[data-bs-dismiss="modal"], .btn-close');
        if (closeBtn) {
            closeBtn.click();
            return;
        }
        if (window.bootstrap && window.bootstrap.Modal) {
            const inst = window.bootstrap.Modal.getInstance(modal) || new window.bootstrap.Modal(modal);
            inst.hide();
        }
    });
    await page.locator("#globalDetailModal.show").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
}

async function waitForGtStockApis(page, trigger) {
    const waits = API_EXPORT_FRAGMENTS.map((frag) =>
        page.waitForResponse((res) => res.url().includes(frag) && res.ok(), {
            timeout: config.apiTimeoutMs
        })
    );
    if (trigger) await trigger();
    const responses = await Promise.all(waits);
    return responses.map((r) => r.url());
}

async function countAuditTypes(page) {
    return page.evaluate(async () => {
        if (!window.MotorisStockPage) return { inbound: 0, outbound: 0, total: 0 };
        const filter = window.MotorisStockPage.getFilter();
        let inbound = 0;
        let outbound = 0;
        let total = 0;
        const pageSize = 50;
        for (let pageNum = 1; pageNum <= 30; pageNum++) {
            const params = new URLSearchParams(
                Object.assign({ page: String(pageNum), pageSize: String(pageSize) }, filter)
            );
            const res = await fetch(window.MotorisStockPage.API.history + "?" + params.toString(), {
                credentials: "same-origin"
            });
            if (!res.ok) return { inbound, outbound, total, error: res.status };
            const body = await res.json();
            const payload = body.data || body;
            const rows = payload.data || [];
            total = payload.totalRow || total;
            if (!rows.length) break;
            rows.forEach((r) => {
                const t = String(r.txtTipe || "").toLowerCase();
                if (t === "inbound") inbound += 1;
                if (t === "outbound") outbound += 1;
            });
            if (inbound > 0 && outbound > 0) break;
            if (pageNum * pageSize >= total) break;
        }
        return { inbound, outbound, total };
    });
}

function isIgnorableConsoleError(text) {
    const t = String(text || "");
    return (
        /notificationHub/i.test(t) ||
        /signalr/i.test(t) ||
        /WebSocket/i.test(t) ||
        /Failed to start the transport/i.test(t) ||
        /Failed to load resource: the server responded with a status of 404/i.test(t) ||
        /Connection disconnected with error/i.test(t) ||
        /Server timeout elapsed/i.test(t) ||
        /status of 500/i.test(t) ||
        /status of 502/i.test(t) ||
        /502 Bad Gateway/i.test(t) ||
        /Failed to complete negotiation/i.test(t)
    );
}

function createApiTracker(page) {
    const seen = new Set();
    page.on("response", (res) => {
        if (!res.ok()) return;
        for (const frag of API_EXPORT_FRAGMENTS) {
            if (res.url().includes(frag)) seen.add(frag);
        }
    });
    return {
        assertAll(record) {
            const missing = API_EXPORT_FRAGMENTS.filter((f) => !seen.has(f));
            record(
                "TC-MS-002",
                "Semua API GtStockMotoris HTTP 200",
                missing.length === 0,
                missing.length ? `belum terpanggil: ${missing.join(", ")}` : `${seen.size}/8 OK`
            );
        }
    };
}

const API_EXPORT_FRAGMENTS = [
    "GtStockMotoris/GetFilters",
    "GtStockMotoris/GetDashboard",
    "GtStockMotoris/GetChartPergerakanWilayah",
    "GtStockMotoris/GetChartTop10Motoris",
    "GtStockMotoris/GetChartTrenHarian",
    "GtStockMotoris/GetChartKontribusiUmbrand",
    "GtStockMotoris/GetBalance",
    "GtStockMotoris/GetHistory"
];

module.exports = {
    createRecorder,
    waitForDashboardReady,
    waitForApi,
    setNativeSelect,
    getKpiText,
    isPlaceholderGone,
    parseNumericKpi,
    collectRegionOptions,
    waitForDataTableRows,
    dismissSwal,
    dismissBlockingOverlays,
    waitForGtStockApis,
    waitForKpiReady,
    countAuditTypes,
    createApiTracker,
    isIgnorableConsoleError,
    pngDimensions,
    imageTransformForDoc,
    captureViewport,
    captureLocator,
    capturePopup,
    applyFilters,
    readKpiSnapshot,
    findAuditNomor,
    takeScenarioShots,
    API_EXPORT_FRAGMENTS
};
