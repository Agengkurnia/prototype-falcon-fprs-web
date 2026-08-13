#!/usr/bin/env python3
"""Capture tombol aksi & validasi SweetAlert modul Channel (Master Data Portal)."""
from __future__ import annotations

import json
import os
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')

sys.path.insert(0, SCRIPT_DIR)
from capture_action_buttons import dedupe_button_entries  # noqa: E402

PORTAL_PATH = 'Views/MasterDataPortal/Channel/index.html'
SEED_VER = 'hierarchy-20260812b'

KEYS = {
    'channel': 'md_channel',
    'typeCus': 'md_type_customer',
    'account': 'md_account',
    'mapping': 'md_channel_mapping',
}
VER_KEYS = {
    'channel': 'md_channel_seed_ver',
    'typeCus': 'md_type_customer_seed_ver',
    'account': 'md_account_seed_ver',
    'mapping': 'md_channel_mapping_seed_ver',
}

VALIDATION_SHOTS = [
    'ss_60_channel_val_nama_channel_wajib.png',
    'ss_61_channel_val_nama_channel_duplikat.png',
    'ss_62_channel_val_typecus_wajib.png',
    'ss_63_channel_val_typecus_duplikat.png',
    'ss_64_channel_val_account_wajib.png',
    'ss_65_channel_val_account_duplikat.png',
    'ss_66_channel_val_no_channel_aktif.png',
    'ss_67_channel_val_no_typecus_aktif.png',
    'ss_68_channel_val_no_account_aktif.png',
    'ss_69_channel_val_mapping_wajib.png',
    'ss_70_channel_val_mapping_duplikat.png',
]

MODAL_SHOTS = [
    ('ss_71_channel_modal_mapping.png', 'open_mapping'),
    ('ss_72_channel_modal_channel.png', 'open_channel'),
    ('ss_73_channel_modal_type_customer.png', 'open_typecus'),
    ('ss_74_channel_modal_account.png', 'open_account'),
]


def _wait_portal(page):
    try:
        page.wait_for_selector('#tblMappingBody tr, #btnAddMapping', timeout=20000)
    except Exception:
        pass
    time.sleep(0.8)


def _shot_btn(page, selector: str, path: str) -> bool:
    loc = page.locator(selector).first
    try:
        if loc.count() and loc.is_visible():
            loc.scroll_into_view_if_needed(timeout=3000)
            data = loc.screenshot()
            with open(path, 'wb') as f:
                f.write(data)
            return True
    except Exception:
        pass
    return False


def _entry(file: str, label: str, bid: str, style: str, narrative: str) -> dict:
    return {
        'file': file,
        'label': label,
        'id': bid,
        'style': style,
        'function': '—',
        'narrative': narrative,
    }


def _goto_manage(page):
    page.locator('#tab-manage-btn').click(timeout=8000)
    page.wait_for_selector('#accManage .accordion-button', timeout=10000)
    time.sleep(0.5)


def _open_accordion(page, target: str):
    """Buka satu panel accordion Manage (data-bs-parent hanya satu terbuka)."""
    btn = page.locator(f'button.accordion-button[data-bs-target="{target}"]')
    if btn.count():
        cls = btn.first.get_attribute('class') or ''
        if 'collapsed' in cls:
            btn.first.click()
            page.wait_for_selector(f'{target}.show', timeout=8000)
            time.sleep(0.35)


