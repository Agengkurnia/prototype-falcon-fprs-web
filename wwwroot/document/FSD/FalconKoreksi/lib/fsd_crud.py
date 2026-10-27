"""Standar tabel CRUD FSD — hanya operasi yang benar-benar ada di UI."""

from __future__ import annotations

_SKIP_KETERANGAN = (
    'tidak tersedia',
    'tidak ada hapus',
    'tombol hapus dihilangkan',
    'bukan modul crud',
)


def crud_row_available(cara: str, keterangan: str) -> bool:
    cara_s = (cara or '').strip()
    ket = (keterangan or '').strip()
    ket_low = ket.lower()
    if any(p in ket_low for p in _SKIP_KETERANGAN):
        return False
    if cara_s and cara_s != '—':
        return True
    if ket and ket != '—':
        if any(x in ket_low for x in ('mobile', 'sfa', 'upload csv', 'sinkron', 'aplikasi')):
            return True
    return False


def format_crud_table(rows: list[tuple[str, str, str, str]]) -> str:
    lines = [
        '| Operasi | Cara | Role | Keterangan |',
        '|---------|------|------|------------|',
    ]
    for op, cara, role, ket in rows:
        if crud_row_available(cara, ket):
            lines.append(f'| **{op}** | {cara} | {role} | {ket} |')
    return '\n'.join(lines)
