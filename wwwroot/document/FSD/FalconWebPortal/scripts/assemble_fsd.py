#!/usr/bin/env python3
"""Assemble full FSD_Falcon_Web_v1.0.md from preamble + extracted fragments."""
from __future__ import annotations

import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))
SOURCE_DIR = os.path.join(WORKSPACE_DIR, 'source')
OUTPUT_MD = os.path.join(SOURCE_DIR, 'FSD_Falcon_Web_v1.0.md')
REGISTRY_PATH = os.path.join(PROTOTYPE_ROOT, 'lib', 'fsd', 'module-registry.json')

sys.path.insert(0, SCRIPT_DIR)
from extract_module_spec import generate_fragments, collect_all_business_rules, load_registry


def preamble() -> str:
    return '''# FUNCTIONAL SPECIFICATION DOCUMENT (FSD)
## Modul: Web Admin Falcon FPRS (Field Partner Relation System)
### Sistem: Falcon FPRS
### Versi Dokumen: 1.0

---

| Atribut | Keterangan |
|---------|------------|
| **Nama Dokumen** | FSD Web Admin Falcon FPRS |
| **Versi** | 1.0 |
| **Tanggal** | 7 Juli 2026 |
| **Divisi** | ICT / Business – Falcon FPRS |
| **Status** | Draft |
| **Dibuat oleh** | Tim ICT – Falcon FPRS |

---

## Riwayat Revisi

| Versi | Tanggal | Diubah Oleh | Keterangan |
|---------|-------------|-------------|------------|
| **1.0** | **7 Juli 2026** | **Tim ICT** | Initial draft – Web Admin prototipe FPRS (Views/FPRS) |

---

## 1. Pendahuluan

### 1.1 Latar Belakang

**Falcon FPRS** (*Field Partner Relation System*) adalah sistem internal PT Kalbe Nutritionals untuk administrasi data master, penjualan lapangan, dan pelacakan kunjungan sales. Prototipe Web Portal di `Views/FPRS/` merupakan *high-fidelity interactive prototype* berbasis HTML statis multi-halaman (MPA) dengan tema Vuexy/Bootstrap, mensimulasikan alur kerja admin sebelum integrasi penuh ke backend Master Data API Kalbe.

Prototipe menggunakan **localStorage** dan file JSON seed di `wwwroot/data/` sebagai lapisan persistensi sisi klien. Dokumen ini mendeskripsikan seluruh modul web admin yang terdaftar pada sidebar `wwwroot/js/layout.js`.

### 1.2 Tujuan Dokumen

1. Mendeskripsikan fungsionalitas **per halaman dan per komponen UI** Web Portal Falcon FPRS.
2. Menjadi acuan pengembangan backend/API dan UAT.
3. Mendokumentasikan business rules, pola CRUD, integrasi API rencana, dan data layer lokal.
4. Menyelaraskan format dokumentasi dengan standar **FSD Generator Engine** (Kalbe Nutritionals).

### 1.3 Ruang Lingkup

| Dalam lingkup | Di luar lingkup |
|---------------|-----------------|
| Web admin `Views/FPRS/` (Dashboard, Master Data, Penjualan, Kunjungan) | Mobile SFA (`Views/Mobile/`, Flutter APK) |
| Shell navigasi `layout.js`, branding Kalbe | Modul legacy `wwwroot/areas/` |
| Persistensi prototipe (localStorage + JSON) | Implementasi produksi backend final |

### 1.4 Stakeholder

| Peran | Tim/Divisi | Keterlibatan |
|-------|------------|--------------|
| Admin Master Data | ICT / Operations | CRUD data referensi |
| Supervisor Sales | Sales | Monitoring kunjungan & penjualan |
| Developer | ICT | Implementasi API & UI produksi |
| Business Analyst | PDV / Sales | Validasi alur bisnis |

---

## 2. Arsitektur Portal

### 2.1 Ringkasan Teknis

| Aspek | Standar |
|-------|---------|
| Arsitektur | Static MPA — satu `.html` per halaman |
| UI Framework | Bootstrap 5.3, Vuexy Admin Theme |
| JavaScript | jQuery 3.7, DataTables, Select2, SweetAlert2 |
| Peta | MapLibre GL JS (modul Geografis Kunjungan) |
| State | `localStorage` + seed `wwwroot/data/*.json` |
| Navigasi | `wwwroot/js/layout.js` — sidebar & navbar injection |
| Branding | Kalbe hijau `#005d41`, font Kalbe Geometric |

### 2.2 Business Flow Portal (Cross-Functional Swimlane)

**Lane (urutan kiri → kanan):**

| # | Lane ID | Label | Tipe | Sumber |
|---|---------|-------|------|--------|
| 1 | L1 | Admin Master Data | User | `layout.js` sidebar |
| 2 | L2 | Supervisor Sales | User | `FSD` stakeholder §1.4 |
| 3 | L3 | Sistem Falcon Web | System | Prototipe `localStorage` |
| 4 | L4 | Master Data API | External | Badge API di sidebar |

```plantuml
@startuml
|Admin Master Data|
start
:Buka modul Master Data;
|Sistem Falcon Web|
:Load seed JSON ke localStorage;
:Tampilkan DataTable index;
|Admin Master Data|
:Isi form / modal;
|Sistem Falcon Web|
:Validasi client-side (Swal);
:Simpan ke localStorage;
|Master Data API|
:Sync rencana (REST /api/v1/...);
|Supervisor Sales|
:Monitoring Penjualan & Kunjungan;
stop
@enduml
```

Hand-off Admin → Sistem: setiap operasi CRUD menulis `localStorage` key modul. Hand-off Sistem → API: badge **Master Data API** menandakan endpoint rencana produksi.

### 2.3 Konvensi Penamaan File

| Pola | Contoh |
|------|--------|
| Index modul | `Views/FPRS/MasterData/Produk/index.html` |
| Form page | `Views/FPRS/MasterData/Produk/add.html` |
| Detail page | `Views/FPRS/MasterData/Produk/detail.html` |
| Modal CRUD | Form di dalam `index.html` (`#modalForm`) |

---
'''


