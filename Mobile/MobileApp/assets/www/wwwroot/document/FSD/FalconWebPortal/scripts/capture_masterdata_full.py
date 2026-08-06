#!/usr/bin/env python3
"""
Capture screenshot FULL-PAGE untuk 8 modul Data Master (Playwright), disimpan ke
screenshots/ memakai nama file yang direferensikan fragmen FSD.

Juga menangkap screenshot per-tombol aksi → ss_btn_{mod}_{slug}.png + manifest.

Prasyarat: server statis prototipe berjalan (default http://127.0.0.1:5502).

Usage:
  py scripts/capture_masterdata_full.py
  py scripts/capture_masterdata_full.py --base-url http://127.0.0.1:5502
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))
REGISTRY_PATH = os.path.join(PROTOTYPE_ROOT, 'lib', 'fsd', 'module-registry.json')

sys.path.insert(0, SCRIPT_DIR)
sys.path.insert(0, os.path.join(WORKSPACE_DIR, 'lib'))
from capture_action_buttons import capture_module_buttons, save_manifest, shot_element  # noqa: E402
from fsd_ui_section import REUSABLE_BUTTON_FILES  # noqa: E402

MASTER_ORDER = [
    'master-produk', 'master-pelanggan', 'master-channel',
    'master-pegawai', 'master-stokis', 'master-limit-target-harian',
    'master-pajak', 'master-alasan',
]

# Screenshot halaman detail (page + formPath) — indeks 1 di SS_BY_MODULE
DETAIL_SHOT_BY_MODULE = {
    'master-produk': 'ss_03_master_produk_detail.png',
    'master-pelanggan': 'ss_16_master_pelanggan_detail.png',
    'master-pegawai': 'ss_20_master_pegawai_detail.png',
    'master-stokis': 'ss_46_master_stokis_detail.png',
    'master-limit-target-harian': 'ss_50_master_limit_detail.png',
}


def load_modules(only=None):
    with open(REGISTRY_PATH, 'r', encoding='utf-8-sig') as f:
        reg = json.load(f)
    by_id = {m['id']: m for m in reg['modules'] if m.get('enabled', True)}
    order = [mid for mid in MASTER_ORDER if mid in by_id]
    if only:
        order = [mid for mid in order if mid in only]
    return [by_id[mid] for mid in order]


def wait_ready(page):
    for st in ('networkidle',):
        try:
            page.wait_for_load_state(st, timeout=15000)
        except Exception:
            pass
    try:
        page.wait_for_selector('#tbl tbody tr, #tblBody tr, .dataTables_wrapper, #app-content', timeout=20000)
    except Exception:
        pass
    try:
        page.wait_for_function(
            "() => typeof window.openModal === 'function' || "
            "document.querySelector('#tblBody tr') !== null",
            timeout=20000,
        )
    except Exception:
        pass
    time.sleep(1.0)


def full_shot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, name)
    page.screenshot(path=path, full_page=True)
    print(f'   saved {name}')
    return path


def _shots_identical(path_a: str, path_b: str) -> bool:
    if not (os.path.exists(path_a) and os.path.exists(path_b)):
        return False
    return hashlib.md5(open(path_a, 'rb').read()).digest() == hashlib.md5(open(path_b, 'rb').read()).digest()


def append_unique_buttons(target: list, extras: list) -> None:
    by_label = {e['label'].lower(): i for i, e in enumerate(target)}
    for e in extras:
        lab = e['label'].lower()
        if lab in by_label:
            idx = by_label[lab]
            if not target[idx].get('file') and e.get('file'):
                target[idx] = e
            continue
        by_label[lab] = len(target)
        target.append(e)


MODAL_SHOT_MODE = {
    'master-channel': 'edit',
}


def has_detail_page(mod: dict) -> bool:
    """True if module has a separate detail page (formPath detail.html), even if type was mis-tagged modal."""
    fp = (mod.get('formPath') or '').replace('\\', '/')
    if fp.endswith('detail.html'):
        return True
    return mod.get('type') == 'page' and bool(fp)


def module_page_shots(mod: dict) -> list[str]:
    """Daftar screenshot halaman: index + detail (ikuti formPath detail.html seperti modul page lain)."""
    shots = list(mod.get('screenshots') or [])
    mid = mod['id']
    if has_detail_page(mod):
        detail = DETAIL_SHOT_BY_MODULE.get(mid)
        if detail and detail not in shots:
            shots.append(detail)
    return shots


def navigate_to_detail_page(page, mod: dict, base_url: str) -> None:
    """Buka halaman detail dari dashboard list (klik baris) atau direct URL."""
    form_path = mod.get('formPath') or ''
    if not form_path:
        return
    view = page.locator(
        '#tblBody tr a.btn-action-view, #tblBody tr .btn-action-view, '
        '#tbl tbody tr a.btn-action-view, #tbl tbody tr .btn-action-view, '
        '#tblBody tr a[href*="detail"], #tbl tbody tr a[href*="detail"]'
    ).first
    if view.count() and view.is_visible():
        try:
            with page.expect_navigation(timeout=20000):
                view.click(timeout=8000)
        except Exception:
            view.click(timeout=8000)
            page.wait_for_load_state('domcontentloaded', timeout=20000)
    else:
        detail_url = base_url.rstrip('/') + '/' + form_path.replace('\\', '/')
        page.goto(detail_url, wait_until='domcontentloaded', timeout=30000)
    wait_ready(page)


def wait_detail_ready(page, mod_id: str) -> None:
    """Tunggu konten detail siap sebelum full-page screenshot."""
    if mod_id == 'master-produk':
        try:
            page.wait_for_selector('#formProduk, #kode', timeout=15000)
            page.wait_for_function(
                "() => { const n = document.querySelector('#nama'); "
                "return n && n.value && n.value.length > 0; }",
                timeout=20000,
            )
        except Exception:
            pass
    elif mod_id == 'master-pelanggan':
        try:
            page.wait_for_selector('#detailNama', timeout=15000)
            page.wait_for_function(
                "() => { const n = document.querySelector('#detailNama'); "
                "return n && n.textContent && n.textContent.trim() !== '-' "
                "&& n.textContent.trim() !== 'Pelanggan'; }",
                timeout=20000,
            )
        except Exception:
            pass
    elif mod_id == 'master-pegawai':
        try:
            page.wait_for_selector('#nama, #kode', timeout=15000)
            page.wait_for_function(
                "() => { const n = document.querySelector('#nama'); "
                "return n && n.value && n.value.length > 0; }",
                timeout=20000,
            )
        except Exception:
            pass
    elif mod_id == 'master-stokis':
        try:
            page.wait_for_function(
                '() => document.querySelectorAll("#stokAccordion .accordion-button").length >= 3',
                timeout=25000,
            )
        except Exception:
            pass
    else:
        try:
            page.wait_for_selector('#app-content', timeout=10000)
        except Exception:
            pass
    page.evaluate('() => window.scrollTo(0, 0)')
    time.sleep(1.0)


def capture_detail_page_buttons(page, mod: dict, base_url: str) -> list:
    """Buka halaman detail lalu capture tombol aksi."""
    if not mod.get('formPath'):
        return []
    navigate_to_detail_page(page, mod, base_url)
    wait_detail_ready(page, mod['id'])
    page.evaluate('() => window.scrollTo(0, document.body.scrollHeight)')
    time.sleep(0.8)
    return capture_module_buttons(page, mod['id'], SCREENSHOTS_DIR)


def open_modal_for_shot(page, mod_id: str):
    """Buka modal lalu siapkan full-page shot (bukan crop elemen modal saja)."""
    mode = MODAL_SHOT_MODE.get(mod_id, 'add')
    wait_ready(page)

    if mode == 'edit':
        edit = page.locator('#tblBody tr .btn-action-edit, #tblBody tr button.btn-action-edit').first
        if edit.count() and edit.is_visible():
            edit.click(timeout=8000)
        else:
            raise RuntimeError('Tombol Edit tidak ditemukan untuk shot modal')
        if mod_id == 'master-channel':
            try:
                page.wait_for_selector('#custSection:not(.d-none)', timeout=10000)
            except Exception:
                pass
    else:
        tambah = page.locator('button.btn-success, a.btn-success').filter(
            has_text=re.compile(r'Tambah', re.I)
        ).first
        if tambah.count() and tambah.is_visible():
            tambah.click(timeout=8000)
        elif page.evaluate('() => typeof window.openModal === "function"'):
            page.evaluate('() => window.openModal()')
        else:
            raise RuntimeError('Tombol Tambah / openModal tidak tersedia')

    try:
        page.wait_for_selector('#modalForm.show, .modal.show, [aria-modal="true"]', timeout=12000)
    except Exception as exc:
        raise RuntimeError(f'Modal tidak tampil setelah klik: {exc}') from exc
    try:
        page.locator('.modal.show .modal-footer, .modal-footer').first.scroll_into_view_if_needed(timeout=3000)
    except Exception:
        pass
    time.sleep(1.2)


def capture_common_reusable_buttons(browser, base_url: str, shots_dir: str):
    """Capture tombol standar reusable (Kembali, Lihat Detail, Detail) sekali untuk semua modul."""
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    try:
        detail_url = base_url.rstrip('/') + '/Views/FPRS/MasterData/Pegawai/detail.html'
        page.goto(detail_url, wait_until='domcontentloaded', timeout=30000)
        wait_ready(page)
        time.sleep(0.6)
        kembali = REUSABLE_BUTTON_FILES['kembali']
        data = shot_element(page, None, 'Kembali')
        if data:
            with open(os.path.join(shots_dir, kembali), 'wb') as f:
                f.write(data)
            print(f'   common {kembali}')

        index_url = base_url.rstrip('/') + '/Views/FPRS/MasterData/Pegawai/index.html'
        page.goto(index_url, wait_until='domcontentloaded', timeout=30000)
        wait_ready(page)
        time.sleep(0.5)
        lihat = REUSABLE_BUTTON_FILES['lihat detail']
        data = shot_element(page, None, 'Lihat Detail')
        if data:
            with open(os.path.join(shots_dir, lihat), 'wb') as f:
                f.write(data)
            print(f'   common {lihat}')

        pel_url = base_url.rstrip('/') + '/Views/FPRS/MasterData/Pelanggan/index.html'
        page.goto(pel_url, wait_until='domcontentloaded', timeout=30000)
        wait_ready(page)
        time.sleep(0.5)
        detail_btn = REUSABLE_BUTTON_FILES['detail']
        data = shot_element(page, None, 'Detail')
        if data:
            with open(os.path.join(shots_dir, detail_btn), 'wb') as f:
                f.write(data)
            print(f'   common {detail_btn}')
    finally:
        page.close()


def capture(base_url, only=None):
    from playwright.sync_api import sync_playwright

    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    modules = load_modules(only)
    btn_manifest: dict = {}
    done = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for mod in modules:
            mid = mod['id']
            shots = module_page_shots(mod)
            if not shots:
                continue
            print(f'[{mid}] {mod["label"]}')
            page = browser.new_page(viewport={'width': 1440, 'height': 900})
            try:
                index_url = base_url.rstrip('/') + '/' + mod['htmlPath'].replace('\\', '/')
                page.goto(index_url, wait_until='domcontentloaded', timeout=30000)
                wait_ready(page)
                page.wait_for_selector('.btn-success, .btn-action, a.btn', timeout=8000)
                time.sleep(0.5)
                full_shot(page, shots[0])
                done += 1
                btn_manifest[mid] = capture_module_buttons(page, mid, SCREENSHOTS_DIR)

                # Prefer formPath detail.html over type=modal (Limit/PRM-style page modules)
                if has_detail_page(mod) and len(shots) > 1:
                    navigate_to_detail_page(page, mod, base_url)
                    wait_detail_ready(page, mid)
                    detail_path = full_shot(page, shots[1])
                    done += 1
                    if _shots_identical(
                        os.path.join(SCREENSHOTS_DIR, shots[0]),
                        detail_path,
                    ):
                        print(f'   WARN {mid}: screenshot detail identik dengan index')
                    detail_btns = capture_module_buttons(page, mid, SCREENSHOTS_DIR)
                    append_unique_buttons(btn_manifest[mid], detail_btns)

                elif mod.get('type') == 'modal' and len(shots) > 1:
                    open_modal_for_shot(page, mid)
                    modal_path = full_shot(page, shots[1])
                    done += 1
                    if _shots_identical(
                        os.path.join(SCREENSHOTS_DIR, shots[0]),
                        modal_path,
                    ):
                        print(f'   WARN {mid}: screenshot modal identik dengan index — cek openModal/layoutReady')
                    extra = capture_module_buttons(page, mid, SCREENSHOTS_DIR)
                    append_unique_buttons(btn_manifest[mid], extra)

                elif mod.get('formPath'):
                    detail_btns = capture_detail_page_buttons(page, mod, base_url)
                    append_unique_buttons(btn_manifest[mid], detail_btns)
            except Exception as e:
                print(f'   WARN {mid}: {e}')
            finally:
                page.close()

        try:
            capture_common_reusable_buttons(browser, base_url, SCREENSHOTS_DIR)
        except Exception as e:
            print(f'   WARN common buttons: {e}')

        browser.close()

    save_manifest(SCREENSHOTS_DIR, btn_manifest)
    print(f'\nSelesai. {done} page screenshot + {sum(len(v) for v in btn_manifest.values())} button shots')
    print(f'Manifest: {os.path.join(SCREENSHOTS_DIR, "_btn_manifest.json")}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', default='http://127.0.0.1:5502')
    ap.add_argument('--only', default=None, help='Comma-separated module ids')
    args = ap.parse_args()
    only = {x.strip() for x in args.only.split(',')} if args.only else None
    capture(args.base_url, only)


if __name__ == '__main__':
    main()
