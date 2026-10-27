"""Remove 'ID Elemen' + 'Tipe' from field tables, and 'ID / Handler' from button tables."""
from __future__ import annotations

import re
from pathlib import Path

MD = Path(__file__).resolve().parents[1] / "source" / "FSD_Falcon_Koreksi_Stok_v1.0.md"
text = MD.read_text(encoding="utf-8")


def drop_cols(block: str, drop_indexes: set[int]) -> str:
    out = []
    for line in block.strip("\n").splitlines():
        raw = line.strip()
        if not raw.startswith("|"):
            out.append(line)
            continue
        cells = [c.strip() for c in raw.strip("|").split("|")]
        kept = [c for i, c in enumerate(cells) if i not in drop_indexes]
        out.append("| " + " | ".join(kept) + " |")
    return "\n".join(out) + "\n"


# Field tables: drop col 1 (ID Elemen) and 2 (Tipe)
field_re = re.compile(
    r"^(\| Field Name \| ID Elemen \| Tipe \|[^\n]+\|\r?\n)"
    r"^(\|[-\s|:]+\|\r?\n)"
    r"((?:^\|[^\n]+\|\r?\n)+)",
    re.M,
)
text, n1 = field_re.subn(lambda m: drop_cols(m.group(0), {1, 2}), text)
print("field tables:", n1)

# Button tables: drop col 2 (ID / Handler)
btn_re = re.compile(
    r"^(\| Tampilan \| Tombol \| ID / Handler \| Warna/Style \| Fungsi \|\r?\n)"
    r"^(\|[-\s|:]+\|\r?\n)"
    r"((?:^\|[^\n]+\|\r?\n)+)",
    re.M,
)
text, n2 = btn_re.subn(lambda m: drop_cols(m.group(0), {2}), text)
print("button tables:", n2)

MD.write_text(text, encoding="utf-8")
print("written", MD)