def chapter_business_rules(rules: list[tuple[str, str]]) -> str:
    lines = [
        '## 7. Aturan Bisnis (Rekap)',
        '',
        'Rekap aturan bisnis lintas modul Web Admin. Rule ID menggunakan prefix:',
        '`BR-W` (portal), `BR-MD` (master data), `BR-PJ` (penjualan), `BR-CV` (canvassing), `BR-KJ` (kunjungan).',
        '',
        '| Rule ID | Aturan |',
        '|---------|--------|',
    ]
    for rid, rule in rules[:80]:
        lines.append(f'| {rid} | {rule} |')
    if len(rules) > 80:
        lines.append(f'| — | *(+{len(rules) - 80} aturan tambahan di sub-bab masing-masing modul)* |')
    lines.append('')
    lines.append('---')
    lines.append('')
    return '\n'.join(lines)


def chapter_rbac() -> str:
    return '''## 8. Hak Akses & RBAC

### 8.1 Role pada Modul Akun

Modul **Akun** (`Views/FPRS/MasterData/Akun/index.html`) mendefinisikan role group berikut pada dropdown `inputRole`:

| Role Group | Keterangan |
|------------|------------|
| Admin | Akses penuh administrasi |
| Salesman Canvassing (SI) | Sales lapangan canvassing |
| Salesman Order | Input order penjualan |
| Supervisor | Monitoring tim |
| Driver | Operasional pengiriman |
| Customer | Akses terbatas pelanggan |

### 8.2 Konfigurasi Akses

Modul **Konfigurasi Akses** (`Views/FPRS/MasterData/KonfigurasiAkses/index.html`) mengatur mapping posisi/role ke hak akses menu. Pada prototipe, RBAC disimulasikan melalui data master Akun dan Konfigurasi Akses; enforcement penuh di server **belum** diimplementasikan.

### 8.3 Matriks Akses Ringkas

| Bagian Portal | Admin | Supervisor | Salesman | Keterangan |
|---------------|-------|------------|----------|------------|
| Master Data | CRUD | Read | Read terbatas | Sesuai konfigurasi |
| Penjualan | CRUD | Read/Approve | Create/Read | Faktur & Canvassing |
| Kunjungan | Read | Read | Read | Monitoring rute |

---
'''


