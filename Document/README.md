# Falcon FPRS — Deliverable FSD (DOCX)

Dokumen FSD final sesuai standar **FSD Generator Engine** (cover Kalbe, tabel hijau `#D9EAD3`, font Calibri, caption otomatis, swimlane, diagram Kroki).

## FSD Web Admin

| Item | Nilai |
|------|-------|
| **Deliverable** | `Document/{YYYYMMDDHHmmss}__FSD_FALCON_WEB.docx` (standar §K.2) |
| **Sumber** | `wwwroot/document/FSD/FalconWebPortal/` |
| **MD internal** | `source/FSD_Falcon_Web_v1.0.md` |
| **Screenshot** | `screenshots/ss_{NN}_{deskripsi}.png` |

## FSD Mobile SFA

| Item | Nilai |
|------|-------|
| **Deliverable** | `Document/{YYYYMMDDHHmmss}__FSD_FALCON_MOBILE.docx` |
| **Sumber** | `wwwroot/document/FSD/FalconMobile/` |
| **MD internal** | `source/FSD_Falcon_Mobile_v1.0.md` |
| **Screenshot** | `screenshots/ss_{NN}_{deskripsi}.png` (21 layar, viewport 360×780) |

## Regenerate FSD Web

```powershell
cd "D:\Work\Source\Comsup\falcon\Prototype"

# Terminal 1 — server statis (wajib saat capture)
py -m http.server 5502

# Terminal 2 — pipeline lengkap Web-only
py Document/build_fsd_deliverables.py --web-only
```

## Regenerate FSD Mobile

```powershell
cd "D:\Work\Source\Comsup\falcon\Prototype"

# Terminal 1 — server statis (wajib saat capture)
py -m http.server 5502

# Terminal 2 — pipeline lengkap Mobile-only
py Document/build_fsd_deliverables.py --mobile-only
```

Tanpa capture ulang (rebuild dari MD + screenshot yang sudah ada):

```powershell
py Document/build_fsd_deliverables.py --web-only --skip-capture
py Document/build_fsd_deliverables.py --mobile-only --skip-capture
```

Setelah buka DOCX di Word → tekan **F9** untuk update Table of Contents.

## Pipeline Web (urutan)

1. `extract_module_spec.py` — fragment + update registry `ss_NN_*`
2. `capture_web_portal_screenshots.py` — Playwright @ `http://127.0.0.1:5502`
3. `assemble_fsd.py` — gabung preamble + fragments
4. `build.py` — Kroki + Pandoc + cover Kalbe + post-process
5. Salin ke `Document/{timestamp}__FSD_FALCON_WEB.docx`

## Pipeline Mobile (urutan)

1. `capture_mobile_screenshots.py` — Playwright @ `http://127.0.0.1:5502` (viewport 360×780, ~6.5 cm lebar di DOCX)
2. `build.py` — Kroki (swimlane, nav flow, ERD) + Pandoc + cover Kalbe + caption
3. Salin ke `Document/{timestamp}__FSD_FALCON_MOBILE.docx`
