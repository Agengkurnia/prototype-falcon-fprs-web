# FSD Falcon — Dokumentasi Terpisah Web & Mobile

Dua FSD independen untuk proyek **Falcon FPRS Prototype**, mengikuti standar [FSD Generator Engine](D:\Work\Source\FSD Generator Engine).

| FSD | Folder | Source | Build |
|-----|--------|--------|-------|
| **Web Admin** | `FalconWebPortal/` | `source/FSD_Falcon_Web_v1.0.md` | `py build.py` |
| **Mobile SFA** | `FalconMobile/` | `source/FSD_Falcon_Mobile_v1.0.md` | `py build.py` |

## Build cepat

```powershell
# FSD Web
cd "D:\Work\Source\Comsup\falcon\Prototype\wwwroot\document\FSD\FalconWebPortal"
py -m pip install python-docx docxcompose
py build.py

# FSD Mobile
cd "D:\Work\Source\Comsup\falcon\Prototype\wwwroot\document\FSD\FalconMobile"
py build.py
```

Output DOCX di masing-masing folder `output/`. Buka Word → tekan **F9** untuk update Table of Contents.

## Ruang lingkup

| FSD | Mencakup | Tidak mencakup |
|-----|----------|----------------|
| Web | `Views/FPRS/` — Master Data, Penjualan, Kunjungan admin | Mobile SFA |
| Mobile | `Views/Mobile/` — kunjungan, order, AR, outlet lapangan | Web admin |

## Dependency

- Python 3 + `python-docx`, `docxcompose`
- [Pandoc](https://pandoc.org/installing.html) di PATH
- Internet (render diagram Mermaid via Kroki.io saat build)
