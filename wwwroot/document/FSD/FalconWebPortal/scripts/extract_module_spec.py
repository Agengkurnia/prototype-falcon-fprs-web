#!/usr/bin/env python3
"""
Extract module UI specs from HTML → Markdown fragments (FSD Generator Engine standard).

Output: 7-column field tables, 5-column grid tables, business rules with BR prefix.
"""
from __future__ import annotations

import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))
REGISTRY_PATH = os.path.join(PROTOTYPE_ROOT, 'lib', 'fsd', 'module-registry.json')
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')
FRAGMENTS_DIR = os.path.join(WORKSPACE_DIR, 'source', '_fragments')

MASTER_DATA_ORDER = [
    'master-produk', 'master-unit', 'master-divisi', 'master-daftar-harga',
    'master-kategori-produk', 'master-brand', 'master-pelanggan', 'master-grup-pelanggan',
    'master-pegawai', 'master-akun', 'master-posisi', 'master-konfigurasi-akses',
    'master-metode-pembayaran', 'master-waktu-pembayaran', 'master-pajak',
    'master-alasan', 'master-supplier', 'master-stokis',
]
PENJUALAN_ORDER = ['penjualan-faktur', 'penjualan-stok-motoris', 'canvassing']
KUNJUNGAN_ORDER = ['kunjungan-informasi', 'kunjungan-geografis', 'kunjungan-rute']

BR_PREFIX = {
    'masterData': 'BR-MD',
    'operational': 'BR',
}

SKIP_VALIDATION_MSGS = {
    'berhasil!', 'dihapus!', 'validasi gagal', 'peringatan',
    'ya, hapus', 'batal',
}

SCREENSHOT_ALIASES = {}  # legacy names migrated to ss_NN in registry

SS_BY_MODULE = {
    'dashboard': ['ss_01_dashboard.png'],
    'master-produk': ['ss_02_master_produk_index.png', 'ss_03_master_produk_add.png', 'ss_04_master_produk_edit.png'],
    'master-unit': ['ss_05_master_unit_index.png', 'ss_06_master_unit_modal.png'],
    'master-divisi': ['ss_07_master_divisi_index.png', 'ss_08_master_divisi_modal.png'],
    'master-daftar-harga': ['ss_09_master_daftar_harga_index.png', 'ss_10_master_daftar_harga_modal.png'],
    'master-kategori-produk': ['ss_11_master_kategori_index.png', 'ss_12_master_kategori_modal.png'],
    'master-brand': ['ss_13_master_brand_index.png', 'ss_14_master_brand_modal.png'],
    'master-pelanggan': ['ss_15_master_pelanggan_index.png', 'ss_16_master_pelanggan_add.png'],
    'master-grup-pelanggan': ['ss_17_master_grup_pelanggan_index.png', 'ss_18_master_grup_modal.png'],
    'master-pegawai': ['ss_19_master_pegawai_index.png', 'ss_20_master_pegawai_add.png'],
    'master-akun': ['ss_21_master_akun_index.png', 'ss_22_master_akun_modal_tambah.png', 'ss_23_master_akun_modal_edit.png'],
    'master-posisi': ['ss_24_master_posisi_index.png', 'ss_25_master_posisi_modal.png'],
    'master-konfigurasi-akses': ['ss_26_master_konfig_akses_index.png', 'ss_27_master_konfig_modal.png'],
    'master-metode-pembayaran': ['ss_28_master_metode_index.png', 'ss_29_master_metode_modal.png'],
    'master-waktu-pembayaran': ['ss_30_master_waktu_index.png', 'ss_31_master_waktu_modal.png'],
    'master-pajak': ['ss_32_master_pajak_index.png', 'ss_33_master_pajak_modal.png'],
    'master-alasan': ['ss_34_master_alasan_index.png', 'ss_35_master_alasan_modal.png'],
    'master-supplier': ['ss_36_master_supplier_index.png', 'ss_37_master_supplier_add.png'],
    'master-stokis': ['ss_45_master_stokis_index.png', 'ss_46_master_stokis_add.png'],
    'penjualan-faktur': ['ss_38_faktur_index.png', 'ss_39_faktur_add.png'],
    'penjualan-stok-motoris': ['ss_40_stok_motoris_index.png'],
    'canvassing': ['ss_41_canvassing_index.png'],
    'kunjungan-informasi': ['ss_42_kunjungan_informasi.png'],
    'kunjungan-geografis': ['ss_43_kunjungan_geografis.png'],
    'kunjungan-rute': ['ss_44_kunjungan_rute.png'],
}

