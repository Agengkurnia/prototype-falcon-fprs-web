#!/usr/bin/env node
/**
 * Build docs/bobot_kesulitan_modul_fprs_v3.xlsx from v2:
 * - Keep yellow (sudah berjalan) rows unchanged
 * - Remove red (take out) rows
 * - Append 4 FALCON MERGER mobile tasks after existing mobile, through Nov 2026
 */
const ExcelJS = require('exceljs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'docs', 'bobot_kesulitan_modul_fprs_v2.xlsx');
const DEST = path.join(ROOT, 'docs', 'bobot_kesulitan_modul_fprs_v3.xlsx');

const HEADER_FILL = 'FF005D41';
const WEB_FILL = 'FFE3F2FD';
const MOBILE_FILL = 'FFE8F5E9';
const TOTAL_FILL = 'FFFFF8E1';
const YELLOW_FILL = 'FFFFFF00';
const RED_FILL = 'FFFF0000';
const HOLIDAY_FILL = 'FFFFEBEE';

/** Libur nasional / cuti bersama RI 2026 (periode Jul–Nov) */
const HOLIDAYS = new Set([
  '2026-08-17', // Proklamasi
  '2026-08-25', // Maulid Nabi
  // Oct–Nov 2026: tidak ada libur nasional per SKB 3 Menteri 2026 (hanya weekend)
]);

const MERGER_TASKS = [
  {
    modul: '[MOBILE] - FALCON MERGER - Visit Plan',
    bobot: 3,
    catatan: 'Merger modul Visit Plan ke Falcon Mobile (rute + detail visit)',
  },
  {
    modul: '[MOBILE] - FALCON MERGER - POA',
    bobot: 3,
    catatan: 'Merger modul POA ke Falcon Mobile',
  },
  {
    modul: '[MOBILE] - FALCON MERGER - Partner',
    bobot: 2,
    catatan: 'Merger modul Partner / outlet ke Falcon Mobile',
  },
  {
    modul: '[MOBILE] - FALCON MERGER - Dashboard',
    bobot: 2,
    catatan: 'Merger Dashboard / KPI ke Falcon Mobile',
  },
];

/**
 * WEB bobot tetap (24). Target total = 60 → MOBILE harus 36.
 * Merger = 3+3+2+2 = 10 → existing mobile dikurangi 10 (36→26).
 * Tanggal existing mobile tidak diubah — hanya bobot.
 */
const MOBILE_BOBOT_ADJUST = {
  '[MOBILE] - Beranda': 1,
  '[MOBILE] - Dasbor': 1,
  '[MOBILE] - Kunjungan - Rute Kunjungan': 1,
  '[MOBILE] - Kunjungan - Detail Kunjungan': 3,
  '[MOBILE] - Penjualan - Faktur Penjualan': 1,
  '[MOBILE] - Penjualan - Sales Order (dalam Visit)': 2,
  '[MOBILE] - Penjualan - Input Transaksi Mandiri': 1,
  '[MOBILE] - Penagihan AR - Input Pembayaran': 1,
  '[MOBILE] - Outlet & Produk - Cek Stok / Belanja Stokis': 1,
  '[MOBILE] - Sinkronisasi - Antrean Upload': 1,
};

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

function parseDate(v) {
  if (!v) return null;
  if (v instanceof Date) return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()));
  if (typeof v === 'object' && v.result instanceof Date) return parseDate(v.result);
  return new Date(v);
}

function isWorkday(d) {
  const day = d.getUTCDay();
  if (day === 0 || day === 6) return false;
  return !HOLIDAYS.has(ymd(d));
}

function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function nextWorkday(d) {
  let x = new Date(d);
  while (!isWorkday(x)) x = addDays(x, 1);
  return x;
}

function workdaysBetweenInclusive(start, end) {
  let n = 0;
  let d = new Date(start);
  const e = new Date(end);
  while (d <= e) {
    if (isWorkday(d)) n++;
    d = addDays(d, 1);
  }
  return n;
}