def capture_channel_buttons(page, shots_dir: str) -> list[dict]:
    """Capture semua tombol Channel (Mapping + Manage + modal)."""
    entries: list[dict] = []

    def add(selector: str, fname: str, label: str, bid: str, style: str, narrative: str):
        path = os.path.join(shots_dir, fname)
        ok = _shot_btn(page, selector, path)
        if ok:
            print(f'   btn {fname} ({label})')
        entries.append(_entry(fname if ok else '', label, bid, style, narrative))

    _wait_portal(page)

    add('#btnAddMapping', 'ss_btn_channel_tambah-mapping.png', 'Tambah Mapping',
        'btnAddMapping', 'btn-success', 'Membuka modal untuk menambah triple mapping baru.')
    add('.btn-del-map', 'ss_btn_channel_hapus.png', 'Hapus',
        'btn-del-map', 'btn-outline-danger', 'Menghapus baris mapping setelah konfirmasi.')
    add('#tab-mapping-btn', 'ss_btn_channel_tab-mapping.png', 'Mapping',
        'tab-mapping-btn', 'btn-secondary', 'Menampilkan tab daftar triple mapping.')
    add('#tab-manage-btn', 'ss_btn_channel_tab-manage.png', 'Manage',
        'tab-manage-btn', 'btn-secondary', 'Menampilkan tab kelola master Channel, Type Customer, dan Account.')

    _goto_manage(page)

    _open_accordion(page, '#accChannel')
    add('button.accordion-button[data-bs-target="#accChannel"]',
        'ss_btn_channel_accordion-channel.png', 'Channel',
        'hdChannel', 'btn-secondary', 'Membuka panel master Channel pada tab Manage.')
    add('#btnAddChannel', 'ss_btn_channel_tambah-channel.png', 'Tambah Channel',
        'btnAddChannel', 'btn-success', 'Membuka modal tambah master Channel.')
    add('.btn-edit-ch', 'ss_btn_channel_ubah-channel.png', 'Ubah Channel',
        'btn-edit-ch', 'btn-outline-success', 'Membuka modal ubah master Channel terpilih.')
    page.locator('#btnAddChannel').click(timeout=5000)
    page.wait_for_selector('#modalChannel.show', timeout=8000)
    add('#btnSaveChannel', 'ss_btn_channel_simpan-channel.png', 'Simpan Channel',
        'btnSaveChannel', 'btn-success', 'Menyimpan master Channel setelah validasi.')
    page.locator('#modalChannel .btn-secondary').click()
    time.sleep(0.3)

    _open_accordion(page, '#accTypeCus')
    add('button.accordion-button[data-bs-target="#accTypeCus"]',
        'ss_btn_channel_accordion-type-customer.png', 'Type Customer',
        'hdTypeCus', 'btn-secondary', 'Membuka panel master Type Customer (global).')
    add('#btnAddTypeCus', 'ss_btn_channel_tambah-type-customer.png', 'Tambah Type Customer',
        'btnAddTypeCus', 'btn-success', 'Membuka modal tambah Type Customer.')
    add('.btn-edit-tc', 'ss_btn_channel_ubah-type-customer.png', 'Ubah Type Customer',
        'btn-edit-tc', 'btn-outline-success', 'Membuka modal ubah Type Customer terpilih.')
    page.locator('#btnAddTypeCus').click(timeout=5000)
    page.wait_for_selector('#modalTypeCus.show', timeout=8000)
    add('#btnSaveTypeCus', 'ss_btn_channel_simpan-type-customer.png', 'Simpan Type Customer',
        'btnSaveTypeCus', 'btn-success', 'Menyimpan master Type Customer setelah validasi.')
    page.locator('#modalTypeCus .btn-secondary').click()
    time.sleep(0.3)

    _open_accordion(page, '#accAccount')
    add('button.accordion-button[data-bs-target="#accAccount"]',
        'ss_btn_channel_accordion-account.png', 'Account',
        'hdAccount', 'btn-secondary', 'Membuka panel master Account (global).')
    add('#btnAddAccount', 'ss_btn_channel_tambah-account.png', 'Tambah Account',
        'btnAddAccount', 'btn-success', 'Membuka modal tambah Account.')
    add('.btn-edit-acc', 'ss_btn_channel_ubah-account.png', 'Ubah Account',
        'btn-edit-acc', 'btn-outline-success', 'Membuka modal ubah Account terpilih.')
    page.locator('#btnAddAccount').click(timeout=5000)
    page.wait_for_selector('#modalAccount.show', timeout=8000)
    add('#btnSaveAccount', 'ss_btn_channel_simpan-account.png', 'Simpan Account',
        'btnSaveAccount', 'btn-success', 'Menyimpan master Account setelah validasi.')
    page.locator('#modalAccount .btn-secondary').click()
    time.sleep(0.3)

    page.locator('#tab-mapping-btn').click(timeout=5000)
    time.sleep(0.4)
    page.locator('#btnAddMapping').click(timeout=5000)
    page.wait_for_selector('#modalMapping.show', timeout=8000)
    add('#btnSaveMapping', 'ss_btn_channel_simpan-mapping.png', 'Simpan Mapping',
        'btnSaveMapping', 'btn-success', 'Menyimpan triple mapping setelah validasi.')
    page.locator('#modalMapping .btn-secondary').click()
    time.sleep(0.3)

    return dedupe_button_entries(entries)


def capture_channel_modals(page, shots_dir: str) -> int:
    """Full-page screenshot tiap modal (opsional, untuk FSD)."""
    done = 0
    _wait_portal(page)

    page.locator('#btnAddMapping').click(timeout=5000)
    page.wait_for_selector('#modalMapping.show', timeout=8000)
    time.sleep(0.4)
    page.screenshot(path=os.path.join(shots_dir, MODAL_SHOTS[0][0]), full_page=True)
    print(f'   modal {MODAL_SHOTS[0][0]}')
    done += 1
    page.locator('#modalMapping .btn-secondary').click()
    time.sleep(0.3)

    _goto_manage(page)
    modal_plan = [
        ('#accChannel', '#btnAddChannel', '#modalChannel.show', MODAL_SHOTS[1][0]),
        ('#accTypeCus', '#btnAddTypeCus', '#modalTypeCus.show', MODAL_SHOTS[2][0]),
        ('#accAccount', '#btnAddAccount', '#modalAccount.show', MODAL_SHOTS[3][0]),
    ]
    for acc, btn_sel, modal_sel, fname in modal_plan:
        _open_accordion(page, acc)
        page.locator(btn_sel).click(timeout=5000)
        page.wait_for_selector(modal_sel, timeout=8000)
        time.sleep(0.4)
        page.screenshot(path=os.path.join(shots_dir, fname), full_page=True)
        print(f'   modal {fname}')
        done += 1
        page.locator('.modal.show .btn-secondary').first.click()
        time.sleep(0.3)

    return done


