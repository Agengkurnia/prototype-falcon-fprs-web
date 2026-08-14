#!/usr/bin/env python3
"""
Assemble FSD Penjualan (Web Admin Falcon FPRS) — Faktur + Stok Motoris + Tuning.

Output: source/FSD_Falcon_Web_Penjualan_v1.0.md (versi dokumen di dalam file = VERSI)
"""
from __future__ import annotations

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SOURCE_DIR = os.path.join(WORKSPACE_DIR, 'source')
OUTPUT_MD = os.path.join(SOURCE_DIR, 'FSD_Falcon_Web_Penjualan_v1.0.md')

sys.path.insert(0, SCRIPT_DIR)
from extract_module_spec import (  # noqa: E402
    PENJUALAN_ORDER,
    load_registry,
    module_section,
)
from maven_spec import chapter_erd_penjualan  # noqa: E402

TANGGAL = '17 Juli 2026'
VERSI = '1.1'

DOCUMENT_APPROVAL = [
    ('Muhammad Rafi', 'SHP Channel & Customer Development'),
    ('Silvester Mario Nian Destrada', 'SHP Channel & Customer Development'),
    ('Aldira Rahmania', 'SHP Channel & Customer Development'),
    ('Ageng Kurniawan Sugianto', 'IT Product'),
    ('Albet', 'IT Product'),
]


def report_faktur() -> str:
    return '''
#### Report / Ekspor Faktur

Tombol **Ekspor** pada dashboard list. Di prototipe masih **mock** (konfirmasi Swal tanpa file).
Target produksi: Excel `.xlsx`, **1 baris = 1 faktur** (header-level), mengikuti filter list + scope RBAC region.

> **Sumber produksi:** query atas `tPenjualanFaktur` dengan join `mPelanggan`, `mPegawai` (dan opsional `mStokis` untuk gudang).
> **Prototipe saat ini:** field denormalized di `fprs_faktur` / `faktur.json` (belum persist ke MAVEN).

| # | Nama kolom (rencana) | Keterangan | Tabel sumber | Kolom produksi |
|---|----------------------|------------|--------------|----------------|
| 1 | Tanggal Faktur | Tanggal dokumen | `tPenjualanFaktur` | `dtTanggalFaktur` |
| 2 | Nomor Faktur | ID / nomor faktur | `tPenjualanFaktur` | `txtNomorFaktur` |
| 3 | Kode Pelanggan | Kode outlet | `mPelanggan` | `txtKode` (FK `tPenjualanFaktur.intPelangganID`) |
| 4 | Nama Pelanggan | Nama outlet | `mPelanggan` | `txtNama` |
| 5 | Sales | Nama / kode sales / motoris | `mPegawai` | `txtNama` atau `txtKode` (FK `tPenjualanFaktur.intPegawaiID`) |
| 6 | Jatuh Tempo | Tanggal jatuh tempo | `tPenjualanFaktur` | `dtJatuhTempo` |
| 7 | Jumlah Tagihan | Total tagihan | `tPenjualanFaktur` | `decJumlahTagihan` |
| 8 | Belum Dibayar | Sisa piutang | `tPenjualanFaktur` | `decBelumDibayar` |
| 9 | Status | Paid / Unpaid / Draft / dll. | `tPenjualanFaktur` | `txtStatus` |

Kolom opsional (belum di sheet v1, tersedia di DB): `tPenjualanFaktur.txtGudang`, `tPenjualanFaktur.txtTipe`, `tPenjualanFaktur.txtJangkaWaktu`, `tPenjualanFaktur.txtCatatan`.

'''


