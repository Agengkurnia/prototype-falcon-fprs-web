#!/usr/bin/env python3
"""
Render FSD Data Master (markdown -> DOCX) memakai pipeline resmi FSD Generator
Engine (cover 2 halaman Kalbe + Document Approval + Kroki + Pandoc + post-process),
lalu salin deliverable ke Document/ (standar §K.2).

Usage (dari mana saja):
  py scripts/build_masterdata_fsd.py
"""
from __future__ import annotations

import os
import shutil
import sys
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, 'output')
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))
DOCUMENT_DIR = os.path.join(PROTOTYPE_ROOT, 'Document')

MD_NAME = 'FSD_Falcon_Web_MasterData_v1.0.md'
DOCX_NAME = 'FSD_Falcon_Web_MasterData_v1.0.docx'
DELIVERABLE_CODE = 'FALCON_WEB_MASTERDATA'

sys.path.insert(0, os.path.join(WORKSPACE_DIR, 'lib'))

from fsd_module_runner import build_fsd_module, ModuleBuildConfig, MermaidHandler  # noqa: E402


def build() -> str:
    docx_out = build_fsd_module(
        ModuleBuildConfig(
            slug='falcon-web-masterdata',
            md_filename=MD_NAME,
            output_filename=DOCX_NAME,
            cover_defaults={
                'project': 'Falcon FPRS',
                'module': 'Data Master (Web Admin)',
                'module_cover': 'Data Master (Web Admin)',
                'brd_no': '2026.SHP-FSD.0101',
                'pid_no': '2026.SHP-PID.0101',
                'prepared_by': 'Tim ICT – Falcon FPRS',
                'date': '08/07/2026',
                'revision_date': '8 Juli 2026',
                'revision_desc': 'Initial draft – modul Data Master Web Admin FPRS',
            },
            mermaid_handlers=[
                MermaidHandler(
                    lambda c: 'erDiagram' in c and 'M_Channel' in c,
                    os.path.join(SCREENSHOTS_DIR, 'ss_md_erd.png'),
                    'ERD', 'ERD – Modul Data Master',
                ),
            ],
        ),
        # script_file pura-pura di root workspace agar source/ output/ screenshots/ resolve benar
        os.path.join(WORKSPACE_DIR, 'build.py'),
    )

    os.makedirs(DOCUMENT_DIR, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d%H%M%S')
    deliverable = os.path.join(DOCUMENT_DIR, f'{ts}__FSD_{DELIVERABLE_CODE}.docx')
    shutil.copy2(docx_out, deliverable)
    print(f'\nDeliverable -> {deliverable} ({os.path.getsize(deliverable):,} bytes)')
    return deliverable


if __name__ == '__main__':
    build()
