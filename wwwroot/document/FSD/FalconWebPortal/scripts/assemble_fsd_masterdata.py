#!/usr/bin/env python3
"""
Assemble FSD Data Master (Web Admin Falcon FPRS) — subset "Data Master" saja.

Menghasilkan source/FSD_Falcon_Web_MasterData_v1.0.md dari preamble (cover +
Document Approval standar FSD Generator Engine) + fragmen per-modul yang
di-extract langsung dari HTML (extract_module_spec.module_section).

Modul dalam lingkup: Produk, Pelanggan, Channel, Pegawai, Stokis, Limit, Pajak, Alasan.
"""
from __future__ import annotations

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SOURCE_DIR = os.path.join(WORKSPACE_DIR, 'source')
OUTPUT_MD = os.path.join(SOURCE_DIR, 'FSD_Falcon_Web_MasterData_v1.0.md')

sys.path.insert(0, SCRIPT_DIR)
from extract_module_spec import (  # noqa: E402
    MASTER_DATA_ORDER,
    load_registry,
    module_section,
)
from maven_spec import (  # noqa: E402
    MAVEN_MAPPING,
    chapter_erd,
)

TANGGAL = '12 Agustus 2026'

LIMIT_VALIDATION_SECTION = '''
#### 3.6.7 Sumber Data Jabatan & Type Jabatan (Master Data API)

Pada halaman **Create / Detail** (form Header), dropdown **Jabatan** dan **Type Jabatan** bersumber dari **Master Data API** endpoint **`/api/v1/Position`** (master jabatan / posisi).

| Field UI | Sumber API (rencana produksi) | Persistensi lokal Limit |
|----------|-------------------------------|-------------------------|
| Nama | Input lokal (wajib, unik global) | Disimpan di `mLimitTargetHarian.txtNama` |
| Jabatan | `/api/v1/Position` → `mJabatan.txtJabatanName` (mis. MD, Motoris) | Disimpan di `mLimitTargetHarian.txtJabatan` |
| Type Jabatan | `/api/v1/Position` → tipe jabatan terkait (mis. MD Reguler, Motoris Reguler) | Disimpan di `mLimitTargetHarian.txtTypeJabatan` |

**UI prototipe:**

- Banner info di atas form Header menjelaskan sumber API.
- Tooltip (`title`) pada label & kontrol: `Source : Master Data API /api/v1/Position | …` — pola sama seperti modul Produk/Alasan.
- Placeholder opsi: `-- Pilih (Master Data API) --`. Di prototipe opsi masih seed lokal; produksi wajib LOV live dari API.

**Catatan desain:** LOV selalu dari API agar selaras master organisasi; header Limit menyimpan **snapshot teks** jabatan/type agar histori versi tetap terbaca meskipun master Position berubah kemudian.

#### 3.6.8 Narasi Validasi & Alur Versi

Modul **Limit** mengelola target kunjungan harian per **Jabatan + Type Jabatan**, dengan **Nama** header wajib & unik global. Create membuat header + versi pertama; **Update selalu append versi baru** (append-only) ke History — versi lama tidak di-overwrite.

**Alur singkat:** isi header (Create) / form versi → klik Save/Update → validasi field → (Update) cek overlap periode versi aktif → simpan atau tampilkan dialog penyelesaian bentrok.

**Validasi field (SweetAlert Peringatan):**

| Rule ID | Kondisi | Tampilan |
|---------|---------|----------|
| BR-MD12 | Nama Limit kosong | (Swal: Nama Limit wajib diisi) |
| BR-MD13 | Jabatan / Type Jabatan kosong | ![Validasi jabatan wajib](screenshots/ss_51_limit_val_jabatan_wajib.png) |
| BR-MD14 | Angka atau periode kosong / &lt; 0 | ![Validasi field wajib](screenshots/ss_52_limit_val_field_wajib.png) |
| BR-MD15 | Maximal Harian &lt; Minimal Harian | ![Validasi max &lt; min](screenshots/ss_53_limit_val_max_lt_min.png) |
| BR-MD16 | Tanggal mulai &lt; hari ini (backdate) | ![Validasi backdate](screenshots/ss_54_limit_val_backdate.png) |
| BR-MD17 | Tanggal selesai &lt; tanggal mulai | ![Validasi selesai &lt; mulai](screenshots/ss_55_limit_val_selesai_lt_mulai.png) |

**Validasi unik & periode:**

| Rule ID | Kondisi | Tampilan |
|---------|---------|----------|
| BR-MD18a | Create/Update: Nama Limit sudah dipakai (unik global) | (Swal Duplikat Nama) |
| BR-MD18 | Create: pasangan Jabatan + Type sudah ada | ![Validasi duplikat](screenshots/ss_56_limit_val_duplikat.png) |
| BR-MD22 | Update: periode versi baru bentrok dengan versi aktif | ![Validasi periode bentrok](screenshots/ss_57_limit_val_periode_bentrok.png) |

Pada dialog **Periode bentrok**, pengguna memilih:

1. **Tutup versi aktif lebih awal** — `tanggalSelesai` versi lama digeser ke sehari sebelum mulai versi baru, lalu versi baru di-append.
2. **Geser mulai versi baru** — sistem mengusulkan tanggal mulai = sehari setelah selesai versi aktif (jika masih valid vs hari ini & tanggal selesai).
3. **Batal** — tidak menyimpan.

**History (view-only):** menampilkan form readonly + panel daftar versi untuk header terpilih.

![Master Data — Limit — History](screenshots/ss_58_master_limit_history.png)

**Pemakaian di dashboard Mobile:** target kunjungan = `minimalHarian` dari versi Limit yang **aktif pada tanggal** filter, untuk jabatan yang dipetakan dari role user (MD → MD/MD Reguler; selain itu → Motoris/Motoris Reguler). Transaksi visit **tidak** menyimpan FK Limit; nilai target di-resolve saat baca KPI.
'''