def report_stok_motoris() -> str:
    return '''
#### Report Excel — Stok Motoris

Tombol **Export Excel** memanggil `exportToExcel()` (SheetJS). File: `StokMotoris_Export_YYYY-MM-DD.xlsx`.
Baris mengikuti filter dashboard + motoris terfilter (scope region RBAC berlaku di produksi).

> **Sumber produksi:** join `tPenjualanFaktur` + `tPenjualanFakturItem` + master (`mPelanggan`, `mPegawai`, `mProduk`, `mPajak`, `mUnit`, `mStokis`) untuk sheet **SalesInvoices**;
> sheet **DailyVisits** dari `tKunjunganHarian` + `mPegawai` + `mPelanggan`.
> **Prototipe:** `buildSalesInvoiceExportRows` / `buildDailyVisitExportRows` di `StokMotoris/index.html` membaca `fprs_faktur`, `md_pelanggan`, snapshot `md_stok_motoris.visitHistory`.

##### Sheet `SalesInvoices` (29 kolom — 1 baris per item faktur)

| # | Kolom | Keterangan | Tabel sumber | Kolom produksi |
|---|-------|------------|--------------|----------------|
| 1 | Date | Tanggal faktur (`YYYY-MM-DD`) | `tPenjualanFaktur` | `dtTanggalFaktur` (date) |
| 2 | SalesInvoiceNo | Nomor / ID faktur | `tPenjualanFaktur` | `txtNomorFaktur` |
| 3 | InvoiceStatus | Status faktur | `tPenjualanFaktur` | `txtStatus` |
| 4 | InvoiceDocType | Tipe dokumen export | — | Konstanta `MobileCanvass` (belum kolom DB v1) |
| 5 | InvoiceGenerateFrom | Asal generate | `tPenjualanFaktur` | `txtTipe` (mis. Canvass → Canvassing) |
| 6 | IsInvoiceReturn | Flag retur | — | Konstanta `false` (belum kolom DB v1) |
| 7 | EmployeeCode | Kode motoris / sales | `mPegawai` | `txtKode` (FK `tPenjualanFaktur.intPegawaiID`) |
| 8 | EmployeeName | Nama motoris / sales | `mPegawai` | `txtNama` |
| 9 | CustomerCode | Kode pelanggan | `mPelanggan` | `txtKode` (FK `tPenjualanFaktur.intPelangganID`) |
| 10 | CustomerName | Nama pelanggan | `mPelanggan` | `txtNama` |
| 11 | CustomerAddress | Alamat pelanggan | `mPelanggan` | `txtAlamat` |
| 12 | OrderLatitude | Latitude outlet | `mPelanggan` | `decLat` |
| 13 | OrderLongitude | Longitude outlet | `mPelanggan` | `decLng` |
| 14 | WarehouseCode | Kode gudang | `tPenjualanFaktur` / `mStokis` | Derivasi dari `txtGudang` atau `mStokis.txtOutletId` |
| 15 | WarehouseName | Nama gudang | `tPenjualanFaktur` / `mStokis` | `txtGudang` atau `mStokis.txtNama` |
| 16 | PaymentTermName | Jangka waktu pembayaran | `tPenjualanFaktur` | `txtJangkaWaktu` |
| 17 | ProductCode | Kode produk (line) | `mProduk` | `txtKode` (FK `tPenjualanFakturItem.intProdukID`) |
| 18 | ProductName | Nama produk | `mProduk` | `txtNama` |
| 19 | QuantityL | Qty unit besar (Karton) | — | Kosong v1 (konversi UOM belum di DB) |
| 20 | UnitL | Satuan L | — | Konstanta `KARTON` |
| 21 | QuantityM | Qty unit menengah | — | Kosong v1 |
| 22 | UnitM | Satuan M | — | Konstanta `RENCENG` |
| 23 | QuantityS | Qty unit kecil (PCS) | `tPenjualanFakturItem` | `decQty` |
| 24 | UnitS | Satuan S | `mUnit` | `txtNama` (FK `tPenjualanFakturItem.intUnitID`; fallback PCS) |
| 25 | TotalQuantity | Total qty | `tPenjualanFakturItem` | `decQty` (prototipe = QuantityS) |
| 26 | SellPrice | Harga jual per unit | `tPenjualanFakturItem` | `decHargaUnit` |
| 27 | TaxCode | Kode pajak line | `mPajak` | `txtKodePajak` (FK `tPenjualanFakturItem.intPajakID`) |
| 28 | LineTotal | Nilai baris | `tPenjualanFakturItem` | `decLineTotal` (atau hitung `decQty × decHargaUnit − decDiskon`) |
| 29 | InvoiceNotes | Catatan header faktur | `tPenjualanFaktur` | `txtCatatan` |

##### Sheet `DailyVisits` (28 kolom — 1 baris per kunjungan)

| # | Kolom | Keterangan | Tabel sumber | Kolom produksi |
|---|-------|------------|--------------|----------------|
| 1 | EmployeeCode | Kode motoris | `mPegawai` | `txtKode` (FK `tKunjunganHarian.intPegawaiID`) |
| 2 | EmployeeName | Nama motoris | `mPegawai` | `txtNama` |
| 3 | Role | Peran lapangan | `mPegawai` | `txtRole` (prototipe: hardcode `Canvasser`) |
| 4 | Date | Tanggal kunjungan | `tKunjunganHarian` | `dtTanggal` |
| 5 | Planned | Kunjungan terencana | — | Kosong v1 (belum kolom planned) |
| 6 | UnPlaned | Kunjungan tidak terencana | — | Derivasi export (prototipe: `1`) |
| 7 | Visited | Sudah dikunjungi | `tKunjunganHarian` | Ada baris kunjungan (prototipe: `1`) |
| 8 | CustomerCode | Kode outlet | `mPelanggan` | `txtKode` (FK `tKunjunganHarian.intPelangganID`) |
| 9 | CustomerName | Nama outlet | `mPelanggan` | `txtNama` |
| 10 | CustomerAddress | Alamat outlet | `mPelanggan` | `txtAlamat` |
| 11 | CustomerLatitude | Lat master outlet | `mPelanggan` | `decLat` |
| 12 | CustomerLongitude | Lng master outlet | `mPelanggan` | `decLng` |
| 13 | CheckInTime | Waktu check-in (ISO) | `tKunjunganHarian` | `dtCheckIn` |
| 14 | CheckOutTime | Waktu check-out (ISO) | `tKunjunganHarian` | `dtCheckOut` |
| 15 | Duration | Durasi `HH:MM:SS` | `tKunjunganHarian` | Hitung dari `dtCheckIn`–`dtCheckOut` atau `intDurasiMenit` |
| 16 | Distance in Meter Check in | Jarak GPS check-in ke outlet (m) | `tKunjunganHarian` + `mPelanggan` | Hitung Haversine(`decCheckInLat/Lng`, `mPelanggan.decLat/decLng`) |
| 17 | CheckInLatitude | Lat check-in | `tKunjunganHarian` | `decCheckInLat` |
| 18 | CheckInLongitude | Lng check-in | `tKunjunganHarian` | `decCheckInLng` |
| 19 | CheckOutLatitude | Lat check-out | `tKunjunganHarian` | `decCheckOutLat` |
| 20 | CheckOutLongitude | Lng check-out | `tKunjunganHarian` | `decCheckOutLng` |
| 21 | Distance in Meter Check out | Jarak GPS check-out ke outlet (m) | `tKunjunganHarian` + `mPelanggan` | Hitung Haversine(`decCheckOutLat/Lng`, `mPelanggan.decLat/decLng`) |
| 22 | Pseq | Urutan planned | — | Kosong v1 |
| 23 | Aseq | Urutan aktual kunjungan | `tKunjunganHarian` | Urutan baris / `intKunjunganID` (belum kolom `intUrutan` v1) |
| 24 | TotalSales | Nilai penjualan kunjungan | `tKunjunganHarian` | `decTotalSales` (atau agregat `tPenjualanFaktur` via `intPenjualanFakturID`) |
| 25 | Description | Ringkasan aktivitas | `tKunjunganHarian` | `txtDeskripsi` |
| 26 | Unvisited | Flag tidak dikunjungi | — | Derivasi export (prototipe: `0` jika ada kunjungan) |
| 27 | TargetCall | Target call | — | KPI / konfig (prototipe: `1`) |
| 28 | EffCall | Effective call (ada transaksi) | `tKunjunganHarian` | `bitHasTransaction` → `1` / `0` |

'''


