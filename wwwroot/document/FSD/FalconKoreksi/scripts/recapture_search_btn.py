"""Capture a clean Search invoice (#btnInvLov) crop — icon button only, before modal opens."""
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SS = ROOT / "screenshots"
BASE = "http://127.0.0.1:8766"


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=3,
        )
        page = ctx.new_page()
        page.goto(
            f"{BASE}/Views/FPRS/Penjualan/Koreksi/index.html?v=search-btn",
            wait_until="domcontentloaded",
            timeout=60000,
        )
        page.wait_for_timeout(1200)
        page.locator("#btnAdd").click()
        page.wait_for_timeout(800)
        # Ensure LOV button visible on create form (modal must be closed)
        btn = page.locator("#btnInvLov")
        btn.wait_for(state="visible", timeout=10000)
        # Prefer element screenshot (accurate) over page clip
        out = SS / "ss_btn_koreksi_search-invoice.png"
        btn.screenshot(path=str(out))
        box = btn.bounding_box()
        print("saved", out.name, "box", box)
        # Also save a wider crop of the invoice input-group for sanity check optional
        group = page.locator("#fInvoiceLabel").locator("xpath=..")
        if group.count():
            group.screenshot(path=str(SS / "ss_btn_koreksi_search-invoice_group.png"))
            print("also saved group crop")
        browser.close()


if __name__ == "__main__":
    main()
