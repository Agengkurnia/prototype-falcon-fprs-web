#!/usr/bin/env python3
"""Capture missing Penjualan button screenshots for FSD Tombol Aksi tables."""
from __future__ import annotations

import os
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SHOTS = os.path.join(WORKSPACE_DIR, "screenshots")

BASE = "http://127.0.0.1:5502"


def shot_loc(page, locator, name: str, pad: int = 4) -> bool:
    path = os.path.join(SHOTS, name)
    try:
        loc = locator.first
        if not loc.count() or not loc.is_visible():
            print(f"   MISS {name}")
            return False
        # Prefer element screenshot; pad via evaluate clip if needed
        box = loc.bounding_box()
        if box and pad:
            page.screenshot(
                path=path,
                clip={
                    "x": max(0, box["x"] - pad),
                    "y": max(0, box["y"] - pad),
                    "width": box["width"] + pad * 2,
                    "height": box["height"] + pad * 2,
                },
            )
        else:
            loc.screenshot(path=path)
        print(f"   saved {name} ({os.path.getsize(path)} bytes)")
        return True
    except Exception as e:
        print(f"   ERR {name}: {e}")
        return False


def capture_faktur(page) -> None:
    url = f"{BASE}/Views/FPRS/Penjualan/Faktur/index.html"
    print("[faktur]", url)
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    try:
        page.wait_for_selector("#tblFaktur tbody tr, #tblFaktur_wrapper", timeout=30000)
    except Exception:
        pass
    time.sleep(1.5)

    shot_loc(page, page.locator("#btnEkspor"), "ss_btn_penjualan-faktur_ekspor.png", pad=2)
    # Action cell: eye + print together looks better; also capture individually
    shot_loc(
        page,
        page.locator("#tblFaktur tbody tr").first.locator("a.btn-action-view, a[title*='Detail']"),
        "ss_btn_penjualan-faktur_lihat-detail.png",
        pad=6,
    )
    shot_loc(
        page,
        page.locator("#tblFaktur tbody tr").first.locator("button[title*='Cetak'], button[onclick*='cetakFaktur']"),
        "ss_btn_penjualan-faktur_cetak-faktur.png",
        pad=6,
    )
    # Reset filter — class may not be .btn
    shot_loc(page, page.locator("#btnResetFilter"), "ss_btn_penjualan-faktur_reset.png", pad=2)

    # Detail page Cetak button (optional richer shot)
    page.goto(f"{BASE}/Views/FPRS/Penjualan/Faktur/detail.html?id=SI-2606146101", wait_until="domcontentloaded")
    time.sleep(1.2)
    shot_loc(page, page.locator("#btnCetak, .btn-cetak-faktur"), "ss_btn_penjualan-faktur_cetak-detail.png", pad=2)


def capture_stok(page) -> None:
    url = f"{BASE}/Views/FPRS/Penjualan/StokMotoris/index.html"
    print("[stok]", url)
    page.goto(url, wait_until="domcontentloaded", timeout=60000)
    try:
        page.wait_for_selector(".dash-card, .filter-bar", timeout=30000)
        page.wait_for_function("() => document.querySelectorAll('.dash-card').length >= 3", timeout=30000)
    except Exception:
        pass
    time.sleep(1.5)

    shot_loc(
        page,
        page.locator("button").filter(has_text="Export Excel"),
        "ss_btn_penjualan-stok-motoris_export-excel.png",
        pad=2,
    )
    shot_loc(
        page,
        page.locator("button").filter(has_text="Refresh"),
        "ss_btn_penjualan-stok-motoris_refresh.png",
        pad=2,
    )
    # Set a filter so Reset Semua chip bar appears
    page.evaluate(
        """() => {
            const region = document.getElementById('filterRegion');
            if (region && region.options.length > 1) {
                region.selectedIndex = 1;
                if (typeof onRegionChange === 'function') onRegionChange();
            }
        }"""
    )
    time.sleep(0.8)
    shot_loc(
        page,
        page.locator(".filter-reset-btn, button").filter(has_text="Reset Semua"),
        "ss_btn_penjualan-stok-motoris_reset-semua.png",
        pad=2,
    )

    # Cetak PDF only visible inside audit popup
    page.evaluate(
        """() => {
            const section = document.getElementById('auditSection');
            if (section) section.scrollIntoView({ block: 'center' });
            if (section && section.style.maxHeight === '0px' && typeof toggleSection === 'function') {
                toggleSection('auditSection');
            }
        }"""
    )
    time.sleep(0.6)
    btn = page.locator("#auditTableBody button").first
    if btn.count():
        btn.click()
        try:
            page.wait_for_selector(".swal-audit-popup, .audit-pop-header", timeout=15000)
            time.sleep(0.8)
            shot_loc(
                page,
                page.locator(".swal-audit-popup button").filter(has_text="Cetak PDF"),
                "ss_btn_penjualan-stok-motoris_cetak-pdf.png",
                pad=2,
            )
            page.keyboard.press("Escape")
        except Exception as e:
            print(f"   WARN audit popup: {e}")


def main() -> None:
    from playwright.sync_api import sync_playwright

    os.makedirs(SHOTS, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        try:
            capture_faktur(page)
            capture_stok(page)
        finally:
            page.close()
            browser.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
