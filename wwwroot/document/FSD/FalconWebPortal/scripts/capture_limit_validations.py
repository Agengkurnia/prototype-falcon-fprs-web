#!/usr/bin/env python3
"""
Capture screenshot validasi / SweetAlert modul Limit Target Harian.

Prasyarat: py -m http.server 5502 di root Prototype.

Usage:
  py scripts/capture_limit_validations.py
  py scripts/capture_limit_validations.py --base-url http://127.0.0.1:5502
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))

DETAIL_CREATE = 'Views/FPRS/MasterData/LimitTargetHarian/detail.html?mode=create'
DETAIL_EDIT = 'Views/FPRS/MasterData/LimitTargetHarian/detail.html'
INDEX = 'Views/FPRS/MasterData/LimitTargetHarian/index.html'
HISTORY = 'Views/FPRS/MasterData/LimitTargetHarian/history.html'
KEY = 'md_limit_target'
SEED_VER_KEY = 'md_limit_target_seed_ver'

# Seed: satu header Motoris dengan versi panjang (untuk overlap + duplikat)
SEED_LIMIT = [
    {
        'id': 900001,
        'nama': 'Limit Motoris Reguler Capture',
        'jabatan': 'Motoris',
        'typeJabatan': 'Motoris Reguler',
        'versions': [
            {
                'id': 'v-seed-1',
                'minimalHarian': 28,
                'maximalHarian': 35,
                'targetHke': 6,
                'targetHkeBulanan': 24,
                'tanggalMulai': '2026-01-01',
                'tanggalSelesai': '2099-12-31',
                'active': True,
            }
        ],
    }
]


SHOTS = [
    'ss_51_limit_val_jabatan_wajib.png',
    'ss_52_limit_val_field_wajib.png',
    'ss_53_limit_val_max_lt_min.png',
    'ss_54_limit_val_backdate.png',
    'ss_55_limit_val_selesai_lt_mulai.png',
    'ss_56_limit_val_duplikat.png',
    'ss_57_limit_val_periode_bentrok.png',
    'ss_58_master_limit_history.png',
]


def seed_storage(page):
    page.evaluate(
        """([key, seedKey, data]) => {
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(seedKey, 'capture-val');
        }""",
        [KEY, SEED_VER_KEY, SEED_LIMIT],
    )


def install_seed_init(context_or_page):
    """Pastikan seed Limit tersedia sebelum script halaman jalan."""
    payload = json.dumps(SEED_LIMIT)
    context_or_page.add_init_script(
        f"""() => {{
            try {{
                localStorage.setItem({json.dumps(KEY)}, {json.dumps(payload)});
                localStorage.setItem({json.dumps(SEED_VER_KEY)}, 'capture-val');
            }} catch (e) {{}}
        }}"""
    )


def shot_swal(page, filename: str) -> bool:
    page.wait_for_selector('.swal2-popup', state='visible', timeout=10000)
    time.sleep(0.35)
    popup = page.query_selector('.swal2-popup')
    out = os.path.join(SCREENSHOTS_DIR, filename)
    if popup:
        popup.screenshot(path=out)
    else:
        page.screenshot(path=out, full_page=False)
    print(f'   saved {filename}')
    return True


def dismiss_swal(page):
    try:
        if page.query_selector('.swal2-confirm'):
            page.click('.swal2-confirm')
        elif page.query_selector('.swal2-cancel'):
            page.click('.swal2-cancel')
        page.wait_for_selector('.swal2-popup', state='hidden', timeout=5000)
    except Exception:
        page.keyboard.press('Escape')
        time.sleep(0.3)


def fill_valid_numbers(page, *, min_v=10, max_v=20, mulai=None, selesai='2099-12-31'):
    if mulai is None:
        mulai = page.evaluate("() => new Date().toISOString().slice(0, 10)")
    page.fill('#inputMin', str(min_v))
    page.fill('#inputMax', str(max_v))
    page.fill('#inputHke', '6')
    page.fill('#inputHkeBulanan', '24')
    page.fill('#inputMulai', mulai)
    page.fill('#inputSelesai', selesai)


def goto_create(page, base):
    page.goto(f'{base}/{DETAIL_CREATE}', wait_until='domcontentloaded')
    page.wait_for_selector('#btnUpdate', timeout=15000)
    seed_storage(page)
    page.reload(wait_until='domcontentloaded')
    page.wait_for_selector('#btnUpdate', timeout=15000)
    page.wait_for_function('() => typeof window.saveForm === "function"', timeout=20000)
    time.sleep(0.4)


def goto_edit(page, base, record_id=900001):
    dismiss_swal(page)
    page.goto(f'{base}/{DETAIL_EDIT}?id={record_id}', wait_until='domcontentloaded', timeout=30000)
    page.wait_for_selector('#btnUpdate', timeout=20000)
    page.wait_for_function('() => typeof window.saveForm === "function"', timeout=20000)
    time.sleep(0.4)


def click_save(page):
    # saveForm async — jangan menunggu Promise di evaluate agar Swal tetap muncul
    page.evaluate('() => { void window.saveForm(); }')
    time.sleep(0.5)


def capture(base_url: str):
    from playwright.sync_api import sync_playwright

    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    base = base_url.rstrip('/')

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        install_seed_init(context)
        page = context.new_page()

        # --- 1 Jabatan wajib (Nama diisi dulu supaya Swal jabatan yang tampil) ---
        print('1) Jabatan / Type wajib')
        goto_create(page, base)
        page.fill('#inputNama', 'Limit Capture Validasi')
        page.select_option('#inputJabatan', '')
        click_save(page)
        shot_swal(page, 'ss_51_limit_val_jabatan_wajib.png')
        dismiss_swal(page)

        # --- 2 Field angka/periode wajib ---
        print('2) Field angka & periode wajib')
        page.fill('#inputNama', 'Limit Capture Validasi')
        page.select_option('#inputJabatan', 'MD')
        page.wait_for_timeout(200)
        page.select_option('#inputTypeJabatan', 'MD Reguler')
        # kosongkan angka
        for sel in ('#inputMin', '#inputMax', '#inputHke', '#inputHkeBulanan'):
            page.fill(sel, '')
        click_save(page)
        shot_swal(page, 'ss_52_limit_val_field_wajib.png')
        dismiss_swal(page)

        # --- 3 Max < Min ---
        print('3) Max < Min')
        page.fill('#inputNama', 'Limit Capture Validasi')
        fill_valid_numbers(page, min_v=30, max_v=10)
        click_save(page)
        shot_swal(page, 'ss_53_limit_val_max_lt_min.png')
        dismiss_swal(page)

        # --- 4 Backdate ---
        print('4) Tanggal mulai backdate')
        page.fill('#inputNama', 'Limit Capture Validasi')
        fill_valid_numbers(page, min_v=10, max_v=20, mulai='2020-01-01', selesai='2099-12-31')
        click_save(page)
        shot_swal(page, 'ss_54_limit_val_backdate.png')
        dismiss_swal(page)

        # --- 5 Selesai < Mulai ---
        print('5) Tanggal selesai < mulai')
        today = page.evaluate("() => new Date().toISOString().slice(0, 10)")
        page.fill('#inputNama', 'Limit Capture Validasi')
        # selesai = kemarin relative to mulai=today → use mulai far future and selesai earlier
        fill_valid_numbers(page, min_v=10, max_v=20, mulai='2030-06-01', selesai='2030-01-01')
        click_save(page)
        shot_swal(page, 'ss_55_limit_val_selesai_lt_mulai.png')
        dismiss_swal(page)

        # --- 6 Duplikat header (nama unik agar kena unik jabatan+type, bukan nama) ---
        print('6) Duplikat jabatan+type')
        page.fill('#inputNama', 'Limit Capture Duplikat Type')
        page.select_option('#inputJabatan', 'Motoris')
        page.wait_for_timeout(200)
        page.select_option('#inputTypeJabatan', 'Motoris Reguler')
        fill_valid_numbers(page, min_v=10, max_v=20, mulai=today, selesai='2099-12-31')
        click_save(page)
        shot_swal(page, 'ss_56_limit_val_duplikat.png')
        dismiss_swal(page)

        # --- 7 Periode bentrok (edit existing) ---
        print('7) Periode bentrok')
        goto_edit(page, base)
        # form sudah prefill versi baru dengan mulai=today → overlap dengan seed sampai 2099
        page.fill('#inputNama', 'Limit Motoris Reguler Capture')
        fill_valid_numbers(page, min_v=30, max_v=35, mulai=today, selesai='2099-12-31')
        click_save(page)
        shot_swal(page, 'ss_57_limit_val_periode_bentrok.png')
        dismiss_swal(page)

        # --- 8 History page ---
        print('8) Halaman History')
        dismiss_swal(page)
        page.goto(f'{base}/{HISTORY}?id=900001', wait_until='domcontentloaded', timeout=30000)
        page.wait_for_selector('#viewNama, #viewJabatan', timeout=20000)
        time.sleep(1.0)
        page.screenshot(
            path=os.path.join(SCREENSHOTS_DIR, 'ss_58_master_limit_history.png'),
            full_page=True,
        )
        print('   saved ss_58_master_limit_history.png')

        context.close()
        browser.close()

    print(f'\nCapture validasi Limit selesai -> {SCREENSHOTS_DIR}')
    for name in SHOTS:
        path = os.path.join(SCREENSHOTS_DIR, name)
        ok = os.path.exists(path)
        print(f'  [{"OK" if ok else "MISS"}] {name}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://127.0.0.1:5502')
    args = parser.parse_args()
    capture(args.base_url)


if __name__ == '__main__':
    main()
