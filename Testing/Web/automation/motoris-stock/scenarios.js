"use strict";

/** Skenario uji dashboard — filter + interaksi UI */
module.exports = [
    {
        id: "S01",
        title: "National — default 30 hari",
        description: "Muat awal tanpa filter geo; verifikasi KPI nasional dan filter default.",
        filters: { reset: true },
        shots: ["header-kpi", "stock-flow", "charts"]
    },
    {
        id: "S02",
        title: "Provinsi Jawa Barat",
        description: "Filter region/provinsi saja; KPI dan chart level provinsi.",
        filters: { region: "Jawa Barat" },
        shots: ["header-kpi", "charts"]
    },
    {
        id: "S03",
        title: "Jawa Barat → Bandung",
        description: "Cascade region ke kota; data lebih terfokus.",
        filters: { region: "Jawa Barat", area: "Bandung" },
        shots: ["header-kpi", "balance-grid"]
    },
    {
        id: "S04",
        title: "Kalimantan Barat → Ketapang",
        description: "Area load-test utama; verifikasi inbound/outbound dan grid.",
        filters: { region: "Kalimantan Barat", area: "Ketapang" },
        shots: ["header-kpi", "stock-flow", "charts", "balance-grid", "audit-grid"]
    },
    {
        id: "S05",
        title: "Ketapang — motoris tunggal",
        description: "Filter satu motoris; Active Fleet harus 1.",
        filters: { region: "Kalimantan Barat", area: "Ketapang", motorisIndex: 0 },
        shots: ["header-kpi", "balance-grid"]
    },
    {
        id: "S06",
        title: "National — Umbrella Brand",
        description: "Filter brand produk nasional; donut chart ter-highlight.",
        filters: { national: true, brandIndex: 0 },
        shots: ["header-kpi", "charts-brand"]
    },
    {
        id: "S07",
        title: "National — full year 2026",
        description: "Rentang 1 Jan–31 Des 2026; uji volume & performa GetDashboard.",
        filters: { national: true, dateStart: "2026-01-01", dateEnd: "2026-12-31" },
        shots: ["header-kpi"],
        measureDashboard: true
    },
    {
        id: "S08",
        title: "Interaksi UI & popup (Ketapang)",
        description: "Klik tombol, link grid, drill chart, refresh, export.",
        filters: { region: "Kalimantan Barat", area: "Ketapang" },
        interactions: true
    }
];
