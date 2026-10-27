#!/usr/bin/env python3
"""
Assemble FSD Data Master v2.0 (Web Admin Falcon FPRS).

Tidak mengubah pipeline v1.17. Mapping/ERD dari maven_gt_spec.py (MAVEN.DAL GT).
"""
from __future__ import annotations

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SOURCE_DIR = os.path.join(WORKSPACE_DIR, 'source')
OUTPUT_MD = os.path.join(SOURCE_DIR, 'FSD_Falcon_Web_MasterData_v2.0.md')

sys.path.insert(0, SCRIPT_DIR)
from extract_module_spec import (  # noqa: E402
    MASTER_DATA_ORDER,
    load_registry,
    module_section,
)
from maven_gt_spec import (  # noqa: E402
    MAVEN_ARCHITECTURE,
    MAVEN_MAPPING,
    chapter_erd,
)

TANGGAL = '17 September 2026'

LIMIT_VALIDATION_SECTION = '''
#### 3.6.7 Sumber Data Jabatan & Type Jabatan (Master Data API)

Pada halaman **Create / Detail** (form Header), dropdown **Jabatan** dan **Type Jabatan** bersumber dari **Master Data API** endpoint **`/api/v1/Position`**.

| Field UI | Sumber API (rencana produksi) | Persistensi DAL |
|----------|-------------------------------|-----------------|
| Nama | Input lokal (wajib, unik global) | `mGtLimitVisit.txtLimitName` |
| Jabatan | `/api/v1/Position` → nama jabatan | `mGtLimitVisit.txtJabatan` + `intJabatanID` + `txtJabatanGuid` |
| Type Jabatan | Tipe jabatan terkait Position | `mGtLimitVisitJabatanType.txtJabatanType` (+ guid) |

**UI prototipe:** banner info + tooltip `Source : Master Data API /api/v1/Position`. Produksi wajib LOV live.

#### 3.6.8 Narasi Validasi & Alur Versi

Modul **Limit** mengelola target kunjungan harian. Create membuat header + versi pertama; **Update selalu append versi baru** ke `mGtLimitVisitVersion` (lalu baris type di `mGtLimitVisitJabatanType`). Versi lama tidak di-overwrite.

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
| BR-MD18a | Nama Limit sudah dipakai | (Swal Duplikat Nama) |
| BR-MD18 | Create: pasangan Jabatan + Type sudah ada | ![Validasi duplikat](screenshots/ss_56_limit_val_duplikat.png) |
| BR-MD22 | Update: periode versi baru bentrok | ![Validasi periode bentrok](screenshots/ss_57_limit_val_periode_bentrok.png) |

Pada dialog **Periode bentrok**, pengguna memilih tutup versi aktif lebih awal, geser mulai versi baru, atau batal.

**History (view-only):** form readonly + daftar versi.

![Master Data — Limit — History](screenshots/ss_58_master_limit_history.png)
'''