MODULE_ENRICHMENT = {
    'master-produk': (
        'Halaman index menampilkan **4 summary cards** (`cntTotal`, `cntActive`, `cntInactive`, `cntAvgPrice`) '
        'dan DataTable `#tbl` dengan filter per kolom. Tombol **Tambah Produk** mengarah ke `add.html`. '
        'Mode edit mengisi form via query `?id=` dan mengunci field `kode` menjadi read-only.'
    ),
    'master-pelanggan': (
        'Modul pelanggan/outlet mencakup informasi dasar, grup pelanggan, alamat, dan pengaturan keuangan '
        '(daftar harga, waktu pembayaran, metode pembayaran). Data disimpan di `md_pelanggan`.'
    ),
    'master-pegawai': (
        'Master pegawai/sales force dengan form `add.html` untuk registrasi karyawan lapangan. '
        'Terintegrasi rencana ke `/api/v1/Employee`.'
    ),
}

# Tujuan form & pengguna per modul (narasi FSD standar)
MODULE_FORM_META: dict[str, dict[str, str]] = {
    'dashboard': {
        'purpose': (
            'Menyediakan halaman awal portal admin dan pintu navigasi ke seluruh modul FPRS '
            '(Master Data, Penjualan, Kunjungan) melalui sidebar Vuexy yang diinjeksikan `layout.js`.'
        ),
        'users': 'Admin Master Data, Supervisor Sales, Developer ICT — semua peran yang mengakses Web Admin.',
    },
    'master-produk': {
        'purpose': (
            'Mendaftarkan dan memelihara data SKU/produk (kode, kategori, brand, harga, pajak, dimensi) '
            'sebagai referensi transaksi penjualan dan integrasi Master Data API.'
        ),
        'users': 'Admin Master Data, ICT Operations — pengelola katalog produk Kalbe.',
    },
    'master-unit': {
        'purpose': 'Mendefinisikan satuan unit dan konversi kemasan produk (Box, Karton, Pcs) untuk penjualan dan stok.',
        'users': 'Admin Master Data, ICT Operations.',
    },
    'master-divisi': {
        'purpose': 'Mengelola struktur divisi organisasi penjualan yang dipakai untuk klasifikasi produk dan pegawai.',
        'users': 'Admin Master Data, HR/ICT.',
    },
    'master-daftar-harga': {
        'purpose': (
            'Menyusun daftar harga jual per segmen pelanggan atau channel; menjadi acuan pricing saat transaksi faktur.'
        ),
        'users': 'Admin Master Data, Finance, Pricing Analyst.',
    },
    'master-kategori-produk': {
        'purpose': 'Mengelompokkan produk ke kategori bisnis untuk filter laporan, katalog, dan aturan penjualan.',
        'users': 'Admin Master Data, Product Manager.',
    },
    'master-brand': {
        'purpose': 'Memelihara master brand/merek produk yang terkait dengan portofolio Kalbe Nutritionals.',
        'users': 'Admin Master Data, Marketing/PDV.',
    },
    'master-pelanggan': {
        'purpose': (
            'Mendaftarkan outlet/pelanggan beserta alamat, grup, skema harga, dan syarat pembayaran '
            'sebagai entitas utama kunjungan sales dan faktur.'
        ),
        'users': 'Admin Master Data, Operations, Supervisor Sales (validasi data outlet).',
    },
    'master-grup-pelanggan': {
        'purpose': 'Mengelompokkan pelanggan (grosir, retail, RS, dll.) untuk kebijakan harga dan laporan segmentasi.',
        'users': 'Admin Master Data, Sales Operations.',
    },
    'master-pegawai': {
        'purpose': (
            'Mendaftarkan pegawai/sales force (canvasser, motoris) beserta identitas dan penempatan '
            'untuk assignment rute dan otorisasi aplikasi.'
        ),
        'users': 'Admin HR, ICT, Supervisor Sales.',
    },
    'master-akun': {
        'purpose': 'Mengelola akun login pengguna portal admin dan mengaitkannya dengan pegawai/role akses.',
        'users': 'Admin ICT, Security Administrator.',
    },
    'master-posisi': {
        'purpose': 'Mendefinisikan jabatan/posisi kerja (Canvasser, Supervisor, Admin) untuk struktur organisasi dan RBAC.',
        'users': 'Admin HR, ICT.',
    },
    'master-konfigurasi-akses': {
        'purpose': (
            'Mengatur matriks hak akses modul portal (menu, CRUD) per role agar kebijakan keamanan '
            'dapat dikonfigurasi tanpa ubah kode.'
        ),
        'users': 'Admin ICT, Security Administrator.',
    },
    'master-metode-pembayaran': {
        'purpose': 'Mencatat metode pembayaran yang diperbolehkan (tunai, transfer, giro) pada transaksi penjualan dan AR.',
        'users': 'Admin Finance, Master Data.',
    },
    'master-waktu-pembayaran': {
        'purpose': 'Mendefinisikan termin/tempo pembayaran (COD, 7 hari, 14 hari) yang melekat pada pelanggan dan faktur.',
        'users': 'Admin Finance, Credit Control.',
    },
    'master-pajak': {
        'purpose': 'Mengonfigurasi skema pajak (PPN, DPP) yang dipakai perhitungan harga produk dan faktur.',
        'users': 'Admin Finance, Tax/Accounting.',
    },
    'master-alasan': {
        'purpose': (
            'Menyimpan kode alasan operasional (tidak order, gagal kunjungan, dll.) untuk pelacakan '
            'aktivitas lapangan dan analitik compliance.'
        ),
        'users': 'Admin Operations, Supervisor Sales, Business Analyst.',
    },
    'master-supplier': {
        'purpose': 'Mendaftarkan pemasok/principal untuk kebutuhan supply chain dan referensi data produk.',
        'users': 'Admin Master Data, Procurement.',
    },
    'master-stokis': {
        'purpose': (
            'Mendaftarkan grosir/distributor stokis tempat salesman melakukan kulakan dan cek stok barang. '
            'Termasuk koordinat GPS untuk validasi check-in mobile.'
        ),
        'users': 'Admin Master Data, Sales Operations, Supervisor Sales.',
    },
    'penjualan-faktur': {
        'purpose': (
            'Membuat dan memantau faktur penjualan dari order lapangan; mencatat header, item, diskon, '
            'dan status pembayaran untuk rekonsiliasi admin.'
        ),
        'users': 'Admin Sales, Supervisor, Finance (monitoring & koreksi).',
    },
    'penjualan-stok-motoris': {
        'purpose': (
            'Memantau stok produk yang dibawa motoris/canvasser di lapangan untuk kontrol availability '
            'sebelum kunjungan dan penjualan.'
        ),
        'users': 'Supervisor Sales, Admin Operations, Warehouse (read-only monitoring).',
    },
    'canvassing': {
        'purpose': (
            'Menampilkan ringkasan aktivitas canvassing (prospek, konversi, performa) untuk evaluasi '
            'efektivitas tim lapangan.'
        ),
        'users': 'Supervisor Sales, Sales Manager, Admin PDV.',
    },
    'kunjungan-informasi': {
        'purpose': (
            'Menyajikan laporan informasi kunjungan (check-in/out, durasi, status) untuk monitoring '
            'kepatuhan rute harian sales.'
        ),
        'users': 'Supervisor Sales, Admin Operations, Business Analyst.',
    },
    'kunjungan-geografis': {
        'purpose': (
            'Memvisualisasikan posisi kunjungan/outlet pada peta (MapLibre) untuk audit GPS, '
            'deteksi deviasi rute, dan analisis cakupan wilayah.'
        ),
        'users': 'Supervisor Sales, Regional Manager, Admin Operations.',
    },
    'kunjungan-rute': {
        'purpose': (
            'Mengelola dan meninjau rute kunjungan harian per sales (urutan outlet, assignment) '
            'sebagai perencanaan sebelum eksekusi di mobile SFA.'
        ),
        'users': 'Supervisor Sales, Sales Planner, Admin Operations.',
    },
}


