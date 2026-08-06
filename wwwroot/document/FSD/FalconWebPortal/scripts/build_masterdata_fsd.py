#!/usr/bin/env python3
"""
Render FSD Data Master (markdown -> DOCX) memakai pipeline resmi FSD Generator
Engine (cover 2 halaman Kalbe + Document Approval + Kroki + Pandoc + post-process).

Deliverable (standar §K.3):
- Project Log (luar git): D:\\Work\\Documentation\\SHP\\Project Log\\{tahun}\\{NNN}. {proyek}\\
  dengan nama ber-timestamp.
- Repo (dalam git): output/ + FSD Generator Engine/docs/deliverables/ — tanpa timestamp.

Usage (dari mana saja):
  py scripts/build_masterdata_fsd.py
"""
from __future__ import annotations

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, 'output')
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, 'screenshots')
PROTOTYPE_ROOT = os.path.abspath(os.path.join(WORKSPACE_DIR, '..', '..', '..', '..'))
FSD_ENGINE_ROOT = os.path.abspath(os.path.join(PROTOTYPE_ROOT, '..', '..', 'FSD Generator Engine'))
ENGINE_DELIVERABLES_DIR = os.path.join(FSD_ENGINE_ROOT, 'docs', 'deliverables')

MD_NAME = 'FSD_Falcon_Web_MasterData_v1.0.md'
DOCX_NAME = 'FSD_Falcon_Web_MasterData_v1.0.docx'
DELIVERABLE_CODE = 'FALCON_WEB_MASTERDATA'
PROJECT_LOG_NAME = 'Man Power GT'

sys.path.insert(0, os.path.join(WORKSPACE_DIR, 'lib'))

from fsd_deliver import DeliverableConfig  # noqa: E402
from fsd_module_runner import build_fsd_module, ModuleBuildConfig, MermaidHandler, PlantumlHandler  # noqa: E402


def build() -> str:
    docx_out = build_fsd_module(
        ModuleBuildConfig(
            slug='falcon-web-masterdata',
            md_filename=MD_NAME,
            output_filename=DOCX_NAME,
            cover_defaults={
                'project': 'Man Power GT',
                'module': 'Data Master (Web Admin)',
                'module_cover': 'Data Master (Web Admin)',
                'brd_no': '2026.SHP-FSD.0101',
                'pid_no': '2026.SHP-PID.0101',
                'prepared_by': 'Tim IT – Man Power GT',
                'date': '06/08/2026',
                'revision_date': '6 Agustus 2026',
                'revision_desc': 'v1.7 – Limit: LOV Jabatan/Type dari API /api/v1/Position (tooltip + narasi)',
            },
            plantuml_handlers=[
                PlantumlHandler(
                    lambda c: '|Admin Master Data|' in c and '|Sistem Man Power GT|' in c,
                    os.path.join(SCREENSHOTS_DIR, 'ss_md_swimlane.png'),
                    'Swimlane', 'Business Flow',
                ),
            ],
            mermaid_handlers=[
                MermaidHandler(
                    lambda c: 'erDiagram' in c and 'mChannel' in c,
                    os.path.join(SCREENSHOTS_DIR, 'ss_md_erd.png'),
                    'ERD', 'ERD – Modul Data Master',
                ),
            ],
            default_image_width_cm=17.0,
            swimlane_image_width_cm=17.0,
            erd_image_width_cm=17.0,
            erd_png_min_width=3900,
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
