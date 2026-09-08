"use strict";

/**
 * Generate Word test report — multi-scenario, popup screenshots, dev-focused.
 */
const fs = require("fs");
const path = require("path");
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    ImageRun,
    AlignmentType,
    PageBreak,
    ShadingType,
    VerticalAlign,
    TableLayoutType
} = require("docx");

const DIR = __dirname;
const config = require("./config");
const { imageTransformForDoc } = require("./helpers");
const resultsPath = path.join(DIR, "results.json");
const reportsDir = path.join(DIR, "..", "..", "reports");

const FONT = "Calibri";
const BODY = 22;
const SMALL = 18;
const H1 = 34;
const H2 = 28;
const H3 = 24;
const GREEN = "1B5E20";
const GREEN_BG = "E8F5E9";
const RED = "B71C1C";
const RED_BG = "FFEBEE";
const GRAY = "616161";
const BORDER = "CCCCCC";

function txt(text, opts = {}) {
    return new TextRun({
        text: String(text ?? ""),
        font: FONT,
        size: opts.size || BODY,
        bold: opts.bold,
        italics: opts.italic,
        color: opts.color
    });
}

function spacer(after = 120) {
    return new Paragraph({ spacing: { after } });
}

function body(text, opts = {}) {
    return new Paragraph({
        spacing: { after: opts.after ?? 140, line: 276 },
        alignment: opts.align,
        children: Array.isArray(text) ? text : [txt(text, opts)]
    });
}

function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 280, after: 160 },
        children: [txt(text, { size: H1, bold: true, color: GREEN })]
    });
}

function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [txt(text, { size: H2, bold: true, color: GREEN })]
    });
}

function h3(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 100 },
        children: [txt(text, { size: H3, bold: true })]
    });
}

function bullet(text, level = 0) {
    return new Paragraph({
        bullet: { level },
        spacing: { after: 80, line: 276 },
        children: [txt(text)]
    });
}

function border() {
    return { style: BorderStyle.SINGLE, size: 1, color: BORDER };
}

function tc(children, opts = {}) {
    const borders = { top: border(), bottom: border(), left: border(), right: border() };
    const content = Array.isArray(children)
        ? children
        : [new Paragraph({ children: [txt(children, { size: SMALL, bold: opts.bold, color: opts.color })] })];
    return new TableCell({
        borders,
        shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
        children: content
    });
}

function statusCell(pass) {
    return tc(pass ? "PASS" : "FAIL", { bold: true, color: pass ? GREEN : RED, fill: pass ? GREEN_BG : RED_BG });
}

function makeTable(headers, rows, colWidths) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
            new TableRow({
                children: headers.map((h, i) =>
                    tc(h, { bold: true, fill: GREEN_BG, width: colWidths ? colWidths[i] : undefined })
                )
            }),
            ...rows.map((row) => new TableRow({ children: row }))
        ]
    });
}

function loadResults() {
    if (!fs.existsSync(resultsPath)) {
        throw new Error("results.json tidak ditemukan. Jalankan: npm run test:motoris-stock");
    }
    return JSON.parse(fs.readFileSync(resultsPath, "utf8"));
}

function formatWib(iso) {
    return new Date(iso || Date.now()).toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "long",
        timeStyle: "short"
    });
}

function imageBlock(filePath, caption, maxWidth = 500) {
    const blocks = [];
    if (!filePath || !fs.existsSync(filePath)) {
        blocks.push(body(`[Screenshot tidak tersedia: ${caption}]`, { italic: true, color: GRAY, size: SMALL }));
        return blocks;
    }
    const data = fs.readFileSync(filePath);
    const t = imageTransformForDoc(data, maxWidth);
    blocks.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 80 },
            children: [
                new ImageRun({
                    data,
                    transformation: { width: t.width, height: t.height },
                    type: "png"
                })
            ]
        })
    );
    blocks.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 160 },
            children: [txt(caption, { size: SMALL, italic: true, color: GRAY })]
        })
    );
    return blocks;
}

function filterSummary(filters = {}) {
    if (filters.reset) return "All Indonesia (National) · tanggal default 30 hari";
    if (filters.national) {
        let s = "All Indonesia (National)";
        if (filters.dateStart) s += ` · ${filters.dateStart} s/d ${filters.dateEnd}`;
        if (filters.brandIndex != null) s += " · Umbrella Brand (opsi pertama)";
        return s;
    }
    const parts = [];
    if (filters.region) parts.push(`Provinsi: ${filters.region}`);
    if (filters.area) parts.push(`Area: ${filters.area}`);
    if (filters.motorisIndex != null) parts.push("Motoris: pilihan pertama di dropdown");
    if (filters.brandIndex != null) parts.push("Umbrella Brand: pilihan pertama");
    if (filters.dateStart) parts.push(`Tanggal: ${filters.dateStart} s/d ${filters.dateEnd}`);
    return parts.join(" · ") || "-";
}

