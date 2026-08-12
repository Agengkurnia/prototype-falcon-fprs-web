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
LIB_DIR = os.path.join(WORKSPACE_DIR, 'lib')
sys.path.insert(0, LIB_DIR)
from fsd_crud import format_crud_table  # noqa: E402
from fsd_ui_section import (  # noqa: E402
    SubsectionCounter,
    buttons_table_md,
    filter_buttons_by_context,
    resolve_button_shot_file,
    screenshot_placeholder_md,
    screenshot_single_md,
    shot_view_kind,
)
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))
REGISTRY_PATH = os.path.join(PROTOTYPE_ROOT, 'lib', 'fsd', 'module-registry.json')
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')
FRAGMENTS_DIR = os.path.join(WORKSPACE_DIR, 'source', '_fragments')

MASTER_DATA_ORDER = [
    'master-produk', 'master-pelanggan', 'master-channel',
    'master-pegawai', 'master-stokis', 'master-limit-target-harian',
    'master-pajak', 'master-alasan',
]
PENJUALAN_ORDER = ['penjualan-faktur', 'penjualan-stok-motoris']
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
    'master-produk': ['ss_02_master_produk_index.png', 'ss_03_master_produk_detail.png'],
    'master-unit': ['ss_05_master_unit_index.png', 'ss_06_master_unit_modal.png'],
    'master-divisi': ['ss_07_master_divisi_index.png', 'ss_08_master_divisi_modal.png'],
    'master-daftar-harga': ['ss_09_master_daftar_harga_index.png', 'ss_10_master_daftar_harga_modal.png'],
    'master-kategori-produk': ['ss_11_master_kategori_index.png', 'ss_12_master_kategori_modal.png'],
    'master-brand': ['ss_13_master_brand_index.png', 'ss_14_master_brand_modal.png'],
    'master-pelanggan': ['ss_15_master_pelanggan_index.png', 'ss_16_master_pelanggan_detail.png'],
    'master-grup-pelanggan': ['ss_17_master_grup_pelanggan_index.png', 'ss_18_master_grup_modal.png'],
    'master-channel': ['ss_47_master_channel_index.png', 'ss_48_master_channel_modal.png'],
    'master-pegawai': ['ss_19_master_pegawai_index.png', 'ss_20_master_pegawai_detail.png'],
    'master-akun': ['ss_21_master_akun_index.png', 'ss_22_master_akun_modal_tambah.png', 'ss_23_master_akun_modal_edit.png'],
    'master-posisi': ['ss_24_master_posisi_index.png', 'ss_25_master_posisi_modal.png'],
    'master-konfigurasi-akses': ['ss_26_master_konfig_akses_index.png', 'ss_27_master_konfig_modal.png'],
    'master-metode-pembayaran': ['ss_28_master_metode_index.png', 'ss_29_master_metode_modal.png'],
    'master-waktu-pembayaran': ['ss_30_master_waktu_index.png', 'ss_31_master_waktu_modal.png'],
    'master-pajak': ['ss_32_master_pajak_index.png', 'ss_33_master_pajak_modal.png'],
    'master-alasan': ['ss_34_master_alasan_index.png', 'ss_35_master_alasan_modal.png'],
    'master-supplier': ['ss_36_master_supplier_index.png', 'ss_37_master_supplier_add.png'],
    'master-stokis': ['ss_45_master_stokis_index.png', 'ss_46_master_stokis_detail.png'],
    'master-limit-target-harian': ['ss_49_master_limit_index.png', 'ss_50_master_limit_detail.png'],
    'penjualan-faktur': ['ss_38_faktur_index.png', 'ss_39_faktur_detail.png'],
    'penjualan-stok-motoris': ['ss_40_stok_motoris_index.png'],
    'canvassing': ['ss_41_canvassing_index.png'],
    'kunjungan-informasi': ['ss_42_kunjungan_informasi.png'],
    'kunjungan-geografis': ['ss_43_kunjungan_geografis.png'],
    'kunjungan-rute': ['ss_44_kunjungan_rute.png'],
}

# Max page screenshots embedded per module (avoids duplicate-looking add/edit pairs)
SCREENSHOT_EMBED_LIMIT = {
    'master-produk': 2,
    'master-pelanggan': 2,
    'master-pegawai': 2,
    'master-stokis': 2,
    'master-channel': 2,
    'master-pajak': 2,
    'master-alasan': 2,
    'penjualan-faktur': 2,
    'penjualan-stok-motoris': 1,
}