CHANNEL_VALIDATION_SECTION = '''
#### 3.3.5 Narasi Validasi (Master Data Portal)

Validasi di modul **Channel** ditampilkan sebagai dialog **SweetAlert** saat simpan master atau mapping gagal. Di prototipe, Type Customer dan Account bersifat master global; triple Channel · Type Customer · Account harus unik.

> **MAVEN.DAL saat ini** hanya punya `mGtChannel`. Type Customer / Account / mapping **belum** ada di DAL — jangan dianggap sudah terbit di produksi.

**Validasi master (modal Channel / Type Customer / Account):**

| Rule ID | Kondisi | Tampilan |
|---------|---------|----------|
| BR-MD08 | Nama Channel kosong | ![Validasi nama Channel wajib](screenshots/ss_60_channel_val_nama_channel_wajib.png) |
| BR-MD09 | Nama Channel sudah dipakai | ![Validasi nama Channel duplikat](screenshots/ss_61_channel_val_nama_channel_duplikat.png) |
| BR-MD10 | Nama Type Customer kosong | ![Validasi Type Customer wajib](screenshots/ss_62_channel_val_typecus_wajib.png) |
| BR-MD11 | Nama Type Customer sudah dipakai | ![Validasi Type Customer duplikat](screenshots/ss_63_channel_val_typecus_duplikat.png) |
| BR-MD12 | Kode Account kosong | ![Validasi Account wajib](screenshots/ss_64_channel_val_account_wajib.png) |
| BR-MD13 | Kode Account sudah dipakai | ![Validasi Account duplikat](screenshots/ss_65_channel_val_account_duplikat.png) |

**Validasi mapping (tab Mapping):**

| Rule ID | Kondisi | Tampilan |
|---------|---------|----------|
| BR-MD14 | Belum ada Channel aktif | ![Validasi tidak ada Channel aktif](screenshots/ss_66_channel_val_no_channel_aktif.png) |
| BR-MD15 | Belum ada Type Customer aktif | ![Validasi tidak ada Type Customer aktif](screenshots/ss_67_channel_val_no_typecus_aktif.png) |
| BR-MD16 | Belum ada Account aktif | ![Validasi tidak ada Account aktif](screenshots/ss_68_channel_val_no_account_aktif.png) |
| BR-MD17 | Channel / Type Customer / Account belum dipilih | ![Validasi mapping wajib dipilih](screenshots/ss_69_channel_val_mapping_wajib.png) |
| BR-MD18 | Triple mapping sudah ada | ![Validasi mapping duplikat](screenshots/ss_70_channel_val_mapping_duplikat.png) |
'''

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
### Versi Dokumen: 2.0

---

| Atribut | Keterangan |
|---------|------------|
| **Nama Dokumen** | FSD Modul Data Master — Web Admin Man Power GT |
| **Versi** | 2.0 |
| **Tanggal** | {TANGGAL} |
| **Divisi** | IT / Business – Man Power GT |
| **Status** | Draft |
| **Dibuat oleh** | Tim IT – Man Power GT |

---

## Riwayat Revisi

| Versi | Tanggal | Diubah Oleh | Keterangan |
|---------|-------------|-------------|------------|
| **2.0** | **{TANGGAL}** | **Tim IT** | Tulis ulang: ERD/mapping dari MAVEN.DAL GT (`mGt*`, `mPajak`, `mGtReason`); screenshot di-capture ulang |
| 1.17 | 12 Agustus 2026 | Tim IT | FSD v1.17 (pipeline terpisah, tidak diubah) |

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
(`Views/FPRS/MasterData/` dan **Master Data Portal** `Views/MasterDataPortal/` untuk Channel).

Prototipe Web Portal berupa *high-fidelity interactive prototype* berbasis HTML
statis (MPA) bertema Vuexy/Bootstrap yang menggunakan **localStorage** dan file
JSON seed di `wwwroot/data/` sebagai lapisan persistensi sisi klien, sebelum
integrasi penuh ke Master Data API Kalbe dan backend MAVEN.

### 1.2 Tujuan Dokumen

1. Mendeskripsikan fungsionalitas **per halaman dan per komponen UI** modul Data Master.
2. Menjadi acuan pengembangan backend/API dan UAT untuk data referensi FPRS.
3. Mendokumentasikan business rules, pola CRUD, sumber data, integrasi API, RBAC, dan data layer.
4. Menyelaraskan skema data dengan **tabel MAVEN.DAL yang sudah ada** (bukan nama rencana lama).
5. Mengikuti standar **FSD Generator Engine** (Kalbe Nutritionals).

### 1.3 Ruang Lingkup

