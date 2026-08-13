#!/usr/bin/env python3
"""
Capture screenshot validasi Mobile SFA (SweetAlert + shake login).

Prasyarat: py -m http.server 5502 di root Prototype.

Usage:
  py capture_mobile_validations.py
  py capture_mobile_validations.py --base-url http://127.0.0.1:5502
"""
from __future__ import annotations

import argparse
import os
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(SCRIPT_DIR, 'screenshots')
MOBILE_BASE = 'Views/Mobile'

VIEWPORT_WIDTH = 390
VIEWPORT_HEIGHT = 844
DEVICE_SCALE = 2

PREPARE_CAPTURE_JS = """
() => {
  const id = 'fsd-capture-style';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      .mobile-wrapper {
        width: 100% !important; max-width: 100% !important;
        margin: 0 !important; border-radius: 0 !important; box-shadow: none !important;
      }
      .proto-doc-btn, .proto-doc-btn--float, .skip-link { display: none !important; }
    `;
    document.head.appendChild(style);
  }
}
"""

SHOTS = [
    'ss_m01_val_login_kosong.png',
    'ss_m02_val_visit_luar_radius.png',
    'ss_m03_val_foto_wajib.png',
    'ss_m04_val_visit_aktif_lain.png',
    'ss_m05_val_aktivitas_belum_lengkap.png',
    'ss_m06_val_cek_stok_wajib.png',
]


def take_wrapper(page, filename: str) -> None:
    out = os.path.join(SCREENSHOTS_DIR, filename)
    page.evaluate(PREPARE_CAPTURE_JS)
    wrapper = page.locator('.mobile-wrapper').first
    try:
        wrapper.wait_for(state='visible', timeout=5000)
        wrapper.screenshot(path=out)
    except Exception:
        page.screenshot(path=out, full_page=False)
    print(f'   saved {filename}')


def shot_swal(page, filename: str) -> None:
    page.wait_for_selector('.swal2-popup', state='visible', timeout=10000)
    time.sleep(0.35)
    popup = page.query_selector('.swal2-popup')
    out = os.path.join(SCREENSHOTS_DIR, filename)
    if popup:
        popup.screenshot(path=out)
    else:
        take_wrapper(page, filename)
    print(f'   saved {filename}')


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


def clear_visits(page):
    page.evaluate("""() => {
        localStorage.setItem('sfa_visits', '[]');
        localStorage.removeItem('sfa_seeded_v9_today');
    }""")


def seed_active_visit_other(page, customer_id='OL-10772', customer_name='Apotek Sehat Jaya'):
    today = page.evaluate("() => new Date().toISOString().slice(0, 10)")
    page.evaluate(
        """([today, customerId, customerName]) => {
            const visit = {
                id: 'VST-CAPTURE-OTHER',
                date: today,
                createdAt: new Date().toISOString(),
                status: 'checked_in',
                customerId,
                customerName,
                checkInTime: '08:30 WIB',
                reason: 'Dalam Radius Outlet',
                hasOrder: false,
                hasNoOrderReason: false,
                orderAmount: 0,
                stockCheckDone: false,
                stockistId: null
            };
            localStorage.setItem('sfa_visits', JSON.stringify([visit]));
        }""",
        [today, customer_id, customer_name],
    )


def seed_checked_in_visit(page, *, has_no_order=False, stock_check_done=False, role='canvasser'):
    today = page.evaluate("() => new Date().toISOString().slice(0, 10)")
    page.evaluate(
        """([today, hasNoOrder, stockDone, role]) => {
            localStorage.setItem('sfa_user', JSON.stringify({
                username: role === 'md' ? 'MDUSER' : 'SINGARAJA',
                name: role === 'md' ? 'MD USER' : 'SINGARAJA',
                role,
                branch: 'Jakarta Pusat',
                loginTime: new Date().toISOString()
            }));
            const visit = {
                id: 'VST-CAPTURE-LOCAL',
                date: today,
                createdAt: new Date().toISOString(),
                status: 'checked_in',
                customerId: 'OL-10283',
                customerName: 'Toko Maju Bersama',
                checkInTime: '09:15 WIB',
                reason: 'Dalam Radius Outlet',
                hasOrder: false,
                hasNoOrderReason: hasNoOrder,
                noOrderReason: hasNoOrder ? 'Stok Masih Banyak' : '',
                orderAmount: 0,
                stockCheckDone: stockDone,
                stockistId: null
            };
            localStorage.setItem('sfa_visits', JSON.stringify([visit]));
        }""",
        [today, has_no_order, stock_check_done, role],
    )


