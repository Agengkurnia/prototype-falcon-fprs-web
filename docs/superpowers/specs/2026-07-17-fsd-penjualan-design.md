# Design: FSD Modul Penjualan — Falcon FPRS Web Admin

**Tanggal:** 17 Juli 2026  
**Status:** Disetujui untuk implementasi  
**Deliverable:** `FSD_Falcon_Web_Penjualan_v1.0.md` / `.docx`

---

## 1. Tujuan

Menghasilkan dokumen FSD terpisah untuk modul **Penjualan** Web Admin Falcon FPRS, mengikuti pola pipeline **Data Master** (capture screenshot → assemble markdown → build DOCX via FSD Generator Engine), dengan lingkup hanya **Faktur** dan **Stok Motoris**.

---

## 2. Lingkup

### Dalam lingkup

| Modul | Path UI | Peran di Web Admin |
|-------|---------|-------------------|
| Penjualan — Faktur | `Views/FPRS/Penjualan/Faktur/` (`index`, `detail`, `print`) | Monitoring & cetak — **read-only** (order dari Mobile) |
| Penjualan — Stok Motoris | `Views/FPRS/Penjualan/StokMotoris/index.html` | Dashboard monitoring — **read-only** + export Excel |

### Di luar lingkup

- **Canvassing** (tidak ada HTML aktif, tidak di sidebar, tidak di registry FSD Penjualan)
- Modul Master Data, Kunjungan, Mobile SFA (hanya disebut sebagai sumber data / integrasi)
- Workflow approval multi-level transaksi
- Bab **Sumber Data (Source of Truth)** (sama seperti Master Data v1.2 terbaru — dihapus)

---

## 3. Pendekatan teknis (mirror Master Data)

| Tahap | Script baru (rencana) | Referensi |
|-------|----------------------|-----------|
| Capture | `scripts/capture_penjualan_full.py` | `capture_masterdata_full.py` |
| Assemble | `scripts/assemble_fsd_penjualan.py` | `assemble_fsd_masterdata.py` |
| Build | `scripts/build_penjualan_fsd.py` | `build_masterdata_fsd.py` |
| Extract | Perluasan `extract_module_spec.py` | `module_section`, `PENJUALAN_ORDER` |

**Prasyarat capture:** server statis prototipe `http://127.0.0.1:5502` (root repo Prototype).

**Order modul:** `['penjualan-faktur', 'penjualan-stok-motoris']` — **tanpa** `canvassing`.

---

## 4. Perbaikan registry & metadata (wajib sebelum generate)

| Field | Modul | Nilai saat ini (salah/stale) | Target |
|-------|-------|------------------------------|--------|
| `formPath` | penjualan-faktur | `.../Faktur/add.html` (tidak ada) | `Views/FPRS/Penjualan/Faktur/detail.html` |
| `storageKey` | penjualan-faktur | `md_faktur` | `fprs_faktur` (sesuai runtime HTML) |
| `screenshots[1]` | penjualan-faktur | `ss_39_faktur_add.png` | `ss_39_faktur_detail.png` (nama file diselaraskan di registry + `SS_BY_MODULE`) |
| `PENJUALAN_ORDER` | extractor | termasuk `canvassing` | hanya 2 modul di atas |
| `MODULE_FORM_META` | penjualan-faktur | narasi create/monitor | view-only Web; sumber order **Mobile SFA** |
| `MODULE_ENRICHMENT` | kedua modul | kosong | prose overview per modul (seperti Master Data) |
| `crud_table` | penjualan-faktur | generic page CRUD | Read + cetak; tidak Create/Update/Delete di Web |
| `crud_table` | penjualan-stok-motoris | sudah read-only override | pertahankan |

---

## 5. Screenshot & tombol aksi

### Faktur

| Shot | File (existing naming) | Cara capture |
|------|------------------------|--------------|
| Dashboard list | `ss_38_faktur_index.png` | `index.html` full-page setelah DataTable siap |
| Detail | `ss_39_faktur_detail.png` | navigasi dari baris list → `detail.html` (bukan `add.html`) |
| Tombol | `ss_btn_*` | Tambah **tidak** ada; capture Lihat/Detail, Cetak, Kembali sesuai UI |

`print.html` **tidak** wajib sebagai screenshot FSD v1 (cetak didokumentasikan sebagai aksi dari detail).

### Stok Motoris

| Shot | File | Cara capture |
|------|------|--------------|
| Dashboard | `ss_40_stok_motoris_index.png` | satu full-page setelah `layoutReady` + data generated |
| Tombol | Export Excel, Refresh | `capture_action_buttons` / manifest |

Popup SweetAlert (audit, detail motoris) **tidak** wajib full-page shot di v1.

---

## 6. Struktur dokumen FSD