| Dalam lingkup | Di luar lingkup |
|---------------|-----------------|
| Delapan modul di `Views/FPRS/MasterData/` + portal Channel | Penjualan, Kunjungan, Dashboard |
| Produk, Pelanggan, Channel, Pegawai, Stokis, Limit, Pajak, Alasan | Mobile SFA (kecuali sebagai sumber data Pelanggan) |
| Persistensi prototipe (localStorage + JSON seed) | Mengubah skema MAVEN.DAL |
| Mapping UI → tabel/kolom DAL GT | Workflow approval multi-level |
| Target RBAC produksi (KNGlobal) | FSD v1.17 (tetap sebagai arsip) |

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
| Persistensi | `localStorage` + seed `wwwroot/data/*.json` | PostgreSQL via `MavenContext` (EF Core) |
| Auth / Menu | Tidak ada login | KNGlobal SSO + `mMenu` / `mRoleAccess` |
| Navigasi | `wwwroot/js/layout.js` | Menu dinamis dari KNGlobal |
| Branding | Kalbe hijau `#005d41`, font Kalbe Geometric | Sama |

### 2.2 Pola Pengelolaan Data Master

| Pola | Modul | Cara Kelola | Tabel DAL |
|------|-------|-------------|-----------|
| Form (add/edit) | Produk | Halaman detail + LOV SKU + Param Category | `mGtProduk` (denormalisasi brand/pajak/unit) |
| Modal CRUD | Pajak, Alasan | Modal di Index | `mPajak`, `mGtReason` |
| Upload-only (CSV + history) | Pegawai, Stokis | Download/Upload CSV | `mGtPegawai` + `mGtPegawaiHistory`; `mGtStokis` + history |
| View-only (sumber mobile) | Pelanggan | List + detail read-only | `mGtPelanggan` |
| Dual-surface (Portal CRUD + MP GT view-only) | Channel | Portal Mapping/Manage; FPRS list | DAL: hanya `mGtChannel`. TypeCus/Account belum di DAL |
| Form + versi (append-only) | Limit | Header + versi + type jabatan | `mGtLimitVisit` → Version → JabatanType |

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
| Form Produk | Create / Edit | Kode dari LOV API; harga beli > 0; kode unik | Insert/update `mGtProduk` | Tidak ada |
| Modal Pajak/Alasan | Tambah / Ubah (/ Hapus) | Field wajib; unik nama/kode | Persist `mPajak` / `mGtReason` | Tidak ada |
| CSV Pegawai/Stokis | Upload file | Header dikenali; baris wajib; Stokis GPS unik | Upsert Active; absen di file → Inactive + hist | Tidak ada |
| Channel | Portal Mapping/Manage; FPRS view-only | Prototipe: TypeCus/Account/triple unik | Produksi v2: persist `mGtChannel` | Tidak ada |
| Pelanggan | Buka list/detail | — (read-only) | Tampil dari `mGtPelanggan` | N/A |
| Limit | Create header / append versi | Nama unik; Max≥Min; no backdate; overlap dialog | `mGtLimitVisit` + Version + JabatanType | Tidak ada |

**Catatan approval:** modul Data Master **tidak** memakai workflow approval multi-level.