REPORT_BY_MODULE = {
    'penjualan-faktur': report_faktur,
    'penjualan-stok-motoris': report_stok_motoris,
}


def preamble() -> str:
    approval_rows = '\n'.join(
        f'| {name} | {title} |  |  |' for name, title in DOCUMENT_APPROVAL
    )
    return f'''# FUNCTIONAL SPECIFICATION DOCUMENT (FSD)
## Modul: Falcon FPRS — Penjualan (Web Admin)
### Sistem: Falcon FPRS
### Versi Dokumen: {VERSI}

---

| Atribut | Keterangan |
|---------|------------|
| **Nama Dokumen** | FSD Modul Penjualan — Web Admin Falcon FPRS |
| **Versi** | {VERSI} |
| **Tanggal** | {TANGGAL} |
| **Divisi** | IT / Business – Falcon FPRS |
| **Status** | Draft |
| **Dibuat oleh** | Tim IT – Falcon FPRS |

---

## Riwayat Revisi

| Versi | Tanggal | Diubah Oleh | Keterangan |
|-------|---------|-------------|------------|
| 1.0 | {TANGGAL} | Tim IT | Initial draft – Faktur + Stok Motoris; RBAC; spesifikasi kolom report Excel |
| **{VERSI}** | **{TANGGAL}** | **Tim IT** | Tambah bab **Skalabilitas & Tuning** (Fase A): agregasi SQL, batas filter/export, seed UAT 6 bulan Cash/Lunas, script `008`–`010` |

---

## Persetujuan Dokumen (Document Approval)

| Full Name | Job Title | Signature | Signature Date |
|-----------|-----------|-----------|----------------|
{approval_rows}

---

## 1. Pendahuluan

### 1.1 Latar Belakang

**Falcon FPRS** (*Field Partner Relation System*) adalah sistem internal PT Kalbe
Nutritionals untuk administrasi data master, penjualan lapangan, dan pelacakan
kunjungan sales. Dokumen ini memfokuskan lingkup pada **modul Penjualan** Web Admin
(`Views/FPRS/Penjualan/`) — monitoring faktur dari Mobile SFA dan dashboard stok motoris.

Prototipe Web Portal berupa *high-fidelity interactive prototype* berbasis HTML
statis (MPA) bertema Vuexy/Bootstrap yang menggunakan **localStorage** dan file
JSON seed di `wwwroot/data/` sebagai lapisan persistensi sisi klien. Implementasi
produksi berada di **MAVEN** (ASP.NET Core + PostgreSQL) dengan route
`/Transaction/SalesOrder` dan `/Dashboard/MotorisStock`.

### 1.2 Tujuan Dokumen

1. Mendeskripsikan fungsionalitas **per halaman dan per komponen UI** modul Penjualan.
2. Menjadi acuan pengembangan backend/API dan UAT untuk monitoring penjualan FPRS.
3. Mendokumentasikan business rules, pola akses (RBAC + scope region), dan **spesifikasi kolom report Excel**.
4. Menyelaraskan format dokumentasi dengan standar **FSD Generator Engine** (Kalbe Nutritionals).
5. Mendokumentasikan **strategi skalabilitas & tuning dashboard Stok Motoris (Fase A)** termasuk seed data UAT dan index SQL.

### 1.3 Ruang Lingkup

| Dalam lingkup | Di luar lingkup |
|---------------|-----------------|
| Faktur Penjualan (list, detail, print) | Modul Canvassing (belum ada UI aktif) |
| Monitoring Stok Motoris (dashboard + export Excel) | Create/Edit/Hapus faktur di Web Admin |
| Persistensi prototipe (`fprs_faktur`, `md_stok_motoris`) + seed MAVEN | Mobile SFA (sumber order — disebut sebagai integrasi) |
| RBAC Super Admin / Sales Manager / RSM | Approval multi-level transaksi |
| Spesifikasi kolom report Excel/CSV | Modul Master Data & Kunjungan (dokumen terpisah) |
| Tuning Fase A (agregasi SQL, index, seed 6 bulan) | Tuning Fase B (tabel agregat harian / partition — roadmap) |

### 1.4 Stakeholder

| Peran | Tim/Divisi | Keterlibatan |
|-------|------------|--------------|
| Super Admin | IT | Akses seluruh menu & data nasional |
| Sales Manager | Sales | Monitoring nasional + filter regional |
| RSM | Sales regional | Monitoring region sendiri |
| Finance | Finance | Monitoring faktur / tagihan (read) |
| Developer | IT | Implementasi API & UI produksi (MAVEN) |

---

## 2. Arsitektur & Alur Penjualan

### 2.1 Ringkasan Teknis

| Aspek | Prototipe | Produksi (MAVEN) |
|-------|-----------|------------------|
| Arsitektur | Static MPA — satu `.html` per halaman | ASP.NET Core MVC + service layer |
| UI Framework | Bootstrap 5.3, Vuexy Admin Theme | Vuexy + Razor Views |
| JavaScript | jQuery, DataTables, Select2, SweetAlert2, Chart.js, Leaflet, SheetJS | Sama / setara (Chart.js 2.9 lokal) |
| Persistensi | `fprs_faktur`, `md_stok_motoris` + seed JSON | PostgreSQL: `tPenjualanFaktur`, `tKunjunganHarian`, `tStokMotorisSaldo`, `tStokMotorisMutasi` |
| Auth / Menu | Tidak ada login | KNGlobal SSO + `mMenu` / `mRoleAccess` (`TSO`, `DMS`) |
| Navigasi | `wwwroot/js/layout.js` | Menu dinamis dari KNGlobal |
| Folder kode | `Views/FPRS/Penjualan/` | `Controllers/PowerGT/...`, `Views/PowerGT/...` |

### 2.2 Pola Modul Penjualan

| Pola | Modul | Cara kelola |
|------|-------|-------------|
| View-only + cetak | Faktur / Sales Order | List → detail → print; order dari Mobile |
| Dashboard monitoring + export | Stok Motoris | KPI + chart + saldo + audit; Export Excel 2 sheet |

### 2.3 Business Flow (Swimlane)

Alur konseptual produksi: order dari Mobile → faktur terbaca di Web; stok motoris diagregasi untuk monitoring.

**Lane (urutan kiri → kanan):**

| # | Lane ID | Label | Tipe | Sumber |
|---|---------|-------|------|--------|
| 1 | L1 | Sales Lapangan (Mobile) | User | Mobile SFA canvassing |
| 2 | L2 | Sistem Man Power GT | System | Transaksi Sales Order / stok |
| 3 | L3 | Web Admin | User | Sales Manager / RSM |

```plantuml
@startuml
|Sales Lapangan Mobile|
start
:Buat order / canvassing;
:Submit faktur;
|Sistem Man Power GT|
:Simpan transaksi ke database;
:Tampilkan list faktur;
:Agregasi stok motoris;
|Web Admin|
:Buka Faktur / Stok Motoris;
:Filter region bila perlu;
:Lihat detail / cetak;
:Unduh report;
|Sistem Man Power GT|
:Export Excel;
stop
@enduml
```

Hand-off Mobile → Sistem: submit faktur menulis transaksi ke database. Hand-off Web Admin → Sistem: monitoring list/agregasi dan export Excel.

**Gambar 2.1 — Business Flow Penjualan (Web Admin)**

---
'''