def form_narrative_block(mod: dict) -> str:
    meta = MODULE_FORM_META.get(mod['id'])
    if not meta:
        return ''
    return (
        '| Aspek | Keterangan |\n'
        '|-------|------------|\n'
        f'| **Tujuan Form** | {meta["purpose"]} |\n'
        f'| **Pengguna** | {meta["users"]} |\n'
        '\n'
    )


def load_registry() -> dict:
    with open(REGISTRY_PATH, 'r', encoding='utf-8-sig') as f:
        return json.load(f)


def read_html(rel_path: str) -> str:
    if not rel_path:
        return ''
    p = os.path.join(PROTOTYPE_ROOT, rel_path.replace('/', os.sep))
    if not os.path.exists(p):
        return ''
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()


def strip_tags(s: str) -> str:
    return re.sub(r'<[^>]+>', '', s).replace('*', '').strip()


def field_type(tag: str, classes: str, inp_type: str) -> str:
    if tag == 'select':
        return 'Dropdown'
    if inp_type == 'email':
        return 'Email'
    if inp_type == 'number':
        return 'Number'
    if inp_type == 'hidden':
        return 'Hidden'
    if 'datepicker' in classes.lower():
        return 'Date Picker'
    if 'readonly' in classes.lower():
        return 'Text (readonly)'
    return 'Text'