/** Allocate `needed` workdays starting on/after `start`, return {start, end, days} */
function allocateWorkdays(startFrom, needed) {
  let start = nextWorkday(startFrom);
  let end = start;
  let count = 0;
  while (count < needed) {
    if (isWorkday(end)) count++;
    if (count < needed) end = addDays(end, 1);
  }
  return { start, end, days: needed };
}

function cellFillArgb(cell) {
  const f = cell.fill;
  if (!f || f.type !== 'pattern' || !f.fgColor) return null;
  return f.fgColor.argb || null;
}

function thinBorder() {
  const c = { argb: 'FFBDBDBD' };
  return {
    left: { style: 'thin', color: c },
    right: { style: 'thin', color: c },
    top: { style: 'thin', color: c },
    bottom: { style: 'thin', color: c },
  };
}

function solidFill(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

function readRow(ws, r) {
  const row = ws.getRow(r);
  const fill = cellFillArgb(row.getCell(1));
  return {
    no: row.getCell(1).value,
    platform: row.getCell(2).value,
    modul: row.getCell(3).value,
    bobot: Number(row.getCell(4).value) || 0,
    start: parseDate(row.getCell(5).value),
    end: parseDate(row.getCell(6).value),
    hari: Number(row.getCell(7).value) || 0,
    catatan: row.getCell(8).value || '',
    fill,
  };
}

function styleDataRow(row, fillArgb, { isTotal = false } = {}) {
  for (let c = 1; c <= 8; c++) {
    const cell = row.getCell(c);
    cell.fill = solidFill(fillArgb);
    cell.border = thinBorder();
    cell.font = { size: 11, name: 'Calibri', bold: isTotal || c === 4 || (isTotal && (c === 3 || c === 7)) };
    if (c === 5 || c === 6) cell.numFmt = 'dd-mmm-yyyy';
  }
  row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  row.getCell(3).alignment = {
    horizontal: isTotal ? 'right' : 'left',
    vertical: 'middle',
    wrapText: true,
  };
  row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  row.getCell(4).font = { bold: true, size: 11, name: 'Calibri' };
  row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  row.getCell(6).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  if (isTotal) row.getCell(7).font = { bold: true, size: 11, name: 'Calibri' };
  row.getCell(8).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
}

function styleHeaderRow(row) {
  row.height = 22;
  for (let c = 1; c <= 8; c++) {
    const cell = row.getCell(c);
    cell.fill = solidFill(HEADER_FILL);
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
    cell.border = thinBorder();
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  }
}

function writeModuleRow(ws, r, item, no) {
  const row = ws.getRow(r);
  row.getCell(1).value = no;
  row.getCell(2).value = item.platform;
  row.getCell(3).value = item.modul;
  row.getCell(4).value = item.bobot;
  row.getCell(5).value = item.start;
  row.getCell(6).value = item.end;
  row.getCell(7).value = item.hari;
  row.getCell(8).value = item.catatan;
  styleDataRow(row, item.fill);
}

function writeTotalRow(ws, r, { bobot, start, end, hari, catatan }) {
  const row = ws.getRow(r);
  row.getCell(1).value = null;
  row.getCell(2).value = null;
  row.getCell(3).value = 'TOTAL';
  row.getCell(4).value = bobot;
  row.getCell(5).value = start;
  row.getCell(6).value = end;
  row.getCell(7).value = hari;
  row.getCell(8).value = catatan;
  styleDataRow(row, TOTAL_FILL, { isTotal: true });
}

function setColWidths(ws) {
  const widths = [6, 12, 55, 10, 14, 14, 12, 55];
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

function buildSheet(wb, name, items, totalNote) {
  const ws = wb.addWorksheet(name);
  setColWidths(ws);
  const headers = ['No', 'Platform', 'Modul', 'Bobot', 'Start Date', 'End Date', 'Hari Kerja', 'Catatan'];
  const h = ws.getRow(1);
  headers.forEach((t, i) => {
    h.getCell(i + 1).value = t;
  });
  styleHeaderRow(h);

  items.forEach((item, i) => writeModuleRow(ws, i + 2, item, i + 1));

  const bobot = items.reduce((s, x) => s + x.bobot, 0);
  const hari = items.reduce((s, x) => s + x.hari, 0);
  const start = items.reduce((min, x) => (!min || x.start < min ? x.start : min), null);
  const end = items.reduce((max, x) => (!max || x.end > max ? x.end : max), null);
  writeTotalRow(ws, items.length + 2, {
    bobot,
    start,
    end,
    hari,
    catatan: totalNote,
  });

  return { bobot, hari, start, end, count: items.length };
}

async function main() {
  const src = new ExcelJS.Workbook();
  await src.xlsx.readFile(SRC);
  const srcAll = src.getWorksheet('Semua Modul');

  const kept = [];
  for (let r = 2; r <= srcAll.rowCount; r++) {
    const item = readRow(srcAll, r);
    if (!item.modul || item.modul === 'TOTAL') continue;
    if (item.fill === RED_FILL) {
      console.log('REMOVE (red):', item.modul);
      continue;
    }
    // Preserve yellow fill & all fields exactly
    if (item.fill === YELLOW_FILL) {
      console.log('KEEP (yellow/done):', item.modul);
    }
    kept.push(item);
  }

  // Split
  const web = kept.filter(x => x.platform === 'WEB');
  const mobileExisting = kept.filter(x => x.platform === 'MOBILE');

  // Adjust mobile bobot only (WEB untouched) so WEB(24)+MOBILE(36)=60
  mobileExisting.forEach(m => {
    if (MOBILE_BOBOT_ADJUST[m.modul] != null) {
      const before = m.bobot;
      m.bobot = MOBILE_BOBOT_ADJUST[m.modul];
      console.log(`BOBOT mobile: ${m.modul}: ${before} → ${m.bobot}`);
    }
  });

  // Schedule merger after last mobile end
  const lastMobileEnd = mobileExisting.reduce(
    (max, x) => (!max || x.end > max ? x.end : max),
    null,
  );
  let cursor = addDays(lastMobileEnd, 1); // day after last mobile

  // Working days from cursor through Nov 30 for proportional allocation
  const periodEnd = new Date(Date.UTC(2026, 10, 30)); // Nov 30
  const available = workdaysBetweenInclusive(nextWorkday(cursor), periodEnd);
  const totalBobot = MERGER_TASKS.reduce((s, t) => s + t.bobot, 0);

  // Distribute available days by bobot; ensure at least 1 day each; finish by Nov 30
  let remainingDays = available;
  let remainingBobot = totalBobot;
  const mergerItems = [];

  MERGER_TASKS.forEach((t, idx) => {
    const isLast = idx === MERGER_TASKS.length - 1;
    let days = isLast
      ? remainingDays
      : Math.max(1, Math.round((t.bobot / remainingBobot) * remainingDays));
    if (!isLast && days >= remainingDays - (MERGER_TASKS.length - idx - 1)) {
      days = remainingDays - (MERGER_TASKS.length - idx - 1);
    }
    const alloc = allocateWorkdays(cursor, days);
    // Cap end at Nov 30
    if (alloc.end > periodEnd) alloc.end = periodEnd;
    mergerItems.push({
      platform: 'MOBILE',
      modul: t.modul,
      bobot: t.bobot,
      start: alloc.start,
      end: alloc.end,
      hari: workdaysBetweenInclusive(alloc.start, alloc.end),
      catatan: t.catatan,
      fill: MOBILE_FILL,
    });
    console.log(
      'MERGER:',
      t.modul,
      ymd(alloc.start),
      '→',
      ymd(alloc.end),
      `(${mergerItems[mergerItems.length - 1].hari} hk)`,
    );
    remainingDays -= mergerItems[mergerItems.length - 1].hari;
    remainingBobot -= t.bobot;
    cursor = addDays(alloc.end, 1);
  });

  const allItems = [...web, ...mobileExisting, ...mergerItems];
  const mobileAll = [...mobileExisting, ...mergerItems];

  // Ensure WEB fills stay: yellow keep yellow, others light blue
  web.forEach(w => {
    if (w.fill !== YELLOW_FILL) w.fill = WEB_FILL;
  });
  mobileExisting.forEach(m => {
    m.fill = MOBILE_FILL;
  });

  const out = new ExcelJS.Workbook();
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

  const allStats = buildSheet(
    out,
    'Semua Modul',
    allItems,
    `Timeline WEB & MOBILE paralel | excl. weekend + libur nasional RI | 22 Jul – ${fmt(allItems.reduce((m, x) => (x.end > m ? x.end : m), allItems[0].end))} | v3: −Canvassing +4 FALCON MERGER`,
  );

  const webEnd = web.reduce((m, x) => (x.end > m ? x.end : m), web[0].end);
  const webStats = buildSheet(
    out,
    'Timeline WEB',
    web,
    `Timeline WEB | excl. weekend + libur nasional RI | 22 Jul – ${fmt(webEnd)} | v3: Canvassing take-out`,
  );

  const mobEnd = mobileAll.reduce((m, x) => (x.end > m ? x.end : m), mobileAll[0].end);
  const mobStats = buildSheet(
    out,
    'Timeline MOBILE',
    mobileAll,
    `Timeline MOBILE | excl. weekend + libur nasional RI | 22 Jul – ${fmt(mobEnd)} | v3: +4 FALCON MERGER Oct–Nov`,
  );

  buildRingkasan(out, webStats, mobStats, allStats);

  await out.xlsx.writeFile(DEST);
  console.log('\nWrote', DEST);
  console.log('WEB modules:', webStats.count, 'bobot', webStats.bobot);
  console.log('MOBILE modules:', mobStats.count, 'bobot', mobStats.bobot);
  console.log('TOTAL modules:', allStats.count, 'bobot', allStats.bobot);
}

function buildRingkasan(wb, webStats, mobStats, allStats) {
  const ws = wb.addWorksheet('Ringkasan');
  ws.getColumn(1).width = 18;
  ws.getColumn(2).width = 14;
  ws.getColumn(3).width = 14;
  ws.getColumn(4).width = 14;
  ws.getColumn(5).width = 14;
  ws.getColumn(6).width = 18;

  const fmt = d =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

  ws.mergeCells('A1:F1');
  ws.getCell('A1').value = 'Ringkasan Timeline & Bobot (v3)';
  ws.getCell('A1').font = { bold: true, size: 14, name: 'Calibri' };

  ws.mergeCells('A2:F2');
  ws.getCell('A2').value =
    'WEB dan MOBILE paralel (dev berbeda). Periode 22 Jul – 30 Nov 2026. Hari kerja = Senin–Jumat dikurangi libur nasional/cuti bersama RI (SKB 3 Menteri 2026). v3: hapus Canvassing (take-out); tambah 4 FALCON MERGER di ujung Mobile (setelah Sinkronisasi) sampai November.';
  ws.getCell('A2').fill = solidFill('FFF5F5F5');
  ws.getCell('A2').alignment = { wrapText: true, vertical: 'middle' };
  ws.getRow(2).height = 45;

  const headers = ['Platform', 'Jumlah Modul', 'Total Bobot', 'Start Date', 'End Date', 'Hari Kerja'];
  const hr = ws.getRow(4);
  headers.forEach((t, i) => {
    hr.getCell(i + 1).value = t;
    hr.getCell(i + 1).fill = solidFill(HEADER_FILL);
    hr.getCell(i + 1).font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
    hr.getCell(i + 1).border = thinBorder();
  });

  const rows = [
    ['WEB', webStats.count, webStats.bobot, webStats.start, webStats.end, webStats.hari],
    ['MOBILE', mobStats.count, mobStats.bobot, mobStats.start, mobStats.end, mobStats.hari],
  ];
  rows.forEach((vals, i) => {
    const row = ws.getRow(5 + i);
    vals.forEach((v, c) => {
      row.getCell(c + 1).value = v;
      if (c === 3 || c === 4) row.getCell(c + 1).numFmt = 'dd-mmm-yyyy';
      row.getCell(c + 1).border = thinBorder();
    });
  });

  const tot = ws.getRow(7);
  [
    'TOTAL',
    allStats.count,
    allStats.bobot,
    allStats.start,
    allStats.end,
    `${webStats.hari} + ${mobStats.hari} (2 track)`,
  ].forEach((v, c) => {
    tot.getCell(c + 1).value = v;
    tot.getCell(c + 1).fill = solidFill(TOTAL_FILL);
    tot.getCell(c + 1).font = { bold: true, name: 'Calibri' };
    tot.getCell(c + 1).border = thinBorder();
    if (c === 3 || c === 4) tot.getCell(c + 1).numFmt = 'dd-mmm-yyyy';
  });

  ws.getCell('A9').value = 'Libur yang dikecualikan (dalam periode)';
  ws.getCell('A9').font = { bold: true };

  const lh = ws.getRow(10);
  ['Tanggal', 'Hari', 'Keterangan', 'Sumber'].forEach((t, i) => {
    lh.getCell(i + 1).value = t;
    lh.getCell(i + 1).fill = solidFill(HEADER_FILL);
    lh.getCell(i + 1).font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };
    lh.getCell(i + 1).border = thinBorder();
  });

  const holidays = [
    ['2026-08-17', 'Senin', 'Libur Nasional — Proklamasi Kemerdekaan RI', 'SKB 3 Menteri 2026'],
    ['2026-08-25', 'Selasa', 'Libur Nasional — Maulid Nabi Muhammad SAW', 'SKB 3 Menteri 2026'],
  ];
  holidays.forEach((vals, i) => {
    const row = ws.getRow(11 + i);
    vals.forEach((v, c) => {
      row.getCell(c + 1).value = c === 0 ? new Date(v + 'T00:00:00Z') : v;
      if (c === 0) row.getCell(c + 1).numFmt = 'dd-mmm-yyyy';
      row.getCell(c + 1).fill = solidFill(HOLIDAY_FILL);
      row.getCell(c + 1).border = thinBorder();
    });
  });

  ws.mergeCells('A14:D14');
  ws.getCell('A14').value =
    'Catatan: Juli, September, Oktober & November 2026 tidak ada libur nasional/cuti bersama menurut SKB (selain Aug). Hanya weekend yang dikecualikan di bulan tersebut.';
  ws.getCell('A14').fill = solidFill('FFF5F5F5');
  ws.getCell('A14').alignment = { wrapText: true };
  ws.getRow(14).height = 35;

  ws.getCell('A16').value = 'Aturan alokasi tanggal';
  ws.getCell('A16').font = { bold: true };
  const rules = [
    '1. Durasi modul proporsional terhadap bobot di track-nya (WEB / MOBILE).',
    '2. Tanggal berurutan atas→bawah per track.',
    '3. Hanya hari kerja efektif: Senin–Jumat, minus libur nasional & cuti bersama RI.',
    '4. Track WEB: 22-Jul-2026 s/d 30-Sep-2026 (Canvassing dihapus di v3). Track MOBILE: 22-Jul-2026 s/d 30-Nov-2026 (+ FALCON MERGER setelah Sinkronisasi).',
    '5. Skala bobot: 1 ringan – 5 sangat berat. Target total bobot = 60 (WEB 24 + MOBILE 36). FALCON MERGER: Visit Plan 3, POA 3, Partner 2, Dashboard 2.',
    '6. Warna kuning = sudah berjalan (jangan diubah). Merah = take-out (dihapus di v3). Bobot Mobile existing disesuaikan di v3 agar total tetap 60.',
  ];
  rules.forEach((t, i) => {
    ws.mergeCells(`A${17 + i}:F${17 + i}`);
    ws.getCell(`A${17 + i}`).value = t;
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
