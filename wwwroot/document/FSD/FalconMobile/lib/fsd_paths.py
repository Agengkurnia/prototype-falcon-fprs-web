"""Path standar aset cover — Falcon Mobile FSD workspace."""
import os

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE_ROOT = WORKSPACE_ROOT
TEMPLATES_DIR = os.path.join(WORKSPACE_ROOT, 'templates')
TMP_DIR = os.path.join(WORKSPACE_ROOT, '_tmp')
COVER_TEMPLATE = os.path.join(TEMPLATES_DIR, 'FSD_Cover_Template.docx')
LOGO_PATH = os.path.join(TEMPLATES_DIR, 'logo.png')
REFERENCE_DOCX = os.path.join(TEMPLATES_DIR, 'reference.docx')


def engine_root_from_script(script_path: str) -> str:
    return os.path.dirname(os.path.abspath(script_path))


def ensure_lib_on_path():
    import sys
    lib_dir = os.path.dirname(os.path.abspath(__file__))
    if lib_dir not in sys.path:
        sys.path.insert(0, lib_dir)