MODULE_ENRICHMENT = {
    'master-produk': (
        'Halaman dashboard list menampilkan **summary cards** (`cntTotal`, `cntActive`, `cntInactive`, `cntUmbrella`) '
        'dan DataTable `#tbl` dengan filter per kolom, termasuk kolom **Umbrella Brand**. Tombol **Tambah Produk** '
        'mengarah ke `detail.html`. Halaman `detail.html` bersifat fleksibel (add & edit): **Kode Produk** berupa '
        'LOV searchable (Select2) yang mengambil data dari Master Data API, mengunci field turunan (nama, umbrella, '
        'brand) menjadi read-only. **Harga Beli** dapat diedit, **Harga Jual** read-only dihitung otomatis '
        '(`Harga Beli + PPN`, default skema PPN 11%). **Unit Konversi** dikunci ke `PCS`, dan **Status Produk** '
        'berupa checkbox aktif/nonaktif.'
    ),
    'master-pelanggan': (
        'Data pelanggan/outlet **diinput dari aplikasi mobile** (SFA), sehingga Web Portal bersifat **view-only** — '
        'tanpa tombol Tambah/Edit/Hapus. Halaman detail menampilkan atribut hasil capture lapangan: foto outlet, '
        'pemilik, NPWP, alamat, RT/RW, kelurahan, kecamatan, kota, koordinat GPS, **channel**, dan tipe outlet. '
        'Data disimpan di `md_pelanggan`.'
    ),
    'master-pegawai': (
        'Master pegawai/sales force bersifat **upload-only** (pola seperti Master Stokis): data disinkronkan via '
        '**Download/Upload CSV** dan setiap perubahan status Active/Inactive dicatat pada **riwayat status**. '
        'Setiap pegawai memiliki **role** (Motoris / SPG GT) dan penempatan **Branch** & **Region**. Identitas unik '
        'menggunakan **NIK**. Halaman `detail.html` menampilkan data pegawai secara read-only beserta riwayat status.'
    ),
    'master-channel': (
        'Modul **Channel** memakai **dual-surface**: CRUD hierarki '
        '**Channel → Type Customer → Account** di **Master Data Portal** '
        '(`Views/MasterDataPortal/Channel/`), sementara menu Channel di '
        '**Man Power GT** (`Views/FPRS/MasterData/Channel/`) **view-only**. '
        'Data berbagi `localStorage`/seed. Portal: tab **Manage** + **Mapping** (triple unik; seed CSV). '
        'Panel pelanggan legacy read-only (`md_pelanggan.channel` belum di-remap ke triple).'
    ),
    'master-stokis': (
        'Master **Stokis/Grosir** bersifat **upload-only** (Download/Upload CSV + riwayat stok). Menampilkan '
        '**Branch** dan **Region** (menggantikan kolom Kota), koordinat GPS untuk validasi check-in mobile, serta '
        'island **Riwayat Input Stok oleh Motoris** pada halaman detail.'
    ),
    'penjualan-faktur': (
        'Halaman dashboard list menampilkan **KPI cards** (Total, Paid, Unpaid/nilai) dan DataTable `#tblFaktur` '
        'dengan filter tanggal, pelanggan, sales, dan status. Data faktur bersumber dari aktivitas **Mobile SFA** '
        '(`localStorage` key `fprs_faktur`, seed `faktur.json`). Web Admin bersifat **view-only**: aksi baris '
        'adalah **lihat detail** dan **cetak**; tidak ada Tambah/Edit/Hapus di web. Halaman `detail.html` '
        'menampilkan header pelanggan, item line, ringkasan pembayaran, dan tombol Cetak menuju `print.html`.'
    ),
    'penjualan-stok-motoris': (
        'Halaman **Monitoring Stok Motoris** adalah dashboard agregat (bukan CRUD): KPI cards, flow stok, '
        'Chart.js, peta Leaflet, grid saldo, dan audit trail. Snapshot disimpan di `md_stok_motoris` dan '
        'dibangun dari master (`md_pegawai`, `md_produk`, `md_stokis`, `md_pelanggan`) plus faktur `fprs_faktur`. '
        'Tombol **Export Excel** menghasilkan file dua sheet (`SalesInvoices`, `DailyVisits`); **Refresh** '
        'memuat ulang data master dan meregenerasi dashboard.'
    ),
}