def chapter_penjualan(reg: dict, all_rules: list) -> str:
    by_id = {m['id']: m for m in reg['modules'] if m.get('enabled', True)}
    br_counters: dict = {}
    lines = [
        '## 3. Modul Penjualan',
        '',
        'Bab ini mendeskripsikan modul **Faktur** dan **Stok Motoris**: dashboard list / monitoring, '
        'halaman detail (jika ada), tombol aksi, business rules, pola CRUD/akses, dan **spesifikasi kolom report**.',
        '',
    ]
    sub = 0
    for mid in PENJUALAN_ORDER:
        mod = by_id.get(mid)
        if not mod:
            continue
        sub += 1
        lines.append(module_section('3', sub, mod, br_counters, all_rules))
        report_fn = REPORT_BY_MODULE.get(mid)
        if report_fn:
            lines.append(report_fn())
    return '\n'.join(lines)


def chapter_business_rules(rules: list[tuple[str, str]]) -> str:
    lines = [
        '## 4. Aturan Bisnis (Rekap)',
        '',
        '### 4.1 Aturan dari Validasi UI Prototipe',
        '',
        'Rule ID memakai prefix `BR-PJ`. Sumber: pesan validasi / SweetAlert di HTML.',
        '',
        '| Rule ID | Aturan |',
        '|---------|--------|',
    ]
    if rules:
        for rid, rule in rules:
            lines.append(f'| {rid} | {rule} |')
    else:
        lines.append('| — | *(Tidak ada validasi UI eksplisit yang terdeteksi)* |')

    lines += [
        '',
        '### 4.2 Aturan Produksi (di luar / pelengkap prototipe)',
        '',
        '| Rule ID | Modul | Aturan |',
        '|---------|-------|--------|',
        '| BR-PR-PJ01 | Semua | Akses halaman membutuhkan `bitView` pada `mRoleAccess`; tanpa hak → HTTP 403. |',
        '| BR-PR-PJ02 | Semua | **Tidak ada create/update/delete faktur** dari Web Admin v1 — sumber order adalah Mobile SFA. |',
        '| BR-PR-PJ03 | Semua | Super Admin melihat semua region; Sales Manager nasional + filter region; RSM hanya region sendiri. |',
        '| BR-PR-PJ04 | Faktur | Export Excel mengikuti filter list + scope region user. |',
        '| BR-PR-PJ05 | Stok Motoris | Export `SalesInvoices` / `DailyVisits` mengikuti filter dashboard + scope region. |',
        '| BR-PR-PJ06 | Semua | Tidak ada approval workflow untuk monitoring penjualan Web Admin v1. |',
        '| BR-PR-PJ07 | Faktur / Stok Motoris | Skenario GT canvassing Web Admin: faktur yang dimonitor berstatus **Paid (lunas)**, pembayaran **Cash**, `decBelumDibayar = 0`. Tidak merepresentasikan hutang / unpaid / draft. |',
        '| BR-PR-PJ08 | Stok Motoris | Default filter tanggal dashboard = **30 hari terakhir**; server menerapkan fallback yang sama bila rentang kosong. |',
        '| BR-PR-PJ09 | Stok Motoris | Export Excel dibatasi maksimal **31 hari** kalender; rentang lebih lebar ditolak dengan pesan jelas. |',
        '| BR-PR-PJ10 | Stok Motoris | KPI/chart/balance memakai **agregasi SQL** (`SUM`/`COUNT`/`GROUP BY`); raw mutasi hanya untuk audit trail berpaginasi. |',
        '',
        '---',
        '',
    ]
    return '\n'.join(lines)


