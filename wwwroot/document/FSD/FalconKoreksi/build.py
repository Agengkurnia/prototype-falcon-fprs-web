"""Build FSD Koreksi Stok (Web Admin + Mobile SFA) — pipeline FSD Generator Engine."""
from __future__ import annotations

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(SCRIPT_DIR, 'lib'))

from fsd_module_runner import (  # noqa: E402
    build_fsd_module,
    ModuleBuildConfig,
    MermaidHandler,
    PlantumlHandler,
)

SCREENSHOTS = os.path.join(SCRIPT_DIR, 'screenshots')
DOCX_NAME = 'FSD_Falcon_Koreksi_Stok_v1.0.docx'


if __name__ == '__main__':
    build_fsd_module(ModuleBuildConfig(
        slug='falcon-koreksi',
        md_filename='FSD_Falcon_Koreksi_Stok_v1.0.md',
        output_filename=DOCX_NAME,
        cover_defaults={
            'project': 'Man Power GT',
            'module': 'Koreksi Stok (Web Admin & Mobile SFA)',
            'module_cover': 'Koreksi Stok',
            'brd_no': '2026.SHP-FSD.0104',
            'pid_no': '2026.SHP-PID.0101',
            'prepared_by': 'Tim IT – Man Power GT',
            'date': '27/10/2026',
            'revision_date': '27 Oktober 2026',
            'revision_desc': 'Initial draft – Koreksi Stok Web + Mobile (prototipe FPRS)',
        },
        plantuml_handlers=[
            PlantumlHandler(
                lambda c: '|Motoris|' in c and ('|ABM / BHO|' in c or '|HO Web|' in c),
                os.path.join(SCREENSHOTS, 'ss_00_koreksi_swimlane.png'),
                'Swimlane', 'Business Flow – Koreksi Stok',
            ),
        ],
        mermaid_handlers=[
            MermaidHandler(
                lambda c: 'erDiagram' in c and 'KoreksiHeader' in c,
                os.path.join(SCREENSHOTS, 'ss_99_erd_koreksi.png'),
                'ERD', 'ERD Logis – Koreksi Stok',
            ),
            MermaidHandler(
                lambda c: 'stateDiagram' in c or ('flowchart' in c and 'Waiting' in c and 'Approved' in c),
                os.path.join(SCREENSHOTS, 'ss_98_status_flow.png'),
                'Status', 'Status Machine – Koreksi Stok',
            ),
        ],
        swimlane_image_width_cm=17.0,
        default_image_width_cm=15.0,
        erd_image_width_cm=14.0,
        portrait_image_max_width_cm=7.2,
        portrait_image_max_height_cm=14.0,
    ), __file__)