# Tujuan form & pengguna per modul (narasi FSD standar)
MODULE_FORM_META: dict[str, dict[str, str]] = {
    'dashboard': {
        'purpose': (
            'Menyediakan halaman awal portal admin dan pintu navigasi ke seluruh modul FPRS '
            '(Master Data, Penjualan, Kunjungan) melalui sidebar Vuexy yang diinjeksikan `layout.js`.'
        ),
        'users': 'Admin Master Data, Supervisor Sales, Developer IT — semua peran yang mengakses Web Admin.',
    },
    'master-produk': {
        'purpose': (
            'Mendaftarkan dan memelihara data SKU/produk (kode, umbrella brand, brand, harga beli, harga jual, '
            'pajak, status) sebagai referensi transaksi penjualan. Data produk bersumber dari Master Data API, '
            'sedangkan harga jual, pajak, dan status dikelola di aplikasi ini.'
        ),
        'users': 'Admin Master Data, IT Operations — pengelola katalog produk Kalbe.',
    },
    'master-unit': {
        'purpose': 'Mendefinisikan satuan unit dan konversi kemasan produk (Box, Karton, Pcs) untuk penjualan dan stok.',
        'users': 'Admin Master Data, IT Operations.',
    },
    'master-divisi': {
        'purpose': 'Mengelola struktur divisi organisasi penjualan yang dipakai untuk klasifikasi produk dan pegawai.',
        'users': 'Admin Master Data, HR/IT.',
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
            'Menampilkan data outlet/pelanggan yang diinput dari aplikasi mobile (foto, pemilik, alamat, GPS, '
            'channel, tipe outlet) sebagai entitas utama kunjungan sales dan faktur. Bersifat view-only di web.'
        ),
        'users': 'Admin Master Data, Operations, Supervisor Sales (validasi data outlet).',
    },
    'master-channel': {
        'purpose': (
            'Mengelola hierarki Channel → Type Customer → Account + mapping triple di '
            '**Master Data Portal**; menu Channel Man Power GT hanya view-only.'
        ),
        'users': 'Admin Master Data (CRUD Portal); Sales Ops / Supervisor (view FPRS).',
    },
    'master-pegawai': {
        'purpose': (
            'Memelihara data pegawai/sales force (Motoris, SPG GT) beserta NIK, Branch, dan Region melalui '
            'mekanisme Download/Upload CSV dengan pencatatan riwayat status aktif/nonaktif.'
        ),
        'users': 'Admin HR, IT, Supervisor Sales.',
    },
    'master-akun': {
        'purpose': 'Mengelola akun login pengguna portal admin dan mengaitkannya dengan pegawai/role akses.',
        'users': 'Admin IT, Security Administrator.',
    },
    'master-posisi': {
        'purpose': 'Mendefinisikan jabatan/posisi kerja (Canvasser, Supervisor, Admin) untuk struktur organisasi dan RBAC.',
        'users': 'Admin HR, IT.',
    },
    'master-konfigurasi-akses': {
        'purpose': (
            'Mengatur matriks hak akses modul portal (menu, CRUD) per role agar kebijakan keamanan '
            'dapat dikonfigurasi tanpa ubah kode.'
        ),
        'users': 'Admin IT, Security Administrator.',
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
            'Memantau dan mencetak faktur penjualan yang dihasilkan dari order Mobile SFA. Web Admin '
            'bersifat view-only (list, detail, print); tidak membuat/mengubah faktur di portal.'
        ),
        'users': 'Super Admin, Sales Manager, RSM (lihat sesuai cakupan region); Finance (monitoring).',
    },
    'penjualan-stok-motoris': {
        'purpose': (
            'Memantau stok & aktivitas motoris (KPI, saldo, kunjungan, audit) serta mengekspor report Excel '
            'SalesInvoices / DailyVisits untuk analisis operasional.'
        ),
        'users': 'Super Admin, Sales Manager, RSM (lihat sesuai cakupan region); Admin Operations.',
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


MODAL_FORM_INTRO = {
    'master-channel': (
        '**Dashboard list** menampilkan Channel. **Detail in-page** punya tab **Manage** '
        '(CRUD Channel, Type Customer scoped, Account global) dan tab **Mapping** '
        '(CRUD triple Channel–TypeCus–Account; pelanggan legacy read-only).'
    ),
    'master-pajak': (
        '**Dashboard list** menampilkan daftar skema pajak. **Form modal** untuk Tambah/Ubah berisi '
        'Kode Pajak, Nama Pajak, Persentase (%), dan Nilai DPP. Data disimpan ke `localStorage` setelah validasi.'
    ),
    'master-alasan': (
        '**Dashboard list** menampilkan master alasan operasional. **Form modal** Tambah/Ubah berisi '
        'Nama Alasan, Deskripsi, dan Tipe (Return/Kunjungan/Order/Lainnya). Terintegrasi rencana API `/api/v1/Param`.'
    ),
}


def apply_fsd_terms(text: str) -> str:
    """Ganti istilah UI; path file (`index.html`) tidak diubah."""
    rules = [
        ('Kolom DataTable Index', 'Kolom DataTable Dashboard List'),
        ('Kolom DataTable Index', 'Kolom DataTable Dashboard List'),
        ('DataTable index', 'dashboard list (DataTable)'),
        ('halaman index', 'dashboard list'),
        ('Halaman index', 'Dashboard list'),
        ('Buka halaman index', 'Buka dashboard list'),
        ('di halaman index', 'pada dashboard list'),
        ('Konfirmasi Swal di index', 'Konfirmasi Swal pada dashboard list'),
        ('Index +', 'Dashboard list +'),
        (' (modal/form)', ' (form modal — tampilan full page)'),
    ]
    for old, new in rules:
        text = text.replace(old, new)
    return text


def form_section_label(mod: dict, form_html: str, ui_type: str) -> str:
    if mod.get('id') == 'master-channel':
        return 'Detail — Manage / Mapping'
    if ui_type == 'modal':
        return 'Form Modal (Tambah / Ubah)'
    if form_html and (' disabled' in form_html or 'readonly' in form_html):
        if 'saveDataForm' not in form_html and 'saveItem' not in form_html:
            return 'Form Detail (read-only)'
    if mod.get('formPath', '').endswith('detail.html'):
        return 'Form Detail (read-only)'
    return 'Form Tambah/Ubah'


def modal_form_intro(mod_id: str) -> str:
    intro = MODAL_FORM_INTRO.get(mod_id)
    return f'{intro}\n\n' if intro else ''


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


SOURCE_TITLE_RE = re.compile(
    r'title\s*=\s*["\']Source\s*:\s*([^|"\']+?)\s*\|\s*([^"\']+)["\']',
    re.I,
)


def source_keterangan(attrs_or_html: str) -> str:
    """Parse `title="Source : mTable | column"` → `` `mTable` | `column` `` (pipe escaped for MD tables)."""
    if not attrs_or_html:
        return ''
    m = SOURCE_TITLE_RE.search(attrs_or_html)
    if not m:
        return ''
    table, col = m.group(1).strip(), m.group(2).strip()
    # Escape | so markdown table cells do not split
    return f'`{table}` \\| `{col}`'


def extract_columns(html: str) -> list[dict]:
    """Return list of {label, keterangan} from thead (skip AKSI)."""
    m = re.search(r'<thead>.*?<tr>(.*?)</tr>', html, re.DOTALL | re.I)
    if not m:
        return []
    cols = []
    for attrs, inner in re.findall(r'<th([^>]*)>(.*?)</th>', m.group(1), re.DOTALL | re.I):
        label = strip_tags(inner)
        if not label or label.upper() == 'AKSI':
            continue
        cols.append({
            'label': label,
            'keterangan': source_keterangan(attrs) or 'Kolom grid dashboard list',
        })
    return cols


def extract_field_error_map(html: str) -> dict[str, list[str]]:
    """Map field id → validation messages from showFieldError(...) in page JS."""
    by_id: dict[str, list[str]] = {}
    patterns = [
        r"showFieldError\(\s*['\"]([^'\"]+)['\"]\s*,\s*['\"]([^'\"]+)['\"]",
        r"showFieldError\(\s*['\"]([^'\"]+)['\"]\s*,\s*`([^`]+)`",
    ]
    for pat in patterns:
        for m in re.finditer(pat, html):
            fid, msg = m.group(1), m.group(2).strip()
            if not msg or msg.lower() in SKIP_VALIDATION_MSGS:
                continue
            by_id.setdefault(fid, [])
            if msg not in by_id[fid]:
                by_id[fid].append(msg)
    return by_id


def build_validation(
    chunk: str,
    tag: str,
    elem_id: str,
    error_map: dict[str, list[str]] | None = None,
) -> str:
    parts: list[str] = []
    if '<span class="required-mark">' in chunk or re.search(r'\brequired\b', tag, re.I):
        parts.append('Wajib')
    ml = re.search(r'\bmaxlength=["\'](\d+)["\']', tag, re.I)
    if ml:
        parts.append(f'maks. {ml.group(1)} karakter')
    mn = re.search(r'\bmin=["\']([^"\']+)["\']', tag, re.I)
    if mn:
        parts.append(f'min={mn.group(1)}')
    mx = re.search(r'\bmax=["\']([^"\']+)["\']', tag, re.I)
    if mx and not re.search(r'\bmaxlength=', tag, re.I):
        parts.append(f'max={mx.group(1)}')
    if re.search(r'\breadonly\b', tag, re.I) or re.search(r'\bdisabled\b', tag, re.I):
        parts.append('readonly')
    msgs = (error_map or {}).get(elem_id) or []
    for msg in msgs:
        # shorten template literals like Kode "${kode}" already...
        short = re.sub(r'\$\{[^}]+\}', '{nilai}', msg)
        if short not in parts:
            parts.append(short)
    return '; '.join(parts) if parts else '—'


def extract_fields(html: str) -> list[dict]:
    """Label + nearest input/select id within col blocks or modal body."""
    fields = []
    seen = set()
    error_map = extract_field_error_map(html)

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
        lm = re.search(
            r'<label([^>]*)>(.*?)</label>',
            chunk, re.I | re.DOTALL,
        )
        if not lm or 'form-label' not in lm.group(1):
            # also accept label with form-label in the opening tag regardless of attr order
            lm2 = re.search(
                r'<label[^>]*class="[^"]*form-label[^"]*"[^>]*>(.*?)</label>',
                chunk, re.I | re.DOTALL,
            )
            if not lm2:
                continue
            # re-match with attrs
            lm = re.search(
                r'<label([^>]*)>(.*?)</label>',
                chunk[chunk.lower().find('<label'):],
                re.I | re.DOTALL,
            )
            if not lm:
                continue
        label_attrs, label_inner = lm.group(1), lm.group(2)
        if 'form-label' not in label_attrs:
            continue
        label = strip_tags(label_inner)
        im = re.search(
            r'<(input|select|textarea)([^>]*)>',
            chunk, re.I,
        )
        if not im:
            fields.append({
                'label': label, 'id': '—', 'type': '—',
                'mandatory': '—', 'default': '—', 'validation': '—',
                'note': source_keterangan(label_attrs) or 'TBD — verifikasi HTML',
            })
            continue
        tag = im.group(0)
        tag_attrs = im.group(2)
        fid = re.search(r'\bid=["\']([^"\']+)["\']', tag, re.I)
        ftype = re.search(r'\btype=["\']([^"\']+)["\']', tag, re.I)
        elem_id = fid.group(1) if fid else '—'
        if elem_id in ('editId',) or label in seen:
            continue
        seen.add(label)
        mandatory = (
            'Ya'
            if '<span class="required-mark">' in chunk or re.search(r'\brequired\b', tag, re.I)
            else 'Tidak'
        )
        default_m = re.search(r'\bvalue=["\']([^"\']*)["\']', tag)
        default = default_m.group(1) if default_m and default_m.group(1) else '(kosong)'
        inp_type = ftype.group(1) if ftype else 'text'
        tag_name = re.match(r'<(\w+)', tag, re.I).group(1).lower()
        note = (
            source_keterangan(label_attrs)
            or source_keterangan(tag_attrs)
            or '—'
        )
        fields.append({
            'label': label,
            'id': f'`{elem_id}`' if elem_id != '—' else '—',
            'type': field_type(tag_name, tag, inp_type),
            'mandatory': mandatory,
            'default': default,
            'validation': build_validation(chunk, tag, elem_id, error_map),
            'note': note,
        })
    return fields


def extract_modal_fields(html: str) -> list[dict]:
    """Field di dalam modal-body (layout mb-3 / form-switch, bukan hanya col-*)."""
    modal_m = re.search(
        r'<div[^>]*class="[^"]*modal-body[^"]*"[^>]*>(.*)</div>\s*<div[^>]*class="[^"]*modal-footer',
        html, re.DOTALL | re.I,
    )
    if not modal_m:
        return []
    body = modal_m.group(1)
    fields: list[dict] = []
    seen: set[str] = set()
    error_map = extract_field_error_map(html)

    for lm in re.finditer(r'<label([^>]*)>(.*?)</label>', body, re.DOTALL | re.I):
        label_attrs = lm.group(1)
        if 'form-label' not in label_attrs:
            continue
        label = strip_tags(lm.group(2))
        if not label or label in seen or label.lower() == 'active':
            continue
        for_m = re.search(r'\bfor=["\']([^"\']+)["\']', label_attrs, re.I)
        for_id = for_m.group(1) if for_m else None
        chunk = body[lm.start():lm.start() + 800]
        im = re.search(r'<(input|select|textarea)([^>]*)>', chunk, re.I)
        if not im and for_id:
            im = re.search(
                rf'<(input|select|textarea)([^>]*\bid=["\']{re.escape(for_id)}["\'][^>]*)>',
                body, re.I,
            )
        if not im:
            continue
        tag, tag_attrs = im.group(0), im.group(2)
        fid = re.search(r'\bid=["\']([^"\']+)["\']', tag, re.I)
        elem_id = fid.group(1) if fid else (for_id or '—')
        if elem_id in ('editId',):
            continue
        seen.add(label)
        ftype = re.search(r'\btype=["\']([^"\']+)["\']', tag, re.I)
        inp_type = ftype.group(1) if ftype else 'text'
        tag_name = re.match(r'<(\w+)', tag, re.I).group(1).lower()
        mandatory = (
            'Ya'
            if '<span class="required-mark">' in chunk or re.search(r'\brequired\b', tag, re.I)
            else 'Tidak'
        )
        note = source_keterangan(label_attrs) or source_keterangan(tag_attrs) or '—'
        fields.append({
            'label': label,
            'id': f'`{elem_id}`',
            'type': field_type(tag_name, tag, inp_type),
            'mandatory': mandatory,
            'default': '(kosong)',
            'validation': build_validation(chunk, tag, elem_id, error_map),
            'note': note,
        })

    if 'custSection' in body:
        fields.append({
            'label': 'Pelanggan pada Channel Ini',
            'id': '`custSection`',
            'type': 'Sub-tabel (read-only)',
            'mandatory': '—',
            'default': '—',
            'validation': '—',
            'note': 'Hanya mode Ubah; data dari `md_pelanggan`, paginasi 5 baris',
        })
    return fields


def extract_validations(html: str) -> list[str]:
    vals = []
    for m in re.finditer(
        r"Swal\.fire\(['\"](?:Peringatan|Duplikat|Tidak bisa|Error|Masih bentrok)['\"],\s*['\"]([^'\"]+)['\"]",
        html,
    ):
        vals.append(m.group(1))
    for m in re.finditer(
        r"Swal\.fire\(['\"](?:Peringatan|Duplikat|Tidak bisa|Error|Masih bentrok)['\"],\s*`([^`]+)`",
        html,
    ):
        msg = m.group(1)
        msg = re.sub(r'\$\{[^}]+\}', '…', msg)
        if 'sudah ada' in msg.lower() and 'nama' in msg.lower():
            vals.append('Nama Limit sudah dipakai (unik global).')
        elif 'sudah ada' in msg.lower() or 'sudah dipakai' in msg.lower():
            if 'nama' in msg.lower():
                vals.append('Nama Limit sudah dipakai (unik global).')
            else:
                vals.append('Limit untuk pasangan Jabatan / Type Jabatan sudah ada (duplikat header).')
        elif 'tidak ada slot' in msg.lower():
            vals.append(
                'Tidak ada slot tanggal mulai ≥ hari ini tanpa menutup versi aktif lebih awal.'
            )
        elif 'melebihi tanggal selesai' in msg.lower():
            vals.append(
                'Tanggal mulai yang digeser melebihi tanggal selesai. Perpanjang tanggal selesai dulu.'
            )
        elif 'masih bentrok' in msg.lower():
            vals.append('Setelah digeser masih bentrok. Tutup versi aktif lebih awal.')
        else:
            vals.append(msg)
    for m in re.finditer(r"title:\s*['\"]Periode bentrok['\"]", html):
        vals.append(
            'Periode bentrok: tanggal mulai versi baru bentrok dengan versi aktif — '
            'pilih Tutup versi aktif lebih awal / Geser mulai versi baru / Batal.'
        )
        break
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
    seen: set[tuple[str, str]] = set()
    for m in re.finditer(
        r'<button([^>]*)>(.*?)</button>',
        html, re.DOTALL | re.I,
    ):
        attrs, inner = m.group(1), strip_tags(m.group(2)).strip()
        if not inner or inner.lower() in ('batal', 'close'):
            continue
        if '${' in inner or '`' in inner:
            continue
        bid = re.search(r'\bid=["\']([^"\']+)["\']', attrs)
        onclick = re.search(r'\bonclick=["\']([^"\']+)["\']', attrs)
        cls = re.search(r'\bclass=["\']([^"\']+)["\']', attrs)
        btn_id = bid.group(1) if bid else (onclick.group(1) if onclick else '—')
        key = (inner.lower(), btn_id)
        if key in seen:
            continue
        seen.add(key)
        style = 'btn-success' if cls and 'btn-success' in cls.group(1) else (
            'btn-danger' if cls and 'btn-danger' in cls.group(1) else 'btn-secondary'
        )
        buttons.append({
            'label': inner,
            'id': btn_id,
            'style': style,
            'function': button_function_narrative(inner, btn_id, onclick.group(1) if onclick else ''),
            'shot': '',
        })
    for m in re.finditer(
        r'<button[^>]*class="[^"]*accordion-button[^"]*"[^>]*>(.*?)</button>',
        html, re.DOTALL | re.I,
    ):
        inner = strip_tags(m.group(1)).strip()
        if not inner:
            continue
        key = (inner.lower(), 'accordion')
        if key in seen:
            continue
        seen.add(key)
        buttons.append({
            'label': inner,
            'id': '—',
            'style': 'btn-secondary',
            'function': button_function_narrative(inner, '—', ''),
            'shot': '',
        })
    return buttons[:12]


def button_function_narrative(label: str, handler: str, onclick: str = '') -> str:
    """Narasi fungsi tombol untuk kolom Fungsi (bukan kode mentah)."""
    h = (handler or onclick or '').strip()
    low = (label or '').lower()
    if h.startswith('openModal') or 'tambah' in low:
        return 'Membuka modal form untuk menambah data baru.'
    if h.startswith('editItem'):
        return 'Membuka modal form dalam mode ubah untuk baris yang dipilih.'
    if h.startswith('saveItem') or 'simpan' in low:
        return 'Menyimpan perubahan dari modal ke penyimpanan lokal setelah validasi.'
    if h.startswith('del(') or 'hapus' in low:
        return 'Menghapus data terpilih setelah konfirmasi pengguna.'
    if 'download' in low or h.startswith('download'):
        return 'Mengunduh data modul sebagai file CSV.'
    if 'riwayat' in low or 'stok per' in low:
        return f'Membuka panel {label} menampilkan data terkait pada halaman detail.'
    if 'upload' in low or h.startswith('triggerUpload'):
        return 'Mengunggah file CSV untuk sinkronisasi data.'
    if h.startswith('saveDataForm') or 'simpan produk' in low:
        return 'Menyimpan data form ke penyimpanan lokal setelah validasi client-side.'
    if 'kembali' in low:
        return 'Kembali ke dashboard list modul.'
    if 'detail' in low or 'lihat' in low or 'ubah' in low:
        return 'Menampilkan halaman detail record terpilih (parameter URL terenkripsi).'
    if h and h != '—':
        return f'Menjalankan aksi terkait tombol {label}.'
    return f'Menjalankan aksi {label}.'


def load_button_manifest() -> dict:
    path = os.path.join(SCREENSHOTS_DIR, '_btn_manifest.json')
    if not os.path.exists(path):
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


_BTN_MANIFEST: dict | None = None


def get_module_buttons(mod: dict, index_html: str, form_html: str, detail_html: str = '') -> list[dict]:
    """Merge HTML-extracted buttons with captured button screenshots (manifest)."""
    global _BTN_MANIFEST
    if _BTN_MANIFEST is None:
        _BTN_MANIFEST = load_button_manifest()
    html_buttons = extract_buttons(index_html + detail_html)
    manifest = _BTN_MANIFEST.get(mod['id'], [])
    if manifest:
        out = [
            {
                'label': e['label'],
                'id': e.get('id', '—'),
                'style': e.get('style', 'btn-secondary'),
                'function': e.get('narrative') or button_function_narrative(
                    e.get('label', ''), e.get('id', ''), e.get('function', '')
                ),
                'shot': resolve_button_shot_file(
                    e.get('file', '') if e.get('file') else '',
                    e.get('label', ''),
                    SCREENSHOTS_DIR,
                ),
            }
            for e in manifest
        ]
        labels = {b['label'].lower() for b in out}
        for hb in html_buttons:
            if hb['label'].lower() not in labels:
                out.append(hb)
                labels.add(hb['label'].lower())
        return out
    return html_buttons


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


def module_shot_files(mod: dict) -> list[str]:
    shots = SS_BY_MODULE.get(mod['id']) or mod.get('screenshots') or []
    existing = [s for s in shots if os.path.exists(os.path.join(SCREENSHOTS_DIR, s))]
    limit = SCREENSHOT_EMBED_LIMIT.get(mod['id'], len(existing) or 1)
    return existing[:limit]


def screenshot_embed(mod: dict) -> str:
    """Legacy — semua screenshot sekaligus (dashboard_section)."""
    lines = []
    shots = module_shot_files(mod)
    ui_type = mod.get('type', 'page')
    if shots:
        for i, shot in enumerate(shots):
            kind = shot_view_kind(ui_type, shot, i)
            lines.append(screenshot_single_md(mod['label'], shot, kind))
            lines.append('')
    else:
        want = (SS_BY_MODULE.get(mod['id']) or ['ss_tbd.png'])[0]
        lines.append(screenshot_placeholder_md(f'screenshots/{want}'))
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
        format_crud_table([
            ('Read', 'Buka `index.html`', 'Semua role', 'Halaman informasi; bukan modul CRUD'),
        ]),
        '',
    ]
    return '\n'.join(lines)


