"""Capture per-button screenshots for FSD Tombol Aksi sections."""
from __future__ import annotations

import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LIB_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'lib')
sys.path.insert(0, LIB_DIR)
from fsd_ui_section import REUSABLE_BUTTON_FILES  # noqa: E402

MANIFEST_NAME = '_btn_manifest.json'
SKIP_TEXT = re.compile(
    r'close|batal|prev|next|chevron|‹|›|semua|filter|^\s*$',
    re.I,
)

_COLLECT_JS = r"""() => {
    const skipRe = /close|batal|prev|next|chevron|semua/i;
    function actionSelector(el) {
        if (el.id) return '#' + CSS.escape(el.id);
        const onclick = el.getAttribute('onclick');
        if (onclick) {
            const tag = el.tagName.toLowerCase();
            return tag + '[onclick="' + onclick.replace(/"/g, '\\"') + '"]';
        }
        const title = el.getAttribute('title');
        const row = el.closest('#tblBody tr, #tbl tbody tr');
        if (row && title) {
            const tbody = row.parentElement;
            const idx = [...tbody.children].indexOf(row) + 1;
            const tid = tbody.id ? '#' + tbody.id : '#tblBody';
            const tag = el.tagName.toLowerCase();
            const cls = [...el.classList].find(c => c.startsWith('btn-action') || c.startsWith('btn-'));
            if (cls) return tid + ' tr:nth-child(' + idx + ') .' + cls;
            return tid + ' tr:nth-child(' + idx + ') ' + tag + '[title="' + title.replace(/"/g, '\\"') + '"]';
        }
        if (title) {
            const tag = el.tagName.toLowerCase();
            return tag + '[title="' + title.replace(/"/g, '\\"') + '"]';
        }
        if (el.classList.contains('accordion-button')) {
            const target = el.getAttribute('data-bs-target');
            if (target) return 'button.accordion-button[data-bs-target="' + target + '"]';
        }
        if (el.classList.contains('btn-action-view')) {
            const r = el.closest('tr');
            if (r && r.parentElement) {
                const idx = [...r.parentElement.children].indexOf(r) + 1;
                return '#tblBody tr:nth-child(' + idx + ') .btn-action-view';
            }
            return '.btn-action-view';
        }
        return null;
    }
    const nodes = [...document.querySelectorAll(
        'a.btn, button.btn, a.btn-action, button.btn-action, a.btn-success, button.btn-success, button.accordion-button'
    )];
    const out = [];
    const seen = new Set();
    for (const el of nodes) {
        if (!el.offsetParent && el.getBoundingClientRect().height === 0) continue;
        if (el.closest('.dataTables_paginate, .dataTables_length, .filter-row')) continue;
        if (el.classList.contains('btn-close')) continue;
        const text = (el.innerText || '').trim()
            || (el.getAttribute('title') || '').trim()
            || (el.getAttribute('aria-label') || '').trim();
        if (!text || skipRe.test(text)) continue;
        const key = text + '|' + (el.id || el.className);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
            text,
            id: el.id || '',
            onclick: el.getAttribute('onclick') || '',
            cls: el.className || '',
            selector: actionSelector(el),
        });
    }
    return out.slice(0, 16);
}"""


