"""Build FSD Mobile SFA — pipeline FSD Generator Engine (Man Power GT)."""
from __future__ import annotations

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(SCRIPT_DIR, 'lib'))

from fsd_deliver import DeliverableConfig  # noqa: E402
from fsd_module_runner import (  # noqa: E402
    build_fsd_module,
    ModuleBuildConfig,
    MermaidHandler,
    PlantumlHandler,
)

SCREENSHOTS = os.path.join(SCRIPT_DIR, 'screenshots')
PROTOTYPE_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..', '..'))
FSD_ENGINE_ROOT = os.path.abspath(os.path.join(PROTOTYPE_ROOT, '..', '..', 'FSD Generator Engine'))
ENGINE_DELIVERABLES_DIR = os.path.join(FSD_ENGINE_ROOT, 'docs', 'deliverables')

DOCX_NAME = 'FSD_Falcon_Mobile_v1.0.docx'


if __name__ == '__main__':
    build_fsd_module(ModuleBuildConfig(
        slug='falcon-mobile',
        md_filename='FSD_Falcon_Mobile_v1.0.md',
        output_filename=DOCX_NAME,
        cover_defaults={
            'project': 'Man Power GT',
            'module': 'Mobile SFA (Sales Force Automation)',
            'module_cover': 'Mobile SFA',
            'brd_no': '2026.SHP-FSD.0103',
            'pid_no': '2026.SHP-PID.0101',
            'prepared_by': 'Tim IT – Man Power GT',
            'date': '04/08/2026',
            'revision_date': '4 Agustus 2026',
            'revision_desc': 'v1.2 – PlantUML swimlane standar; screenshot ulang; Man Power GT',
        },
        plantuml_handlers=[
            PlantumlHandler(
                lambda c: '|Salesman|' in c and '|Sistem SfaStore|' in c,
                os.path.join(SCREENSHOTS, 'ss_00_visit_swimlane.png'),
                'Swimlane', 'Business Flow – Kunjungan Sales',
            ),
        ],
        mermaid_handlers=[
            MermaidHandler(
                lambda c: 'flowchart' in c and 'login.html' in c,
                os.path.join(SCREENSHOTS, 'ss_98_nav_flow.png'),
                'Nav-Flow', 'Diagram Navigasi Utama Mobile SFA',
            ),
            MermaidHandler(
                lambda c: 'erDiagram' in c and 'CUSTOMER' in c,
                os.path.join(SCREENSHOTS, 'ss_99_erd.png'),
                'ERD', 'ERD – Mobile SFA Man Power GT',
            ),
        ],
        swimlane_image_width_cm=17.0,
        default_image_width_cm=17.0,
        erd_image_width_cm=17.0,
        portrait_image_max_width_cm=6.5,
        portrait_image_max_height_cm=14.0,
        deliverable=DeliverableConfig(
            project_log_name='Man Power GT',
            deliverable_code='FALCON_MOBILE',
            include_md=True,
            repo_copy_path=os.path.join(ENGINE_DELIVERABLES_DIR, DOCX_NAME),
        ),
    ), __file__)
