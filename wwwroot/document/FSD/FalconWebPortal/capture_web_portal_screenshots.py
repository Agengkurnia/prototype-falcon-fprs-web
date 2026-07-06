#!/usr/bin/env python3
"""Capture Web Portal screenshots for FSD job (Playwright)."""
import argparse
import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROTOTYPE_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..', '..'))
REGISTRY_PATH = os.path.join(PROTOTYPE_ROOT, 'lib', 'fsd', 'module-registry.json')
MANIFEST_PATH = os.path.join(SCRIPT_DIR, '_cache', 'manifest.json')
PROMPT_VERSION = os.environ.get('FSD_PROMPT_VERSION', 'fsd-flow-v2')


def load_job_config(path):
    with open(path, 'r', encoding='utf-8-sig') as f:
        return json.load(f)


def load_registry():
    with open(REGISTRY_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)


def read_html_rel(rel_path):
    if not rel_path:
        return ''
    p = os.path.join(PROTOTYPE_ROOT, rel_path.replace('/', os.sep))
    if not os.path.exists(p):
        return ''
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()


def compute_source_hash(mod):
    index_html = read_html_rel(mod.get('htmlPath', ''))
    form_html = read_html_rel(mod.get('formPath') or '')
    content = index_html + '\n---\n' + form_html
    return hashlib.sha256(content.encode('utf-8')).hexdigest()


def load_manifest():
    if not os.path.exists(MANIFEST_PATH):
        return {'version': 1, 'promptVersion': PROMPT_VERSION, 'modules': {}}
    with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if 'modules' not in data:
        data['modules'] = {}
    return data


def save_manifest(manifest):
    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    manifest['promptVersion'] = PROMPT_VERSION
    manifest['updatedAt'] = datetime.now(timezone.utc).isoformat()
    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)


def update_manifest_screenshots(mod, captured_files):
    manifest = load_manifest()
    mid = mod['id']
    source_hash = compute_source_hash(mod)
    now = datetime.now(timezone.utc).isoformat()
    if mid not in manifest['modules']:
        manifest['modules'][mid] = {}
    manifest['modules'][mid]['sourceHash'] = source_hash
    if 'screenshots' not in manifest['modules'][mid]:
        manifest['modules'][mid]['screenshots'] = {}
    for shot in captured_files:
        manifest['modules'][mid]['screenshots'][shot] = {
            'sourceHash': source_hash,
            'capturedAt': now,
        }
    save_manifest(manifest)


def get_modules(job_cfg):
    reg = load_registry()
    ids = set(job_cfg.get('moduleIds') or [])
    mods = [m for m in reg['modules'] if m['id'] in ids]
    capture_ids = job_cfg.get('captureModuleIds') or []
    if capture_ids:
        capture_set = set(capture_ids)
        mods = [m for m in mods if m['id'] in capture_set]
    return mods


def wait_ready(page):
    try:
        page.wait_for_load_state('networkidle', timeout=15000)
    except Exception:
        pass
    try:
        page.wait_for_function(
            '() => document.querySelector("#app-content") || document.body',
            timeout=15000,
        )
    except Exception:
        pass
    time.sleep(0.8)


def shot_by_pattern(shots, *patterns):
    for s in shots:
        low = s.lower()
        if any(p in low for p in patterns):
            return s
    return None


