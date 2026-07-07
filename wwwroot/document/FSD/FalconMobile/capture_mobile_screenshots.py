#!/usr/bin/env python3
"""Capture Mobile SFA screenshots for FSD (Playwright)."""
import argparse
import os
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROTOTYPE_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..', '..'))
OUT_DIR = os.path.join(SCRIPT_DIR, 'screenshots')
MOBILE_BASE = 'Views/Mobile'

# (filename, path relative to MOBILE_BASE, setup callback name or None)
PAGES = [
    ('ss_01_login.png', 'login.html', None),
    ('ss_02_home.png', 'home.html', 'auth'),
    ('ss_03_dasbor.png', 'dasbor.html', 'auth'),
    ('ss_04_profil.png', 'profil.html', 'auth'),
    ('ss_05_target.png', 'target.html', 'auth'),
    ('ss_06_bottom_nav.png', 'home.html', 'auth_bottom'),
    ('ss_07_visit_list.png', 'visit_list.html', 'auth'),
    ('ss_08_visit_detail.png', 'visit_detail.html?id=OL-10283', 'auth'),
    ('ss_09_order_input.png', 'order_input.html?outletId=OL-10283', 'auth'),
    ('ss_10_order_add.png', 'order_add.html', 'auth'),
    ('ss_11_invoice_list.png', 'invoice_list.html', 'auth'),
    ('ss_12_invoice_detail.png', 'invoice_detail.html?id=INV-DEMO-001', 'auth'),
    ('ss_13_collection_list.png', 'collection_list.html', 'auth'),
    ('ss_14_collection_input.png', 'collection_input.html?outletId=OL-10511', 'auth'),
    ('ss_15_outlet_list.png', 'outlet_list.html', 'auth'),
    ('ss_16_outlet_detail.png', 'outlet_detail.html?id=OL-10283', 'auth'),
    ('ss_17_outlet_add.png', 'outlet_add.html', 'auth'),
    ('ss_18_product_catalog.png', 'product_catalog.html', 'auth'),
    ('ss_19_product_detail.png', 'product_detail.html?id=KN-SF-001', 'auth'),
    ('ss_20_restock_review.png', 'restock_review.html?outletId=OL-10283', 'auth'),
    ('ss_21_sync_detail.png', 'sync_detail.html', 'auth'),
]

AUTH_JS = """
() => {
  localStorage.setItem('sfa_user', JSON.stringify({
    username: 'SINGARAJA',
    name: 'SINGARAJA',
    role: 'canvasser',
    branch: 'Jakarta Pusat',
    loginTime: new Date().toISOString()
  }));
  if (!localStorage.getItem('sfa_seeded_v9_today')) {
    localStorage.removeItem('sfa_visits');
    localStorage.removeItem('sfa_invoices');
    localStorage.removeItem('sfa_collections');
    localStorage.removeItem('sfa_customers');
    localStorage.removeItem('sfa_products');
    localStorage.removeItem('sfa_sync_queue');
  }
}
"""


def wait_ready(page, filename: str, rel_path: str):
    try:
        page.wait_for_load_state('networkidle', timeout=12000)
    except Exception:
        pass

    low = (filename + ' ' + rel_path).lower()
    if 'dasbor' in low or 'target' in low:
        try:
            page.wait_for_selector('canvas', timeout=6000)
            time.sleep(1.0)
        except Exception:
            pass
    elif any(x in low for x in ('visit_list', 'invoice_list', 'collection_list', 'product_catalog', 'outlet_list')):
        try:
            page.wait_for_selector(
                '.visit-card, .invoice-card, .product-card, .outlet-item, '
                '.list-group-item, table tbody tr, .mobile-card',
                timeout=6000,
            )
        except Exception:
            pass
    elif 'visit_detail' in low or 'outlet_detail' in low:
        time.sleep(1.2)
    elif 'sync_detail' in low:
        try:
            page.wait_for_selector('.sync-item, .sync-row, table tbody tr', timeout=5000)
        except Exception:
            pass

    time.sleep(0.6)


def take_shot(page, filename: str) -> None:
    """Viewport capture — satu layar ponsel, proporsi sesuai UI mobile."""
    page.screenshot(path=os.path.join(OUT_DIR, filename), full_page=False)


def capture_all(base_url: str):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('ERROR: pip install playwright && playwright install chromium')
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    base = base_url.rstrip('/')
    captured = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 360, 'height': 780},
            device_scale_factor=1,
            is_mobile=True,
            has_touch=True,
        )
        page = context.new_page()

        for filename, rel_path, setup in PAGES:
            url = f'{base}/{MOBILE_BASE}/{rel_path}'
            print(f'  {filename} <- {rel_path}')
            try:
                if setup in ('auth', 'auth_bottom'):
                    page.goto(f'{base}/{MOBILE_BASE}/login.html', wait_until='domcontentloaded', timeout=30000)
                    page.evaluate(AUTH_JS)
                page.goto(url, wait_until='domcontentloaded', timeout=30000)
                wait_ready(page, filename, rel_path)
                if setup == 'auth_bottom':
                    try:
                        page.locator('.mobile-nav').scroll_into_view_if_needed(timeout=3000)
                        time.sleep(0.4)
                    except Exception:
                        page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                        time.sleep(0.4)
                take_shot(page, filename)
                captured += 1
            except Exception as e:
                print(f'    WARN: {e}')

        page.close()
        context.close()
        browser.close()

    print(f'Capture selesai -> {OUT_DIR} ({captured}/{len(PAGES)} berhasil)')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://127.0.0.1:5502')
    args = parser.parse_args()
    capture_all(args.base_url)


if __name__ == '__main__':
    main()