''' + MAVEN_ARCHITECTURE


def chapter_master_data(reg: dict, all_rules: list) -> str:
    by_id = {m['id']: m for m in reg['modules'] if m.get('enabled', True)}
    br_counters: dict = {}
    lines = [
        '## 3. Modul Data Master',
        '',
        'Bab ini mendeskripsikan setiap modul Data Master: kolom dashboard list, '
        'field form/modal/detail, tombol aksi, business rules, dan pola CRUD. '
        'Konten field/kolom/validasi diambil dari file HTML sumber. '
        'Mapping database mengikuti MAVEN.DAL GT.',
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
        if mid == 'master-channel':
            lines.append(CHANNEL_VALIDATION_SECTION)
    return '\n'.join(lines)


def chapter_business_rules(rules: list[tuple[str, str]]) -> str:
    lines = [
        '## 4. Aturan Bisnis (Rekap)',
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
        '| Rule ID | Modul | Aturan |',
        '|---------|-------|--------|',
        '| BR-PR01 | Semua | Akses halaman membutuhkan `bitView` pada `mRoleAccess`; tanpa hak → HTTP 403. |',
        '| BR-PR02 | Semua | Create/Update/Delete/Upload membutuhkan `bitEdit` (atau `bitDelete` untuk hapus); audit insert/update wajib terisi dari user login. |',
        '| BR-PR03 | Semua | **Tidak ada approval workflow** untuk Data Master — simpan langsung setelah validasi lolos. |',
        '| BR-PR04 | Produk | Identitas SKU bersumber Master Data API; category dari Param `PRODUCT_CATEGORY_GT`; persist ke `mGtProduk` (brand/pajak/unit denormalisasi). |',
        '| BR-PR05 | Produk | Harga jual = f(harga beli, `decPajakID` persen); tidak diinput manual. |',
        '| BR-PR06 | Pajak | `mGtProduk` **tidak** FK ke `mPajak`. Hapus pajak tidak dicek lewat constraint DB; cek pemakaian `txtNamaPajak` / tarif di aplikasi bila diperlukan. |',
        '| BR-PR07 | Channel | Produksi DAL: hanya `mGtChannel`. Type Customer / Account / mapping triple **belum ada di MAVEN.DAL** (perilaku portal = prototipe). |',
        '| BR-PR08 | Pelanggan | Web Admin **read-only**; create/update hanya dari Mobile SFA / job sync. |',
        '| BR-PR09 | Pegawai | Upload CSV: baris di file → Active; NIK absen → Inactive + `mGtPegawaiHistory`. Identitas = `txtNik`. |',
        '| BR-PR10 | Stokis | Upload CSV: pola Active/Inactive; GPS wajib unik; catat `mGtStokisHistory`. |',
        '| BR-PR11 | Alasan | `mGtReason.txtTipe` terbatas: Return, Kunjungan, Order, Lainnya. |',
        '| BR-PR12 | Limit | `txtLimitName` unik; Update = append `mGtLimitVisitVersion` + baris `mGtLimitVisitJabatanType`; Max ≥ Min; no backdate; bentrok periode wajib dialog. |',
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
| Enforcement | Tidak ada | `CheckRoleAccessMenu(txtMenuCode)` → `mRoleAccess` |
| Permission flag | — | `bitView`, `bitEdit`, `bitDelete`, `bitSuperuser` |

### 5.2 Mapping Menu Code (KNGlobal)

| Modul | `txtMenuCode` | `txtMenuName` | Route MAVEN | Hak minimum list | Hak tulis |
|-------|---------------|--------------|-------------|------------------|-----------|
| Produk | `MPR` | Product | `/MasterData/Product` | `bitView` | `bitEdit` |
| Pelanggan | `MPL` | Customer | `/MasterData/Customer` | `bitView` | — (read-only) |
| Channel | `MCH` | Channel | `/MasterData/Channel` | `bitView` | `bitEdit` |
| Pegawai | `MPE` | Employee | `/MasterData/Pegawai` | `bitView` | `bitEdit` (upload) |
| Pajak | `MTX` | Tax | `/MasterData/Tax` | `bitView` | `bitEdit` / `bitDelete` |
| Alasan | `MRS` | Reason | `/MasterData/Reason` | `bitView` | `bitEdit` / `bitDelete` |
| Stokis | `MST` | Stokis | `/MasterData/Stokis` | `bitView` | `bitEdit` (upload) |

### 5.3 Matriks Role Target

| Modul | Admin Master Data | Supervisor Sales | Keterangan |
|-------|-------------------|------------------|------------|
| Produk | Create / Read / Update | Read | Hapus tidak tersedia |
| Pelanggan | Read | Read | View-only; sumber mobile |
| Channel | Create / Read / Update | Read | DAL: `mGtChannel` |
| Pegawai | Upload / Read | Read | Sinkronisasi CSV |
| Stokis | Upload / Read | Read | Sinkronisasi CSV |
| Pajak | Create / Read / Update / Delete | Read | Tidak ada FK dari `mGtProduk` |
| Alasan | Create / Read / Update / Delete | Read | `mGtReason` |
| Limit | Create / Read / Update | Read | Append versi |

### 5.4 Approval

Data Master **tidak** masuk antrian approval. Kontrol perubahan = RBAC + audit trail.

---
'''


