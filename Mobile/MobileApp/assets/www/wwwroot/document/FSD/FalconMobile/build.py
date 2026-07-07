"""Build FSD Falcon Mobile v1.0 — pipeline FSD Generator Engine."""
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(SCRIPT_DIR, 'lib'))

from fsd_module_runner import build_fsd_module, ModuleBuildConfig, MermaidHandler

SCREENSHOTS = os.path.join(SCRIPT_DIR, 'screenshots')

if __name__ == '__main__':
    build_fsd_module(ModuleBuildConfig(
        slug='falcon-mobile',
        md_filename='FSD_Falcon_Mobile_v1.0.md',
        output_filename='FSD_Falcon_Mobile_v1.0.docx',
        cover_defaults={
            'project': 'Falcon FPRS',
            'module': 'Mobile SFA Falcon FPRS (Sales Force Automation)',
            'module_cover': 'Mobile SFA',
            'brd_no': '2026.SHP-FSD.0101',
            'pid_no': '2026.SHP-PID.0101',
            'prepared_by': 'Tim ICT – Falcon FPRS',
            'date': '07/07/2026',
            'revision_date': '7 Juli 2026',
            'revision_desc': 'Initial draft – Mobile SFA prototipe (Views/Mobile)',
        },
        mermaid_handlers=[
            MermaidHandler(
                lambda c: 'sequenceDiagram' in c and 'Salesman' in c,
                os.path.join(SCREENSHOTS, 'ss_00_visit_swimlane.png'),
                'Swimlane', 'Business Flow – Kunjungan Sales',
            ),
            MermaidHandler(
                lambda c: 'flowchart' in c and 'login.html' in c,
                os.path.join(SCREENSHOTS, 'ss_98_nav_flow.png'),
                'Nav-Flow', 'Diagram Navigasi Utama Mobile SFA',
            ),
            MermaidHandler(
                lambda c: 'erDiagram' in c and 'CUSTOMER' in c,
                os.path.join(SCREENSHOTS, 'ss_99_erd.png'),
                'ERD', 'ERD – Falcon Mobile SFA',
            ),
        ],
        swimlane_image_width_cm=17.0,
        default_image_width_cm=17.0,
        portrait_image_max_width_cm=6.5,
        portrait_image_max_height_cm=14.0,
    ), __file__)
