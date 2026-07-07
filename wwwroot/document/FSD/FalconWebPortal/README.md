# FSD Web Admin — Falcon FPRS

Dokumen FSD untuk **Web Admin** Falcon FPRS (`Views/FPRS/`), mengikuti standar FSD Generator Engine.

> Mobile SFA didokumentasikan terpisah di [`../FalconMobile/`](../FalconMobile/).

## Struktur

| Path | Isi |
|------|-----|
| `source/FSD_Falcon_Web_v1.0.md` | Markdown canonical |
| `source/_fragments/` | Fragment per modul (regenerate via script) |
| `output/` | DOCX hasil build |
| `screenshots/` | Capture UI |
| `lib/` | Pipeline Python |
| `templates/` | Cover Kalbe, reference.docx |
| `scripts/` | Ekstraksi HTML & perakitan MD |

## Build

```powershell
cd "D:\Work\Source\Comsup\falcon\Prototype\wwwroot\document\FSD\FalconWebPortal"
py -m pip install python-docx docxcompose
py scripts/assemble_fsd.py   # opsional: regenerate dari HTML
py build.py
```

Output: `output/FSD_Falcon_Web_v1.0.docx`

## Bab Dokumen

1. Pendahuluan
2. Arsitektur Portal
3. Dashboard & Shell
4. Master Data (17 modul)
5. Penjualan
6. Kunjungan
7. Aturan Bisnis (rekap)
8. Hak Akses & RBAC
9. Data Layer & Integrasi
10. Struktur Data & ERD
11. Appendix