def chapter_integration(reg: dict) -> str:
    rows = []
    for m in reg['modules']:
        if not m.get('enabled', True):
            continue
        api = m.get('apiEndpoint') or '—'
        sk = m.get('storageKey') or '—'
        rows.append(f'| {m["label"]} | `{api}` | `{sk}` |')
    return '''## 9. Data Layer & Integrasi

### 9.1 Pola Persistensi Prototipe

1. Saat halaman dimuat, cek `localStorage` dengan key modul (mis. `md_produk`).
2. Jika kosong, fetch file JSON seed dari `wwwroot/data/` lalu simpan ke `localStorage`.
3. Operasi CRUD menulis kembali ke `localStorage` (tanpa server round-trip).

### 9.2 Integrasi Master Data API (Rencana)

Portal Kalbe Master Data dev: `https://newmasterdatadev.kalbenutritionals.web.id/`

Modul dengan badge **Master Data API** di sidebar direncanakan terintegrasi ke endpoint REST (`/api/v1/...`). Pada prototipe saat ini, endpoint dicantumkan sebagai referensi; operasi aktual masih lokal.

### 9.3 Mapping Modul – API – Storage

| Modul | API Endpoint (rencana) | localStorage Key |
|-------|--------------------------|------------------|
''' + '\n'.join(rows) + '''

---
'''


def chapter_erd() -> str:
    return '''## 10. Struktur Data & ERD

Diagram entity relationship tingkat portal (prototipe):

```mermaid
erDiagram
    M_Pelanggan ||--o{ Tr_Kunjungan : has
    M_Pegawai ||--o{ Tr_Kunjungan : performs
    M_Produk ||--o{ Tr_FakturDetail : item
    Tr_Faktur ||--|{ Tr_FakturDetail : contains
    M_Pelanggan ||--o{ Tr_Faktur : orders
    M_Pegawai ||--o{ Tr_Canvassing : conducts
```

| Entity | Deskripsi |
|--------|-----------|
| `M_Produk` | Master produk/SKU |
| `M_Pelanggan` | Master pelanggan/outlet |
| `M_Pegawai` | Master pegawai/sales |
| `Tr_Faktur` | Transaksi faktur penjualan |
| `Tr_Kunjungan` | Record kunjungan sales |
| `Tr_Canvassing` | Transaksi canvassing desktop |

---
'''


def chapter_appendix(reg: dict) -> str:
    lines = [
        '## 11. Appendix',
        '',
        '### 11.1 Daftar Modul & File HTML',
        '',
        '| No | Modul | File Index | Tipe UI |',
        '|----|-------|------------|---------|',
    ]
    for i, m in enumerate(reg['modules'], 1):
        if not m.get('enabled', True):
            continue
        lines.append(f'| {i} | {m["label"]} | `{m["htmlPath"]}` | {m.get("type", "page")} |')
    lines += [
        '',
        '### 11.2 Status Prototipe vs Produksi',
        '',
        '| Aspek | Prototipe Saat Ini | Produksi Target |',
        '|-------|-------------------|-----------------|',
        '| Persistensi | localStorage + JSON | REST API + database |',
        '| Autentikasi | Tidak ada login web admin | SSO / JWT |',
        '| RBAC | Data master saja | Server-side enforcement |',
        '| Screenshot | `screenshots/` folder | — |',
        '',
        '### 11.3 Build Dokumen',
        '',
        '```powershell',
        'cd wwwroot/document/FSD/FalconWebPortal',
        'py scripts/assemble_fsd.py',
        'py build.py',
        '# Buka output/FSD_Falcon_Web_v1.0.docx → tekan F9 untuk TOC',
        '# Deliverable: Document/{TIMESTAMP}__FSD_FALCON_WEB.docx',
        '```',
        '',
    ]
    return '\n'.join(lines)


def assemble():
    os.makedirs(SOURCE_DIR, exist_ok=True)
    chapter_sections, reg, all_rules = generate_fragments()

    parts = [
        preamble(),
        chapter_sections[0],
        chapter_sections[1],
        chapter_sections[2],
        chapter_sections[3],
        chapter_business_rules(all_rules),
        chapter_rbac(),
        chapter_integration(reg),
        chapter_erd(),
        chapter_appendix(reg),
    ]

    content = '\n'.join(parts)
    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Assembled: {OUTPUT_MD} ({len(content):,} chars, {content.count(chr(10)):,} lines)')


if __name__ == '__main__':
    assemble()