| Bab | Isi |
|-----|-----|
| Cover + Document Approval | Template Kalbe / SHP (sama pola Master Data) |
| **1. Pendahuluan** | Latar, tujuan, ruang lingkup, stakeholder |
| **2. Arsitektur & Alur** | MPA + localStorage/JSON prototipe; alur Mobile → faktur; stok = agregasi master + `fprs_faktur` |
| **3. Modul Penjualan** | 3.1 Faktur · 3.2 Stok Motoris (`module_section` dari HTML) + **spesifikasi kolom report** per modul |
| **4. Business Rules** | Rekap `BR-PJ*` |
| **5. Hak Akses & RBAC** | Lihat §7 |
| **6. Data Layer & Integrasi** | API rencana `/api/v1/Invoice`; key prototipe; **tanpa** § Sumber Data |
| **7. ERD** | Opsional ringan / konseptual di v1 jika belum ada DDL penjualan di MAVEN |

Report Excel/CSV didokumentasikan **di dalam bab modul** (bukan bab terpisah), agar dekat dengan tombol Export/Ekspor.

Versi dokumen awal: **1.0** (initial Penjualan subset).

---

## 7. RBAC (produksi — target)

Prototipe saat ini **belum** mengimplementasikan role FPRS (`role-manager.js` masih role legacy). FSD mendokumentasikan **kebijakan produksi** berikut.

| Role | Menu Penjualan | Cakupan data (Faktur & Stok Motoris) |
|------|----------------|--------------------------------------|
| **Super Admin** | Semua menu portal | Semua region (nasional) |
| **Sales Manager** | Faktur, Stok Motoris (view) | **Semua region**; dapat **filter per region** |
| **RSM** (Regional Sales Manager) | Faktur, Stok Motoris (view) | **Hanya region user** |

**Hak operasi Web:** lihat, cetak faktur, export dashboard — **tidak** create/edit/hapus faktur dari Web Admin.

**Enforcement (rencana MAVEN):** KNGlobal `mMenu` / `mRoleAccess` + scope region pada query (RSM); Super Admin bypass scope.

**Prototipe:** dokumentasi + optional BR; filter UI per role dapat fase berikutnya.

---

## 8. Isi ekstraksi UI per modul

### Faktur

- Tabel kolom dashboard list (`#tblFaktur`) + keterangan dari `title="Source : ..."` jika ada
- Tabel field detail (read-only) dari `detail.html`
- Validasi minimal (id tidak ditemukan, dll.)
- Business rules dari Swal / JS inline
- Sub-bagian **Report / Ekspor** (§9.1)

### Stok Motoris

- Kolom grid utama (balance / audit) dari `<thead>`
- Narasi panel: KPI cards, flow stok, chart, peta, drill-down region
- Tombol Refresh / Export Excel
- Sub-bagian **Report Excel** (§9.2) — wajib: tabel kolom per sheet
- Tidak memaksa tabel form 7-kolom untuk field CRUD

---

## 9. Spesifikasi Report (Excel / CSV)

FSD Penjualan **wajib** mendokumentasikan setiap report unduhan: nama file, sheet, filter yang memengaruhi isi, dan **daftar kolom + arti**.

Sumber kebenaran kolom di prototipe: `Views/FPRS/Penjualan/StokMotoris/index.html` (`SALES_INVOICE_HEADERS`, `DAILY_VISIT_HEADERS`, `buildSalesInvoiceExportRows`, `buildDailyVisitExportRows`).

### 9.1 Faktur — tombol Ekspor

| Aspek | Status prototipe | Target FSD |
|-------|------------------|------------|
| Tombol | `#btnEkspor` di index | Ya |
| Output | **Mock** (Swal sukses saja; file belum digenerate) | Dokumentasikan sebagai **rencana produksi** |
| Format rencana | Excel (`.xlsx`) | Satu sheet, baris = 1 faktur (header level) |
| Filter | Mengikuti filter aktif di list (tanggal, pelanggan, sales, status) + scope RBAC region | Sama |

**Kolom rencana export Faktur** (selaras kolom dashboard list, tanpa AKSI):

| # | Nama kolom (rencana) | Keterangan |
|---|----------------------|------------|
| 1 | Tanggal Faktur | Tanggal dokumen |
| 2 | Nomor Faktur | ID / nomor faktur |
| 3 | Kode Pelanggan | Kode outlet |
| 4 | Nama Pelanggan | Nama outlet |
| 5 | Sales | Nama / kode sales |
| 6 | Jatuh Tempo | Tanggal jatuh tempo |
| 7 | Jumlah Tagihan | Total tagihan |
| 8 | Belum Dibayar | Sisa piutang |
| 9 | Status | Paid / Unpaid / Draft / dll. |

