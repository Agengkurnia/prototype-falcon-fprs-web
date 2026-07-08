# Dokumentasi Falcon FPRS Prototype

Pusat dokumentasi prototipe **Falcon FPRS (PT Kalbe Nutritionals)** — panel web admin dan aplikasi SFA mobile.

## Struktur Dokumentasi

| Area | Dokumen | Deskripsi |
|------|---------|-----------|
| **Umum** | [project_overview.md](project_overview.md) | Arsitektur dual-target, folder, data layer, build APK |
| **Changelog** | [changelog_web_mobile_jul2026.md](changelog_web_mobile_jul2026.md) | **Perubahan Juli 2026** — web Stokis, mobile unduh/upload, role MD |
| **Web** | [web/README.md](web/README.md) | Portal admin desktop (`Views/FPRS/`) |
| **Web** | [web/FSD_Falcon_Web_Portal.md](web/FSD_Falcon_Web_Portal.md) | Functional Specification Document portal web |
| **Web** | [web/master_stokis.md](web/master_stokis.md) | Modul Master Stokis / Grosir (CRUD, validasi form, CSV) |
| **Web** | [web/pages/README.md](web/pages/README.md) | **Dokumentasi per halaman / modul web** |
| **Web** | [web/master_data_integration.md](web/master_data_integration.md) | Integrasi Master Data Kalbe |
| **Web** | [web/geografis_kunjungan_plan.md](web/geografis_kunjungan_plan.md) | Rencana modul geografis kunjungan |
| **Mobile** | [mobile/README.md](mobile/README.md) | Indeks dokumentasi SFA mobile |
| **Mobile** | [mobile/sfa_mobile_prototype.md](mobile/sfa_mobile_prototype.md) | Modul, alur bisnis, panduan uji |
| **Mobile** | [mobile/pages/README.md](mobile/pages/README.md) | **Dokumentasi per halaman mobile** |
| **Mobile** | [mobile/feedback_implementation.md](mobile/feedback_implementation.md) | Rekaman implementasi feedback PDF |
| **Mobile** | [mobile/generate_apk.md](mobile/generate_apk.md) | Build & distribusi APK Android |
| **Mobile** | [mobile/simplidots_sfa_mobile_flow.md](mobile/simplidots_sfa_mobile_flow.md) | Referensi alur SimpliDOTS (dekompilasi) |
| **Mobile** | [mobile/restock_flow_redesign.md](mobile/restock_flow_redesign.md) | Redesign alur kulakan/restock |

## Quick Start

### Web (Desktop Admin)

```
URL     : http://127.0.0.1:5501/index.html
Entry   : Views/FPRS/ (via sidebar layout.js)
Data    : wwwroot/js/canvassing-store.js + wwwroot/data/*.json
```

### Mobile (Browser / APK)

```
URL     : http://127.0.0.1:5501/Views/Mobile/login.html
Source  : Views/Mobile/  (source utama)
APK     : build-apk.bat → app-release.apk
Data    : wwwroot/js/sfa-store.js (localStorage)
```

## Source of Truth

| Target | Folder sumber | Catatan |
|--------|---------------|---------|
| Web admin | `Views/FPRS/`, `wwwroot/` | Panel desktop |
| Mobile web | `Views/Mobile/`, `wwwroot/` | Prototype & Live Server |
| Mobile APK | Hasil sync ke `Mobile/MobileApp/assets/www/` | Via `scripts/create-flutter-wrapper.js` |

Setelah mengubah mobile, jalankan `build-apk.bat` agar APK memuat aset terbaru.

## Testing

| Target | Lokasi |
|--------|--------|
| Mobile automated | `Testing/Mobile/automation/` |
| Mobile manual checklist | `Testing/Mobile/testing_mobile.md` |
