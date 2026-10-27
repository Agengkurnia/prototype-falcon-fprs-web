#!/usr/bin/env python3
"""
Capture screenshot FSD Data Master v2.0.

Menimpa PNG di screenshots/ (nama file sama dengan v1).
Pipeline capture v1 (`capture_masterdata_full.py`) tidak diubah; dipanggil dari sini.
Tambahan: validasi Limit (`capture_limit_validations.py`).

Prasyarat: server statis prototipe (default http://127.0.0.1:5502).

Usage:
  py scripts/capture_masterdata_v2.py
  py scripts/capture_masterdata_v2.py --base-url http://127.0.0.1:5502
"""
from __future__ import annotations

import argparse
import os
import sys
import urllib.error
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

from capture_masterdata_full import capture  # noqa: E402
from capture_limit_validations import capture as capture_limit  # noqa: E402


def _assert_server(base_url: str) -> None:
    url = base_url.rstrip('/') + '/'
    try:
        urllib.request.urlopen(url, timeout=5)
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise SystemExit(
            f'Server prototipe tidak merespons {url}\n'
            f'Jalankan dari root Prototype: py -m http.server 5502\n'
            f'Detail: {exc}'
        ) from exc


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--base-url', default='http://127.0.0.1:5502')
    ap.add_argument('--only', default=None, help='Comma-separated module ids')
    args = ap.parse_args()
    only = {x.strip() for x in args.only.split(',')} if args.only else None
    _assert_server(args.base_url)
    capture(args.base_url, only)
    if only is None or 'master-limit-target-harian' in only:
        print('\n[master-limit-target-harian] validasi SweetAlert + history')
        capture_limit(args.base_url)


if __name__ == '__main__':
    main()