def goto_visit_detail(page, base, outlet_id='OL-10283'):
    page.goto(
        f'{base}/{MOBILE_BASE}/visit_detail.html?id={outlet_id}',
        wait_until='domcontentloaded',
        timeout=30000,
    )
    time.sleep(1.0)
    page.wait_for_function('() => typeof triggerCheckInWorkflow === "function"', timeout=15000)


def capture(base_url: str):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('ERROR: pip install playwright && playwright install chromium')
        sys.exit(1)

    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    base = base_url.rstrip('/')

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': VIEWPORT_WIDTH, 'height': VIEWPORT_HEIGHT},
            device_scale_factor=DEVICE_SCALE,
            is_mobile=True,
            has_touch=True,
            user_agent=(
                'Mozilla/5.0 (Linux; Android 13; Pixel 7) '
                'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
            ),
        )
        page = context.new_page()

        # 1) Login — username kosong (shake)
        print('1) Login — field wajib (shake)')
        page.goto(f'{base}/{MOBILE_BASE}/login.html', wait_until='domcontentloaded')
        page.fill('#usernameInput', '')
        page.fill('#passwordInput', '')
        page.click('#loginBtn')
        time.sleep(0.25)
        take_wrapper(page, 'ss_m01_val_login_kosong.png')

        # 2) Visit luar radius
        print('2) Visit di luar radius GPS')
        clear_visits(page)
        goto_visit_detail(page, base, 'OL-10283')
        page.evaluate('() => triggerCheckInWorkflow()')
        shot_swal(page, 'ss_m02_val_visit_luar_radius.png')
        page.click('.swal2-confirm')
        time.sleep(0.5)

        # 3) Foto bukti wajib (modal check-in)
        print('3) Foto bukti wajib')
        page.wait_for_selector('#checkInReasonModal.show, #checkInReasonModal[style*="display: block"]', timeout=8000)
        page.evaluate('() => confirmCheckInWithReason()')
        shot_swal(page, 'ss_m03_val_foto_wajib.png')
        dismiss_swal(page)

        # 4) Visit aktif di outlet lain
        print('4) Visit aktif di outlet lain')
        seed_active_visit_other(page)
        goto_visit_detail(page, base, 'OL-10283')
        page.evaluate('() => triggerCheckInWorkflow()')
        shot_swal(page, 'ss_m04_val_visit_aktif_lain.png')
        dismiss_swal(page)

        # 5) Aktivitas belum lengkap
        print('5) Aktivitas belum lengkap (order/alasan)')
        clear_visits(page)
        seed_checked_in_visit(page, has_no_order=False, stock_check_done=False)
        goto_visit_detail(page, base, 'OL-10283')
        page.evaluate('() => triggerCheckOutWorkflow()')
        shot_swal(page, 'ss_m05_val_aktivitas_belum_lengkap.png')
        dismiss_swal(page)

        # 6) Cek stok wajib (MD user)
        print('6) Cek stok wajib sebelum selesai visit')
        clear_visits(page)
        seed_checked_in_visit(page, has_no_order=True, stock_check_done=False, role='md')
        goto_visit_detail(page, base, 'OL-10283')
        page.evaluate('() => triggerCheckOutWorkflow()')
        shot_swal(page, 'ss_m06_val_cek_stok_wajib.png')
        dismiss_swal(page)

        page.close()
        context.close()
        browser.close()

    print(f'\nCapture validasi Mobile SFA selesai -> {SCREENSHOTS_DIR}')
    for name in SHOTS:
        path = os.path.join(SCREENSHOTS_DIR, name)
        print(f'  [{"OK" if os.path.exists(path) else "MISS"}] {name}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://127.0.0.1:5502')
    args = parser.parse_args()
    capture(args.base_url)


if __name__ == '__main__':
    main()
