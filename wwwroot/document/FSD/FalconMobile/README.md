# FSD Mobile SFA — Falcon FPRS

Dokumen FSD untuk **Mobile SFA** Falcon FPRS (`Views/Mobile/`), mengikuti standar FSD Generator Engine.

> Web Admin didokumentasikan terpisah di [`../FalconWebPortal/`](../FalconWebPortal/).

## Struktur

| Path | Isi |
|------|-----|
| `source/FSD_Falcon_Mobile_v1.0.md` | Markdown canonical |
| `output/` | DOCX hasil build |
| `screenshots/` | Capture UI mobile (`ss_01` … `ss_21`, full-page) |
| `lib/` | Pipeline Python (sync dari Engine / FalconWebPortal) |
| `templates/` | Cover Kalbe, reference.docx |

## Build cepat (dari Prototype root)

```powershell
cd "D:\Work\Source\Comsup\falcon\Prototype"

# Terminal 1 (opsional, untuk capture screenshot)
py -m http.server 5502

# Terminal 2 — Mobile saja, skip capture jika screenshot sudah ada
py Document/build_fsd_deliverables.py --mobile-only --skip-capture
```

Deliverable: `Document/{YYYYMMDDHHmmss}__FSD_FALCON_MOBILE.docx`

Terakhir di-build: **8 Juli 2026** — `20260708101352__FSD_FALCON_MOBILE.docx`

## Build lokal (hanya folder ini)

```powershell
cd "D:\Work\Source\Comsup\falcon\Prototype\wwwroot\document\FSD\FalconMobile"
py capture_mobile_screenshots.py --base-url http://127.0.0.1:5502
py build.py
```

Output internal: `output/FSD_Falcon_Mobile_v1.0.docx`

## Bab Dokumen

1. Pendahuluan
2. Arsitektur Mobile & Business Flow (swimlane + nav flow)
3. Login & Shell (Beranda, Dasbor, Profil, Target)
4. Kunjungan (Rute & Detail Visit)
5. Penjualan & Faktur
6. Penagihan AR
7. Outlet & Produk
8. Sinkronisasi Data
9. Aturan Bisnis (BR-M01 s.d. BR-M40)
10. RBAC & Data Layer (`SfaStore`)
11. Struktur Data & ERD
12. Appendix

## Sumber UI

- Halaman: `Views/Mobile/*.html` (20 halaman)
- Data layer: `wwwroot/js/sfa-store.js`
- Desain: `wwwroot/css/mobile.css`
- Prototipe doc: `docs/mobile/sfa_mobile_prototype.md`