def capture_page_module(page, mod, base_url, out_dir, shots):
    """Capture index, add, edit, validation, delete for page+form modules."""
    captured = []
    index_url = base_url.rstrip('/') + '/' + mod['htmlPath'].replace('\\', '/')

    page.goto(index_url, wait_until='domcontentloaded', timeout=30000)
    wait_ready(page)
    if shots:
        page.screenshot(path=os.path.join(out_dir, shots[0]))
        captured.append(shots[0])

    form_path = mod.get('formPath')
    if not form_path:
        return captured

    form_url = base_url.rstrip('/') + '/' + form_path.replace('\\', '/')

    add_shot = shot_by_pattern(shots, '_add')
    if add_shot:
        page.goto(form_url, wait_until='domcontentloaded', timeout=30000)
        wait_ready(page)
        page.screenshot(path=os.path.join(out_dir, add_shot))
        captured.append(add_shot)

    edit_shot = shot_by_pattern(shots, '_edit')
    if edit_shot:
        page.goto(index_url, wait_until='domcontentloaded', timeout=30000)
        wait_ready(page)
        edit_href = page.evaluate('''() => {
            const a = document.querySelector('a.btn-action-edit, a[href*="add.html?id="]');
            return a ? a.getAttribute('href') : null;
        }''')
        if edit_href:
            if edit_href.startswith('http'):
                target = edit_href
            else:
                base = index_url.rsplit('/', 1)[0]
                target = base + '/' + edit_href.lstrip('/')
            page.goto(target, wait_until='domcontentloaded', timeout=30000)
            wait_ready(page)
            page.screenshot(path=os.path.join(out_dir, edit_shot))
            captured.append(edit_shot)

    val_shot = shot_by_pattern(shots, 'validation')
    if val_shot:
        page.goto(form_url, wait_until='domcontentloaded', timeout=30000)
        wait_ready(page)
        submit = page.locator('button[type="submit"], #formProduk button[type="submit"]').first
        if submit.count():
            submit.click(timeout=5000)
            time.sleep(1.0)
            page.screenshot(path=os.path.join(out_dir, val_shot))
            captured.append(val_shot)

    del_shot = shot_by_pattern(shots, 'delete')
    if del_shot:
        page.goto(index_url, wait_until='domcontentloaded', timeout=30000)
        wait_ready(page)
        del_btn = page.locator('.btn-action-delete, button.btn-action-delete').first
        if del_btn.count():
            del_btn.click(timeout=5000)
            time.sleep(0.8)
            page.screenshot(path=os.path.join(out_dir, del_shot))
            captured.append(del_shot)

    return captured


def capture_modal_module(page, mod, base_url, out_dir, shots):
    captured = []
    url = base_url.rstrip('/') + '/' + mod['htmlPath'].replace('\\', '/')
    page.goto(url, wait_until='domcontentloaded', timeout=30000)
    wait_ready(page)
    page.screenshot(path=os.path.join(out_dir, shots[0]))
    captured.append(shots[0])

    btn = page.locator('button.btn-success, a.btn-success').first
    if btn.count():
        btn.click(timeout=5000)
        time.sleep(0.6)
        modal = shot_by_pattern(shots, 'modal')
        if modal:
            page.screenshot(path=os.path.join(out_dir, modal))
            captured.append(modal)
    return captured


def capture_modules(base_url, job_cfg):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('ERROR: pip install playwright && playwright install chromium')
        sys.exit(1)

    out_dir = job_cfg.get('screenshotDir') or os.path.join(SCRIPT_DIR, 'screenshots')
    os.makedirs(out_dir, exist_ok=True)
    modules = get_modules(job_cfg)

    if not modules:
        print('Tidak ada modul untuk capture (semua cache fresh).')
        return

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        for mod in modules:
            shots = mod.get('screenshots') or []
            if not shots:
                continue
            print(f'[{mod["id"]}] {mod["label"]}')
            captured = []
            page = browser.new_page(viewport={'width': 1366, 'height': 768})
            try:
                if mod.get('type') == 'modal':
                    captured = capture_modal_module(page, mod, base_url, out_dir, shots)
                else:
                    captured = capture_page_module(page, mod, base_url, out_dir, shots)

                if captured:
                    update_manifest_screenshots(mod, captured)
                    print(f'  captured {len(captured)}/{len(shots)}: {", ".join(captured)}')
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
    parser.add_argument('--module-ids', default=None, help='Comma-separated module ids')
    args = parser.parse_args()
    job_cfg = load_job_config(args.job_config)
    if args.module_ids:
        job_cfg['captureModuleIds'] = [x.strip() for x in args.module_ids.split(',') if x.strip()]
    capture_modules(args.base_url, job_cfg)


if __name__ == '__main__':
    main()
