"""Auto-number figures/tables and add standardized captions in processed MD."""
from __future__ import annotations

import re

FIG_CAPTION_RE = re.compile(r'^\*?Gambar\s+(\d+(?:\.\d+)*)\s*[—–-]\s*(.+?)\*?$')
TBL_CAPTION_RE = re.compile(r'^\*?Tabel\s+(\d+(?:\.\d+)*)\s*[—–-]\s*(.+?)\*?$')
CHAPTER_RE = re.compile(r'^##\s+(\d+)\.\s+')
SUBSECTION_RE = re.compile(r'^###\s+(\d+)\.(\d+)\s+')
IMAGE_RE = re.compile(r'^!\[([^\]]*)\]\(([^)]+)\)\s*$')
TABLE_ROW_RE = re.compile(r'^\|.+\|$')
TABLE_SEP_RE = re.compile(r'^\|[\s|:\-]+\|$')
BOLD_LINE_RE = re.compile(r'^\*\*(.+?)\*\*\s*$')
LANE_TABLE_MARKERS = ('| # | Lane ID |', '| # | Lane ID|', 'Lane ID | Label')


def _is_lane_table(lines: list[str], start: int) -> bool:
    block = '\n'.join(lines[start:min(start + 4, len(lines))])
    return any(m in block for m in LANE_TABLE_MARKERS)


def _is_separator_row(line: str) -> bool:
    return bool(TABLE_SEP_RE.match(line.strip()))


def _extract_table_block(lines: list[str], start: int) -> tuple[int, list[str]]:
    end = start
    while end < len(lines) and TABLE_ROW_RE.match(lines[end].strip()):
        end += 1
    return end, lines[start:end]


def _table_title(lines: list[str], table_start: int) -> str:
    idx = table_start - 1
    while idx >= 0:
        line = lines[idx].strip()
        if not line:
            idx -= 1
            continue
        if TBL_CAPTION_RE.match(line):
            return ''
        m = BOLD_LINE_RE.match(line)
        if m:
            return m.group(1).strip()
        if line.startswith('#'):
            break
        idx -= 1
    _, table_lines = _extract_table_block(lines, table_start)
    if table_lines:
        header_cells = [c.strip() for c in table_lines[0].strip('|').split('|')]
        if header_cells:
            return header_cells[0]
    return 'Tabel'


def _format_caption(kind: str, number: str, title: str) -> str:
    label = 'Gambar' if kind == 'fig' else 'Tabel'
    return f'*{label} {number} — {title}*'


def preprocess_captions(md_text: str) -> str:
    """Number images/tables and add center+italic caption lines in processed MD only."""
    lines = md_text.splitlines()
    out: list[str] = []

    chapter: int | None = None
    subsection: int | None = None
    fig_counter = 0
    tbl_counter = 0
    in_code = False
    prev_line = ''

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith('```'):
            in_code = not in_code
            out.append(line)
            i += 1
            prev_line = stripped
            continue

        if in_code:
            out.append(line)
            i += 1
            prev_line = stripped
            continue

        m_ch = CHAPTER_RE.match(stripped)
        if m_ch:
            chapter = int(m_ch.group(1))
            subsection = None
            fig_counter = 0
            tbl_counter = 0

        m_sub = SUBSECTION_RE.match(stripped)
        if m_sub:
            subsection = int(m_sub.group(2))
            tbl_counter = 0

        if stripped.startswith('## Daftar Gambar') or stripped.startswith('## Daftar Tabel'):
            while i < len(lines) and not CHAPTER_RE.match(lines[i].strip()):
                i += 1
            continue

        img = IMAGE_RE.match(stripped)
        if img and chapter is not None:
            alt = img.group(1).strip()
            next_stripped = lines[i + 1].strip() if i + 1 < len(lines) else ''
            if not FIG_CAPTION_RE.match(next_stripped):
                fig_counter += 1
                number = f'{chapter}.{fig_counter}'
                title = alt or f'Gambar {number}'
                out.append(line)
                out.append('')
                out.append(_format_caption('fig', number, title))
                i += 1
                prev_line = _format_caption('fig', number, title)
                continue

        if TABLE_ROW_RE.match(stripped) and chapter is not None:
            if TABLE_ROW_RE.match(prev_line.strip()):
                out.append(line)
                i += 1
                prev_line = stripped
                continue

            end, table_lines = _extract_table_block(lines, i)
            for tl in table_lines:
                out.append(tl)

            if not _is_lane_table(lines, i):
                after = end
                while after < len(lines) and not lines[after].strip():
                    after += 1
                has_caption = (
                    after < len(lines)
                    and TBL_CAPTION_RE.match(lines[after].strip())
                )
                if not has_caption:
                    tbl_counter += 1
                    if subsection is not None:
                        number = f'{chapter}.{subsection}.{tbl_counter}'
                    else:
                        number = f'{chapter}.{tbl_counter}'
                    title = _table_title(lines, i)
                    out.append('')
                    caption = _format_caption('tbl', number, title)
                    out.append(caption)
                    prev_line = caption
                else:
                    prev_line = table_lines[-1] if table_lines else stripped
            else:
                prev_line = table_lines[-1] if table_lines else stripped

            i = end
            continue

        out.append(line)
        i += 1
        prev_line = stripped

    return '\n'.join(out)


def caption_number_from_text(text: str) -> bool:
    """True if paragraph text is a Gambar/Tabel caption line."""
    text = text.strip().strip('*')
    return bool(FIG_CAPTION_RE.match(text) or TBL_CAPTION_RE.match(text))