def chapter_rbac() -> str:
    return '''## 5. Hak Akses & RBAC

### 5.1 Prototipe vs Produksi

| Aspek | Prototipe | Produksi (MAVEN) |
|-------|-----------|------------------|
| Login | Tidak ada | KNGlobal SSO |
| Menu | Hardcoded `layout.js` | `KNGlobalDB.dbo.mMenu` |
| Role FPRS | Belum di-enforce (`role-manager.js` legacy) | Super Admin / Sales Manager / RSM |
| Enforcement data | Tidak ada | Filter query by region + `mRoleAccess` |

### 5.2 Matriks Role Target

| Role | Menu Penjualan | Cakupan data (Faktur & Stok Motoris) | Operasi |
|------|----------------|--------------------------------------|---------|
| **Super Admin** | Semua menu portal | Semua region (nasional) | Lihat, cetak, export |
| **Sales Manager** | Faktur, Stok Motoris | Semua region; dapat **filter per region** | Lihat, cetak, export |
| **RSM** | Faktur, Stok Motoris | **Hanya region user** | Lihat, cetak, export |

### 5.3 Approval

Monitoring penjualan Web Admin **tidak** memakai antrian approval. Kontrol = RBAC + scope region + audit trail transaksi di sumber Mobile/backend.

---
'''


def chapter_integration() -> str:
    return '''## 6. Data Layer & Integrasi

### 6.1 Integrasi API (Rencana Produksi)

| Item | Nilai |
|------|-------|
| Endpoint Faktur | `/api/v1/Invoice` (rencana) |
| Arah | Inbound ke Web Admin (read / list / detail / export) |
| Sumber order | Mobile SFA / canvassing lapangan |
| Stok Motoris | Service MAVEN `MotorisStockService` membaca tabel saldo/mutasi/kunjungan + agregasi faktur |

### 6.2 Persistensi Prototipe

| Key / file | Penggunaan |
|------------|------------|
| `fprs_faktur` | List/detail/print Faktur; input sheet SalesInvoices |
| `md_stok_motoris` | Snapshot dashboard Stok Motoris + visitHistory |
| `wwwroot/data/faktur.json` | Seed faktur |
| `pegawai.json`, `produk.json`, `stokis.json`, `pelanggan.json` | Master untuk generate dashboard (nama asli motoris) |

### 6.3 Persistensi Produksi (MAVEN)

| Lapisan | Teknologi / objek |
|---------|-------------------|
| DB transaksi | PostgreSQL: `tPenjualanFaktur`, `tPenjualanFakturItem`, `tKunjunganHarian`, `tStokMotorisSaldo`, `tStokMotorisMutasi` |
| Master | `mPegawai`, `mPelanggan`, `mProduk`, `mStokis`, `mChannel` |
| Menu / RBAC | SQL Server `KNGlobalDB` (`mMenu` kode `TSO` / `DMS`, `mRoleAccess`) |
| Scope region | Hook `ApplyRegionScope` + filter `txtRegion` |

Seed & index UAT skala didokumentasikan di **Bab 8**.

---
'''