def crud_table(mod: dict) -> str:
    ui_type = mod.get('type', 'page')
    mid = mod['id']
    rows: list[tuple[str, str, str, str]] = []
    if mid == 'master-pelanggan':
        rows = [
            ('Create', '—', '—', 'Data diinput dari aplikasi mobile (SFA)'),
            ('Read', 'dashboard list (DataTable) + `detail.html`', 'Semua role', 'View-only'),
            ('Update', '—', '—', 'Tidak tersedia di web (sumber mobile)'),
            ('Delete', '—', '—', 'Tidak tersedia di web'),
        ]
    elif mid in ('master-pegawai', 'master-stokis'):
        rows = [
            ('Create', 'Upload CSV (baris baru)', 'Admin', 'Sinkronisasi dari file, bukan input manual'),
            ('Read', 'dashboard list (DataTable) + `detail.html`', 'Semua role', 'Termasuk riwayat status/stok'),
            ('Update', 'Upload CSV (status Active/Inactive)', 'Admin', 'Status disimpulkan dari keberadaan ID di file'),
            ('Delete', '—', '—', 'Tidak ada hapus; nonaktif via sinkronisasi CSV'),
        ]
    elif mid == 'master-produk':
        rows = [
            ('Create', 'Klik Tambah Produk → `detail.html` (LOV Kode Produk)', 'Admin', 'Persist ke localStorage'),
            ('Read', 'dashboard list (DataTable) + `detail.html`', 'Semua role', '—'),
            ('Update', 'Buka `detail.html?param=` → ubah harga beli/pajak/status', 'Admin', 'Kode & data API read-only'),
            ('Delete', '—', '—', 'Tombol hapus dihilangkan'),
        ]
    elif mid == 'master-channel':
        rows = [
            ('Create', 'Master Data Portal: Tambah Channel / Type Customer / Account / Mapping', 'Admin Master Data', 'localStorage simulasi; FPRS tidak punya Create'),
            ('Read', 'Portal + FPRS: list + detail (Manage & Mapping); FPRS view-only', 'Semua role dengan bitView', 'Shared seed/localStorage'),
            ('Update', 'Hanya di Master Data Portal (tab Manage)', 'Admin Master Data', 'TypeCus unik per Channel; Account unik global'),
            ('Delete', 'Portal: hapus Mapping; soft nonaktif via Status', 'Admin Master Data', 'FPRS tidak bisa hapus/ubah'),
        ]
    elif mid == 'penjualan-faktur':
        rows = [
            ('Create', '—', '—', 'Dibuat dari Mobile SFA; tidak tersedia di Web Admin'),
            ('Read', 'dashboard list + `detail.html` + `print.html`', 'Super Admin, Sales Manager, RSM', 'View-only; cakupan region sesuai RBAC'),
            ('Update', '—', '—', 'Tidak tersedia di Web Admin'),
            ('Delete', '—', '—', 'Tidak tersedia di Web Admin'),
            ('Export', 'Tombol Ekspor (rencana Excel)', 'Super Admin, Sales Manager, RSM', 'Prototipe: mock Swal; produksi: file Excel header-level'),
        ]
    elif mid in ('penjualan-stok-motoris', 'kunjungan-geografis'):
        rows = [
            ('Read', 'Buka dashboard monitoring', 'Super Admin, Sales Manager, RSM', 'Dashboard/monitoring read-only'),
            ('Create', '—', '—', 'Tidak tersedia di UI'),
            ('Update', '—', '—', 'Tidak tersedia (Refresh meregenerasi snapshot lokal)'),
            ('Delete', '—', '—', 'Tidak tersedia'),
            ('Export', 'Export Excel → `SalesInvoices` + `DailyVisits`', 'Super Admin, Sales Manager, RSM', 'Filter UI + scope region berlaku'),
        ]
    elif ui_type == 'modal':
        rows = [
            ('Create', 'Klik Tambah → isi modal → Simpan', 'Admin', 'Persist ke localStorage'),
            ('Read', 'dashboard list (DataTable)', 'Semua role', '—'),
            ('Update', 'Klik Edit → ubah modal → Simpan', 'Admin', '—'),
            ('Delete', 'Klik Hapus → konfirmasi Swal', 'Admin', 'Hapus dari localStorage'),
        ]
    else:
        rows = [
            ('Create', 'Klik Tambah → `add.html`', 'Admin', '—'),
            ('Read', 'dashboard list + `detail.html`', 'Semua role', '—'),
            ('Update', 'Edit via `add.html?id=`', 'Admin', '—'),
            ('Delete', 'Konfirmasi Swal pada dashboard list', 'Admin', '—'),
        ]
    return apply_fsd_terms(format_crud_table(rows))


