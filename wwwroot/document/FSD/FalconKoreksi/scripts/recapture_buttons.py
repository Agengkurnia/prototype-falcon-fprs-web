#!/usr/bin/env python3
"""Recapture Koreksi action-button crops at 2x DPR with tight padding."""
from __future__ import annotations

import os
import sys
import time

from playwright.sync_api import sync_playwright

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SS = os.path.join(os.path.dirname(SCRIPT_DIR), 'screenshots')
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8766'
os.makedirs(SS, exist_ok=True)


def shot_el(page, selector: str, name: str, pad: int = 6):
    loc = page.locator(selector).first
    loc.wait_for(state='visible', timeout=15000)
    box = loc.bounding_box()
    if not box:
        print(f' skip {name}: no box')
        return
    path = os.path.join(SS, name)
    page.screenshot(
        path=path,
        clip={
            'x': max(0, box['x'] - pad),
            'y': max(0, box['y'] - pad),
            'width': box['width'] + pad * 2,
            'height': box['height'] + pad * 2,
        },
    )
    print(f' ok {name} {int(box["width"])}x{int(box["height"])}')


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={'width': 1440, 'height': 900},
            device_scale_factor=2,
        )
        page = ctx.new_page()
        url = f'{BASE.rstrip("/")}/Views/FPRS/Penjualan/Koreksi/index.html?v=btn'
        page.goto(url, wait_until='domcontentloaded', timeout=60000)
        page.wait_for_timeout(1500)
        shot_el(page, '#btnAdd', 'ss_btn_koreksi_add.png')
        shot_el(page, '#btnApproveAll', 'ss_btn_koreksi_approve-all.png')
        shot_el(page, '#btnRejectAll', 'ss_btn_koreksi_reject-all.png')

        page.locator('#btnAdd').click()
        page.wait_for_timeout(800)
        shot_el(page, '#btnBack', 'ss_btn_koreksi_back.png')
        # pick motoris + open lov for search icon; then lines for save
        try:
            page.locator('#fMotoris').select_option(index=1)
        except Exception:
            try:
                page.click('#fMotoris + .select2-container')
                page.wait_for_timeout(300)
                page.locator('.select2-results__option').nth(1).click()
            except Exception:
                pass
        page.wait_for_timeout(400)
        page.locator('#btnInvLov').click()
        page.wait_for_timeout(600)
        shot_el(page, '#btnInvLov', 'ss_btn_koreksi_search-invoice.png')
        sel = page.locator('#invList button, #invTbl tbody button').first
        if sel.count():
            sel.click()
            page.wait_for_timeout(900)
            qty = page.locator('#mLines input').first
            if qty.count():
                qty.fill('20')
            page.locator('#mReason').fill('FSD button capture')
            page.wait_for_timeout(300)
            shot_el(page, '#btnSave', 'ss_btn_koreksi_save.png')

        page.goto(url, wait_until='domcontentloaded')
        page.wait_for_timeout(1200)
        page.locator('.mpg-stat-card[data-filter="Waiting"]').click(force=True)
        page.wait_for_timeout(500)
        page.locator('#tbl tbody a').first.click()
        page.wait_for_timeout(900)
        shot_el(page, '#btnApprove', 'ss_btn_koreksi_approve.png')
        shot_el(page, '#btnReject', 'ss_btn_koreksi_reject.png')

        # Mobile
        page.set_viewport_size({'width': 390, 'height': 844})
        page.goto(f'{BASE.rstrip("/")}/Views/Mobile/correction_approve.html?v=btn', wait_until='domcontentloaded')
        page.evaluate("""() => localStorage.setItem('sfa_user', JSON.stringify({
            username:'ABM1', name:'ABM1', role:'abm', branch:'Jakarta Pusat'
        }))""")
        page.reload(wait_until='domcontentloaded')
        page.wait_for_timeout(1200)
        shot_el(page, '.btn-card-approve', 'ss_btn_koreksi_setujui.png', pad=4)
        shot_el(page, '.btn-card-reject', 'ss_btn_koreksi_tolak.png', pad=4)

        page.goto(f'{BASE.rstrip("/")}/Views/Mobile/correction_form.html?source=invoice&v=btn', wait_until='domcontentloaded')
        page.evaluate("""() => localStorage.setItem('sfa_user', JSON.stringify({
            username:'MOTORIS1', name:'RESTI', role:'motoris', branch:'Jakarta Pusat'
        }))""")
        page.reload(wait_until='domcontentloaded')
        page.wait_for_timeout(1000)
        # try enable send
        try:
            page.locator('input[type="number"], .qty-input').first.fill('1')
            page.locator('textarea').first.fill('capture')
            page.wait_for_timeout(400)
        except Exception:
            pass
        for sel in ['#btnSend', 'button:has-text("Kirim")', '.bottom-action button']:
            try:
                if page.locator(sel).first.is_visible():
                    shot_el(page, sel, 'ss_btn_koreksi_kirim-pengajuan.png', pad=4)
                    break
            except Exception:
                continue

        browser.close()
    print('done')


if __name__ == '__main__':
    main()
