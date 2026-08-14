#!/usr/bin/env python3
"""
Capture screenshot Filter + Pop-up Detail Motoris + Pop-up Audit (Stok Motoris).

Prasyarat: server statis prototipe (default http://127.0.0.1:5502).

Usage:
  py scripts/capture_stok_motoris_popups.py
  py scripts/capture_stok_motoris_popups.py --base-url http://127.0.0.1:5502
"""
from __future__ import annotations

import argparse
import os
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, "screenshots")

INDEX_PATH = "Views/FPRS/Penjualan/StokMotoris/index.html"


def shot(page, name: str, full_page: bool = False) -> str:
    path = os.path.join(SCREENSHOTS_DIR, name)
    page.screenshot(path=path, full_page=full_page)
    print(f"   saved {name}")
    return path


def wait_dashboard(page) -> None:
    try:
        page.wait_for_load_state("networkidle", timeout=20000)
    except Exception:
        pass
    page.wait_for_selector(".filter-bar, .dash-card", timeout=30000)
    try:
        page.wait_for_function(
            "() => document.querySelectorAll('#balanceTableBody tr a.motoris-link, "
            "#balanceTableBody tr .motoris-link').length > 0 "
            "|| document.querySelectorAll('#auditTableBody tr button').length > 0",
            timeout=60000,
        )
    except Exception:
        pass
    time.sleep(2.5)


def capture(base_url: str) -> None:
    from playwright.sync_api import sync_playwright

    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    url = base_url.rstrip("/") + "/" + INDEX_PATH

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        try:
            print(f"[open] {url}")
            page.goto(url, wait_until="domcontentloaded", timeout=60000)
            wait_dashboard(page)

            # --- Filter bar (+ chips jika ada) ---
            print("[1] Filter bar")
            # Set sample filter agar chip aktif terlihat
            page.evaluate(
                """() => {
                    const region = document.getElementById('filterRegion');
                    if (region && region.options.length > 1) {
                        region.selectedIndex = 1;
                        if (typeof onRegionChange === 'function') onRegionChange();
                        else region.dispatchEvent(new Event('change'));
                    }
                    const brand = document.getElementById('filterBrand');
                    if (brand && brand.options.length > 1) {
                        brand.selectedIndex = 1;
                        if (typeof applyAllFilters === 'function') applyAllFilters();
                        else brand.dispatchEvent(new Event('change'));
                    }
                }"""
            )
            time.sleep(1.2)
            bar = page.query_selector(".filter-bar")
            chips = page.query_selector("#filterChipsBar:not(.hidden), .filter-chips-bar:not(.hidden)")
            if bar and chips:
                # Clip encompassing filter + chips
                b = bar.bounding_box()
                c = chips.bounding_box()
                if b and c:
                    x = min(b["x"], c["x"])
                    y = min(b["y"], c["y"])
                    w = max(b["x"] + b["width"], c["x"] + c["width"]) - x
                    h = max(b["y"] + b["height"], c["y"] + c["height"]) - y
                    page.screenshot(
                        path=os.path.join(SCREENSHOTS_DIR, "ss_sm_filter.png"),
                        clip={"x": max(0, x - 8), "y": max(0, y - 8), "width": w + 16, "height": h + 16},
                    )
                    print("   saved ss_sm_filter.png (clip)")
                else:
                    shot(page, "ss_sm_filter.png")
            elif bar:
                bar.screenshot(path=os.path.join(SCREENSHOTS_DIR, "ss_sm_filter.png"))
                print("   saved ss_sm_filter.png (element)")
            else:
                shot(page, "ss_sm_filter.png")

            # Reset filter agar data penuh untuk popup
            page.evaluate(
                """() => {
                    if (typeof resetAllFilters === 'function') resetAllFilters();
                }"""
            )
            time.sleep(1.5)

            # --- Pop-up Detail Motoris (Sebaran Outlet) ---
            print("[2] Pop-up Detail Motoris")
            opened = page.evaluate(
                """() => {
                    const link = document.querySelector('#balanceTableBody a.motoris-link, a.motoris-link');
                    if (link) { link.click(); return true; }
                    // fallback: call first motoris code from balance rows
                    const row = document.querySelector('#balanceTableBody tr');
                    if (!row) return false;
                    const codeEl = row.querySelector('span');
                    const code = codeEl && codeEl.textContent ? codeEl.textContent.trim() : null;
                    if (code && typeof showMotorisDetail === 'function') {
                        showMotorisDetail(code);
                        return true;
                    }
                    return false;
                }"""
            )
            if not opened:
                print("   WARN: tidak ada link motoris — skip popup motoris")
            else:
                page.wait_for_selector(".swal-motoris-popup, .swal2-container .motoris-pop", timeout=20000)
                time.sleep(2.0)  # map + chart render
                popup = page.query_selector(".swal2-popup.swal-motoris-popup, .swal2-popup")
                if popup:
                    popup.screenshot(
                        path=os.path.join(SCREENSHOTS_DIR, "ss_sm_popup_motoris.png")
                    )
                    print("   saved ss_sm_popup_motoris.png")
                else:
                    shot(page, "ss_sm_popup_motoris.png")
                page.keyboard.press("Escape")
                time.sleep(0.6)
                page.evaluate(
                    """() => {
                        if (window.Swal && Swal.isVisible && Swal.isVisible()) Swal.close();
                    }"""
                )
                time.sleep(0.5)

            # --- Pop-up Audit (ID Transaksi & Pergerakan Stok) ---
            print("[3] Pop-up Audit")
            # Expand audit section if collapsed
            page.evaluate(
                """() => {
                    const section = document.getElementById('auditSection');
                    if (section && section.style.maxHeight === '0px') {
                        if (typeof toggleSection === 'function') toggleSection('auditSection');
                    }
                    const el = document.getElementById('auditSection');
                    if (el) el.scrollIntoView({ block: 'center' });
                }"""
            )
            time.sleep(0.8)
            clicked = page.evaluate(
                """() => {
                    const btn = document.querySelector('#auditTableBody button[onclick*=\"showAuditDetail\"], #auditTableBody button.btn-outline-secondary');
                    if (btn) { btn.click(); return true; }
                    return false;
                }"""
            )
            if not clicked:
                print("   WARN: tidak ada tombol audit — skip")
            else:
                page.wait_for_selector(".swal-audit-popup, .swal2-container .audit-pop", timeout=20000)
                time.sleep(1.0)
                popup = page.query_selector(".swal2-popup.swal-audit-popup, .swal2-popup")
                if popup:
                    popup.screenshot(
                        path=os.path.join(SCREENSHOTS_DIR, "ss_sm_popup_audit.png")
                    )
                    print("   saved ss_sm_popup_audit.png")
                else:
                    shot(page, "ss_sm_popup_audit.png")

        finally:
            page.close()
            browser.close()

    print("\nSelesai capture filter + pop-up Stok Motoris.")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default="http://127.0.0.1:5502")
    args = ap.parse_args()
    capture(args.base_url)


if __name__ == "__main__":
    main()