def _install_seed_init(context):
    context.add_init_script(
        f"""() => {{
            try {{
                localStorage.setItem({json.dumps(VER_KEYS['channel'])}, {json.dumps(SEED_VER)});
                localStorage.setItem({json.dumps(VER_KEYS['typeCus'])}, {json.dumps(SEED_VER)});
                localStorage.setItem({json.dumps(VER_KEYS['account'])}, {json.dumps(SEED_VER)});
                localStorage.setItem({json.dumps(VER_KEYS['mapping'])}, {json.dumps(SEED_VER)});
            }} catch (e) {{}}
        }}"""
    )


def _set_storage(page, *, channel=None, type_cus=None, account=None, mapping=None):
    payload = {}
    if channel is not None:
        payload[KEYS['channel']] = channel
    if type_cus is not None:
        payload[KEYS['typeCus']] = type_cus
    if account is not None:
        payload[KEYS['account']] = account
    if mapping is not None:
        payload[KEYS['mapping']] = mapping
    page.evaluate(
        """(p) => {
            for (const [k, v] of Object.entries(p)) {
                localStorage.setItem(k, JSON.stringify(v));
            }
        }""",
        payload,
    )


def _shot_swal(page, filename: str, shots_dir: str):
    page.wait_for_selector('.swal2-popup', state='visible', timeout=10000)
    time.sleep(0.35)
    popup = page.query_selector('.swal2-popup')
    out = os.path.join(shots_dir, filename)
    if popup:
        popup.screenshot(path=out)
    else:
        page.screenshot(path=out, full_page=False)
    print(f'   val {filename}')


def _dismiss_swal(page):
    try:
        if page.query_selector('.swal2-confirm'):
            page.click('.swal2-confirm')
        page.wait_for_selector('.swal2-popup', state='hidden', timeout=5000)
    except Exception:
        page.keyboard.press('Escape')
        time.sleep(0.3)


def _goto_portal(page, base: str):
    page.goto(f'{base}/{PORTAL_PATH}', wait_until='domcontentloaded', timeout=30000)
    page.wait_for_selector('#btnAddMapping', timeout=25000)
    _wait_portal(page)


def _reset_seed(page, base: str):
    """Muat ulang halaman dengan seed JSON default (hapus cache localStorage)."""
    page.goto(f'{base}/{PORTAL_PATH}', wait_until='domcontentloaded', timeout=30000)
    page.evaluate(
        """() => {
            [
                'md_channel_seed_ver', 'md_type_customer_seed_ver',
                'md_account_seed_ver', 'md_channel_mapping_seed_ver',
                'md_channel', 'md_type_customer', 'md_account', 'md_channel_mapping',
            ].forEach(k => localStorage.removeItem(k));
        }"""
    )
    page.reload(wait_until='domcontentloaded')
    page.wait_for_selector('#btnAddMapping', timeout=25000)
    _wait_portal(page)