function kpiTable(kpi) {
    if (!kpi) return body("KPI tidak tercatat.", { italic: true, color: GRAY });
    return makeTable(
        ["Metrik", "Nilai"],
        [
            [tc("Region / Area"), tc(`${(kpi.region || "-").trim()} / ${(kpi.area || "-").trim()}`)],
            [tc("Periode"), tc(`${kpi.dateStart} → ${kpi.dateEnd}`)],
            [tc("Active Motoris"), tc(kpi.armada)],
            [tc("Customers"), tc(kpi.pelanggan)],
            [tc("Sales Invoices"), tc(kpi.faktur)],
            [tc("Visits"), tc(kpi.kunjungan)],
            [tc("Effective Call"), tc(`${kpi.effCall}%`)],
            [tc("Inbound (Stokis)"), tc(kpi.flowStokis)],
            [tc("Stock at Motoris"), tc(kpi.flowMotoris)],
            [tc("Outbound (Outlet)"), tc(kpi.flowOutlet)]
        ],
        [35, 65]
    );
}

function buildDevFindings(summary) {
    const items = [
        {
            id: "DEV-001",
            sev: "High",
            title: "KPI Visits & Effective Call hardcoded 0",
            detail:
                "GtStockMotorisService.Monitor.cs baris 146–148: intKunjungan=0, decEffectiveCallPersen=0. Subtitle EC menampilkan faktur vs 0 kunjungan.",
            action: "Integrasikan tabel kunjungan GT; hitung EC% dari data aktual."
        },
        {
            id: "DEV-002",
            sev: "Low",
            title: 'Label "Region" vs data provinsi',
            detail: "Filter UI Region = txtProvinsi (nama provinsi).",
            action: 'Ganti label ke "Province" atau selaraskan istilah domain.'
        },
        {
            id: "DEV-003",
            sev: "Low",
            title: "Audit grid: Inbound tidak di halaman pertama",
            detail: "Sort tanggal desc → outbound dominan. Inbound ada di halaman berikutnya.",
            action: "Pertimbangkan filter Type atau indikator jumlah Inbound/Outbound."
        },
        {
            id: "DEV-005",
            sev: "High",
            title: "GetDashboard lambat pada filter nasional full year",
            detail: "Query 2,8 juta faktur + history membutuhkan waktu > 60 detik di dev.",
            action: "Optimasi indeks DB, caching KPI, atau paginate agregasi untuk rentang tahun penuh."
        }
    ];
    if (summary.failed > 0) {
        items.unshift({
            id: "DEV-000",
            sev: "Critical",
            title: `${summary.failed} test gagal`,
            detail: "Lihat tabel hasil per skenario.",
            action: "Perbaiki dan jalankan ulang npm run test:motoris-stock"
        });
    }
    return items;
}

function scenarioSection(sc, summary) {
    const children = [
        h2(`${sc.id} — ${sc.title}`),
        body(sc.description || ""),
        body([txt("Filter: ", { bold: true }), txt(filterSummary(sc.filters))]),
        body([txt("Status skenario: ", { bold: true }), txt(sc.pass ? "LULUS" : "GAGAL", { bold: true, color: sc.pass ? GREEN : RED })]),
        spacer(80),
        h3("KPI & Stock Flow"),
        kpiTable(sc.kpi),
        spacer(100)
    ];

    if (sc.dashboardMs != null) {
        children.push(
            body([
                txt("GetDashboard (full year): ", { bold: true }),
                txt(`${sc.dashboardMs} ms`, { color: sc.dashboardMs < 7000 ? GREEN : RED })
            ])
        );
    }

    if (sc.screenshots && sc.screenshots.length) {
        children.push(h3("Screenshot"));
        for (const shot of sc.screenshots) {
            children.push(...imageBlock(shot.file, `${sc.id} — ${shot.label}`));
        }
    }

    if (sc.interactions && sc.interactions.length) {
        children.push(h3("Popup & interaksi"));
        for (const item of sc.interactions) {
            children.push(...imageBlock(item.file, item.action));
        }
    }

    const shotResults = (summary.results || []).filter(
        (r) => r.scenarioId === sc.id && r.screenshot && fs.existsSync(r.screenshot)
    );
    if (shotResults.length) {
        children.push(h3("Bukti tambahan (assertion)"));
        for (const r of shotResults) {
            children.push(...imageBlock(r.screenshot, `${r.id}: ${r.name}`));
        }
    }

    if (sc.error) {
        children.push(body(`Error: ${sc.error}`, { color: RED }));
    }

    children.push(spacer(200));
    return children;
}

