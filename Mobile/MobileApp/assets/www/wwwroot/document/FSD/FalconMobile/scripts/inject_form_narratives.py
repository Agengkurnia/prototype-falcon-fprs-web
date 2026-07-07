#!/usr/bin/env python3
"""Sisipkan tabel Tujuan Form & Pengguna ke setiap modul UI di FSD Mobile."""
from __future__ import annotations

import os
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MD_PATH = os.path.join(SCRIPT_DIR, '..', 'source', 'FSD_Falcon_Mobile_v1.0.md')

MOBILE_FORM_META: dict[str, dict[str, str]] = {
    'login.html': {
        'purpose': (
            'Memverifikasi identitas canvasser sebelum mengakses aplikasi SFA; '
            'membuat session lokal (`sfa_user`) sebagai prasyarat seluruh modul lapangan.'
        ),
        'users': 'Canvasser / Salesman lapangan (role `canvasser`).',
    },
    'home.html': {
        'purpose': (
            'Menjadi pusat aktivitas harian: ringkasan KPI hari ini, akses cepat ke rute kunjungan, '
            'faktur, cek stok, dan status sinkronisasi data offline.'
        ),
        'users': 'Canvasser / Salesman — layar utama setelah login.',
    },
    'dasbor.html': {
        'purpose': (
            'Menampilkan analitik performa penjualan dan kunjungan (chart, progress target) '
            'untuk evaluasi pencapaian periode berjalan.'
        ),
        'users': 'Canvasser (monitoring diri), Supervisor Sales (review saat coaching).',
    },
    'profil.html': {
        'purpose': (
            'Menampilkan identitas pengguna, cabang, dan menu pendukung (target, logout, sync) '
            'serta pintasan ke pengaturan akun.'
        ),
        'users': 'Canvasser / Salesman.',
    },
    'target.html': {
        'purpose': (
            'Menyajikan target KPI yang ditetapkan (kunjungan, omzet, efektivitas) '
            'agar sales dapat memantau gap terhadap goal periode.'
        ),
        'users': 'Canvasser, Supervisor Sales (penetapan & review target).',
    },
    'bottom-nav': {
        'purpose': (
            'Menyediakan navigasi shell persisten antar tiga area utama aplikasi: Dasbor, Beranda, dan Profil.'
        ),
        'users': 'Canvasser — komponen UI global di halaman shell.',
    },
    'visit_list.html': {
        'purpose': (
            'Menampilkan daftar outlet/rute kunjungan hari ini beserta status (belum/sedang/selesai) '
            'sebagai starting point eksekusi visit.'
        ),
        'users': 'Canvasser / Salesman.',
    },
    'visit_detail.html': {
        'purpose': (
            'Mengelola siklus kunjungan tunggal: pilih stokis, check-in GPS, cek stok, input order/AR, '
            'alasan tidak beli, hingga check-out dan antrean sync.'
        ),
        'users': 'Canvasser / Salesman di lokasi outlet.',
    },
    'order_input.html': {
        'purpose': (
            'Mencatat sales order dalam konteks visit aktif: pilih produk, UOM, diskon, '
            'dan menyelesaikan transaksi penjualan ke outlet yang sedang dikunjungi.'
        ),
        'users': 'Canvasser saat kunjungan berstatus checked-in.',
    },
    'order_add.html': {
        'purpose': (
            'Mencatat transaksi penjualan mandiri di luar alur visit terstruktur '
            '(mis. order telepon atau follow-up) dengan form produk lengkap.'
        ),
        'users': 'Canvasser / Salesman.',
    },
    'invoice_list.html': {
        'purpose': 'Menampilkan daftar faktur penjualan yang terbentuk untuk dilacak status dan follow-up pembayaran.',
        'users': 'Canvasser, Supervisor (monitoring piutang lapangan).',
    },
    'invoice_detail.html': {
        'purpose': (
            'Menampilkan rincian faktur (item, total, status bayar) sebagai bukti transaksi '
            'dan referensi penagihan AR.'
        ),
        'users': 'Canvasser, Supervisor Sales.',
    },
    'collection_list.html': {
        'purpose': 'Menampilkan daftar piutang/AR outlet yang belum lunas untuk diprioritaskan penagihan.',
        'users': 'Canvasser (penagihan lapangan), Supervisor.',
    },
    'collection_input.html': {
        'purpose': (
            'Mencatat pembayaran piutang: pilih invoice, nominal, metode tunai, foto bukti, '
            'dan menghitung sisa tagihan.'
        ),
        'users': 'Canvasser saat menagih di outlet.',
    },
    'outlet_list.html': {
        'purpose': (
            'Menampilkan daftar outlet/pelanggan dengan filter dan mode pilih outlet '
            '(kunjungan, geo tag, registrasi).'
        ),
        'users': 'Canvasser, Supervisor (validasi data outlet).',
    },
    'outlet_detail.html': {
        'purpose': (
            'Menampilkan profil lengkap outlet (alamat, kontak, saldo AR, riwayat) '
            'sebagai referensi sebelum/sesudah kunjungan.'
        ),
        'users': 'Canvasser, Supervisor Sales.',
    },
    'outlet_add.html': {
        'purpose': (
            'Mendaftarkan outlet/pelanggan baru di lapangan beserta koordinat GPS dan data wajib '
            'untuk antrean sinkronisasi ke server.'
        ),
        'users': 'Canvasser (prospek lapangan), Supervisor (approval data).',
    },
    'product_catalog.html': {
        'purpose': (
            'Menyediakan katalog produk untuk cek stok, filter kategori, dan pemilihan item order '
            '(mode standalone atau dalam visit).'
        ),
        'users': 'Canvasser / Salesman.',
    },
    'product_detail.html': {
        'purpose': 'Menampilkan detail produk (harga, konversi UOM, stok) sebelum ditambahkan ke order.',
        'users': 'Canvasser / Salesman.',
    },
    'restock_review.html': {
        'purpose': (
            'Mereview kebutuhan kulakan/restock dari stokis berdasarkan hasil cek stok outlet '
            'untuk perencanaan pengisian ulang.'
        ),
        'users': 'Canvasser, Supervisor (koordinasi supply).',
    },
    'sync_detail.html': {
        'purpose': (
            'Menampilkan antrean data offline yang menunggu sinkronisasi (visit, invoice, collection, outlet) '
            'dan status upload ke server.'
        ),
        'users': 'Canvasser (trigger sync), ICT/Support (troubleshooting data).',
    },
}


