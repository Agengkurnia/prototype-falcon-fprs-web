#!/usr/bin/env python3
"""
Capture screenshot FULL-PAGE untuk modul Penjualan (Faktur + Stok Motoris).

Prasyarat: server statis prototipe (default http://127.0.0.1:5502).

Usage:
  py scripts/capture_penjualan_full.py
  py scripts/capture_penjualan_full.py --base-url http://127.0.0.1:5502
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
REGISTRY_PATH = os.path.join(PROTOTYPE_ROOT, 'lib', 'fsd', 'module-registry.json')

sys.path.insert(0, SCRIPT_DIR)
sys.path.insert(0, os.path.join(WORKSPACE_DIR, 'lib'))
from capture_action_buttons import capture_module_buttons, save_manifest  # noqa: E402

PENJUALAN_ORDER = ['penjualan-faktur', 'penjualan-stok-motoris']

DETAIL_SHOT_BY_MODULE = {
    'penjualan-faktur': 'ss_39_faktur_detail.png',
}


def load_modules(only=None):
    with open(REGISTRY_PATH, 'r', encoding='utf-8-sig') as f:
        reg = json.load(f)
    by_id = {m['id']: m for m in reg['modules'] if m.get('enabled', True)}
    order = [mid for mid in PENJUALAN_ORDER if mid in by_id]
    if only:
        order = [mid for mid in order if mid in only]
    return [by_id[mid] for mid in order]


def wait_ready(page):
    try:
        page.wait_for_load_state('networkidle', timeout=20000)
    except Exception:
        pass
    try:
        page.wait_for_selector(
            '#tblFaktur tbody tr, #tbl tbody tr, .dataTables_wrapper, #app-content, .dash-card',
            timeout=25000,
        )
    except Exception:
        pass
    time.sleep(1.2)


def full_shot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, name)
    page.screenshot(path=path, full_page=True)
    print(f'   saved {name}')
    return path


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


def seed_faktur_storage(page, base_url: str) -> None:
    """Pastikan localStorage fprs_faktur terisi dari seed JSON sebelum buka detail."""
    seed_url = base_url.rstrip('/') + '/wwwroot/data/faktur.json'
    page.goto(seed_url, wait_until='domcontentloaded', timeout=30000)
    page.evaluate(
        """async () => {
            const res = await fetch('/wwwroot/data/faktur.json');
            const data = await res.json();
            localStorage.setItem('fprs_faktur_v4', JSON.stringify(data));
            return data.length;
        }"""
    )


def navigate_faktur_detail(page, mod: dict, base_url: str) -> None:
    # Direct URL — lebih andal daripada klik baris DataTables
    detail_url = (
        base_url.rstrip('/')
        + '/Views/FPRS/Penjualan/Faktur/detail.html?id=SI-2606146101'
    )
    page.goto(detail_url, wait_until='domcontentloaded', timeout=30000)
    wait_ready(page)
    try:
        page.wait_for_selector('#hdrNomor, #custNama, #tblItems', timeout=15000)
        page.wait_for_function(
            "() => { const n = document.querySelector('#hdrNomor'); "
            "return n && n.textContent && n.textContent.trim() !== '—'; }",
            timeout=25000,
        )
    except Exception:
        pass
    page.evaluate('() => window.scrollTo(0, 0)')
    time.sleep(1.0)


def wait_stok_ready(page) -> None:
    try:
        page.wait_for_selector('.dash-card, .flow-container', timeout=25000)
        page.wait_for_function(
            "() => document.querySelectorAll('.dash-card').length >= 3",
            timeout=25000,
        )
    except Exception:
        pass
    time.sleep(1.5)


def capture(base_url, only=None):
    from playwright.sync_api import sync_playwright

    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    modules = load_modules(only)
    btn_manifest: dict = {}
    done = 0

    # Merge into existing masterdata button manifest if present
    existing_manifest = os.path.join(SCREENSHOTS_DIR, '_btn_manifest.json')
    if os.path.exists(existing_manifest):
        try:
            with open(existing_manifest, 'r', encoding='utf-8') as f:
                btn_manifest = json.load(f)
        except Exception:
            btn_manifest = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for mod in modules:
            mid = mod['id']
            shots = list(mod.get('screenshots') or [])
            detail = DETAIL_SHOT_BY_MODULE.get(mid)
            if detail and detail not in shots:
                shots.append(detail)
            if not shots:
                continue
            print(f'[{mid}] {mod["label"]}')
            page = browser.new_page(viewport={'width': 1440, 'height': 900})
            try:
                index_url = base_url.rstrip('/') + '/' + mod['htmlPath'].replace('\\', '/')
                page.goto(index_url, wait_until='domcontentloaded', timeout=45000)
                wait_ready(page)
                if mid == 'penjualan-stok-motoris':
                    wait_stok_ready(page)
                full_shot(page, shots[0])
                done += 1
                btn_manifest[mid] = capture_module_buttons(page, mid, SCREENSHOTS_DIR)

                if mid == 'penjualan-faktur' and len(shots) > 1:
                    seed_faktur_storage(page, base_url)
                    navigate_faktur_detail(page, mod, base_url)
                    full_shot(page, shots[1])
                    done += 1
                    extra = capture_module_buttons(page, mid, SCREENSHOTS_DIR)
                    append_unique_buttons(btn_manifest[mid], extra)
            except Exception as e:
                print(f'   WARN {mid}: {e}')
            finally:
                page.close()
        browser.close()

    save_manifest(SCREENSHOTS_DIR, btn_manifest)
    print(f'\nSelesai. {done} page screenshot + buttons in manifest')
    print(f'Manifest: {existing_manifest}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', default='http://127.0.0.1:5502')
    ap.add_argument('--only', default=None, help='Comma-separated module ids')
    args = ap.parse_args()
    only = {x.strip() for x in args.only.split(',')} if args.only else None
    capture(args.base_url, only)


if __name__ == '__main__':
    main()