# Document Approval — standar Man Power GT / SHP
DOCUMENT_APPROVAL = [
    ('Muhammad Rafi', 'SHP Channel & Customer Development'),
    ('Silvester Mario Nian Destrada', 'SHP Channel & Customer Development'),
    ('Aldira Rahmania', 'SHP Channel & Customer Development'),
    ('Ageng Kurniawan Sugianto', 'IT Product'),
    ('Albet', 'IT Product'),
]


def preamble() -> str:
    approval_rows = '\n'.join(
        f'| {name} | {title} |  |  |' for name, title in DOCUMENT_APPROVAL
    )
    return f'''# FUNCTIONAL SPECIFICATION DOCUMENT (FSD)
## Modul: Man Power GT — Data Master (Web Admin)
### Sistem: Man Power GT
### Versi Dokumen: 1.10

---

| Atribut | Keterangan |
|---------|------------|
| **Nama Dokumen** | FSD Modul Data Master — Web Admin Man Power GT |
| **Versi** | 1.10 |
| **Tanggal** | {TANGGAL} |
| **Divisi** | IT / Business – Man Power GT |
| **Status** | Draft |
| **Dibuat oleh** | Tim IT – Man Power GT |

---

## Riwayat Revisi

| Versi | Tanggal | Diubah Oleh | Keterangan |
|---------|-------------|-------------|------------|
| **1.10** | **{TANGGAL}** | **Tim IT** | Channel: hierarki **Channel → Type Customer → Account**; tab Manage + Mapping (simulasi Master Data) |
| **1.9** | **10 Agustus 2026** | **Tim IT** | Limit: field **Nama** wajib & unik global (`txtNama`); kolom list + input Header |
| **1.8** | **7 Agustus 2026** | **Tim IT** | Channel: **view-only** (sumber API `/api/v1/Channel`); hapus Tambah/Edit di UI + FSD |
| **1.7** | **6 Agustus 2026** | **Tim IT** | Limit: sumber LOV Jabatan/Type dari API `/api/v1/Position` (tooltip + narasi FSD) |
| **1.6** | **6 Agustus 2026** | **Tim IT** | Limit: screenshot + narasi validasi (field, duplikat, periode bentrok) + History |
| **1.5** | **6 Agustus 2026** | **Tim IT** | ERD + DDL **Limit** (`mLimitTargetHarian` / `mLimitTargetHarianVer`); script `012_mLimitTargetHarian.sql` |
| **1.4** | **4 Agustus 2026** | **Tim IT** | Swimlane Bab 2 diganti ke **PlantUML** kolom role (standar FSD Engine) |
| **1.3** | **4 Agustus 2026** | **Tim IT** | Rename **Man Power GT**; tambah modul **Limit**; screenshot ulang 8 modul |
| **1.2** | **10 Juli 2026** | **Tim IT** | Perkaya business flow, RBAC/approval, sumber data & API; rapikan ERD |
| **1.1** | **9 Juli 2026** | **Tim IT** | Tambah arsitektur MAVEN, mapping UI→database, ERD lengkap |
| **1.0** | **8 Juli 2026** | **Tim IT** | Initial draft – modul Data Master Web Admin |

---

## Persetujuan Dokumen (Document Approval)

| Full Name | Job Title | Signature | Signature Date |
|-----------|-----------|-----------|----------------|
{approval_rows}

---

## 1. Pendahuluan

### 1.1 Latar Belakang

**Man Power GT** (*Man Power General Trade*) adalah sistem internal PT Kalbe
Nutritionals untuk mengelola tenaga lapangan General Trade (motoris / canvasser),
administrasi data master terkait, monitoring penjualan lapangan, dan pelacakan
kunjungan sales. Dokumen ini memfokuskan lingkup pada **modul Data Master** Web Admin
(`Views/FPRS/MasterData/`) — kumpulan halaman referensi yang menjadi fondasi transaksi.

Prototipe Web Portal berupa *high-fidelity interactive prototype* berbasis HTML
statis (MPA) bertema Vuexy/Bootstrap yang menggunakan **localStorage** dan file
JSON seed di `wwwroot/data/` sebagai lapisan persistensi sisi klien, mensimulasikan
alur kerja admin sebelum integrasi penuh ke Master Data API Kalbe dan backend MAVEN.

### 1.2 Tujuan Dokumen

1. Mendeskripsikan fungsionalitas **per halaman dan per komponen UI** modul Data Master.
2. Menjadi acuan pengembangan backend/API dan UAT untuk data referensi FPRS.
3. Mendokumentasikan business rules (UI + produksi), pola CRUD, sumber data, integrasi API, RBAC, dan data layer.
4. Menyelaraskan format dokumentasi dengan standar **FSD Generator Engine** (Kalbe Nutritionals).

### 1.3 Ruang Lingkup

| Dalam lingkup | Di luar lingkup |
|---------------|-----------------|
| Modul Data Master Web (`Views/FPRS/MasterData/`) | Modul Penjualan, Kunjungan, Dashboard |
| Produk, Pelanggan, Channel, Pegawai, Stokis, Limit, Pajak, Alasan | Mobile SFA (`Views/Mobile/`, Flutter APK) — kecuali sebagai **sumber data** Pelanggan |
| Persistensi prototipe (localStorage + JSON seed) | Modul DOFS MAVEN yang sudah ada |
| Desain database produksi MAVEN (PostgreSQL + EF Core) | Workflow approval multi-level (tidak berlaku untuk Data Master v1) |
| Mapping UI → tabel/kolom MAVEN & skrip DDL | — |
| Target RBAC produksi (KNGlobal `mMenu` / `mRoleAccess`) | — |

### 1.4 Stakeholder

| Peran | Tim/Divisi | Keterlibatan |
|-------|------------|--------------|
| Admin Master Data | IT / Operations | CRUD & sinkronisasi data referensi |
| Supervisor Sales | Sales | Validasi data outlet & pegawai (read) |
| Developer | IT | Implementasi API & UI produksi (MAVEN) |
| Business Analyst | PDV / Sales | Validasi alur bisnis & sumber data |
| IT Security / Access Admin | IT | Konfigurasi role access KNGlobal |

---

## 2. Arsitektur & Alur Data Master

### 2.1 Ringkasan Teknis

| Aspek | Prototipe | Produksi (MAVEN) |
|-------|-----------|------------------|
| Arsitektur | Static MPA — satu `.html` per halaman | ASP.NET Core MVC + service layer |
| UI Framework | Bootstrap 5.3, Vuexy Admin Theme | Vuexy + Razor Views |
| JavaScript | jQuery, DataTables, Select2, SweetAlert2 | Sama (server-side DataTable) |
| Persistensi | `localStorage` + seed `wwwroot/data/*.json` | PostgreSQL via `CentralContext` (EF Core) |
| Auth / Menu | Tidak ada login | KNGlobal SSO + `mMenu` / `mRoleAccess` |
| Navigasi | `wwwroot/js/layout.js` | Menu dinamis dari KNGlobal |
| Branding | Kalbe hijau `#005d41`, font Kalbe Geometric | Sama |

### 2.2 Pola Pengelolaan Data Master

Modul Data Master memakai **empat pola** pengelolaan data:

| Pola | Modul | Cara Kelola | Sumber kebenaran (produksi) |
|------|-------|-------------|------------------------------|
| Form (add/edit) | Produk | Halaman detail fleksibel + LOV SKU | Katalog SKU dari Master Data API; harga/pajak/status di DB FPRS |
| Modal CRUD | Pajak, Alasan | Modal di dalam Index | Tabel lokal MAVEN (`mPajak`, `mAlasan`) |
| Upload-only (CSV + history) | Pegawai, Stokis | Download/Upload CSV, status disinkronkan | File CSV sebagai input; hasil di `mPegawai` / `mStokis` + tabel riwayat |
| View-only (sumber mobile) | Pelanggan | List + detail read-only | Mobile SFA → `mPelanggan` |
| Hierarki + mapping (simulasi MD) | Channel | Detail tabs Manage + Mapping | Channel → Type Customer → Account; triple mapping; prototype localStorage |
| Form + versi (append-only) | Limit | Header + versi periode | LOV jabatan dari API Position; persist `mLimitTargetHarian` / Ver |

### 2.3 Business Flow (Swimlane)

Alur berikut menggambarkan pengelolaan Data Master **saat menggunakan database produksi** (MAVEN / PostgreSQL), bukan localStorage prototipe.

**Lane (urutan kiri → kanan):**

| # | Lane ID | Label | Tipe | Sumber |
|---|---------|-------|------|--------|
| 1 | L1 | Admin Master Data | User | RBAC Web Admin |
| 2 | L2 | Sistem Man Power GT | System | Controllers PowerGT Master Data |
| 3 | L3 | Master Data API / Mobile SFA | External | LOV Produk + sync outlet |

```plantuml
@startuml
|Admin Master Data|
start
:Buka modul Data Master;
|Sistem Man Power GT|
:Baca data dari database;
:Tampilkan daftar;
|Master Data API / Mobile SFA|
:Sumber LOV Produk;
:Data outlet dari mobile;
|Admin Master Data|
:Isi form / modal / upload;
|Sistem Man Power GT|
:Validasi via Client Side;
:Simpan ke database;
|Master Data API / Mobile SFA|
:Sinkronisasi API;
|Admin Master Data|
:Tinjau data;
stop
@enduml
```

Hand-off Admin → Sistem: setiap operasi form/modal/upload dibaca dan disimpan ke database. Hand-off Sistem ↔ API/Mobile: LOV Produk dan data outlet mensuplai form; hasil simpan dapat disinkronkan ke API.

### 2.4 Ringkasan Alur per Pola (Produksi)

| Pola | Trigger | Validasi utama | Hasil | Approval |
|------|---------|----------------|-------|----------|
| Form Produk | Create / Edit | Kode dari LOV API; harga beli > 0; kode unik | Insert/update `mProduk` | Tidak ada — langsung simpan |
| Modal Pajak/Alasan | Tambah / Ubah (/ Hapus) | Field wajib; unik nama/kode; Pajak cek FK produk sebelum hapus | Persist ke tabel terkait | Tidak ada |
| CSV Pegawai/Stokis | Upload file | Header dikenali; baris wajib; Stokis: GPS unik | Upsert Active; absen di file → Inactive + hist | Tidak ada |
| Channel | Manage / Mapping | TypeCus unik/Channel; Account unik; triple unik | Persist simulasi MD (Channel/TypeCus/Account/mapping) | Tidak ada |
| Pelanggan | Buka list/detail | — (read-only) | Tampil dari `mPelanggan` | N/A |
| Limit | Create header / append versi | Nama wajib+unik global; Jabatan+type unik; Max≥Min; no backdate; overlap dialog | `mLimitTargetHarian` + Ver | Tidak ada |

**Catatan approval:** modul Data Master **tidak** memakai workflow approval multi-level. Perubahan langsung tersimpan jika user punya `bitEdit` (atau hak upload untuk Pegawai/Stokis). Audit trail: `txtInsertedBy` / `txtUpdatedBy` / `dtInserted` / `dtUpdated`.

'''