def extract_columns(html: str) -> list[str]:
    m = re.search(r'<thead>.*?<tr>(.*?)</tr>', html, re.DOTALL | re.I)
    if not m:
        return []
    cols = []
    for t in re.findall(r'<th[^>]*>(.*?)</th>', m.group(1), re.DOTALL | re.I):
        label = strip_tags(t)
        if label and label.upper() != 'AKSI':
            cols.append(label)
    return cols


def extract_fields(html: str) -> list[dict]:
    """Label + nearest input/select id within col blocks or modal body."""
    fields = []
    seen = set()

    modal_m = re.search(
        r'<div[^>]*class="[^"]*modal-body[^"]*"[^>]*>(.*?)</div>\s*<div[^>]*class="[^"]*modal-footer',
        html, re.DOTALL | re.I,
    )
    search_html = modal_m.group(1) if modal_m else html

    for block in re.finditer(
        r'<div[^>]*class="[^"]*col-[^"]*"[^>]*>(.*?)</div>',
        search_html, re.DOTALL | re.I,
    ):
        chunk = block.group(1)
        lm = re.search(r'<label[^>]*class="[^"]*form-label[^"]*"[^>]*>(.*?)</label>', chunk, re.I)
        if not lm:
            continue
        label = strip_tags(lm.group(1))
        im = re.search(
            r'<(input|select|textarea)[^>]*>',
            chunk, re.I,
        )
        if not im:
            fields.append({
                'label': label, 'id': '—', 'type': '—',
                'mandatory': '—', 'default': '—', 'validation': '—', 'note': 'TBD — verifikasi HTML',
            })
            continue
        tag = im.group(0)
        fid = re.search(r'\bid=["\']([^"\']+)["\']', tag, re.I)
        ftype = re.search(r'\btype=["\']([^"\']+)["\']', tag, re.I)
        elem_id = fid.group(1) if fid else '—'
        if elem_id in ('editId',) or label in seen:
            continue
        seen.add(label)
        mandatory = 'Ya' if '<span class="required-mark">' in chunk or 'required' in tag else 'Tidak'
        default_m = re.search(r'\bvalue=["\']([^"\']*)["\']', tag)
        default = default_m.group(1) if default_m and default_m.group(1) else '(kosong)'
        inp_type = ftype.group(1) if ftype else 'text'
        tag_name = re.match(r'<(\w+)', tag, re.I).group(1).lower()
        fields.append({
            'label': label,
            'id': f'`{elem_id}`' if elem_id != '—' else '—',
            'type': field_type(tag_name, tag, inp_type),
            'mandatory': mandatory,
            'default': default,
            'validation': '—',
            'note': '—',
        })
    return fields


def extract_validations(html: str) -> list[str]:
    vals = []
    for m in re.finditer(r"Swal\.fire\(['\"]Peringatan['\"],\s*['\"]([^'\"]+)['\"]", html):
        vals.append(m.group(1))
    for m in re.finditer(r"showFieldError\([^,]+,\s*['\"]([^'\"]+)['\"]", html):
        vals.append(m.group(1))
    for m in re.finditer(r"showFieldError\([^,]+,\s*`([^`]+)`", html):
        vals.append(m.group(1))
    filtered = []
    for v in vals:
        if v.strip().lower() in SKIP_VALIDATION_MSGS:
            continue
        if len(v.strip()) < 8 and v.strip().endswith('!'):
            continue
        filtered.append(v)
    return list(dict.fromkeys(filtered))


