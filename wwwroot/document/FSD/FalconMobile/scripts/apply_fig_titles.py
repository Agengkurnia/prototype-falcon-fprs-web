#!/usr/bin/env python3
"""Apply fig-title comments to Mobile SFA source MD screenshots."""
from __future__ import annotations

import re
from pathlib import Path

MD_PATH = Path(__file__).resolve().parent.parent / 'source' / 'FSD_Falcon_Mobile_v1.0.md'

FIG_TITLES: dict[str, str] = {
    'ss_01_login.png': 'Mobile SFA — Login',
    'ss_02_home.png': 'Mobile SFA — Beranda',
    'ss_03_dasbor.png': 'Mobile SFA — Dasbor',
    'ss_04_profil.png': 'Mobile SFA — Profil',
    'ss_05_target.png': 'Mobile SFA — Target KPI',
    'ss_06_bottom_nav.png': 'Mobile SFA — Bottom Navigation',
    'ss_07_visit_list.png': 'Mobile SFA — Daftar Kunjungan',
    'ss_08_visit_detail.png': 'Mobile SFA — Detail Kunjungan',
    'ss_09_order_input.png': 'Mobile SFA — Input Sales Order',
    'ss_10_order_add.png': 'Mobile SFA — Tambah Order Mandiri',
    'ss_11_invoice_list.png': 'Mobile SFA — Daftar Faktur',
    'ss_12_invoice_detail.png': 'Mobile SFA — Detail Faktur',
    'ss_13_collection_list.png': 'Mobile SFA — Daftar Penagihan',
    'ss_14_collection_input.png': 'Mobile SFA — Input Penagihan',
    'ss_15_outlet_list.png': 'Mobile SFA — Daftar Outlet',
    'ss_16_outlet_detail.png': 'Mobile SFA — Detail Outlet',
    'ss_17_outlet_add.png': 'Mobile SFA — Tambah Outlet',
    'ss_18_product_catalog.png': 'Mobile SFA — Katalog Produk',
    'ss_19_product_detail.png': 'Mobile SFA — Detail Produk',
    'ss_20_restock_review.png': 'Mobile SFA — Review Restock',
    'ss_21_sync_detail.png': 'Mobile SFA — Detail Sinkronisasi',
    'ss_m01_val_login_kosong.png': 'Validasi login — field wajib',
    'ss_m02_val_visit_luar_radius.png': 'Validasi visit luar radius GPS',
    'ss_m03_val_foto_wajib.png': 'Validasi foto bukti wajib',
    'ss_m04_val_visit_aktif_lain.png': 'Validasi visit aktif di outlet lain',
    'ss_m05_val_aktivitas_belum_lengkap.png': 'Validasi aktivitas visit belum lengkap',
    'ss_m06_val_cek_stok_wajib.png': 'Validasi cek stok wajib',
}

IMAGE_RE = re.compile(r'^!\[([^\]]*)\]\((screenshots/([^)]+))\)\s*$')


def convert_images(text: str) -> str:
    out_lines: list[str] = []
    for line in text.splitlines():
        m = IMAGE_RE.match(line.strip())
        if m:
            fname = m.group(3)
            path = m.group(2)
            title = FIG_TITLES.get(fname, m.group(1).strip() or fname)
            out_lines.append(f'<!-- fig-title: {title} -->')
            out_lines.append(f'![]({path})')
            continue
        out_lines.append(line)
    return '\n'.join(out_lines)


def main():
    text = MD_PATH.read_text(encoding='utf-8')
    updated = convert_images(text)
    MD_PATH.write_text(updated, encoding='utf-8')
    count = sum(1 for ln in updated.splitlines() if ln.startswith('<!-- fig-title:'))
    print(f'Updated {MD_PATH.name}: {count} fig-title markers')


if __name__ == '__main__':
    main()
