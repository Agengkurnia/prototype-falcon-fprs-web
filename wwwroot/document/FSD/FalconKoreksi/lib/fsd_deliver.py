"""
Deliverable FSD — arsip Project Log (timestamp) + salinan terbaru di repo (tanpa timestamp).

Project Log (di luar git):
  D:\\Work\\Documentation\\SHP\\Project Log\\{TAHUN}\\{NNN}. {NAMA_PROYEK}\\
  File: {YYYYMMDDHHmmss}__{nama_file}

Repo proyek (di dalam git):
  Satu file stabil, ditimpa setiap build — hindari akumulasi timestamp di GitHub.
"""
from __future__ import annotations

import os
import re
import shutil
from dataclasses import dataclass, field
from datetime import datetime

DEFAULT_PROJECT_LOG_ROOT = r'D:\Work\Documentation\SHP\Project Log'
BUILD_LOG_NAME = '_build-log.txt'
_FOLDER_RE = re.compile(r'^(\d{3})\.\s+(.+)$')


@dataclass
class DeliverableConfig:
    """Konfigurasi salinan deliverable setelah build DOCX selesai."""

    project_log_name: str
    deliverable_code: str = ''
    project_log_root: str = DEFAULT_PROJECT_LOG_ROOT
    repo_copy_path: str | None = None
    include_md: bool = False
    md_source_path: str | None = None


def resolve_project_log_folder(
    project_name: str,
    *,
    project_log_root: str = DEFAULT_PROJECT_LOG_ROOT,
    year: int | None = None,
) -> str:
    """Folder log proyek: {NNN}. {NAMA_PROYEK} — buat otomatis bila belum ada."""
    year = year or datetime.now().year
    year_dir = os.path.join(project_log_root, str(year))
    os.makedirs(year_dir, exist_ok=True)

    target = project_name.strip()
    target_lower = target.lower()

    for name in sorted(os.listdir(year_dir)):
        full = os.path.join(year_dir, name)
        if not os.path.isdir(full):
            continue
        m = _FOLDER_RE.match(name)
        if m and m.group(2).strip().lower() == target_lower:
            return full

    nums: list[int] = []
    for name in os.listdir(year_dir):
        m = _FOLDER_RE.match(name)
        if m:
            nums.append(int(m.group(1)))
    next_num = (max(nums) if nums else 0) + 1
    folder = os.path.join(year_dir, f'{next_num:03d}. {target}')
    os.makedirs(folder, exist_ok=True)
    return folder


def _timestamped_name(path: str, ts: str | None = None) -> str:
    ts = ts or datetime.now().strftime('%Y%m%d%H%M%S')
    base = os.path.basename(path)
    if base.startswith(f'{ts}__'):
        return base
    return f'{ts}__{base}'


def _append_build_log(log_dir: str, archived_paths: list[str]) -> None:
    log_path = os.path.join(log_dir, BUILD_LOG_NAME)
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    lines = []
    for p in archived_paths:
        size = os.path.getsize(p) if os.path.exists(p) else 0
        lines.append(f'{now} | {os.path.basename(p)} | {size:,} bytes\n')
    with open(log_path, 'a', encoding='utf-8') as f:
        f.writelines(lines)


def archive_to_project_log(
    source_path: str,
    project_name: str,
    *,
    project_log_root: str = DEFAULT_PROJECT_LOG_ROOT,
    deliverable_code: str = '',
) -> str:
    """Salin file ke Project Log dengan prefix timestamp."""
    if not os.path.isfile(source_path):
        raise FileNotFoundError(source_path)

    log_dir = resolve_project_log_folder(project_name, project_log_root=project_log_root)
    ts = datetime.now().strftime('%Y%m%d%H%M%S')
    base = os.path.basename(source_path)
    if deliverable_code and 'FSD_' not in base.upper():
        name, ext = os.path.splitext(base)
        base = f'FSD_{deliverable_code}{ext or ".docx"}'
    dest = os.path.join(log_dir, _timestamped_name(base, ts))
    shutil.copy2(source_path, dest)
    _append_build_log(log_dir, [dest])
    return dest


def publish_repo_copy(source_path: str, dest_path: str) -> str:
    """Salin/timpa deliverable terbaru di folder repo (tanpa timestamp)."""
    if not os.path.isfile(source_path):
        raise FileNotFoundError(source_path)
    os.makedirs(os.path.dirname(os.path.abspath(dest_path)), exist_ok=True)
    shutil.copy2(source_path, dest_path)
    return dest_path


def deliver_fsd_outputs(
    docx_path: str,
    config: DeliverableConfig,
    *,
    md_path: str | None = None,
) -> dict[str, str]:
    """
    Setelah build:
    1. Arsip timestamp → Project Log
    2. Salinan stabil (opsional) → repo_copy_path
    """
    results: dict[str, str] = {'build': docx_path}

    archived = archive_to_project_log(
        docx_path,
        config.project_log_name,
        project_log_root=config.project_log_root,
        deliverable_code=config.deliverable_code,
    )
    results['project_log_docx'] = archived
    print(f'   [Project Log] {archived}')

    md_src = md_path or config.md_source_path
    if config.include_md and md_src and os.path.isfile(md_src):
        log_dir = os.path.dirname(archived)
        ts = datetime.now().strftime('%Y%m%d%H%M%S')
        md_dest = os.path.join(log_dir, _timestamped_name(os.path.basename(md_src), ts))
        shutil.copy2(md_src, md_dest)
        _append_build_log(log_dir, [md_dest])
        results['project_log_md'] = md_dest
        print(f'   [Project Log] {md_dest}')

    if config.repo_copy_path:
        repo = publish_repo_copy(docx_path, config.repo_copy_path)
        results['repo_docx'] = repo
        print(f'   [Repo latest] {repo}')

    return results