def extract_buttons(html: str) -> list[dict]:
    buttons = []
    for m in re.finditer(
        r'<button([^>]*)>(.*?)</button>',
        html, re.DOTALL | re.I,
    ):
        attrs, inner = m.group(1), strip_tags(m.group(2))
        if not inner or inner.lower() in ('batal', 'close'):
            continue
        bid = re.search(r'\bid=["\']([^"\']+)["\']', attrs)
        onclick = re.search(r'\bonclick=["\']([^"\']+)["\']', attrs)
        cls = re.search(r'\bclass=["\']([^"\']+)["\']', attrs)
        style = 'btn-success' if cls and 'btn-success' in cls.group(1) else (
            'btn-danger' if cls and 'btn-danger' in cls.group(1) else 'btn-secondary'
        )
        buttons.append({
            'label': inner,
            'id': bid.group(1) if bid else (onclick.group(1) if onclick else '—'),
            'style': style,
            'condition': '—',
            'function': onclick.group(1) if onclick else '—',
        })
    return buttons[:8]


def br_prefix_for(mod: dict) -> str:
    if mod['id'] == 'dashboard':
        return 'BR-W'
    if mod.get('group') == 'masterData':
        return 'BR-MD'
    if mod['id'].startswith('penjualan-'):
        return 'BR-PJ'
    if mod['id'].startswith('kunjungan-'):
        return 'BR-KJ'
    if mod['id'] == 'canvassing':
        return 'BR-CV'
    return 'BR'


def next_br_id(prefix: str, counters: dict) -> str:
    counters[prefix] = counters.get(prefix, 0) + 1
    return f'{prefix}{counters[prefix]:02d}'


def screenshot_embed(mod: dict) -> str:
    lines = []
    shots = SS_BY_MODULE.get(mod['id']) or mod.get('screenshots') or []
    existing = [s for s in shots if os.path.exists(os.path.join(SCREENSHOTS_DIR, s))]
    if existing:
        title = mod['label']
        lines.append(f'**Tampilan {title}:**')
        lines.append('')
        lines.append(f'![{title}](screenshots/{existing[0]})')
        lines.append('')
        for s in existing[1:5]:
            lines.append(f'![Tampilan tambahan {mod["label"]}](screenshots/{s})')
            lines.append('')
    else:
        want = shots[0] if shots else 'ss_tbd.png'
        lines.append(f'> *Screenshot belum tersedia: screenshots/{want}*')
        lines.append('')
    return '\n'.join(lines)


def dashboard_section(chapter: str, sub: int, mod: dict) -> str:
    lines = [
        f'### {chapter}.{sub} Dashboard & Home Portal',
        '',
        'Halaman **Home Portal** (`index.html`) adalah landing page setelah membuka aplikasi. '
        'Konten utama berupa kartu saran browser/resolusi; navigasi ke seluruh modul dilakukan '
        'melalui **sidebar** yang diinjeksikan oleh `wwwroot/js/layout.js`.',
        '',
        form_narrative_block(mod),
        screenshot_embed(mod),
        f'#### {chapter}.{sub}.1 Shell Navigasi (Sidebar)',
        '',
        'Sidebar Vuexy memuat menu bertingkat berikut (sumber: `layout.js`):',
        '',
        '| Menu | Sub-menu | Path |',
        '|------|----------|------|',
        '| Home | — | `index.html` |',
        '| Data Master | Master Produk, Unit, Divisi, Daftar Harga, Kategori, Brand | `Views/FPRS/MasterData/...` |',
        '| Data Master | Master Pelanggan, Grup Pelanggan | `Views/FPRS/MasterData/Pelanggan/...` |',
        '| Data Master | Pegawai, Akun, Posisi, Konfigurasi Akses | `Views/FPRS/MasterData/...` |',
        '| Data Master | Metode/Waktu Pembayaran, Pajak, Alasan, Supplier | `Views/FPRS/MasterData/...` |',
        '| Penjualan | Faktur, Canvassing, Stok Motoris | `Views/FPRS/Penjualan/...`, `Canvassing/` |',
        '| Kunjungan | Informasi, Geografis, Management Rute | `Views/FPRS/Kunjungan/...` |',
        '',
        f'#### {chapter}.{sub}.2 Komponen Halaman Home',
        '',
        '| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |',
        '|------------|-----------|------|-----------|---------|----------|------------|',
        '| Judul halaman | `.home-title` | Text (heading) | — | Home Page \\| Falcon FPRS | — | H2 di `#app-content` |',
        '| Kartu saran | `.suggestion-card` | Card | — | — | — | Rekomendasi browser & resolusi |',
        '',
        f'#### {chapter}.{sub}.3 CRUD',
        '',
        '| Operasi | Cara | Role | Keterangan |',
        '|---------|------|------|------------|',
        '| **Read** | Buka `index.html` | Semua role | Halaman informasi; bukan modul CRUD |',
        '| **Create** | — | — | Tidak tersedia |',
        '| **Update** | — | — | Tidak tersedia |',
        '| **Delete** | — | — | Tidak tersedia |',
        '',
    ]
    return '\n'.join(lines)