def chapter_integration() -> str:
    return '''## 6. Data Layer & Integrasi

### 6.1 Integrasi Master Data API (Rencana Produksi)

| Item | Nilai |
|------|-------|
| Portal referensi (dev) | `https://newmasterdatadev.kalbenutritionals.web.id/` |
| Pola konsumsi di MAVEN | Service External → LOV / metadata |
| Auth API | Mengikuti standar Master Data Kalbe |

| Endpoint | Modul FPRS | Arah | Digunakan untuk |
|----------|------------|------|-----------------|
| `GET /api/v1/Sku` | Produk | Inbound LOV | Pilih kode produk; isi nama, umbrella, brand |
| `GET /api/v1/Param?paramCode=PRODUCT_CATEGORY_GT` | Produk | Inbound LOV | Dropdown Product Category |
| `GET /api/v1/Channel` | Channel | Referensi / sync | Produksi: `mGtChannel`; portal TypeCus/Account belum di DAL |
| `GET /api/v1/Position` | Limit | Inbound LOV | Jabatan & Type Jabatan |
| `/api/v1/Customer` | Pelanggan | Inbound sync | `mGtPelanggan` dari mobile — web tidak write |
| `/api/v1/Tax` | Pajak | Opsional sync | Referensi; v2 lokal di `mPajak` |
| `/api/v1/Reason` | Alasan | Opsional sync | Referensi; v2 lokal di `mGtReason` |
| — | Pegawai, Stokis | Lokal / CSV | Tidak bergantung Master Data API |

### 6.2 Persistensi Produksi MAVEN

| Lapisan | Teknologi |
|---------|-----------|
| DB | PostgreSQL (Central DB) |
| ORM | EF Core `MavenContext` |
| Identitas record di URL | `txtGuid` (UUID) |
| Menu / RBAC | SQL Server `KNGlobalDB` (`mMenu`, `mRoleAccess`) |

Mapping fisik: `MAVEN.DAL/ModelBuilders/GT/Master/` dan `MPajakModelBuilder.cs`.

---
'''


def chapter_appendix() -> str:
    return '''## 8. Appendix

### 8.1 Path HTML sumber

| Modul | Path |
|-------|------|
| Produk | `Views/FPRS/MasterData/Produk/` |
| Pelanggan | `Views/FPRS/MasterData/Pelanggan/` |
| Channel | `Views/FPRS/MasterData/Channel/index.html` + `Views/MasterDataPortal/Channel/` |
| Pegawai | `Views/FPRS/MasterData/Pegawai/` |
| Stokis | `Views/FPRS/MasterData/Stokis/` |
| Limit | `Views/FPRS/MasterData/LimitTargetHarian/` |
| Pajak | `Views/FPRS/MasterData/Pajak/index.html` |
| Alasan | `Views/FPRS/MasterData/Alasan/index.html` |

### 8.2 Prototipe vs produksi

| Aspek | Prototipe | Produksi |
|-------|-----------|----------|
| Persistensi | localStorage + JSON seed | PostgreSQL `mGt*` / `mPajak` |
| Channel child | Type Customer / Account lokal | Belum ada di MAVEN.DAL |
| Produk lookup | Nama di form | Kolom teks di `mGtProduk` |

### 8.3 Dokumen terkait

- Spec desain: `docs/superpowers/specs/2026-09-17-fsd-masterdata-v2-design.md`
- FSD v1.17 (arsip): `source/FSD_Falcon_Web_MasterData_v1.0.md`
- Standar: `D:\\Work\\Source\\FSD Generator Engine\\docs\\STANDARD-FSD-GENERATION.md`

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
        chapter_master_data(reg, all_rules),
        chapter_business_rules(all_rules),
        chapter_rbac(),
        chapter_integration(),
        chapter_erd(),
        chapter_appendix(),
    ]
    content = '\n'.join(parts)
    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Assembled: {OUTPUT_MD} ({len(content):,} chars, {content.count(chr(10)):,} lines, {len(all_rules)} rules)')
    return OUTPUT_MD


if __name__ == '__main__':
    assemble()
