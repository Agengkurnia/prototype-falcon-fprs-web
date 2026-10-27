#!/usr/bin/env python3
"""Capture full-page + button crops for FSD Koreksi Stok (web + mobile).

Prasyarat: server statis prototipe (default http://127.0.0.1:8766).

  py scripts/capture_koreksi_full.py
  py scripts/capture_koreksi_full.py --base-url http://127.0.0.1:8766
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)


def _slug(text: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', text.lower().strip())
    return s.strip('-')[:40] or 'btn'


def wait_ms(page, ms=800):
    page.wait_for_timeout(ms)


def shot(page, name: str, full_page: bool = True):
    path = os.path.join(SCREENSHOTS_DIR, name)
    page.screenshot(path=path, full_page=full_page)
    print(f'   saved {name}')
    return path


def crop_btn(page, selector: str, filename: str) -> str | None:
    try:
        loc = page.locator(selector).first
        if loc.count() == 0:
            return None
        path = os.path.join(SCREENSHOTS_DIR, filename)
        loc.screenshot(path=path)
        print(f'   btn  {filename}')
        return path
    except Exception as ex:
        print(f'   skip {filename}: {ex}')
        return None


def set_local_user(page, username: str, role: str, name: str | None = None):
    page.evaluate(
        """([u, r, n]) => {
            localStorage.setItem('sfa_user', JSON.stringify({
                username: u, name: n || u, role: r, branch: 'Jakarta Pusat'
            }));
        }""",
        [username, role, name or username],
    )


def ensure_web_seed(page):
    """Trigger page load so Koreksi seed runs; wait for DataTable."""
    try:
        page.wait_for_selector('#tbl tbody tr, #cT', timeout=20000)
    except Exception:
        pass
    wait_ms(page, 1200)


def capture_web(page, base: str, buttons: list):
    url = f'{base}/Views/FPRS/Penjualan/Koreksi/index.html?v=fsd'
    print('\n=== WEB Stock Correction ===')
    page.set_viewport_size({'width': 1440, 'height': 900})
    page.goto(url, wait_until='domcontentloaded', timeout=60000)
    ensure_web_seed(page)

    shot(page, 'ss_01_web_list.png')
    crop_btn(page, '#btnAdd', 'ss_btn_koreksi_add.png')
    crop_btn(page, '#btnApproveAll', 'ss_btn_koreksi_approve-all.png')
    crop_btn(page, '#btnRejectAll', 'ss_btn_koreksi_reject-all.png')
    buttons.extend([
        {'label': 'Add', 'file': 'ss_btn_koreksi_add.png', 'channel': 'web'},
        {'label': 'Approve all', 'file': 'ss_btn_koreksi_approve-all.png', 'channel': 'web'},
        {'label': 'Reject all', 'file': 'ss_btn_koreksi_reject-all.png', 'channel': 'web'},
    ])

    # Filter Waiting card
    page.locator('.mpg-stat-card[data-filter="Waiting"]').click()
    wait_ms(page, 600)
    shot(page, 'ss_02_web_list_waiting_filter.png')

    # Create
    page.locator('#btnAdd').click()
    wait_ms(page, 800)
    shot(page, 'ss_03_web_create.png')
    crop_btn(page, '#btnBack', 'ss_btn_koreksi_back.png')
    buttons.append({'label': 'Back', 'file': 'ss_btn_koreksi_back.png', 'channel': 'web'})

    # Pick motoris if Select2 present
    try:
        page.locator('#fMotoris').select_option(index=1)
    except Exception:
        try:
            page.click('#fMotoris + .select2-container')
            wait_ms(page, 400)
            page.locator('.select2-results__option').nth(1).click()
        except Exception:
            pass
    wait_ms(page, 500)

    # Open LOV
    try:
        page.locator('#btnInvLov').click()
        wait_ms(page, 1000)
        shot(page, 'ss_05_web_invoice_lov.png')
        crop_btn(page, '#btnInvLov', 'ss_btn_koreksi_search-invoice.png')
        buttons.append({'label': 'Search invoice', 'file': 'ss_btn_koreksi_search-invoice.png', 'channel': 'web'})
        # Select first invoice if available
        sel = page.locator('#invList button, #invTbl tbody button').first
        if sel.count():
            sel.click()
            wait_ms(page, 1000)
            shot(page, 'ss_04_web_create_lines.png')
            # tweak qty for validation later
            qty = page.locator('#mLines input').first
            if qty.count():
                qty.fill('99')
                wait_ms(page, 300)
            crop_btn(page, '#btnSave', 'ss_btn_koreksi_save.png')
            buttons.append({'label': 'Save', 'file': 'ss_btn_koreksi_save.png', 'channel': 'web'})
        else:
            page.keyboard.press('Escape')
            wait_ms(page, 400)
            # still save empty create lines shot
            shot(page, 'ss_04_web_create_lines.png')
    except Exception as ex:
        print(f'   LOV warn: {ex}')
        shot(page, 'ss_04_web_create_lines.png')
        shot(page, 'ss_05_web_invoice_lov.png')

    # Validation: clear reason and try save if visible
    try:
        if page.locator('#btnSave').is_visible():
            page.locator('#mReason').fill('')
            page.locator('#btnSave').click()
            wait_ms(page, 800)
            shot(page, 'ss_09_web_validation.png')
            try:
                page.locator('.swal2-confirm, .swal2-cancel').first.click(timeout=2000)
            except Exception:
                page.keyboard.press('Escape')
            wait_ms(page, 300)
    except Exception:
        shot(page, 'ss_09_web_validation.png')

    # Always return to list via hard navigation (create/review hide #list)
    page.goto(url, wait_until='domcontentloaded')
    ensure_web_seed(page)
    page.locator('.mpg-stat-card[data-filter="Waiting"]').click(force=True)
    wait_ms(page, 600)
    link = page.locator('#tbl tbody a').first
    if link.count():
        link.click()
        wait_ms(page, 900)
        shot(page, 'ss_06_web_review_waiting.png')
        crop_btn(page, '#btnApprove', 'ss_btn_koreksi_approve.png')
        crop_btn(page, '#btnReject', 'ss_btn_koreksi_reject.png')
        buttons.extend([
            {'label': 'Approve', 'file': 'ss_btn_koreksi_approve.png', 'channel': 'web'},
            {'label': 'Reject', 'file': 'ss_btn_koreksi_reject.png', 'channel': 'web'},
        ])
        try:
            if page.locator('#btnApprove').is_visible():
                page.locator('#btnApprove').click()
                wait_ms(page, 700)
                shot(page, 'ss_08_web_confirm_approve.png')
                try:
                    page.locator('.swal2-cancel').click(timeout=3000)
                except Exception:
                    page.keyboard.press('Escape')
                wait_ms(page, 400)
        except Exception:
            shot(page, 'ss_08_web_confirm_approve.png')
    else:
        shot(page, 'ss_06_web_review_waiting.png')
        shot(page, 'ss_08_web_confirm_approve.png')

    # Approved review
    page.goto(url, wait_until='domcontentloaded')
    ensure_web_seed(page)
    page.locator('.mpg-stat-card[data-filter="Approved"]').click(force=True)
    wait_ms(page, 600)
    link = page.locator('#tbl tbody a').first
    if link.count():
        link.click()
        wait_ms(page, 800)
    shot(page, 'ss_07_web_review_approved.png')


def capture_mobile(page, base: str, buttons: list):
    print('\n=== MOBILE correction ===')
    page.set_viewport_size({'width': 390, 'height': 844})

    # Motoris session
    page.goto(f'{base}/Views/Mobile/login.html', wait_until='domcontentloaded')
    set_local_user(page, 'MOTORIS1', 'motoris', 'RESTI ANGGERAINI')
    wait_ms(page, 200)

    # Find an invoice id from store if possible
    inv_id = page.evaluate("""() => {
        try {
            if (window.SfaStore && SfaStore.getInvoices) {
                const list = SfaStore.getInvoices() || [];
                if (list.length) return list[0].id || list[0].invoiceId || '';
            }
        } catch (e) {}
        return '';
    }""")

    # Load sfa-store by visiting a page that includes it
    page.goto(f'{base}/Views/Mobile/home.html', wait_until='domcontentloaded')
    set_local_user(page, 'MOTORIS1', 'motoris', 'RESTI ANGGERAINI')
    wait_ms(page, 500)
    inv_id = page.evaluate("""() => {
        try {
            const list = (window.SfaStore && SfaStore.getInvoices && SfaStore.getInvoices()) || [];
            if (list.length) return String(list[0].id || list[0].invoiceId || '');
            // fallback: scan localStorage keys
            for (const k of Object.keys(localStorage)) {
                if (/faktur|invoice/i.test(k)) {
                    try {
                        const v = JSON.parse(localStorage.getItem(k));
                        const arr = Array.isArray(v) ? v : (v && v.data);
                        if (arr && arr[0]) return String(arr[0].id || arr[0].invoiceId || '');
                    } catch (e) {}
                }
            }
        } catch (e) {}
        return '';
    }""")

    form_url = f'{base}/Views/Mobile/correction_form.html?source=invoice&id={inv_id}&v=fsd' if inv_id else \
        f'{base}/Views/Mobile/correction_form.html?source=invoice&v=fsd'
    page.goto(form_url, wait_until='domcontentloaded')
    set_local_user(page, 'MOTORIS1', 'motoris', 'RESTI ANGGERAINI')
    page.reload(wait_until='domcontentloaded')
    wait_ms(page, 1200)
    shot(page, 'ss_10_mob_form_step_source.png')
    # scroll / interact lines
    try:
        inp = page.locator('input[type="number"], .qty-input, input.form-control').first
        if inp.count():
            shot(page, 'ss_11_mob_form_step_lines.png')
            inp.fill('1')
            wait_ms(page, 300)
        else:
            shot(page, 'ss_11_mob_form_step_lines.png')
    except Exception:
        shot(page, 'ss_11_mob_form_step_lines.png')

    try:
        page.locator('textarea, #reason, #txtReason').first.fill('Salah hitung qty di nota.')
        wait_ms(page, 300)
    except Exception:
        pass
    shot(page, 'ss_12_mob_form_step_reason.png')
    crop_btn(page, 'button:has-text("Kirim"), #btnSubmit, .btn-submit', 'ss_btn_koreksi_kirim-pengajuan.png')
    buttons.append({'label': 'Kirim pengajuan', 'file': 'ss_btn_koreksi_kirim-pengajuan.png', 'channel': 'mobile'})

    try:
        page.locator('button:has-text("Kirim")').first.click()
        wait_ms(page, 700)
        shot(page, 'ss_13_mob_form_confirm.png')
        page.locator('.swal2-cancel, button:has-text("Batal")').first.click()
    except Exception:
        shot(page, 'ss_13_mob_form_confirm.png')

    page.goto(f'{base}/Views/Mobile/correction_list.html?v=fsd', wait_until='domcontentloaded')
    set_local_user(page, 'MOTORIS1', 'motoris', 'RESTI ANGGERAINI')
    page.reload(wait_until='domcontentloaded')
    wait_ms(page, 1000)
    shot(page, 'ss_14_mob_list.png')

    # Invoice detail entry (best effort)
    page.goto(f'{base}/Views/Mobile/invoice_list.html?v=fsd', wait_until='domcontentloaded')
    wait_ms(page, 800)
    try:
        page.locator('a, .inv-card, .list-item').first.click()
        wait_ms(page, 1000)
    except Exception:
        pass
    shot(page, 'ss_15_mob_entry_invoice.png')

    # ABM approve
    page.goto(f'{base}/Views/Mobile/correction_approve.html?v=fsd', wait_until='domcontentloaded')
    set_local_user(page, 'ABM1', 'abm', 'ABM1')
    page.reload(wait_until='domcontentloaded')
    wait_ms(page, 1200)
    shot(page, 'ss_16_mob_approve_list.png')
    crop_btn(page, '.btn-card-approve, #btnApprove', 'ss_btn_koreksi_setujui.png')
    crop_btn(page, '.btn-card-reject, #btnReject', 'ss_btn_koreksi_tolak.png')
    crop_btn(page, '.seg-btn[data-tab="waiting"]', 'ss_btn_koreksi_menunggu.png')
    crop_btn(page, '.seg-btn[data-tab="history"]', 'ss_btn_koreksi_riwayat.png')
    buttons.extend([
        {'label': 'Setujui', 'file': 'ss_btn_koreksi_setujui.png', 'channel': 'mobile'},
        {'label': 'Tolak', 'file': 'ss_btn_koreksi_tolak.png', 'channel': 'mobile'},
        {'label': 'Menunggu', 'file': 'ss_btn_koreksi_menunggu.png', 'channel': 'mobile'},
        {'label': 'Riwayat', 'file': 'ss_btn_koreksi_riwayat.png', 'channel': 'mobile'},
    ])

    try:
        page.locator('#searchInput').fill('RESTI')
        wait_ms(page, 400)
        shot(page, 'ss_17_mob_approve_search.png')
        page.locator('#searchClear').click()
        wait_ms(page, 300)
    except Exception:
        shot(page, 'ss_17_mob_approve_search.png')

    try:
        page.locator('.corr-motoris, .corr-card').first.click()
        wait_ms(page, 800)
        shot(page, 'ss_18_mob_approve_detail.png')
        page.locator('#btnApprove').click()
        wait_ms(page, 600)
        shot(page, 'ss_19_mob_approve_confirm.png')
        page.locator('.swal2-cancel').click()
        wait_ms(page, 300)
        page.locator('#btnHeaderBack').click()
        wait_ms(page, 400)
    except Exception:
        shot(page, 'ss_18_mob_approve_detail.png')
        shot(page, 'ss_19_mob_approve_confirm.png')

    page.locator('.seg-btn[data-tab="history"]').click()
    wait_ms(page, 600)
    shot(page, 'ss_20_mob_approve_history.png')
    try:
        page.locator('.corr-card').first.click()
        wait_ms(page, 700)
        shot(page, 'ss_21_mob_approve_history_detail.png')
    except Exception:
        shot(page, 'ss_21_mob_approve_history_detail.png')

    # View-only as motoris
    page.goto(f'{base}/Views/Mobile/correction_approve.html?v=fsd', wait_until='domcontentloaded')
    set_local_user(page, 'MOTORIS1', 'motoris', 'RESTI ANGGERAINI')
    page.reload(wait_until='domcontentloaded')
    wait_ms(page, 1000)
    shot(page, 'ss_22_mob_view_only.png')

    # Stok motoris hint (web) — best effort
    try:
        page.set_viewport_size({'width': 1440, 'height': 900})
        page.goto(
            f'{base}/Views/FPRS/Penjualan/StokMotoris/index.html?v=fsd',
            wait_until='domcontentloaded',
            timeout=45000,
        )
        wait_ms(page, 1500)
        shot(page, 'ss_23_web_stok_motoris_hint.png')
    except Exception as ex:
        print(f'   stok motoris skip: {ex}')
        # reuse list as soft fallback so MD embed does not 404
        fallback = os.path.join(SCREENSHOTS_DIR, 'ss_01_web_list.png')
        target = os.path.join(SCREENSHOTS_DIR, 'ss_23_web_stok_motoris_hint.png')
        if os.path.isfile(fallback) and not os.path.isfile(target):
            import shutil
            shutil.copyfile(fallback, target)
            print('   saved ss_23_web_stok_motoris_hint.png (fallback copy)')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', default='http://127.0.0.1:8766')
    args = ap.parse_args()
    base = args.base_url.rstrip('/')

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('Install playwright: py -m pip install playwright && py -m playwright install chromium')
        sys.exit(1)

    buttons: list = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        capture_web(page, base, buttons)
        capture_mobile(page, base, buttons)
        browser.close()

    manifest = os.path.join(SCREENSHOTS_DIR, '_btn_manifest.json')
    with open(manifest, 'w', encoding='utf-8') as f:
        json.dump({'module': 'koreksi', 'buttons': buttons}, f, indent=2, ensure_ascii=False)
    print(f'\nManifest → {manifest}')
    print('Done.')


if __name__ == '__main__':
    main()