def chapter_scalability() -> str:
    """Bab Skalabilitas & Tuning — deskriptif + cuplikan script 008–010."""
    return r'''## 8. Skalabilitas & Tuning Dashboard Stok Motoris

Bab ini menjelaskan mengapa dashboard perlu dituning, apa yang sudah diterapkan di **Fase A**,
bagaimana data UAT disiapkan, serta isi script SQL `008`–`010` di repository MAVEN.

### 8.1 Mengapa perlu tuning?

Dashboard Monitoring Stok Motoris menampilkan KPI, empat chart, dua DataTable, dan export Excel.
Jika setiap request **memuat seluruh baris mutasi ke memori aplikasi** lalu menghitung di C#/JS,
performa akan turun cepat seiring tumbuhnya transaksi lapangan.

| Parameter desain | Estimasi |
|------------------|----------|
| Motoris aktif | ~300 orang |
| Transaksi outbound / motoris / hari | ~30 |
| Volume mutasi nasional / hari | ~9.000 baris |
| Volume / bulan (≈26 hari kerja) | ~230.000 baris |
| Volume / tahun | ~2–3 juta baris |

Dengan beban tersebut, pendekatan “load all lalu agregasi di app” cocok hanya untuk prototipe/UAT kecil.
Untuk produksi, dashboard harus **membaca hasil agregasi dari database**, membatasi rentang tanggal,
dan memisahkan **audit detail** (paging) dari **KPI/chart** (summary).

### 8.2 Prinsip desain

> **Dashboard = baca agregat. Transaksi detail = baca raw dengan paging ketat.**

| Lapisan | Peran |
|---------|--------|
| `tStokMotorisSaldo` | Snapshot stok berjalan per motoris × SKU (tidak dihitung ulang dari seluruh history setiap buka page) |
| `tStokMotorisMutasi` | Ledger inbound/outbound — sumber audit trail & agregasi outbound per periode |
| `tKunjunganHarian` | Kunjungan + effective call |
| `tPenjualanFaktur` (+ item) | Faktur Paid/Cash untuk KPI jumlah faktur & sheet export |

### 8.3 Kebijakan data bisnis (Cash & Lunas)

Untuk skenario **GT canvassing** yang dimonitor di Web Admin:

| Field | Nilai yang dipakai |
|-------|--------------------|
| `txtStatus` | `Paid` (= lunas) |
| `txtJangkaWaktuPembayaran` | `Cash` |
| `decBelumDibayar` | `0` |

Sistem **tidak** menampilkan skenario hutang, unpaid, atau draft pada seed/monitoring modul ini.
Hal ini menyederhanakan KPI dan menjaga konsistensi UAT dengan aturan operasional lapangan.

### 8.4 Fase A — yang sudah diterapkan di MAVEN

| Kontrol | Spesifikasi |
|---------|-------------|
| Agregasi KPI / chart / balance | Dilakukan di SQL via EF (`SumAsync`, `CountAsync`, `GroupBy`) — bukan `ToList` seluruh mutasi lalu hitung di memory |
| Audit trail | Server-side paging (`Skip` / `Take`) |
| Default filter tanggal | **30 hari terakhir** (UI + fallback server) |
| Export Excel | Maksimal **31 hari**; rentang lebih lebar → HTTP 400 + pesan jelas |
| KPI faktur | Hanya menghitung status `Paid` |
| Index composite | Script `010_dashboard_indexes_faseA.sql` |
| Master UAT | Pegawai & stokis diganti data prototype (nama asli) via `008` |
| Volume UAT | Seed ~6 bulan weekday via `009` |

**Kode utama:** `MAVEN.Services/Penjualan/MotorisStockService.cs`  
**UI:** `Views/PowerGT/Dashboard/MotorisStock/Index.cshtml` + `wwwroot/js/powergt/dashboard/MotorisStock/MotorisStock.js`

### 8.5 Urutan eksekusi script UAT

Jalankan di PostgreSQL database `maven` (DBeaver / pgAdmin), **berurutan**:

| # | File | Tujuan |
|---|------|--------|
| 1 | `MAVEN.DAL/Scripts/008_reset_seed_pegawai_stokis_prototype.sql` | Reset master pegawai/stokis + hapus transaksi lama; inject data prototype |
| 2 | `MAVEN.DAL/Scripts/009_seed_6bulan_cash_lunas.sql` | Generate transaksi 6 bulan (Cash/Paid) + saldo + kunjungan |
| 3 | `MAVEN.DAL/Scripts/010_dashboard_indexes_faseA.sql` | Buat index composite untuk pola query dashboard |

Prasyarat DDL: `004_tPenjualanFaktur.sql`, `006_penjualan_kunjungan_stok_fase2.sql` sudah dijalankan.

### 8.6 Script 008 — Reset & seed master dari prototype

#### Deskripsi

Script ini memastikan environment UAT memakai **data pegawai yang sama dengan prototipe**
(`wwwroot/data/pegawai.json`) — termasuk **nama asli motoris** — serta stokis dari
`stokis.json`. Karena `pegawai.json` tidak selalu mengisi `region`/`branch`, script
mengisi wilayah secara **round-robin** dari pasangan branch–region stokis agar filter
Region/Area di dashboard tetap berfungsi.

#### Apa yang dilakukan (langkah)

1. Melepas FK salesman di `mPelanggan` (`intSalesmanID = NULL`).
2. Menghapus seluruh transaksi terkait: item faktur, faktur, mutasi, saldo, kunjungan.
3. Menghapus histori & master `mPegawai` / `mStokis`.
4. Menyisipkan ulang **84 stokis** dan **163 pegawai** (Motoris + SPG GT) dari prototype.
5. Menampilkan ringkasan `COUNT(*)` untuk verifikasi.

#### Cuplikan struktur SQL

```sql
-- 008: Reset & seed mPegawai + mStokis dari prototype (nama asli)
-- Sumber: Prototype/wwwroot/data/pegawai.json + stokis.json
BEGIN;

UPDATE "mPelanggan" SET "intSalesmanID" = NULL WHERE "intSalesmanID" IS NOT NULL;
DELETE FROM "tPenjualanFakturItem";
DELETE FROM "tPenjualanFaktur";
DELETE FROM "tStokMotorisMutasi";
DELETE FROM "tStokMotorisSaldo";
DELETE FROM "tKunjunganHarian";
DELETE FROM "mPegawaiStatusHist";
DELETE FROM "mPegawai";
DELETE FROM "mStokisStockHist";
DELETE FROM "mStokisStatusHist";
DELETE FROM "mStokis";

INSERT INTO "mStokis" (
  "txtOutletId","txtNama","txtAlamat","txtKota","txtBranch","txtRegion",
  "txtTelepon","decLat","decLng","bitActive","txtInsertedBy"
) VALUES
  -- ... 84 baris stokis prototype (nama asli) ...
  ('010211-00005127','SUGENG MAKMUR','','Medan','Medan','Region 1',
   NULL,3.5952::numeric,98.6722::numeric,true,'seed_prototype')
  /* ... */;

INSERT INTO "mPegawai" (
  "txtKode","txtNama","txtRole","txtTelepon","txtBranch","txtRegion",
  "txtKeterangan","bitActive","txtInsertedBy"
) VALUES
  -- ... 163 baris pegawai prototype ...
  ('2507000744','GALIH ANDRIAN EKA PUTRA','Motoris',NULL,
   'Medan','Region 1','SALES CANVASSING',true,'seed_prototype')
  /* ... */;

SELECT 'mPegawai' AS tbl, COUNT(*) AS n FROM "mPegawai"
UNION ALL SELECT 'mStokis', COUNT(*) FROM "mStokis";
COMMIT;
```

> **Catatan:** daftar `VALUES` lengkap ada di file script (di-generate dari JSON).
> FSD menampilkan pola & contoh representatif agar dokumen tetap terbaca.

### 8.7 Script 009 — Seed 6 bulan Cash + Lunas

#### Deskripsi

Script procedural (`DO $$ ... $$`) menghasilkan data dummy realistis untuk **stress-test Fase A**:

- Periode: **6 bulan** berakhir pada `CURRENT_DATE`.
- Hanya **hari kerja** (Senin–Jumat).
- Densitas: sekitar **8 outbound / motoris / hari kerja** (+ inbound kulakan tiap Senin + kunjungan non-efektif).
- Semua faktur: `Paid` + `Cash` + `decBelumDibayar = 0`.
- Juga mengisi: `tPenjualanFakturItem`, `tStokMotorisMutasi`, `tKunjunganHarian`, `tStokMotorisSaldo`.
- Memastikan produk umbrella & outlet Cash pendukung tersedia.

Densitas seed (~8 trx/hari) **lebih rendah** dari target produksi (~30 trx/hari) agar runtime seed tetap wajar,
tetapi volume 6 bulan sudah cukup untuk menguji agregasi SQL, index, dan filter tanggal.

#### Cuplikan inti generator

```sql
-- 009: Seed 6 bulan transaksi Cash + Lunas (Paid)
-- Prasyarat: 004, 006, 008
BEGIN;

-- Pastikan produk + channel + outlet Cash tersedia (idempotent)
-- ... INSERT mProduk / mChannel / mPelanggan CS6-xxx ...

DELETE FROM "tPenjualanFakturItem";
DELETE FROM "tPenjualanFaktur";
DELETE FROM "tStokMotorisMutasi";
DELETE FROM "tStokMotorisSaldo";
DELETE FROM "tKunjunganHarian";

DO $$
DECLARE
  d_start date := (CURRENT_DATE - INTERVAL '6 months')::date;
  d_end   date := CURRENT_DATE;
  n_out int := 8;  -- outbound per motoris per weekday
  -- ... cursor motoris, produk, pelanggan, stokis ...
BEGIN
  FOR r_motoris IN
    SELECT * FROM "mPegawai"
    WHERE "bitActive" AND lower("txtRole") = 'motoris'
  LOOP
    d := d_start;
    WHILE d <= d_end LOOP
      IF EXTRACT(ISODOW FROM d) BETWEEN 1 AND 5 THEN
        -- Senin: inbound kulakan (3 SKU)
        -- Setiap hari kerja: n_out faktur Paid/Cash + mutasi outbound + kunjungan efektif
        -- + 2 kunjungan non-efektif (EffCall = 0)
        INSERT INTO "tPenjualanFaktur" (..., "txtJangkaWaktuPembayaran","decBelumDibayar","txtStatus", ...)
        VALUES (..., 'Cash', 0, 'Paid', ...);
        -- checkout waktu: check_in + INTERVAL '12 minutes'  (hindari make_time menit > 59)
      END IF;
      d := d + 1;
    END LOOP;
    -- Snapshot saldo akhir per motoris (hingga 8 SKU)
  END LOOP;
END $$;

-- Guard: pastikan tidak ada non-lunas / non-cash pada seed
UPDATE "tPenjualanFaktur"
SET "txtStatus" = 'Paid',
    "txtJangkaWaktuPembayaran" = 'Cash',
    "decBelumDibayar" = 0
WHERE "txtInsertedBy" IN ('seed_6mo','seed_uat','seed_prototype');

-- Ringkasan verifikasi COUNT + min/max tanggal faktur
COMMIT;
```

### 8.8 Script 010 — Index composite Fase A

#### Deskripsi

Index mengikuti **pola filter dashboard** yang paling sering dipakai:
tanggal + tipe mutasi, pegawai + tanggal, umbrella, region, kunjungan efektif, dan faktur by pegawai/status.

Semua index memakai `IF NOT EXISTS` sehingga aman dijalankan berulang.

#### SQL lengkap

```sql
-- 010: Index composite untuk dashboard Stok Motoris (Fase A scalability)

CREATE INDEX IF NOT EXISTS "tStokMotorisMutasi_tanggal_tipe_idx"
  ON "tStokMotorisMutasi" ("dtTanggal", "txtTipe");

CREATE INDEX IF NOT EXISTS "tStokMotorisMutasi_pegawai_tanggal_tipe_idx"
  ON "tStokMotorisMutasi" ("intPegawaiID", "dtTanggal", "txtTipe");

CREATE INDEX IF NOT EXISTS "tStokMotorisMutasi_umbrella_tanggal_idx"
  ON "tStokMotorisMutasi" ("txtUmbrella", "dtTanggal")
  WHERE "txtUmbrella" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "tStokMotorisMutasi_region_tanggal_idx"
  ON "tStokMotorisMutasi" ("txtRegion", "dtTanggal")
  WHERE "txtRegion" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "tKunjunganHarian_pegawai_tanggal_eff_idx"
  ON "tKunjunganHarian" ("intPegawaiID", "dtTanggal", "intEffCall");

CREATE INDEX IF NOT EXISTS "tPenjualanFaktur_pegawai_tanggal_idx"
  ON "tPenjualanFaktur" ("intPegawaiID", "dtTanggalFaktur");

CREATE INDEX IF NOT EXISTS "tPenjualanFaktur_status_tanggal_idx"
  ON "tPenjualanFaktur" ("txtStatus", "dtTanggalFaktur");

CREATE INDEX IF NOT EXISTS "tStokMotorisSaldo_pegawai_umbrella_idx"
  ON "tStokMotorisSaldo" ("intPegawaiID", "txtUmbrella");

CREATE INDEX IF NOT EXISTS "mPegawai_role_active_region_idx"
  ON "mPegawai" ("txtRole", "bitActive", "txtRegion");
```

### 8.9 Fase B (roadmap — belum diimplementasi)

| Item | Tujuan |
|------|--------|
| Tabel agregat harian (`tStokMotorisAggDaily`) | KPI/chart membaca ringkasan harian, bukan raw mutasi |
| Job malam / trigger | Mengisi agregat dari mutasi & kunjungan |
| Partition bulanan | Menjaga performa tabel hot path |
| Payload JSON terpisah | `txtPayloadJson` audit detail on-demand |

### 8.10 Referensi dokumen terkait

| Dokumen | Path |
|---------|------|
| Page note prototype | `docs/web/pages/penjualan_stok_motoris.md` |
| Scalability note | `docs/web/pages/penjualan_stok_motoris_scalability.md` |
| Design spec | `docs/superpowers/specs/2026-07-17-fsd-penjualan-design.md` §13 |
| Migration MAVEN | `MAVEN/docs/fprs-penjualan-migration.md` |

---
'''


def assemble() -> str:
    os.makedirs(SOURCE_DIR, exist_ok=True)
    import extract_module_spec as ems  # noqa: E402
    ems._BTN_MANIFEST = None
    reg = load_registry()
    all_rules: list[tuple[str, str]] = []

    parts = [
        preamble(),
        chapter_penjualan(reg, all_rules),
        chapter_business_rules(all_rules),
        chapter_rbac(),
        chapter_integration(),
        chapter_erd_penjualan(),
        chapter_scalability(),
    ]
    content = '\n'.join(parts)
    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write(content)
    print(
        f'Assembled: {OUTPUT_MD} '
        f'({len(content):,} chars, {content.count(chr(10)):,} lines, {len(all_rules)} rules)'
    )
    return OUTPUT_MD


if __name__ == '__main__':
    assemble()
