#!/usr/bin/env python3
"""
Capture screenshot FULL-PAGE untuk 7 modul Data Master (Playwright), disimpan ke
screenshots/ memakai nama file yang direferensikan fragmen FSD.

Prasyarat: server statis prototipe berjalan (default http://127.0.0.1:5502).

Usage:
  py scripts/capture_masterdata_full.py
  py scripts/capture_masterdata_full.py --base-url http://127.0.0.1:5502
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

MASTER_ORDER = [
    'master-produk', 'master-pelanggan', 'master-channel',
    'master-pegawai', 'master-stokis', 'master-pajak', 'master-alasan',
]


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
        page.wait_for_selector('#tbl tbody tr, #tblBody tr, .dataTables_wrapper, #app-content', timeout=12000)
    except Exception:
        pass
    time.sleep(1.0)


def full_shot(page, name):
    path = os.path.join(SCREENSHOTS_DIR, name)
    page.screenshot(path=path, full_page=True)
    print(f'   saved {name}')
    return name


def abs_from_index(index_url, href):
    if href.startswith('http'):
        return href
    base = index_url.rsplit('/', 1)[0]
    return base + '/' + href.lstrip('/')


def first_detail_href(page):
    return page.evaluate(
        "() => { const a = document.querySelector('a[href*=\"detail.html\"]');"
        " return a ? a.getAttribute('href') : null; }"
    )


def capture(base_url, only=None):
    from playwright.sync_api import sync_playwright

    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    modules = load_modules(only)
    done = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for mod in modules:
            mid = mod['id']
            shots = mod.get('screenshots') or []
            if not shots:
                continue
            print(f'[{mid}] {mod["label"]}')
            page = browser.new_page(viewport={'width': 1440, 'height': 900})
            try:
                index_url = base_url.rstrip('/') + '/' + mod['htmlPath'].replace('\\', '/')
                page.goto(index_url, wait_until='domcontentloaded', timeout=30000)
                wait_ready(page)
                full_shot(page, shots[0]); done += 1

                if mod.get('type') == 'modal':
                    if len(shots) > 1:
                        if mid == 'master-channel':
                            page.evaluate(
                                "() => { const btn = document.querySelector('.btn-action-edit');"
                                " if (btn) { btn.click(); return; }"
                                " if (window.openModal) window.openModal(); }"
                            )
                        else:
                            page.evaluate("() => { if (window.openModal) window.openModal(); }")
                        try:
                            page.wait_for_selector('#modalForm.show', timeout=8000)
                        except Exception:
                            time.sleep(1.0)
                        time.sleep(1.0)
                        full_shot(page, shots[1]); done += 1
                else:
                    if mid == 'master-produk':
                        form_url = base_url.rstrip('/') + '/' + (mod.get('formPath') or '').replace('\\', '/')
                        if len(shots) > 1 and form_url:
                            page.goto(form_url, wait_until='domcontentloaded', timeout=30000)
                            wait_ready(page)
                            time.sleep(0.6)
                            full_shot(page, shots[1]); done += 1
                        if len(shots) > 2:
                            page.goto(index_url, wait_until='domcontentloaded', timeout=30000)
                            wait_ready(page)
                            href = first_detail_href(page)
                            if href:
                                page.goto(abs_from_index(index_url, href), wait_until='domcontentloaded', timeout=30000)
                                wait_ready(page)
                                time.sleep(0.6)
                                full_shot(page, shots[2]); done += 1
                    else:
                        # pelanggan / pegawai / stokis → detail baris pertama
                        if len(shots) > 1:
                            href = first_detail_href(page)
                            if href:
                                page.goto(abs_from_index(index_url, href), wait_until='domcontentloaded', timeout=30000)
                                wait_ready(page)
                                time.sleep(0.6)
                                full_shot(page, shots[1]); done += 1
                            else:
                                print('   (tidak ada link detail di baris index)')
            except Exception as e:
                print(f'   WARN {mid}: {e}')
            finally:
                page.close()
        browser.close()

    print(f'\nSelesai. {done} screenshot disimpan di {SCREENSHOTS_DIR}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', default='http://127.0.0.1:5502')
    ap.add_argument('--only', default=None, help='Comma-separated module ids')
    args = ap.parse_args()
    only = {x.strip() for x in args.only.split(',')} if args.only else None
    capture(args.base_url, only)


if __name__ == '__main__':
    main()
