"""
Generic FSD module build runner — cover merge + Kroki + Pandoc + post-process.

Usage from modules/{slug}/build.py:

    from fsd_module_runner import build_fsd_module, ModuleBuildConfig, MermaidHandler

    build_fsd_module(ModuleBuildConfig(
        slug='item-registration',
        md_filename='FSD_Item_Registration_v1.0.md',
        output_filename='FSD_Item_Registration_v1.0.docx',
        mermaid_handlers=[...],
        plantuml_handlers=[...],  # optional
    ))
"""
from __future__ import annotations

import os
import re
import sys
from dataclasses import dataclass, field
from typing import Callable

from fsd_cover_merge import (
    parse_md_cover_meta,
    strip_md_for_body,
    merge_cover_and_content,
)
from fsd_paths import TMP_DIR, engine_root_from_script
from fsd_build import (
    render_kroki,
    render_kroki_plantuml,
    is_swimlane_mermaid,
    is_swimlane_plantuml,
    inject_plantuml_swimlane_style,
    run_pandoc,
    postprocess_docx,
)
from fsd_captions import preprocess_captions


@dataclass
class MermaidHandler:
    match: Callable[[str], bool]
    png_path: str
    label: str
    caption: str = ''


# Alias — same structure for PlantUML swimlane blocks
PlantumlHandler = MermaidHandler


@dataclass
class ModuleBuildConfig:
    slug: str
    md_filename: str
    output_filename: str
    mermaid_handlers: list[MermaidHandler] = field(default_factory=list)
    plantuml_handlers: list[PlantumlHandler] = field(default_factory=list)
    cover_defaults: dict | None = None
    swimlane_image_width_cm: float = 17.0
    default_image_width_cm: float = 15.0


def _rel(script_dir: str, path: str) -> str:
    return os.path.relpath(path, script_dir).replace('\\', '/')


def build_fsd_module(config: ModuleBuildConfig, script_file: str):
    script_dir = os.path.dirname(os.path.abspath(script_file))
    engine_root = engine_root_from_script(script_file)
    sys.path.insert(0, os.path.join(engine_root, 'lib'))

    source_dir = os.path.join(script_dir, 'source')
    output_dir = os.path.join(script_dir, 'output')
    screenshots = os.path.join(script_dir, 'screenshots')
    os.makedirs(TMP_DIR, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(screenshots, exist_ok=True)

    md_src = os.path.join(source_dir, config.md_filename)
    md_tmp = os.path.join(TMP_DIR, f"{config.slug}_processed.md")
    docx_content = os.path.join(TMP_DIR, f"{config.slug}_content.docx")
    docx_out = os.path.join(output_dir, config.output_filename)

    if not os.path.exists(md_src):
        raise FileNotFoundError(md_src)

    print(f'\n=== BUILD {config.slug} ===')
    with open(md_src, 'r', encoding='utf-8') as f:
        raw = f.read()

    meta = parse_md_cover_meta(raw, defaults=config.cover_defaults)
    text = strip_md_for_body(raw)
    has_swimlane = False

    # --- Mermaid ---
    mermaid_blocks = list(re.finditer(r'```mermaid\s*\n(.*?)```', text, flags=re.DOTALL))
    for i, match in enumerate(mermaid_blocks):
        code = match.group(1).strip()
        if is_swimlane_mermaid(code):
            has_swimlane = True
        handled = False
        for h in config.mermaid_handlers:
            if h.match(code):
                render_kroki(code, h.png_path, h.label)
                handled = True
                break
        if not handled:
            generic = os.path.join(screenshots, f'{config.slug}_diagram_{i + 1}.png')
            render_kroki(code, generic, f'Diagram-{i + 1}')

    mermaid_counter = [0]

    def replace_mermaid(m):
        code = m.group(1).strip()
        mermaid_counter[0] += 1
        for h in config.mermaid_handlers:
            if h.match(code):
                cap = h.caption or h.label
                if os.path.exists(h.png_path):
                    return f'\n![{cap}]({_rel(script_dir, h.png_path)})\n'
                return f'\n> *[{cap} – diagram tidak dapat di-render]*\n'
        generic = os.path.join(screenshots, f'{config.slug}_diagram_{mermaid_counter[0]}.png')
        if os.path.exists(generic):
            return f'\n![Diagram {mermaid_counter[0]}]({_rel(script_dir, generic)})\n'
        return f'\n> *[Diagram {mermaid_counter[0]} – tidak dapat di-render]*\n'

    text = re.sub(r'```mermaid\s*\n(.*?)```', replace_mermaid, text, flags=re.DOTALL)

    # --- PlantUML (opsional) ---
    plantuml_blocks = list(re.finditer(r'```plantuml\s*\n(.*?)```', text, flags=re.DOTALL))
    for i, match in enumerate(plantuml_blocks):
        code = match.group(1).strip()
        if is_swimlane_plantuml(code):
            has_swimlane = True
        handled = False
        for h in config.plantuml_handlers:
            if h.match(code):
                render_kroki_plantuml(inject_plantuml_swimlane_style(code), h.png_path, h.label)
                handled = True
                break
        if not handled:
            generic = os.path.join(screenshots, f'{config.slug}_plantuml_{i + 1}.png')
            render_kroki_plantuml(inject_plantuml_swimlane_style(code), generic, f'PlantUML-{i + 1}')

    plantuml_counter = [0]

    def replace_plantuml(m):
        code = m.group(1).strip()
        plantuml_counter[0] += 1
        for h in config.plantuml_handlers:
            if h.match(code):
                cap = h.caption or h.label
                if os.path.exists(h.png_path):
                    return f'\n![{cap}]({_rel(script_dir, h.png_path)})\n'
                return f'\n> *[{cap} – diagram tidak dapat di-render]*\n'
        generic = os.path.join(screenshots, f'{config.slug}_plantuml_{plantuml_counter[0]}.png')
        if os.path.exists(generic):
            return f'\n![Diagram {plantuml_counter[0]}]({_rel(script_dir, generic)})\n'
        return f'\n> *[Diagram {plantuml_counter[0]} – tidak dapat di-render]*\n'

    text = re.sub(r'```plantuml\s*\n(.*?)```', replace_plantuml, text, flags=re.DOTALL)

    text = preprocess_captions(text)
    print('   [Caption] selesai')

    if has_swimlane:
        print('   [Swimlane] terdeteksi — lebar gambar max {:.0f} cm'.format(
            config.swimlane_image_width_cm))

    with open(md_tmp, 'w', encoding='utf-8') as f:
        f.write(text)

    run_pandoc(md_tmp, docx_content, [script_dir, screenshots], script_dir)
    merge_cover_and_content(docx_content, docx_out, meta)
    img_width = config.swimlane_image_width_cm if has_swimlane else config.default_image_width_cm
    postprocess_docx(docx_out, max_width_cm=img_width)

    for tmp in (md_tmp, docx_content):
        if os.path.exists(tmp):
            os.remove(tmp)

    print(f'SELESAI: {docx_out}')
    return docx_out
