#!/usr/bin/env python3
"""Create ss_NN alias copies of existing screenshots (non-destructive)."""
import os
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SHOT_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'screenshots')

ALIASES = {
    'dashboard_home.png': 'ss_01_dashboard.png',
    'master_produk.png': 'ss_02_master_produk_index.png',
    'master_produk_add.png': 'ss_03_master_produk_add.png',
    'master_produk_edit.png': 'ss_04_master_produk_edit.png',
    'master_pelanggan.png': 'ss_05_master_pelanggan_index.png',
    'master_pegawai.png': 'ss_06_master_pegawai_index.png',
    'master_akun.png': 'ss_07_master_akun_index.png',
    'faktur_index.png': 'ss_08_faktur_index.png',
    'faktur_add.png': 'ss_09_faktur_add.png',
    'canvassing_index.png': 'ss_10_canvassing_index.png',
    'kunjungan_informasi.png': 'ss_11_kunjungan_informasi.png',
    'kunjungan_geografis.png': 'ss_12_kunjungan_geografis.png',
    'kunjungan_rute.png': 'ss_13_kunjungan_rute.png',
    'motoris_index.png': 'ss_14_stok_motoris_index.png',
    'master_supplier.png': 'ss_15_master_supplier_index.png',
}

if __name__ == '__main__':
    created = 0
    for src, dst in ALIASES.items():
        sp = os.path.join(SHOT_DIR, src)
        dp = os.path.join(SHOT_DIR, dst)
        if os.path.exists(sp) and not os.path.exists(dp):
            shutil.copy2(sp, dp)
            created += 1
            print(f'  {src} -> {dst}')
    print(f'Done: {created} alias screenshots created in {SHOT_DIR}')