def crud_table(mod: dict) -> str:
    ui_type = mod.get('type', 'page')
    mid = mod['id']
    lines = [
        '| Operasi | Cara | Role | Keterangan |',
        '|---------|------|------|------------|',
    ]
    if mid in ('penjualan-stok-motoris', 'kunjungan-geografis'):
        lines += [
            '| **Read** | Buka halaman index | Admin, Supervisor | Dashboard/monitoring read-only |',
            '| **Create** | — | — | Tidak tersedia di UI |',
            '| **Update** | — | — | Tidak tersedia |',
            '| **Delete** | — | — | Tidak tersedia |',
        ]
    elif ui_type == 'modal':
        lines += [
            '| **Create** | Klik Tambah → isi modal → Simpan | Admin | Persist ke localStorage |',
            '| **Read** | DataTable index | Semua role | — |',
            '| **Update** | Klik Edit → ubah modal → Simpan | Admin | — |',
            '| **Delete** | Klik Hapus → konfirmasi Swal | Admin | Hapus dari localStorage |',
        ]
    else:
        lines += [
            '| **Create** | Klik Tambah → `add.html` | Admin | — |',
            '| **Read** | Index + `detail.html` | Semua role | — |',
            '| **Update** | Edit via `add.html?id=` | Admin | — |',
            '| **Delete** | Konfirmasi Swal di index | Admin | — |',
        ]
    return '\n'.join(lines)


def module_section(chapter: str, sub: int, mod: dict, br_counters: dict, all_rules: list) -> str:
    if mod['id'] == 'dashboard':
        return dashboard_section(chapter, sub, mod)
    index_html = read_html(mod['htmlPath'])
    form_html = read_html(mod.get('formPath') or '')
    detail_html = ''
    if mod.get('formPath'):
        detail_path = mod['formPath'].replace('add.html', 'detail.html')
        detail_html = read_html(detail_path)
    combined = index_html + form_html + detail_html

    ui_type = mod.get('type', 'page')
    short_label = mod['label'].split('—')[-1].strip() if '—' in mod['label'] else mod['label']
    lines = [
        f'### {chapter}.{sub} {short_label}',
        '',
        f'Modul **{short_label}** merupakan bagian dari Web Portal Falcon FPRS. '
        f'Tipe UI: **{ui_type}**. '
        f'Sumber: `{mod["htmlPath"]}`.',
        '',
    ]
    enrich = MODULE_ENRICHMENT.get(mod['id'])
    if enrich:
        lines.append(enrich)
        lines.append('')

    narrative = form_narrative_block(mod)
    if narrative:
        lines.append(narrative)

    if mod.get('apiEndpoint'):
        lines.append(f'> **Integrasi API (rencana):** `{mod["apiEndpoint"]}`')
        lines.append('')
    if mod.get('storageKey'):
        lines.append(f'> **localStorage key:** `{mod["storageKey"]}`')
        lines.append('')

    lines.append(screenshot_embed(mod))

    cols = extract_columns(index_html)
    if cols:
        lines.append(f'#### {chapter}.{sub}.1 Kolom DataTable Index')
        lines.append('')
        lines.append('| Kolom | Field Key | Render | Sortable | Keterangan |')
        lines.append('|-------|-----------|--------|----------|------------|')
        for c in cols:
            key = re.sub(r'[^A-Za-z0-9]', '', c.title())
            lines.append(f'| {c} | `{key}` | Text | Ya | Kolom grid index |')
        lines.append('')

    fields = extract_fields(form_html or index_html)
    if not fields and ui_type == 'modal':
        fields = extract_fields(index_html)
    if fields:
        form_label = 'Modal Form' if ui_type == 'modal' else 'Form Tambah/Ubah'
        lines.append(f'#### {chapter}.{sub}.2 {form_label}')
        lines.append('')
        lines.append('| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |')
        lines.append('|------------|-----------|------|-----------|---------|----------|------------|')
        for f in fields:
            lines.append(
                f'| {f["label"]} | {f["id"]} | {f["type"]} | {f["mandatory"]} | {f["default"]} | {f["validation"]} | {f["note"]} |'
            )
        lines.append('')

    buttons = extract_buttons(index_html + form_html)
    if buttons:
        lines.append(f'#### {chapter}.{sub}.3 Tombol Aksi')
        lines.append('')
        lines.append('| Tombol | ID / Handler | Warna/Style | Kondisi Aktif | Fungsi |')
        lines.append('|--------|--------------|-------------|---------------|--------|')
        for b in buttons:
            lines.append(f'| {b["label"]} | `{b["id"]}` | {b["style"]} | {b["condition"]} | {b["function"]} |')
        lines.append('')

    vals = extract_validations(combined)
    if vals:
        lines.append(f'#### {chapter}.{sub}.4 Business Rules')
        lines.append('')
        lines.append('| Rule ID | Aturan |')
        lines.append('|---------|--------|')
        prefix = br_prefix_for(mod)
        for v in vals:
            rid = next_br_id(prefix, br_counters)
            lines.append(f'| {rid} | {v} |')
            all_rules.append((rid, f'[{mod["label"]}] {v}'))
        lines.append('')

    lines.append(f'#### {chapter}.{sub}.5 CRUD')
    lines.append('')
    lines.append(crud_table(mod))
    lines.append('')

    return '\n'.join(lines)