async function buildDocument(summary) {
    const scenarios = summary.scenarios || [];
    const scPass = scenarios.filter((s) => s.pass).length;
    const passRate = summary.total ? Math.round((summary.passed / summary.total) * 100) : 0;
    const allPass = summary.failed === 0;

    const findings = buildDevFindings(summary);

    const scenarioSummaryRows = scenarios.map((sc) => [
        tc(sc.id),
        statusCell(sc.pass),
        tc(sc.title),
        tc(filterSummary(sc.filters))
    ]);

    const tcRows = (summary.results || []).map((r) => [
        tc(r.id),
        statusCell(r.pass),
        tc(r.name),
        tc(r.detail || "-")
    ]);

    const findingRows = findings.map((f) => [
        tc(f.id),
        tc(f.sev),
        tc(f.title),
        tc(f.action)
    ]);

    const children = [
        // Cover
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1200, after: 200 },
            children: [txt("LAPORAN PENGUJIAN", { size: 40, bold: true })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [txt("Motoris Stock Monitoring", { size: 32, bold: true, color: GREEN })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [txt("MAVEN Web Admin — Development Environment", { size: 24, color: GRAY })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [txt(formatWib(summary.finishedAt), { size: 22, color: GRAY })]
        }),
        makeTable(
            ["Item", "Nilai"],
            [
                [tc("URL"), tc(`${summary.environment?.baseUrl || config.baseUrl}${config.dashboardPath}`)],
                [tc("Tool"), tc("Playwright + Chromium (viewport 1440×900)")],
                [tc("Skenario dijalankan"), tc(String(scenarios.length))],
                [tc("Skenario lulus"), tc(`${scPass} / ${scenarios.length}`)],
                [tc("Total assertion"), tc(`${summary.passed} PASS · ${summary.failed} FAIL (${passRate}%)`)],
                [tc("Status"), tc(allPass ? "SIAP REVIEW DEV" : "PERLU PERBAIKAN", { color: allPass ? GREEN : RED, bold: true })]
            ],
            [32, 68]
        ),
        new Paragraph({ children: [new PageBreak()] }),

        h1("1. Ringkasan untuk Tim Dev"),
        body(
            "Dokumen ini memuat hasil uji otomatis multi-skenario pada dashboard Motoris Stock. " +
                "Setiap skenario mencakup kombinasi filter berbeda, screenshot area UI (tanpa distorsi), " +
                "dan skenario interaksi yang menangkap popup detail motoris, audit trail, drill chart, refresh, serta export."
        ),
        bullet("Prioritas perbaikan: lihat Bagian 4 (Backlog Dev)."),
        bullet("Bukti visual per filter: Bagian 3 (per skenario)."),
        bullet("Popup & tombol: S08 — lampiran screenshot popup terpisah (tidak di-stretch)."),

        h1("2. Ringkasan Skenario"),
        makeTable(["ID", "Status", "Judul", "Filter"], scenarioSummaryRows, [8, 12, 35, 45]),
        spacer(200),

        h1("3. Detail per Skenario"),
        ...scenarios.flatMap((sc) => scenarioSection(sc, summary)),

        new Paragraph({ children: [new PageBreak()] }),
        h1("4. Backlog Bug Fixing & Enhancement"),
        makeTable(["ID", "Severity", "Temuan", "Rekomendasi"], findingRows, [10, 12, 38, 40]),
        spacer(200),

        h1("5. Semua Assertion (Log Test)"),
        makeTable(["ID", "Status", "Deskripsi", "Detail"], tcRows, [14, 10, 36, 40]),
        spacer(200),

        h1("6. Referensi Kode"),
        makeTable(
            ["Layer", "Path"],
            [
                [tc("View"), tc("MAVEN/Views/PowerGT/Dashboard/MotorisStock/Index.cshtml")],
                [tc("JS"), tc("MAVEN/wwwroot/js/powergt/dashboard/MotorisStock/MotorisStock.js")],
                [tc("Service"), tc("MAVEN.Services/GT/MasterData/GtStockMotorisService.Monitor.cs")],
                [tc("Automation"), tc("Prototype/Testing/Web/automation/motoris-stock/")],
                [tc("Skenario manual"), tc("Prototype/Testing/Web/002. Motoris Stock Monitoring.md")]
            ],
            [25, 75]
        ),
        spacer(160),
        h1("7. Regresi"),
        bullet("Jalankan test: npm run test:motoris-stock"),
        bullet("Generate laporan: npm run report:motoris-stock"),
        bullet("Kombinasi: npm run test:motoris-stock:report")
    ];

    return new Document({
        creator: "MAVEN QA Automation",
        title: "Motoris Stock Monitoring — Test Report",
        styles: {
            default: {
                document: {
                    run: { font: FONT, size: BODY },
                    paragraph: { spacing: { line: 276, after: 140 } }
                }
            }
        },
        sections: [
            {
                properties: {
                    page: {
                        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
                    }
                },
                children
            }
        ]
    });
}

async function main() {
    const summary = loadResults();
    fs.mkdirSync(reportsDir, { recursive: true });
    const stamp = new Date(summary.finishedAt || Date.now()).toISOString().slice(0, 10).replace(/-/g, "");
    const outFile = path.join(reportsDir, `${stamp}_Motoris_Stock_Monitoring_Test_Report.docx`);
    const buffer = await Packer.toBuffer(await buildDocument(summary));
    fs.writeFileSync(outFile, buffer);
    console.log(`Report written: ${outFile}`);
}

main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
});
