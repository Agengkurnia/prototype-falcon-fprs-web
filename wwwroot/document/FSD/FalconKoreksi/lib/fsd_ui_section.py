"""
Standar penulisan section UI FSD — helper Markdown bersama.

Digunakan oleh:
- Skrip extract HTML→MD (mis. `extract_module_spec.py` di proyek eksternal)
- Penulis manual yang mengikuti `docs/STANDARD-FSD-GENERATION.md`

Bab Database / ERD / DDL / mapping MAVEN **tidak** di-generate di sini —
kontennya spesifik per proyek.
"""
from __future__ import annotations

import os


def shot_view_kind(ui_type: str, shot: str, index: int) -> str:
    """Klasifikasi tampilan screenshot: dashboard | modal | detail."""
    if index == 0:
        return 'dashboard'
    low = shot.lower()
    if 'modal' in low:
        return 'modal'
    if 'detail' in low or '_add' in low:
        return 'detail'
    return 'modal' if ui_type == 'modal' else 'detail'


def screenshot_embed_md(
    title: str,
    shot: str,
    *,
    screenshots_prefix: str = 'screenshots',
) -> str:
    """Embed screenshot: judul hanya di caption Gambar (bukan alt Pandoc)."""
    if not shot:
        return ''
    safe_title = (title or '').strip()
    return f'<!-- fig-title: {safe_title} -->\n![]({screenshots_prefix}/{shot})\n'


def screenshot_single_md(
    module_label: str,
    shot: str,
    view_kind: str,
    *,
    screenshots_prefix: str = 'screenshots',
) -> str:
    """Satu gambar — caption bernomor (Gambar N.M) ditambahkan otomatis saat build."""
    if not shot:
        return ''
    suffix = {
        'dashboard': ' — Dashboard List',
        'modal': ' — Form Modal (full page)',
        'detail': ' — Halaman Detail',
    }.get(view_kind, '')
    title = f'{module_label}{suffix}'.strip()
    return screenshot_embed_md(title, shot, screenshots_prefix=screenshots_prefix)


def screenshot_placeholder_md(shot_path: str) -> str:
    return f'> *Screenshot belum tersedia: {shot_path}*\n'


def infer_button_context(btn: dict) -> str:
    """Klasifikasi tombol: dashboard | modal | detail."""
    label = (btn.get('label') or '').lower()
    bid = (btn.get('id') or '').lower()
    narrative = (btn.get('narrative') or btn.get('function') or '').lower()
    if 'kembali ke dashboard' in narrative:
        return 'detail'
    if 'pada halaman detail' in narrative or (
        'panel ' in narrative and 'halaman detail' in narrative
    ):
        return 'detail'
    if 'simpan produk' in label:
        return 'detail'
    if 'saveitem' in bid.replace(' ', '') or (
        'simpan' in label and 'modal' in narrative
    ):
        return 'modal'
    if label == 'simpan' or bid == 'saveitem()':
        return 'modal'
    return 'dashboard'


def filter_buttons_by_context(buttons: list[dict], context: str) -> list[dict]:
    return [b for b in buttons if infer_button_context(b) == context]


def buttons_table_md(
    buttons: list[dict],
    *,
    screenshots_prefix: str = 'screenshots',
) -> list[str]:
    """Tabel Tombol Aksi 5 kolom (standar § Per Section UI)."""
    lines = [
        '| Tampilan | Tombol | ID / Handler | Warna/Style | Fungsi |',
        '|----------|--------|--------------|-------------|--------|',
    ]
    for b in buttons:
        shot_cell = (
            f'![]({screenshots_prefix}/{b["shot"]})'
            if b.get('shot') else '—'
        )
        lines.append(
            f'| {shot_cell} | {b["label"]} | `{b["id"]}` | {b["style"]} | {b["function"]} |'
        )
    return lines


class SubsectionCounter:
    """Penomoran dinamis #### {chapter}.{sub}.{n} …"""

    def __init__(self, chapter: str, sub: int, start: int = 1):
        self.chapter = chapter
        self.sub = sub
        self.n = start

    def next(self, title: str) -> str:
        hdr = f'#### {self.chapter}.{self.sub}.{self.n} {title}'
        self.n += 1
        return hdr


REUSABLE_BUTTON_FILES = {
    'kembali': 'ss_btn_common_kembali.png',
    'lihat detail': 'ss_btn_common_lihat-detail.png',
    'detail': 'ss_btn_common_detail.png',
}


def resolve_button_shot_file(shot: str, label: str, shots_dir: str) -> str:
    """Pakai screenshot tombol bersama (reusable) untuk label standar."""
    key = (label or '').lower().strip()
    if key in REUSABLE_BUTTON_FILES:
        common = REUSABLE_BUTTON_FILES[key]
        cpath = os.path.join(shots_dir, common)
        if os.path.exists(cpath) and os.path.getsize(cpath) > 80:
            return common
    if shot:
        path = os.path.join(shots_dir, shot)
        if os.path.exists(path) and os.path.getsize(path) > 80:
            return shot
    common = REUSABLE_BUTTON_FILES.get(key)
    if common:
        cpath = os.path.join(shots_dir, common)
        if os.path.exists(cpath):
            return common
    return shot or ''


def source_path_md(label: str, path: str) -> str:
    """Path sumber — italic (Pandoc native, lebih andal daripada HTML di DOCX)."""
    safe = (path or '').strip()
    if not safe:
        return ''
    return f'*{label}: {safe}*'


def format_db_source_note(table: str, col: str) -> str:
    """Catatan sumber kolom/field — italic untuk DOCX (pipe di-escape untuk tabel MD)."""
    return f'*{table} \\| {col}*'


def module_overview_channel(mod: dict) -> str:
    """Narasi ringkas modul Channel — paragraf + poin."""
    parts = [
        'Modul **Channel** mengatur klasifikasi outlet lewat **mapping triple**: '
        '**Channel** · **Type Customer** · **Account** (kombinasi unik).',
        '',
        'Prototipe memakai **dual-surface**:',
        '',
        '- **Master Data Portal** — kelola master dan mapping (tab **Mapping** + **Manage**).',
        '- **Man Power GT** — lihat daftar mapping saja; tanpa tambah, ubah, atau hapus.',
        '',
        '**Type Customer** adalah master **global** (bukan turunan Channel). '
        'Hubungan ke Channel hanya lewat baris mapping.',
    ]
    return '\n'.join(parts) + '\n'


UI_SECTION_FLOW = [
    'dashboard_screenshot',
    'dashboard_columns',
    'dashboard_buttons',
    'secondary_screenshot',
    'secondary_narrative',
    'secondary_fields',
    'secondary_buttons',
    'business_rules',
    'crud',
]