def capture_channel_validations(base_url: str, shots_dir: str | None = None) -> int:
    from playwright.sync_api import sync_playwright

    shots_dir = shots_dir or SCREENSHOTS_DIR
    os.makedirs(shots_dir, exist_ok=True)
    base = base_url.rstrip('/')
    done = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        _install_seed_init(context)
        page = context.new_page()

        _goto_portal(page, base)

        # BR-MD08: Nama Channel wajib
        _goto_manage(page)
        _open_accordion(page, '#accChannel')
        page.locator('#btnAddChannel').click()
        page.wait_for_selector('#modalChannel.show', timeout=8000)
        page.fill('#chNama', '')
        page.locator('#btnSaveChannel').click()
        _shot_swal(page, VALIDATION_SHOTS[0], shots_dir)
        _dismiss_swal(page)
        page.locator('#modalChannel .btn-secondary').click()
        done += 1

        # BR-MD09: Nama Channel duplikat
        page.locator('#btnAddChannel').click()
        page.wait_for_selector('#modalChannel.show', timeout=8000)
        page.fill('#chNama', 'MEDICAL')
        page.locator('#btnSaveChannel').click()
        _shot_swal(page, VALIDATION_SHOTS[1], shots_dir)
        _dismiss_swal(page)
        page.locator('#modalChannel .btn-secondary').click()
        done += 1

        # BR-MD10: Type Customer wajib
        _open_accordion(page, '#accTypeCus')
        page.locator('#btnAddTypeCus').click()
        page.wait_for_selector('#modalTypeCus.show', timeout=8000)
        page.fill('#tcNama', '')
        page.locator('#btnSaveTypeCus').click()
        _shot_swal(page, VALIDATION_SHOTS[2], shots_dir)
        _dismiss_swal(page)
        page.locator('#modalTypeCus .btn-secondary').click()
        done += 1

        # BR-MD11: Type Customer duplikat
        first_tc = page.locator('#tblTypeCusBody tr td:nth-child(2)').first.inner_text().strip()
        page.locator('#btnAddTypeCus').click()
        page.wait_for_selector('#modalTypeCus.show', timeout=8000)
        page.fill('#tcNama', first_tc or 'HOSPITAL')
        page.locator('#btnSaveTypeCus').click()
        _shot_swal(page, VALIDATION_SHOTS[3], shots_dir)
        _dismiss_swal(page)
        page.locator('#modalTypeCus .btn-secondary').click()
        done += 1

        # BR-MD12: Account wajib
        _open_accordion(page, '#accAccount')
        page.locator('#btnAddAccount').click()
        page.wait_for_selector('#modalAccount.show', timeout=8000)
        page.fill('#accKode', '')
        page.locator('#btnSaveAccount').click()
        _shot_swal(page, VALIDATION_SHOTS[4], shots_dir)
        _dismiss_swal(page)
        page.locator('#modalAccount .btn-secondary').click()
        done += 1

        # BR-MD13: Account duplikat
        first_acc = page.locator('#tblAccountBody tr td:nth-child(2)').first.inner_text().strip()
        page.locator('#btnAddAccount').click()
        page.wait_for_selector('#modalAccount.show', timeout=8000)
        page.fill('#accKode', first_acc or 'IND')
        page.locator('#btnSaveAccount').click()
        _shot_swal(page, VALIDATION_SHOTS[5], shots_dir)
        _dismiss_swal(page)
        page.locator('#modalAccount .btn-secondary').click()
        done += 1

        # BR-MD14/15/16: master kosong saat Tambah Mapping
        for key, shot in [
            (KEYS['channel'], VALIDATION_SHOTS[6]),
            (KEYS['typeCus'], VALIDATION_SHOTS[7]),
            (KEYS['account'], VALIDATION_SHOTS[8]),
        ]:
            _goto_portal(page, base)
            page.evaluate(
                """(k) => { localStorage.setItem(k, '[]'); }""",
                key,
            )
            page.reload(wait_until='domcontentloaded')
            _wait_portal(page)
            page.locator('#btnAddMapping').click()
            _shot_swal(page, shot, shots_dir)
            _dismiss_swal(page)
            done += 1

        # BR-MD17: mapping wajib dipilih — buka modal lalu kosongkan select
        _reset_seed(page, base)
        page.locator('#btnAddMapping').click()
        page.wait_for_selector('#modalMapping.show', timeout=8000)
        page.evaluate("""() => {
            document.querySelector('#mapChannel').value = '';
            document.querySelector('#mapTypeCus').value = '';
            document.querySelector('#mapAccount').value = '';
        }""")
        page.locator('#btnSaveMapping').click()
        _shot_swal(page, VALIDATION_SHOTS[9], shots_dir)
        _dismiss_swal(page)
        page.locator('#modalMapping .btn-secondary').click()
        done += 1

        # BR-MD18: mapping triple duplikat
        _reset_seed(page, base)
        page.locator('#btnAddMapping').click()
        page.wait_for_selector('#modalMapping.show', timeout=8000)
        page.locator('#btnSaveMapping').click()
        _shot_swal(page, VALIDATION_SHOTS[10], shots_dir)
        _dismiss_swal(page)
        done += 1

        context.close()
        browser.close()

    return done


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://127.0.0.1:5502')
    parser.add_argument('--buttons-only', action='store_true')
    parser.add_argument('--validations-only', action='store_true')
    args = parser.parse_args()

    if not args.validations_only:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 1440, 'height': 900})
            page.goto(f'{args.base_url.rstrip("/")}/{PORTAL_PATH}', wait_until='domcontentloaded')
            _wait_portal(page)
            capture_channel_buttons(page, SCREENSHOTS_DIR)
            capture_channel_modals(page, SCREENSHOTS_DIR)
            browser.close()

    if not args.buttons_only:
        capture_channel_validations(args.base_url, SCREENSHOTS_DIR)


if __name__ == '__main__':
    main()
