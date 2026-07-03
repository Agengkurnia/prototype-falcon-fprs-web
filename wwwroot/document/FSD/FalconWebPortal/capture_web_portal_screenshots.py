#!/usr/bin/env python3
"""Capture Web Portal screenshots for FSD job (Playwright)."""
import argparse
import json
import os
import sys
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROTOTYPE_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..', '..'))
REGISTRY_PATH = os.path.join(PROTOTYPE_ROOT, 'lib', 'fsd', 'module-registry.json')


def load_job_config(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_registry():
    with open(REGISTRY_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_modules(job_cfg):
    reg = load_registry()
    ids = set(job_cfg.get('moduleIds') or [])
    mods = [m for m in reg['modules'] if m['id'] in ids]
    return mods


def capture_modules(base_url, job_cfg):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('ERROR: pip install playwright && playwright install chromium')
        sys.exit(1)

    out_dir = job_cfg.get('screenshotDir') or os.path.join(SCRIPT_DIR, 'screenshots')
    os.makedirs(out_dir, exist_ok=True)
    modules = get_modules(job_cfg)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for mod in modules:
            shots = mod.get('screenshots') or []
            if not shots:
                continue
            print(f'[{mod["id"]}] {mod["label"]}')
            page = browser.new_page(viewport={'width': 1366, 'height': 768})
            try:
                url = base_url.rstrip('/') + '/' + mod['htmlPath'].replace('\\', '/')
                page.goto(url, wait_until='domcontentloaded', timeout=30000)
                time.sleep(1)
                page.screenshot(path=os.path.join(out_dir, shots[0]))

                if mod.get('type') == 'modal':
                    btn = page.locator('button.btn-success, a.btn-success').first
                    if btn.count():
                        btn.click(timeout=5000)
                        time.sleep(0.6)
                        modal = next((s for s in shots if 'modal' in s), None)
                        if modal:
                            page.screenshot(path=os.path.join(out_dir, modal))

                if mod.get('formPath'):
                    form_url = base_url.rstrip('/') + '/' + mod['formPath'].replace('\\', '/')
                    page.goto(form_url, wait_until='domcontentloaded', timeout=30000)
                    time.sleep(0.8)
                    add_shot = next((s for s in shots if '_add' in s or 'add' in s), None)
                    if add_shot:
                        page.screenshot(path=os.path.join(out_dir, add_shot))
            except Exception as e:
                print(f'  WARN {mod["id"]}: {e}')
            finally:
                page.close()
        browser.close()

    print('Capture selesai.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--job-config', required=True)
    parser.add_argument('--base-url', default='http://127.0.0.1:5500')
    args = parser.parse_args()
    job_cfg = load_job_config(args.job_config)
    capture_modules(args.base_url, job_cfg)


if __name__ == '__main__':
    main()
