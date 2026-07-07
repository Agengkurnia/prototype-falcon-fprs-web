#!/usr/bin/env python3
"""
Build FSD Falcon Web / Mobile dan salin DOCX final ke Document/ (standar §K.2).

Usage (dari Prototype root):
  py Document/build_fsd_deliverables.py --web-only
  py Document/build_fsd_deliverables.py --mobile-only
  py Document/build_fsd_deliverables.py --web-only --skip-capture
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from datetime import datetime

PROTOTYPE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCUMENT_DIR = os.path.join(PROTOTYPE_ROOT, 'Document')
WEB_DIR = os.path.join(PROTOTYPE_ROOT, 'wwwroot', 'document', 'FSD', 'FalconWebPortal')
MOBILE_DIR = os.path.join(PROTOTYPE_ROOT, 'wwwroot', 'document', 'FSD', 'FalconMobile')
WEB_MD = 'FSD_Falcon_Web_v1.0.md'
WEB_DOCX_INTERNAL = 'FSD_Falcon_Web_v1.0.docx'
MOBILE_DOCX_INTERNAL = 'FSD_Falcon_Mobile_v1.0.docx'
BASE_URL = 'http://127.0.0.1:5502'


def run(cmd, cwd=None):
    print(f'\n>> {" ".join(cmd)}')
    r = subprocess.run(cmd, cwd=cwd)
    if r.returncode != 0:
        sys.exit(r.returncode)


def deliverable_name(code: str) -> str:
    ts = datetime.now().strftime('%Y%m%d%H%M%S')
    return f'{ts}__FSD_{code}.docx'


def copy_deliverable(src: str, code: str) -> str:
    if not os.path.exists(src):
        print(f'ERROR: {src} tidak ditemukan')
        sys.exit(1)
    os.makedirs(DOCUMENT_DIR, exist_ok=True)
    dst_name = deliverable_name(code)
    dst = os.path.join(DOCUMENT_DIR, dst_name)
    shutil.copy2(src, dst)
    print(f'Salin -> {dst} ({os.path.getsize(dst):,} bytes)')
    return dst


def build_web(skip_capture: bool, base_url: str) -> str:
    run([sys.executable, os.path.join(WEB_DIR, 'scripts', 'extract_module_spec.py')])

    if not skip_capture:
        job = os.path.join(WEB_DIR, '_jobs', 'capture_all.json')
        run([
            sys.executable,
            os.path.join(WEB_DIR, 'capture_web_portal_screenshots.py'),
            '--job-config', job,
            '--base-url', base_url,
        ])

    run([sys.executable, os.path.join(WEB_DIR, 'scripts', 'assemble_fsd.py')])
    run([sys.executable, 'build.py'], cwd=WEB_DIR)

    src = os.path.join(WEB_DIR, 'output', WEB_DOCX_INTERNAL)
    return copy_deliverable(src, 'FALCON_WEB')


def build_mobile(skip_capture: bool, base_url: str) -> str:
    run([sys.executable, os.path.join(MOBILE_DIR, 'scripts', 'inject_form_narratives.py')])
    if not skip_capture:
        run([
            sys.executable,
            os.path.join(MOBILE_DIR, 'capture_mobile_screenshots.py'),
            '--base-url', base_url,
        ])
    run([sys.executable, 'build.py'], cwd=MOBILE_DIR)

    src = os.path.join(MOBILE_DIR, 'output', MOBILE_DOCX_INTERNAL)
    return copy_deliverable(src, 'FALCON_MOBILE')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--web-only', action='store_true', help='Hanya build FSD Web')
    parser.add_argument('--mobile-only', action='store_true', help='Hanya build FSD Mobile')
    parser.add_argument('--skip-capture', action='store_true')
    parser.add_argument('--base-url', default=BASE_URL)
    args = parser.parse_args()

    if args.web_only and args.mobile_only:
        print('ERROR: pilih salah satu --web-only atau --mobile-only')
        sys.exit(1)

    if args.mobile_only:
        dst = build_mobile(args.skip_capture, args.base_url)
        print('\n=== SELESAI (Mobile) ===')
        print(f'  {dst}')
        return

    if args.web_only:
        dst = build_web(args.skip_capture, args.base_url)
        print('\n=== SELESAI (Web) ===')
        print(f'  {dst}')
        return

    web_dst = build_web(args.skip_capture, args.base_url)
    mobile_dst = build_mobile(args.skip_capture, args.base_url)
    print('\n=== SELESAI (Web + Mobile) ===')
    print(f'  {web_dst}')
    print(f'  {mobile_dst}')


if __name__ == '__main__':
    main()
