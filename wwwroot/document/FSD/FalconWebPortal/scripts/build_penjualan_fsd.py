#!/usr/bin/env python3
"""
Render FSD Penjualan (markdown -> DOCX) memakai pipeline resmi FSD Generator Engine.

Usage:
  py scripts/build_penjualan_fsd.py
"""
from __future__ import annotations

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))
FSD_ENGINE_ROOT = os.path.abspath(os.path.join(PROTOTYPE_ROOT, '..', '..', 'FSD Generator Engine'))
ENGINE_DELIVERABLES_DIR = os.path.join(FSD_ENGINE_ROOT, 'docs', 'deliverables')

MD_NAME = 'FSD_Falcon_Web_Penjualan_v1.0.md'
DOCX_NAME = 'FSD_Falcon_Web_Penjualan_v1.0.docx'
DELIVERABLE_CODE = 'FALCON_WEB_PENJUALAN'
PROJECT_LOG_NAME = 'Man Power GT'

sys.path.insert(0, os.path.join(WORKSPACE_DIR, 'lib'))

from fsd_deliver import DeliverableConfig  # noqa: E402
from fsd_module_runner import build_fsd_module, ModuleBuildConfig, MermaidHandler, PlantumlHandler  # noqa: E402


def build() -> str:
    docx_out = build_fsd_module(
        ModuleBuildConfig(
            slug='falcon-web-penjualan',
            md_filename=MD_NAME,
            output_filename=DOCX_NAME,
            cover_defaults={
                'project': 'Man Power GT',
                'module': 'Penjualan (Web Admin)',
                'module_cover': 'Penjualan (Web Admin)',
                'brd_no': '2026.SHP-FSD.0102',
                'pid_no': '2026.SHP-PID.0101',
                'prepared_by': 'Tim IT – Man Power GT',
                'date': '26/08/2026',
                'revision_date': '26 Agustus 2026',
                'revision_desc': 'v1.9 – Faktur UI: hapus Jatuh Tempo & Stokis (detail/list/print)',
            },
            plantuml_handlers=[
                PlantumlHandler(
                    lambda c: '|Sales Lapangan Mobile|' in c and '|Web Admin|' in c,
                    os.path.join(SCREENSHOTS_DIR, 'ss_pj_swimlane.png'),
                    'Swimlane', 'Business Flow',
                ),
            ],
            mermaid_handlers=[
                MermaidHandler(
                    lambda c: 'erDiagram' in c and 'tPenjualanFaktur' in c,
                    os.path.join(SCREENSHOTS_DIR, 'ss_pj_erd.png'),
                    'ERD', 'ERD – Modul Penjualan',
                ),
            ],
            default_image_width_cm=17.0,
            swimlane_image_width_cm=17.0,
            erd_image_width_cm=10.2,
            erd_png_min_width=3600,
            deliverable=DeliverableConfig(
                project_log_name=PROJECT_LOG_NAME,
                deliverable_code=DELIVERABLE_CODE,
                include_md=True,
                repo_copy_path=os.path.join(ENGINE_DELIVERABLES_DIR, DOCX_NAME),
            ),
        ),
        os.path.join(WORKSPACE_DIR, 'build.py'),
    )

    print(f'\nBuild output (repo, tanpa timestamp): {docx_out}')
    return docx_out


if __name__ == '__main__':
    build()