def _slug(text: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', text.lower().strip())
    return s.strip('-')[:40] or 'btn'


def _style_from_class(cls: str) -> str:
    if 'btn-success' in cls:
        return 'btn-success'
    if 'btn-danger' in cls:
        return 'btn-danger'
    if 'btn-warning' in cls:
        return 'btn-warning'
    if 'btn-action' in cls or 'btn-outline' in cls:
        return 'btn-outline-secondary'
    return 'btn-secondary'


def collect_button_meta(page) -> list[dict]:
    raw = page.evaluate(_COLLECT_JS)
    return raw or []


def shot_element(page, selector: str | None, fallback_text: str) -> bytes | None:
    tried = []
    if selector:
        tried.append(page.locator(selector).first)
    safe = fallback_text.replace('"', '\\"')
    tried.append(page.locator(f'[title="{safe}"]'))
    tried.append(page.locator(f'a[title="{safe}"], button[title="{safe}"]'))
    low = fallback_text.lower()
    if 'tambah' in low:
        tried.append(page.locator('a.btn-success, button.btn-success').filter(has_text=re.compile(r'Tambah', re.I)).first)
    if 'simpan' in low:
        tried.append(page.locator('.modal.show .modal-footer .btn-success').first)
        tried.append(page.locator('.modal.show button.btn-success, .modal-footer button.btn-success').first)
        tried.append(page.locator('button[onclick*="saveItem"]').first)
    if 'detail' in low or 'lihat' in low or 'ubah' in low:
        tried.append(page.locator('#tblBody tr').first.locator('.btn-action-view, a.btn-action-view').first)
        tried.append(page.locator('[title*="Detail"], [title*="Ubah"], [title*="Lihat"]').first)
    if 'upload' in low:
        tried.append(page.locator('button[onclick*="Upload"], button[onclick*="upload"]').first)
    if 'download' in low:
        tried.append(page.locator('button[onclick*="download"], button[onclick*="Download"]').first)
    if 'kembali' in low:
        tried.insert(0, page.locator('a.btn-secondary[href*="index"]').filter(
            has_text=re.compile(r'Kembali', re.I)
        ).first)
        tried.insert(1, page.locator('a.btn.btn-secondary').filter(
            has_text=re.compile(r'^\s*Kembali\s*$', re.I)
        ).first)
    if 'accordion' in low or 'stok per' in low or 'riwayat' in low:
        tried.append(page.locator('button.accordion-button').filter(has_text=fallback_text[:40]).first)
    tried.append(page.get_by_role('button', name=fallback_text, exact=False).first)
    tried.append(page.get_by_role('link', name=fallback_text, exact=False).first)
    for loc in tried:
        try:
            if loc.count() and loc.first.is_visible():
                return loc.first.screenshot()
        except Exception:
            pass
    return None


def _button_narrative(label: str, handler: str, onclick: str) -> str:
    h = (onclick or handler or '').strip()
    low = (label or '').lower()
    if h.startswith('openModal') or 'tambah' in low:
        return 'Membuka modal form untuk menambah data baru.'
    if h.startswith('editItem'):
        return 'Membuka modal form dalam mode ubah untuk baris yang dipilih.'
    if h.startswith('saveItem') or 'simpan' in low:
        return 'Menyimpan perubahan dari modal ke penyimpanan lokal setelah validasi.'
    if h.startswith('del(') or 'hapus' in low:
        return 'Menghapus data terpilih setelah konfirmasi pengguna.'
    if 'download' in low:
        return 'Mengunduh data modul sebagai file CSV.'
    if 'riwayat' in low or 'stok per' in low:
        return f'Membuka panel {label} menampilkan data terkait pada halaman detail.'
    if 'upload' in low or h.startswith('triggerUpload'):
        return 'Mengunggah file CSV untuk sinkronisasi data.'
    if 'kembali' in low:
        return 'Kembali ke dashboard list modul.'
    if 'detail' in low or 'lihat' in low:
        return 'Menampilkan halaman detail record terpilih (parameter URL terenkripsi).'
    if h and h != '—':
        return f'Menjalankan aksi terkait tombol {label}.'
    return f'Menjalankan aksi {label}.'


def dedupe_button_entries(entries: list[dict]) -> list[dict]:
    """Satu label = satu baris; prefer entri yang punya file screenshot."""
    by_label: dict[str, dict] = {}
    for e in entries:
        lab = e['label'].lower()
        prev = by_label.get(lab)
        if not prev or (not prev.get('file') and e.get('file')):
            by_label[lab] = e
    return list(by_label.values())


def _button_filename(mod_id: str, label: str, slug: str) -> str:
    key = label.lower().strip()
    if key in REUSABLE_BUTTON_FILES:
        return REUSABLE_BUTTON_FILES[key]
    short = mod_id.replace('master-', '')
    return f'ss_btn_{short}_{slug}.png'


def capture_module_buttons(page, mod_id: str, shots_dir: str) -> list[dict]:
    entries: list[dict] = []
    metas = collect_button_meta(page)
    used_slugs: set[str] = set()
    for i, meta in enumerate(metas, 1):
        slug = _slug(meta['text'])
        if slug in used_slugs:
            slug = f'{slug}-{i}'
        used_slugs.add(slug)
        fname = _button_filename(mod_id, meta['text'], slug)
        path = os.path.join(shots_dir, fname)
        key = meta['text'].lower().strip()
        reuse = key in REUSABLE_BUTTON_FILES
        need_capture = not reuse or not os.path.exists(path) or os.path.getsize(path) < 80
        data = None
        if need_capture:
            data = shot_element(page, meta.get('selector'), meta['text'])
        file_name = ''
        if reuse and os.path.exists(path) and os.path.getsize(path) >= 80:
            file_name = fname
        elif data:
            with open(path, 'wb') as f:
                f.write(data)
            file_name = fname
            print(f'   btn {fname} ({meta["text"][:30]})')
        elif not reuse:
            print(f'   WARN no shot: {meta["text"][:40]}')
        bid = meta['id'] or meta['onclick'] or '—'
        entries.append({
            'file': file_name,
            'label': meta['text'],
            'id': bid,
            'style': _style_from_class(meta.get('cls', '')),
            'function': meta.get('onclick') or '—',
            'narrative': _button_narrative(meta['text'], bid, meta.get('onclick') or ''),
        })
    return dedupe_button_entries(entries)


def save_manifest(shots_dir: str, manifest: dict):
    path = os.path.join(shots_dir, MANIFEST_NAME)
    existing: dict = {}
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            existing = json.load(f)
    for mid, entries in manifest.items():
        existing[mid] = dedupe_button_entries(entries)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)


def load_manifest(shots_dir: str) -> dict:
    path = os.path.join(shots_dir, MANIFEST_NAME)
    if not os.path.exists(path):
        return {}
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)