def collect_all_business_rules(mods: list[dict]) -> list[tuple[str, str]]:
    """Legacy — prefer all_rules from generate_fragments()."""
    br_counters: dict = {}
    rules = []
    order = ['dashboard'] + MASTER_DATA_ORDER + PENJUALAN_ORDER + KUNJUNGAN_ORDER
    by_id = {m['id']: m for m in mods}
    for mid in order:
        mod = by_id.get(mid)
        if not mod:
            continue
        combined = read_html(mod['htmlPath']) + read_html(mod.get('formPath') or '')
        prefix = br_prefix_for(mod)
        for v in extract_validations(combined):
            rid = next_br_id(prefix, br_counters)
            rules.append((rid, f'[{mod["label"]}] {v}'))
    return rules


def generate_fragments():
    reg = load_registry()
    by_id = {m['id']: m for m in reg['modules'] if m.get('enabled', True)}
    os.makedirs(FRAGMENTS_DIR, exist_ok=True)
    br_counters: dict = {}
    all_rules: list[tuple[str, str]] = []

    chapters = {
        '3': [('dashboard', by_id.get('dashboard'))],
        '4': [(mid, by_id[mid]) for mid in MASTER_DATA_ORDER if mid in by_id],
        '5': [(mid, by_id[mid]) for mid in PENJUALAN_ORDER if mid in by_id],
        '6': [(mid, by_id[mid]) for mid in KUNJUNGAN_ORDER if mid in by_id],
    }

    all_sections = []
    for ch, items in chapters.items():
        ch_lines = [f'## {ch}. ' + {
            '3': 'Dashboard & Shell',
            '4': 'Master Data',
            '5': 'Penjualan',
            '6': 'Kunjungan',
        }[ch], '']
        if ch == '3':
            ch_lines.append(
                'Bab ini mendeskripsikan halaman Home Portal dan shell navigasi Vuexy '
                'yang diinjeksikan oleh `wwwroot/js/layout.js` ke seluruh halaman FPRS.'
            )
            ch_lines.append('')
        for i, (mid, mod) in enumerate(items, 1):
            if not mod:
                continue
            section = module_section(ch, i, mod, br_counters, all_rules)
            ch_lines.append(section)
            frag_path = os.path.join(FRAGMENTS_DIR, f'{mid}.md')
            with open(frag_path, 'w', encoding='utf-8') as f:
                f.write(section)
        all_sections.append('\n'.join(ch_lines))

    return all_sections, reg, all_rules


if __name__ == '__main__':
    sections, reg, rules = generate_fragments()
    for m in reg['modules']:
        if m['id'] in SS_BY_MODULE:
            m['screenshots'] = SS_BY_MODULE[m['id']]
    with open(REGISTRY_PATH, 'w', encoding='utf-8') as f:
        json.dump(reg, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f'Generated {len(sections)} chapter fragments, {len(rules)} business rules')
    print(f'Updated registry screenshots in {REGISTRY_PATH}')