Jika produksi nanti memakai **baris item** (line-level) seperti sheet SalesInvoices Stok Motoris, itu change request terpisah; v1 FSD mengikuti **header-level** sesuai list.

### 9.2 Stok Motoris — Export Excel (implementasi nyata)

| Aspek | Nilai |
|-------|-------|
| Tombol | `Export Excel` → `exportToExcel()` |
| File | `StokMotoris_Export_YYYY-MM-DD.xlsx` |
| Library | SheetJS (`XLSX`) |
| Scope baris | Motoris hasil `getFilteredMotoris()` (filter UI + scope region RBAC) |
| Sheet 1 | `SalesInvoices` — 1 baris per **item faktur** (line) |
| Sheet 2 | `DailyVisits` — 1 baris per **kunjungan** |

#### Sheet `SalesInvoices` (29 kolom)

| # | Kolom | Keterangan |
|---|-------|------------|
| 1 | Date | Tanggal faktur (`YYYY-MM-DD`) |
| 2 | SalesInvoiceNo | Nomor / ID faktur |
| 3 | InvoiceStatus | Status faktur (Paid, Unpaid, …) |
| 4 | InvoiceDocType | Tipe dokumen; prototipe: `MobileCanvass` |
| 5 | InvoiceGenerateFrom | Asal generate (mis. `Canvassing` / tipe faktur) |
| 6 | IsInvoiceReturn | Boolean retur; prototipe: `false` |
| 7 | EmployeeCode | Kode motoris / sales |
| 8 | EmployeeName | Nama motoris / sales |
| 9 | CustomerCode | Kode pelanggan |
| 10 | CustomerName | Nama pelanggan |
| 11 | CustomerAddress | Alamat pelanggan |
| 12 | OrderLatitude | Latitude outlet (master pelanggan) |
| 13 | OrderLongitude | Longitude outlet |
| 14 | WarehouseCode | Kode gudang (diturunkan dari nama gudang) |
| 15 | WarehouseName | Nama gudang |
| 16 | PaymentTermName | Jangka waktu pembayaran |
| 17 | ProductCode | Kode produk (line) |
| 18 | ProductName | Nama produk |
| 19 | QuantityL | Qty unit besar (Karton); sering kosong di prototipe |
| 20 | UnitL | Satuan L — `KARTON` |
| 21 | QuantityM | Qty unit menengah; sering kosong |
| 22 | UnitM | Satuan M — `RENCENG` |
| 23 | QuantityS | Qty unit kecil (PCS) — diisi dari `item.qty` |
| 24 | UnitS | Satuan S — `PCS` / `item.satuan` |
| 25 | TotalQuantity | Total qty (prototipe = QuantityS) |
| 26 | SellPrice | Harga jual per unit |
| 27 | TaxCode | Kode pajak line (`item.pajak` / `NoPPN`) |
| 28 | LineTotal | `qty × SellPrice − diskon` |
| 29 | InvoiceNotes | Catatan header faktur |

Filter yang memengaruhi sheet: rentang tanggal, umbrella brand, outlet motoris terfilter.

#### Sheet `DailyVisits` (28 kolom)

| # | Kolom | Keterangan |
|---|-------|------------|
| 1 | EmployeeCode | Kode motoris |
| 2 | EmployeeName | Nama motoris |
| 3 | Role | Peran; prototipe: `Canvasser` |
| 4 | Date | Tanggal kunjungan |
| 5 | Planned | Flag planned; prototipe sering kosong |
| 6 | UnPlaned | Flag unplanned; prototipe: `1` |
| 7 | Visited | Flag dikunjungi; prototipe: `1` |
| 8 | CustomerCode | Kode outlet |
| 9 | CustomerName | Nama outlet |
| 10 | CustomerAddress | Alamat outlet |
| 11 | CustomerLatitude | Lat master outlet |
| 12 | CustomerLongitude | Lng master outlet |
| 13 | CheckInTime | Waktu check-in (ISO) |
| 14 | CheckOutTime | Waktu check-out (ISO) |
| 15 | Duration | Durasi `HH:MM:SS` |
| 16 | Distance in Meter Check in | Jarak GPS check-in ke outlet (m) |
| 17 | CheckInLatitude | Lat check-in |
| 18 | CheckInLongitude | Lng check-in |
| 19 | CheckOutLatitude | Lat check-out |
| 20 | CheckOutLongitude | Lng check-out |
| 21 | Distance in Meter Check out | Jarak GPS check-out ke outlet (m) |
| 22 | Pseq | Urutan planned; prototipe sering kosong |
| 23 | Aseq | Urutan aktual kunjungan |
| 24 | TotalSales | Nilai penjualan kunjungan (0 jika tanpa transaksi) |
| 25 | Description | Ringkas aktivitas / produk / “tanpa transaksi” |
| 26 | Unvisited | Flag tidak dikunjungi; prototipe: `0` |
| 27 | TargetCall | Target call; prototipe: `1` |
| 28 | EffCall | Effective call (`1` jika ada transaksi) |

