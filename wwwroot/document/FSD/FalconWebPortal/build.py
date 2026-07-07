"""Build FSD Falcon Web v1.0 — pipeline FSD Generator Engine."""
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(SCRIPT_DIR, 'lib'))

from fsd_module_runner import build_fsd_module, ModuleBuildConfig, MermaidHandler, PlantumlHandler

SCREENSHOTS = os.path.join(SCRIPT_DIR, 'screenshots')

if __name__ == '__main__':
    build_fsd_module(ModuleBuildConfig(
        slug='falcon-web',
        md_filename='FSD_Falcon_Web_v1.0.md',
        output_filename='FSD_Falcon_Web_v1.0.docx',
        cover_defaults={
            'project': 'Falcon FPRS',
            'module': 'Web Admin Falcon FPRS (Field Partner Relation System)',
            'module_cover': 'Web Admin',
            'brd_no': '2026.SHP-FSD.0100',
            'pid_no': '2026.SHP-PID.0100',
            'prepared_by': 'Tim ICT – Falcon FPRS',
            'date': '07/07/2026',
            'revision_date': '7 Juli 2026',
            'revision_desc': 'Initial draft – Web Admin prototipe FPRS',
        },
        plantuml_handlers=[
            PlantumlHandler(
                lambda c: '|Admin|' in c or '|Sistem|' in c,
                os.path.join(SCREENSHOTS, 'ss_00_portal_swimlane.png'),
                'Swimlane', 'Business Flow – Web Admin Portal',
            ),
        ],
        mermaid_handlers=[
            MermaidHandler(
                lambda c: 'erDiagram' in c and 'M_Pelanggan' in c,
                os.path.join(SCREENSHOTS, 'ss_99_erd.png'),
                'ERD', 'ERD – Falcon Web Admin',
            ),
        ],
    ), __file__)
