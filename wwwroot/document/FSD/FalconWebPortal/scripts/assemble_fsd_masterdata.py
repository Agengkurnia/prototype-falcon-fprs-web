#!/usr/bin/env python3
"""
Assemble FSD Data Master (Web Admin Falcon FPRS) — subset "Data Master" saja.

Menghasilkan source/FSD_Falcon_Web_MasterData_v1.0.md dari preamble (cover +
Document Approval standar FSD Generator Engine) + fragmen per-modul yang
di-extract langsung dari HTML (extract_module_spec.module_section).

Modul dalam lingkup: Produk, Pelanggan, Channel, Pegawai, Stokis, Pajak, Alasan.
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
    appendix_maven_extra,
    chapter_erd,
)

TANGGAL = '9 Juli 2026'

# Document Approval — standar Falcon FPRS / SHP (lihat fsd_cover_merge.DEFAULT_DOCUMENT_APPROVAL)
DOCUMENT_APPROVAL = [
    ('Muhammad Rafi', 'SHP Channel & Customer Development'),
    ('Silvester Mario Nian Destrada', 'SHP Channel & Customer Development'),
    ('Ageng Kurniawan Sugianto', 'IT Product'),
    ('Albet', 'IT Product'),
]


def preamble() -> str:
    approval_rows = '\n'.join(
        f'| {name} | {title} |  |  |' for name, title in DOCUMENT_APPROVAL
    )
    return f'''# FUNCTIONAL SPECIFICATION DOCUMENT (FSD)
## Modul: Falcon FPRS — Data Master (Web Admin)
### Sistem: Falcon FPRS
### Versi Dokumen: 1.1

---

| Atribut | Keterangan |
|---------|------------|
| **Nama Dokumen** | FSD Modul Data Master — Web Admin Falcon FPRS |
| **Versi** | 1.1 |
| **Tanggal** | {TANGGAL} |
| **Divisi** | IT / Business – Falcon FPRS |
| **Status** | Draft |
| **Dibuat oleh** | Tim IT – Falcon FPRS |

---

## Riwayat Revisi

| Versi | Tanggal | Diubah Oleh | Keterangan |
|---------|-------------|-------------|------------|
| **1.1** | **{TANGGAL}** | **Tim IT** | Tambah arsitektur produksi MAVEN, mapping UI→database, ERD lengkap, DDL PostgreSQL, tooltip prototipe |
| **1.0** | **8 Juli 2026** | **Tim IT** | Initial draft – modul Data Master Web Admin FPRS |

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
kunjungan sales. Dokumen ini memfokuskan lingkup pada **modul Data Master** pada
Web Admin (`Views/FPRS/MasterData/`) — kumpulan halaman referensi yang menjadi
fondasi seluruh transaksi FPRS.

Prototipe Web Portal berupa *high-fidelity interactive prototype* berbasis HTML
statis (MPA) bertema Vuexy/Bootstrap yang menggunakan **localStorage** dan file
JSON seed di `wwwroot/data/` sebagai lapisan persistensi sisi klien, mensimulasikan
alur kerja admin sebelum integrasi penuh ke Master Data API Kalbe.

### 1.2 Tujuan Dokumen

1. Mendeskripsikan fungsionalitas **per halaman dan per komponen UI** modul Data Master.
2. Menjadi acuan pengembangan backend/API dan UAT untuk data referensi FPRS.
3. Mendokumentasikan business rules, pola CRUD, integrasi API rencana, dan data layer lokal.
4. Menyelaraskan format dokumentasi dengan standar **FSD Generator Engine** (Kalbe Nutritionals).

### 1.3 Ruang Lingkup

| Dalam lingkup | Di luar lingkup |
|---------------|-----------------|
| Modul Data Master Web (`Views/FPRS/MasterData/`) | Modul Penjualan, Kunjungan, Dashboard |
| Produk, Pelanggan, Channel, Pegawai, Stokis, Pajak, Alasan | Mobile SFA (`Views/Mobile/`, Flutter APK) |
| Persistensi prototipe (localStorage + JSON seed) | Modul DOFS MAVEN yang sudah ada |
| Desain database produksi MAVEN (PostgreSQL + EF Core) | — |
| Mapping UI → tabel/kolom MAVEN & skrip DDL | — |

### 1.4 Stakeholder

| Peran | Tim/Divisi | Keterlibatan |
|-------|------------|--------------|
| Admin Master Data | IT / Operations | CRUD & sinkronisasi data referensi |
| Supervisor Sales | Sales | Validasi data outlet & pegawai |
| Developer | IT | Implementasi API & UI produksi |
| Business Analyst | PDV / Sales | Validasi alur bisnis |

---

## 2. Arsitektur & Alur Data Master

### 2.1 Ringkasan Teknis

| Aspek | Standar |
|-------|---------|
| Arsitektur | Static MPA — satu `.html` per halaman |
| UI Framework | Bootstrap 5.3, Vuexy Admin Theme |
| JavaScript | jQuery 3.7, DataTables, Select2, SweetAlert2 |
| State | `localStorage` + seed `wwwroot/data/*.json` (versi seed `*_seed_ver`) |
| Navigasi | `wwwroot/js/layout.js` — sidebar & navbar injection |
| Branding | Kalbe hijau `#005d41`, font Kalbe Geometric |

### 2.2 Pola Pengelolaan Data Master

Modul Data Master memakai **tiga pola** pengelolaan data:

| Pola | Modul | Cara Kelola |
|------|-------|-------------|
| Form (add/edit) | Produk | Halaman `detail.html` fleksibel + LOV Master Data API |
| Modal CRUD | Channel, Pajak, Alasan | Modal `#modalForm` di dalam `index.html` |
| Upload-only (CSV + history) | Pegawai, Stokis | Download/Upload CSV, status disinkronkan, riwayat dicatat |
| View-only (sumber mobile) | Pelanggan | Ditampilkan dari data aplikasi mobile |

### 2.3 Business Flow Data Master (Swimlane)

**Lane (urutan kiri → kanan):**

| # | Lane ID | Label | Tipe |
|---|---------|-------|------|
| 1 | L1 | Admin Master Data | User |
| 2 | L2 | Sistem Falcon Web | System |
| 3 | L3 | Master Data API / Mobile SFA | External |

```mermaid
flowchart LR
  subgraph L1[Admin Master Data]
    A1[Buka modul Data Master]
    A2[Isi form / modal / upload CSV]
    A3[Tinjau detail & riwayat]
  end
  subgraph L2[Sistem Falcon Web]
    B1[Load seed JSON ke localStorage]
    B2[Tampilkan dashboard list DataTable]
    B3[Validasi client-side Swal]
    B4[Simpan ke localStorage]
  end
  subgraph L3[Master Data API / Mobile SFA]
    C1[Sumber data Produk - LOV]
    C2[Input outlet dari mobile]
    C3[Sync rencana REST /api/v1]
  end
  A1 --> B1 --> B2 --> A2 --> B3 --> B4 --> A3
  C1 -.-> A2
  C2 -.-> B2
  B4 -.-> C3
```

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
    return '\n'.join(lines)


def chapter_business_rules(rules: list[tuple[str, str]]) -> str:
    lines = [
        '## 4. Aturan Bisnis (Rekap)',
        '',
        'Rekap aturan bisnis modul Data Master. Rule ID memakai prefix `BR-MD`.',
        '',
        '| Rule ID | Aturan |',
        '|---------|--------|',
    ]
    if rules:
        for rid, rule in rules:
            lines.append(f'| {rid} | {rule} |')
    else:
        lines.append('| — | *(Tidak ada validasi UI eksplisit yang terdeteksi)* |')
    lines += ['', '---', '']
    return '\n'.join(lines)


def chapter_rbac() -> str:
    return '''## 5. Hak Akses & RBAC

Pada prototipe, seluruh halaman Data Master dapat diakses tanpa login web admin;
enforcement RBAC penuh di server **belum** diimplementasikan. Matriks berikut adalah
target kebijakan produksi:

| Modul | Admin Master Data | Supervisor Sales | Keterangan |
|-------|-------------------|------------------|------------|
| Produk | Create/Read/Update | Read | Hapus tidak tersedia |
| Pelanggan | Read | Read | View-only, sumber mobile |
| Channel | Create/Read/Update | Read | Kelola via bit Active |
| Pegawai | Upload/Read | Read | Sinkronisasi CSV |
| Stokis | Upload/Read | Read | Sinkronisasi CSV |
| Pajak | Create/Read/Update/Delete | Read | Konfigurasi finance |
| Alasan | Create/Read/Update/Delete | Read | Kode operasional |

---
'''


def chapter_integration(reg: dict) -> str:
    by_id = {m['id']: m for m in reg['modules'] if m.get('enabled', True)}
    rows = []
    for mid in MASTER_DATA_ORDER:
        m = by_id.get(mid)
        if not m:
            continue
        api = m.get('apiEndpoint') or '— (dikelola lokal)'
        sk = m.get('storageKey') or '—'
        rows.append(f'| {m["label"]} | `{api}` | `{sk}` |')
    return '''## 6. Data Layer & Integrasi

### 6.1 Pola Persistensi Prototipe

1. Saat halaman dimuat, cek `localStorage` dengan key modul (mis. `md_produk`).
2. Bandingkan penanda versi seed (`*_seed_ver`); bila berbeda/kosong, muat ulang JSON seed dari `wwwroot/data/`.
3. Operasi CRUD / Upload menulis kembali ke `localStorage` (tanpa server round-trip).

### 6.2 Integrasi Master Data API (Rencana)

Portal Kalbe Master Data dev: `https://newmasterdatadev.kalbenutritionals.web.id/`.
Modul dengan endpoint di bawah direncanakan tersinkron ke REST API produksi; pada
prototipe, endpoint dicantumkan sebagai referensi. Modul **Channel**, **Pegawai**,
dan **Stokis** dikelola lokal (tanpa Master Data API), sedangkan **Pelanggan**
bersumber dari aplikasi mobile.

### 6.3 Mapping Modul – API – Storage

| Modul | API Endpoint (rencana) | localStorage Key |
|-------|--------------------------|------------------|
''' + '\n'.join(rows) + '''

---
'''


def chapter_appendix(reg: dict) -> str:
    by_id = {m['id']: m for m in reg['modules'] if m.get('enabled', True)}
    lines = [
        '## 8. Appendix',
        '',
        '### 8.1 Daftar Modul & File HTML',
        '',
        '| No | Modul | File Index | Tipe UI |',
        '|----|-------|------------|---------|',
    ]
    for i, mid in enumerate(
        [m for m in MASTER_DATA_ORDER if m in by_id], 1
    ):
        m = by_id[mid]
        lines.append(f'| {i} | {m["label"]} | `{m["htmlPath"]}` | {m.get("type", "page")} |')
    lines.append(appendix_maven_extra())
    return '\n'.join(lines)


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
        chapter_appendix(reg),
    ]
    content = '\n'.join(parts)
    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Assembled: {OUTPUT_MD} ({len(content):,} chars, {content.count(chr(10)):,} lines, {len(all_rules)} rules)')
    return OUTPUT_MD


if __name__ == '__main__':
    assemble()
