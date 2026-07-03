#!/usr/bin/env python3
"""Generate deep Master Data / module spec markdown for FSD job build."""
import argparse
import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROTOTYPE_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..', '..', '..'))
REGISTRY_PATH = os.path.join(PROTOTYPE_ROOT, 'lib', 'fsd', 'module-registry.json')
OUTPUT_MD = os.path.join(SCRIPT_DIR, '_job_build.md')


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def read_html(rel_path):
    p = os.path.join(PROTOTYPE_ROOT, rel_path.replace('/', os.sep))
    if not os.path.exists(p):
        return ''
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()


def extract_columns(html):
    m = re.search(r'<thead>.*?<tr>(.*?)</tr>', html, re.DOTALL | re.I)
    if not m:
        return []
    ths = re.findall(r'<th[^>]*>(.*?)</th>', m.group(1), re.DOTALL | re.I)
    cols = []
    for t in ths:
        t = re.sub(r'<[^>]+>', '', t).strip()
        if t and t.upper() != 'AKSI':
            cols.append(t)
    return cols


def extract_fields(html):
    fields = []
    for m in re.finditer(r'<label[^>]*class="[^"]*form-label[^"]*"[^>]*>(.*?)</label>', html, re.DOTALL | re.I):
        label = re.sub(r'<[^>]+>', '', m.group(1)).replace('*', '').strip()
        fields.append(label)
    return fields


def extract_validations(html):
    vals = []
    for m in re.finditer(r"Swal\.fire\(['\"]Peringatan['\"],\s*['\"]([^'\"]+)['\"]", html):
        vals.append(m.group(1))
    for m in re.finditer(r"showFieldError\([^,]+,\s*['\"]([^'\"]+)['\"]", html):
        vals.append(m.group(1))
    return list(dict.fromkeys(vals))


def load_ai_md(ai_dir, module_id):
    p = os.path.join(ai_dir, module_id + '.md')
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            return f.read().strip()
    return ''


def module_section(num, mod, sections, ai_dir, shot_dir):
    index_html = read_html(mod['htmlPath'])
    form_html = read_html(mod.get('formPath') or '')
    combined = index_html + form_html
    lines = [f'## {num}. {mod["label"]}', '']

    ai = load_ai_md(ai_dir, mod['id'])
    if 'overview' in sections and ai:
        lines.append(ai)
        lines.append('')
    elif 'overview' in sections:
        lines.append(f'Modul **{mod["label"]}** — spesifikasi fungsional Web Portal Falcon FPRS.')
        lines.append('')

    if 'columns' in sections:
        cols = extract_columns(index_html)
        if cols:
            lines.append('### Kolom DataTable Index')
            for c in cols:
                lines.append(f'- {c}')
            lines.append('')

    if 'fields' in sections:
        fields = extract_fields(form_html or index_html)
        if fields:
            lines.append('### Field Form')
            lines.append('| Field |')
            lines.append('|-------|')
            for f in fields:
                lines.append(f'| {f} |')
            lines.append('')

    if 'validation' in sections:
        vals = extract_validations(combined)
        if vals:
            lines.append('### Validasi Simpan')
            for v in vals:
                lines.append(f'- {v}')
            lines.append('')

    if 'screenshots' in sections:
        shots = mod.get('screenshots') or []
        if shots:
            lines.append('### Screenshot UI')
            for s in shots:
                rel = os.path.relpath(os.path.join(shot_dir, s), SCRIPT_DIR).replace('\\', '/')
                lines.append(f'![{s}]({rel})')
                lines.append('')

    if 'businessRules' in sections and ai and 'Business Rules' not in ai:
        lines.append('### Business Rules')
        lines.append('- Lihat analisis AI modul.')
        lines.append('')

    return '\n'.join(lines)


def generate(job_cfg):
    reg = load_json(REGISTRY_PATH)
    ids = job_cfg.get('moduleIds') or []
    sections = job_cfg.get('sections') or []
    ai_dir = job_cfg.get('aiMarkdownDir') or os.path.join(SCRIPT_DIR, '_job_ai')
    shot_dir = job_cfg.get('screenshotDir') or os.path.join(SCRIPT_DIR, 'screenshots')

    mods = [m for m in reg['modules'] if m['id'] in ids]
    parts = [
        '# FUNCTIONAL SPECIFICATION DOCUMENT (FSD)',
        '',
        '**Modul:** Web Portal Falcon FPRS (Field Partner Relation System)',
        '',
        '**Sistem:** Falcon FPRS',
        '',
        '## Riwayat Revisi',
        '',
        '| Versi | Tanggal | Penulis | Keterangan |',
        '|-------|---------|---------|------------|',
        f'| 1.0 | Auto | FSD Worker | Job {job_cfg.get("jobId", "")} |',
        '',
        '## 7. Spesifikasi Modul Web Portal',
        '',
    ]

    for i, mod in enumerate(mods, 1):
        parts.append(module_section(i, mod, sections, ai_dir, shot_dir))
        parts.append('')

    with open(OUTPUT_MD, 'w', encoding='utf-8') as f:
        f.write('\n'.join(parts))
    print(f'Generated {OUTPUT_MD} ({len(mods)} modules)')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--job-config', default=None)
    args = parser.parse_args()
    if not args.job_config:
        print('No job config — skip deep spec')
        return
    job_cfg = load_json(args.job_config)
    generate(job_cfg)


if __name__ == '__main__':
    main()