def narrative_table(meta: dict[str, str]) -> str:
    return (
        '| Aspek | Keterangan |\n'
        '|-------|------------|\n'
        f'| **Tujuan Form** | {meta["purpose"]} |\n'
        f'| **Pengguna** | {meta["users"]} |\n'
        '\n'
    )


def section_key(heading: str) -> str | None:
    m = re.search(r'`([^`]+\.html)`', heading)
    if m:
        return m.group(1)
    if 'Bottom Navigation' in heading:
        return 'bottom-nav'
    return None


def inject(md: str) -> tuple[str, int]:
    count = 0
    parts = re.split(r'(^### \d+\.\d+ [^\n]+)', md, flags=re.MULTILINE)
    if len(parts) < 2:
        return md, 0

    out = [parts[0]]
    i = 1
    while i < len(parts):
        heading = parts[i]
        body = parts[i + 1] if i + 1 < len(parts) else ''
        key = section_key(heading)
        meta = MOBILE_FORM_META.get(key) if key else None

        if meta and '**Tujuan Form**' not in body[:800]:
            marker = '**Tampilan'
            pos = body.find(marker)
            if pos != -1:
                body = body[:pos] + narrative_table(meta) + body[pos:]
                count += 1

        out.append(heading)
        out.append(body)
        i += 2

    return ''.join(out), count


def main():
    with open(MD_PATH, 'r', encoding='utf-8', newline='') as f:
        md = f.read()
    updated, n = inject(md)
    if n:
        with open(MD_PATH, 'w', encoding='utf-8', newline='') as f:
            f.write(updated)
        print(f'Narasi form disisipkan ({n} section) -> {MD_PATH}')
    else:
        print('Semua section sudah memiliki narasi form.')


if __name__ == '__main__':
    main()