def module_section(chapter: str, sub: int, mod: dict, br_counters: dict, all_rules: list) -> str:
    if mod['id'] == 'dashboard':
        return dashboard_section(chapter, sub, mod)
    index_html = read_html(mod['htmlPath'])
    form_html = read_html(mod.get('formPath') or '')
    detail_html = ''
    if mod.get('formPath'):
        if mod['formPath'].endswith('detail.html'):
            detail_html = form_html
        else:
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

    sec = SubsectionCounter(chapter, sub)

    shots = module_shot_files(mod)
    all_buttons = get_module_buttons(mod, index_html, form_html, detail_html)

    # --- Dashboard list: screenshot → kolom → tombol aksi ---
    if shots:
        lines.append(screenshot_single_md(mod['label'], shots[0], 'dashboard'))
        lines.append('')
    else:
        want = (SS_BY_MODULE.get(mod['id']) or ['ss_tbd.png'])[0]
        lines.append(screenshot_placeholder_md(f'screenshots/{want}'))
        lines.append('')

    cols = extract_columns(index_html)
    if cols:
        lines.append(sec.next('Kolom DataTable Dashboard List'))
        lines.append('')
        lines.append('| Kolom | Field Key | Render | Sortable | Keterangan |')
        lines.append('|-------|-----------|--------|----------|------------|')
        for c in cols:
            label = c['label'] if isinstance(c, dict) else c
            ket = c.get('keterangan', 'Kolom grid dashboard list') if isinstance(c, dict) else 'Kolom grid dashboard list'
            key = re.sub(r'[^A-Za-z0-9]', '', label.title())
            lines.append(f'| {label} | `{key}` | Text | Ya | {ket} |')
        lines.append('')

    dash_buttons = filter_buttons_by_context(all_buttons, 'dashboard')
    if dash_buttons:
        lines.append(sec.next('Tombol Aksi — Dashboard List'))
        lines.append('')
        lines.extend(buttons_table_md(dash_buttons))
        lines.append('')

    # --- Tampilan sekunder (modal / detail): screenshot → narasi form → field → tombol ---
    secondary_shot = shots[1] if len(shots) > 1 else None
    has_detail_view = bool(detail_html and ui_type != 'modal')

    if secondary_shot:
        kind = shot_view_kind(ui_type, secondary_shot, 1)
        lines.append(screenshot_single_md(mod['label'], secondary_shot, kind))
        lines.append('')
        if ui_type == 'modal':
            intro = modal_form_intro(mod['id'])
            if intro:
                lines.append(intro)
    elif has_detail_view:
        lines.append(
            'Halaman **detail** (`detail.html`) diakses melalui aksi baris pada dashboard list '
            '(parameter URL terenkripsi `?param=`).'
        )
        lines.append('')

    if ui_type == 'modal':
        fields = extract_modal_fields(index_html)
        form_label = form_section_label(mod, index_html, ui_type)
        ctx_buttons = filter_buttons_by_context(all_buttons, 'modal')
    elif has_detail_view:
        fields = extract_fields(detail_html)
        form_label = form_section_label(mod, detail_html, ui_type)
        ctx_buttons = filter_buttons_by_context(all_buttons, 'detail')
    elif form_html:
        fields = extract_fields(form_html)
        form_label = form_section_label(mod, form_html, ui_type)
        ctx_buttons = []
    else:
        fields = []
        form_label = ''
        ctx_buttons = []

    if fields:
        lines.append(sec.next(form_label))
        lines.append('')
        lines.append('| Field Name | ID Elemen | Tipe | Mandatory | Default | Validasi | Keterangan |')
        lines.append('|------------|-----------|------|-----------|---------|----------|------------|')
        for f in fields:
            lines.append(
                f'| {f["label"]} | {f["id"]} | {f["type"]} | {f["mandatory"]} | {f["default"]} | {f["validation"]} | {f["note"]} |'
            )
        lines.append('')

    if ctx_buttons:
        ctx_title = 'Form Modal' if ui_type == 'modal' else 'Halaman Detail'
        lines.append(sec.next(f'Tombol Aksi — {ctx_title}'))
        lines.append('')
        lines.extend(buttons_table_md(ctx_buttons))
        lines.append('')

    vals = extract_validations(combined)
    if vals:
        lines.append(sec.next('Business Rules'))
        lines.append('')
        lines.append('| Rule ID | Aturan |')
        lines.append('|---------|--------|')
        prefix = br_prefix_for(mod)
        for v in vals:
            rid = next_br_id(prefix, br_counters)
            lines.append(f'| {rid} | {v} |')
            all_rules.append((rid, f'[{mod["label"]}] {v}'))
        lines.append('')

    lines.append(sec.next('CRUD'))
    lines.append('')
    lines.append(crud_table(mod))
    lines.append('')

    return apply_fsd_terms('\n'.join(lines))


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