def chapter_master_data(reg: dict, all_rules: list) -> str:
    by_id = {m['id']: m for m in reg['modules'] if m.get('enabled', True)}
    br_counters: dict = {}
    lines = [
        '## 3. Modul Data Master',
        '',
        'Bab ini mendeskripsikan setiap modul Data Master: kolom dashboard list (DataTable), '
        'field form/modal/detail, tombol aksi, business rules (hasil ekstraksi validasi UI), '
        'dan pola CRUD. Konten field/kolom/validasi diambil langsung dari file HTML sumber.',
        '',
    ]
    sub = 0
    for mid in MASTER_DATA_ORDER:
        mod = by_id.get(mid)
        if not mod:
            continue
        sub += 1
        lines.append(module_section('3', sub, mod, br_counters, all_rules))
        mapping = MAVEN_MAPPING.get(mid)
        if mapping:
            lines.append(mapping)
        if mid == 'master-limit-target-harian':
            lines.append(LIMIT_VALIDATION_SECTION)
    return '\n'.join(lines)


def chapter_business_rules(rules: list[tuple[str, str]]) -> str:
    lines = [
        '## 4. Aturan Bisnis (Rekap)',
        '',
        'Bab ini memisahkan aturan yang **terdeteksi dari validasi UI prototipe** '
        'dengan aturan **produksi** yang wajib diimplementasikan di MAVEN '
        '(meski belum tampak di prototipe).',
        '',
        '### 4.1 Aturan dari Validasi UI Prototipe',
        '',
        'Rule ID memakai prefix `BR-MD`. Sumber: pesan validasi / SweetAlert di HTML.',
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
        '### 4.2 Aturan Produksi (di luar prototipe)',
        '',
        'Aturan berikut **wajib** di backend MAVEN / kebijakan operasional, '
        'meskipun prototipe hanya mensimulasikan sebagian.',
        '',
        '| Rule ID | Modul | Aturan |',
        '|---------|-------|--------|',
        '| BR-PR01 | Semua | Akses halaman membutuhkan `bitView` pada `mRoleAccess` untuk `txtMenuCode` terkait; tanpa hak → HTTP 403. |',
        '| BR-PR02 | Semua | Create/Update/Delete/Upload membutuhkan `bitEdit` (atau `bitDelete` untuk hapus); audit `txtInsertedBy` / `txtUpdatedBy` wajib terisi dari user login. |',
        '| BR-PR03 | Semua | **Tidak ada approval workflow** untuk Data Master v1 — simpan langsung setelah validasi lolos. |',
        '| BR-PR04 | Produk | Identitas SKU (kode/nama/umbrella/brand) bersumber Master Data API; aplikasi hanya boleh mengubah harga beli, skema pajak, unit default PCS, dan status. |',
        '| BR-PR05 | Produk | Harga jual = f(harga beli, persentase pajak); tidak diinput manual. |',
        '| BR-PR06 | Pajak | Hapus ditolak jika `mProduk.intPajakID` masih mereferensikan record tersebut. |',
        '| BR-PR07 | Channel | Hierarki Channel → Type Customer → Account; mapping triple unik; prototype simulasi Master Data (CRUD Web Admin). |',
        '| BR-PR08 | Pelanggan | Web Admin **read-only**; create/update hanya dari Mobile SFA / job sync (fase integrasi). |',
        '| BR-PR09 | Pegawai | Upload CSV: baris di file → Active (insert/update); NIK yang tidak ada di file → Inactive + catat `mPegawaiStatusHist`. |',
        '| BR-PR10 | Stokis | Upload CSV: sama pola Active/Inactive; `lat`/`lng` wajib dan unik antar outlet; catat `mStokisStatusHist`. |',
        '| BR-PR11 | Alasan | `txtTipe` terbatas enum: Return, Kunjungan, Order, Lainnya. |',
        '| BR-PR12 | Limit | `txtNama` wajib & unik global; header unik (`txtJabatan`+`txtTypeJabatan`); Update = append `mLimitTargetHarianVer`; Max ≥ Min; no backdate; bentrok periode wajib dialog tutup-versi / geser-mulai. |',
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
| Menu | Hardcoded `layout.js` | `KNGlobalDB.dbo.mMenu` (`intProgramID` FPRS) |
| Enforcement | Tidak ada | `CheckRoleAccessMenu(txtMenuCode)` → `mRoleAccess` |
| Permission flag | — | `bitView`, `bitEdit`, `bitDelete`, `bitSuperuser` |

### 5.2 Mapping Menu Code (KNGlobal)

Konstanta di aplikasi **harus** match `mMenu.txtMenuCode` (bukan `txtMenuName`):

| Modul | `txtMenuCode` | `txtMenuName` | Route MAVEN | Hak minimum list | Hak tulis |
|-------|---------------|--------------|-------------|------------------|-----------|
| Produk | `MPR` | Product | `/MasterData/Product` | `bitView` | `bitEdit` |
| Pelanggan | `MPL` | Customer | `/MasterData/Customer` | `bitView` | — (read-only) |
| Channel | `MCH` | Channel | `/MasterData/Channel` | `bitView` | `bitEdit` |
| Pegawai | `MPE` | Employee | `/MasterData/Pegawai` | `bitView` | `bitEdit` (upload) |
| Pajak | `MTX` | Tax | `/MasterData/Tax` | `bitView` | `bitEdit` / `bitDelete` |
| Alasan | `MRS` | Reason | `/MasterData/Reason` | `bitView` | `bitEdit` / `bitDelete` |
| Stokis | `MST` | Stokis | `/MasterData/Stokis` | `bitView` | `bitEdit` (upload) |

Parent menu Data Master: `intParentID = 3936`, `intModuleID = 2749` (sama untuk semua child di seed awal).

### 5.3 Matriks Role Target

| Modul | Admin Master Data | Supervisor Sales | Keterangan |
|-------|-------------------|------------------|------------|
| Produk | Create / Read / Update | Read | Hapus tidak tersedia |
| Pelanggan | Read | Read | View-only; sumber mobile |
| Channel | Create / Read / Update | Read | Hierarki + mapping Type Customer / Account |
| Pegawai | Upload / Read | Read | Sinkronisasi CSV |
| Stokis | Upload / Read | Read | Sinkronisasi CSV |
| Pajak | Create / Read / Update / Delete | Read | Cek FK produk sebelum hapus |
| Alasan | Create / Read / Update / Delete | Read | Kode operasional |

### 5.4 Approval

Data Master **tidak** masuk antrian approval (berbeda dengan modul transaksi DOFS / Task Approval).
Kontrol perubahan = RBAC + audit trail kolom insert/update. Jika di masa depan diperlukan
*maker-checker*, itu diluar scope FSD v1.2 dan harus ditambahkan sebagai change request terpisah.

---
'''


def chapter_integration(reg: dict) -> str:
    return '''## 6. Data Layer & Integrasi

### 6.1 Integrasi Master Data API (Rencana Produksi)

| Item | Nilai |
|------|-------|
| Portal referensi (dev) | `https://newmasterdatadev.kalbenutritionals.web.id/` |
| Pola konsumsi di MAVEN | Service External (`clsMasterData_*API`) → LOV / metadata |
| Auth API | Mengikuti standar Master Data Kalbe (token/header sesuai environment) |

**Pemakaian per endpoint:**

| Endpoint | Modul FPRS | Arah | Digunakan untuk |
|----------|------------|------|-----------------|
| `GET /api/v1/Sku` | Produk | Inbound LOV | Pilih kode produk; isi nama, umbrella, brand (read-only di form) |
| `GET /api/v1/Channel` | Channel | Referensi / sync (rencana) | Prototype: simulasi lokal hierarki + mapping; produksi boleh sync |
| `GET /api/v1/Position` | Limit | Inbound LOV | Dropdown **Jabatan** & **Type Jabatan** pada form Create/Detail |
| `/api/v1/Customer` | Pelanggan | Inbound sync (fase 4b) | Isi/update `mPelanggan` dari mobile/SFA — **belum** di v1 web write |
| `/api/v1/Tax` | Pajak | Opsional sync | Referensi skema pajak; v1 boleh fully lokal di `mPajak` |
| `/api/v1/Reason` | Alasan | Opsional sync | Referensi alasan; v1 boleh fully lokal di `mAlasan` |
| — | Pegawai, Stokis | Lokal / CSV | Tidak bergantung Master Data API |

### 6.2 Persistensi Produksi MAVEN

| Lapisan | Teknologi |
|---------|-----------|
| DB | PostgreSQL (Central DB) |
| ORM | EF Core `CentralContext` |
| Identitas record di URL | `txtGuid` (UUID) |
| Menu / RBAC | SQL Server `KNGlobalDB` (`mMenu`, `mRoleAccess`) |

Skrip DDL: `MAVEN.DAL/Scripts/001_*.sql`, `002_*.sql`, `012_mLimitTargetHarian.sql`. Seed UAT opsional: `003_seed_masterdata_uat.sql`.

---
'''


def assemble() -> str:
    os.makedirs(SOURCE_DIR, exist_ok=True)
    import extract_module_spec as ems  # noqa: E402
    ems._BTN_MANIFEST = None
    reg = load_registry()
    all_rules: list[tuple[str, str]] = []

    md_chapter = chapter_master_data(reg, all_rules)

    parts = [
        preamble(),
        md_chapter,
        chapter_business_rules(all_rules),
        chapter_rbac(),
        chapter_integration(reg),
        chapter_erd(),
    ]
    content = '\n'.join(parts)
    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Assembled: {OUTPUT_MD} ({len(content):,} chars, {content.count(chr(10)):,} lines, {len(all_rules)} rules)')
    return OUTPUT_MD


if __name__ == '__main__':
    assemble()