### 9.3 Implementasi di pipeline FSD

- Assemble: di bawah masing-masing modul (atau bab Report terpisah), sisipkan tabel kolom di atas (boleh digenerate dari konstanta header di HTML / helper di `assemble_fsd_penjualan.py`).
- Tidak mengandalkan ekstraksi otomatis full dari `thead` UI untuk report (header Excel ≠ kolom grid UI).
- Saat Faktur mock diganti file nyata, update §9.1 agar match implementasi.

---

## 10. Data & integrasi (ringkas)

| Key / file | Penggunaan |
|------------|------------|
| `fprs_faktur` | List/detail/print Faktur; input Stok Motoris + sheet SalesInvoices |
| `md_stok_motoris` | Snapshot generated dashboard + visitHistory → DailyVisits |
| `wwwroot/data/faktur.json` | Seed faktur |
| `pegawai.json`, `produk.json`, `stokis.json`, `pelanggan.json` | Master untuk generate Stok Motoris |
| `/api/v1/Invoice` | Endpoint rencana produksi (Faktur) |

---

## 11. Kriteria selesai (acceptance)

1. Registry dan `PENJUALAN_ORDER` selaras dengan UI aktual (tanpa canvassing / add.html).
2. Screenshot 2 modul + tombol relevan ter-regenerate di `FalconWebPortal/screenshots/`.
3. `source/FSD_Falcon_Web_Penjualan_v1.0.md` ter-assemble dengan bab RBAC §7 **dan** spesifikasi kolom report §9.
4. `output/FSD_Falcon_Web_Penjualan_v1.0.docx` build sukses + Project Log (jika path tersedia).
5. Tidak ada referensi Canvassing atau form Tambah Faktur di Web sebagai fitur aktif.
6. Sheet `SalesInvoices` (29 kolom) dan `DailyVisits` (28 kolom) tercantum lengkap di FSD.
7. Kebijakan data GT canvassing: faktur monitoring **Paid (lunas) + Cash**; tidak ada hutang/unpaid/draft pada skenario Web Admin ini.
8. Catatan skalabilitas dashboard Stok Motoris (Fase A) terdokumentasi (§13 + page note prototype).

---

## 12. Langkah berikutnya

Setelah review spec ini disetujui: buat **implementation plan** (`writing-plans`) — implement script trio, patch registry/extractor, capture, assemble (termasuk tabel report), build.

---

## 13. Skalabilitas Dashboard Stok Motoris (MAVEN)

### 13.1 Estimasi beban

| Parameter | Nilai desain |
|-----------|----------------|
| Motoris aktif | ~300 |
| Transaksi outbound / motoris / hari | ~30 |
| Mutasi / hari (nasional) | ~9.000 |
| Mutasi / tahun | ~2–3 juta |

### 13.2 Asumsi bisnis data

- Semua faktur yang ditampilkan / di-seed untuk modul ini: status **Paid (lunas)**, pembayaran **Cash**, `decBelumDibayar = 0`.
- Master pegawai memakai data prototype `pegawai.json` (nama asli); region/branch diisi dari mapping stokis bila kosong di JSON.

### 13.3 Fase A (wajib sebelum volume produksi penuh)

| Kontrol | Spesifikasi |
|---------|-------------|
| Agregasi KPI / chart / balance | Dilakukan di **SQL** (`SUM`/`COUNT`/`GROUP BY`), bukan materialize seluruh mutasi ke app memory |
| Audit trail | Server-side paging (`Skip`/`Take`) |
| Default filter tanggal | 30 hari terakhir |
| Export Excel | Maksimal **31 hari** per unduhan; rentang lebih lebar ditolak dengan pesan jelas |
| Index | Composite pada `(dtTanggal, txtTipe)`, `(intPegawaiID, dtTanggal, txtTipe)`, kunjungan, faktur |

Script seed UAT skala: `MAVEN.DAL/Scripts/008_reset_seed_pegawai_stokis_prototype.sql`, `009_seed_6bulan_cash_lunas.sql`, `010_dashboard_indexes_faseA.sql`.

### 13.4 Fase B (roadmap)

- Tabel agregat harian per pegawai; job malam mengisi dari mutasi/kunjungan.
- Dashboard KPI/chart membaca agregat; raw mutasi hanya untuk drill-down audit.
- Partition bulanan + payload JSON detail on-demand.

Detail operasional & path file: `docs/web/pages/penjualan_stok_motoris_scalability.md`.
